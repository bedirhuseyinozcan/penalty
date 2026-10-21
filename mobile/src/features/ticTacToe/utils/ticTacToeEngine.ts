import { ILightPlayer, searchEngine } from '../../../services/searchEngine';
import { IGridCriterion, ITicTacToeBoardData, ITicTacToeCellState } from '../types';

const LEAGUE_LABELS: Record<string, string> = {
  super_lig: 'Süper Lig',
  premier_league: 'Premier League',
  la_liga: 'La Liga',
  serie_a: 'Serie A',
  bundesliga: 'Bundesliga',
  ligue_1: 'Ligue 1',
};

function createSeededRandom(seedStr: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;
    return (hash >>> 0) / 4294967296;
  };
}

export function getPlayerPositionGroup(pos: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  const p = (pos || '').toUpperCase().trim();
  if (p === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DF'].includes(p)) return 'DEF';
  if (['DM', 'CM', 'AM', 'LM', 'RM', 'MF'].includes(p)) return 'MID';
  return 'FWD';
}

export function doesPlayerMatchCriterion(player: ILightPlayer, criterion: IGridCriterion): boolean {
  switch (criterion.type) {
    case 'club':
      return (player.club || '').toLowerCase().trim() === criterion.value.toLowerCase().trim();
    case 'nationality':
      return (player.nationality || '').toLowerCase().trim() === criterion.value.toLowerCase().trim();
    case 'league':
      return player.league === criterion.value;
    case 'positionGroup':
      return getPlayerPositionGroup(player.position) === criterion.value;
    case 'ageGroup': {
      const age = player.age ?? 25;
      if (criterion.value === 'u24') return age <= 24;
      if (criterion.value === 'o30') return age >= 30;
      return age >= 25 && age <= 29;
    }
    default:
      return false;
  }
}

export function getMatchingPlayersForCell(
  pool: ILightPlayer[],
  rowCrit: IGridCriterion,
  colCrit: IGridCriterion,
  usedPlayerIds: Set<string> = new Set()
): ILightPlayer[] {
  return pool.filter(
    (p) =>
      !usedPlayerIds.has(p.id) &&
      doesPlayerMatchCriterion(p, rowCrit) &&
      doesPlayerMatchCriterion(p, colCrit)
  );
}

export function generateTicTacToeBoard(
  seedKey: string,
  leagueMode: 'global' | 'super_lig'
): ITicTacToeBoardData {
  const rng = createSeededRandom(seedKey);
  const pool = searchEngine.getPlayersByLeagueMode(leagueMode);
  const safePool = pool.length >= 30 ? pool : searchEngine.getPlayersByLeagueMode();

  // 1. Sütun adayları: En çok oyuncusu olan kulüpler
  const clubCounts = new Map<string, number>();
  const natCounts = new Map<string, number>();

  for (const p of safePool) {
    if (p.club) clubCounts.set(p.club, (clubCounts.get(p.club) || 0) + 1);
    if (p.nationality) natCounts.set(p.nationality, (natCounts.get(p.nationality) || 0) + 1);
  }

  const topClubs = Array.from(clubCounts.entries())
    .filter(([_, count]) => count >= 8)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([name]) => name);

  const topNats = Array.from(natCounts.entries())
    .filter(([_, count]) => count >= 6)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([nat]) => nat);

  const colCandidates: IGridCriterion[] = topClubs.map((clubName) => ({
    id: `club_${clubName}`,
    type: 'club',
    value: clubName,
    label: clubName,
    subLabel: 'Kulüp',
    badgeText: '🛡️',
  }));

  const rowCandidates: IGridCriterion[] = [
    {
      id: 'pos_FWD',
      type: 'positionGroup',
      value: 'FWD',
      label: 'Hücum / Forvet',
      subLabel: 'Mevki',
      badgeText: '⚡',
    },
    {
      id: 'pos_MID',
      type: 'positionGroup',
      value: 'MID',
      label: 'Orta Saha',
      subLabel: 'Mevki',
      badgeText: '🎯',
    },
    {
      id: 'pos_DEF',
      type: 'positionGroup',
      value: 'DEF',
      label: 'Defans',
      subLabel: 'Mevki',
      badgeText: '🧱',
    },
    {
      id: 'age_u24',
      type: 'ageGroup',
      value: 'u24',
      label: '≤ 24 Yaş',
      subLabel: 'Genç Yıldız',
      badgeText: '🌱',
    },
    {
      id: 'age_o30',
      type: 'ageGroup',
      value: 'o30',
      label: '≥ 30 Yaş',
      subLabel: 'Tecrübeli',
      badgeText: '👑',
    },
    ...topNats.slice(0, 6).map((nat) => ({
      id: `nat_${nat}`,
      type: 'nationality' as const,
      value: nat,
      label: nat,
      subLabel: 'Uyruk',
      badgeText: '🌍',
    })),
  ];

  if (leagueMode === 'global') {
    ['premier_league', 'la_liga', 'serie_a', 'bundesliga'].forEach((lg) => {
      colCandidates.push({
        id: `league_${lg}`,
        type: 'league',
        value: lg,
        label: LEAGUE_LABELS[lg] || lg,
        subLabel: 'Lig',
        badgeText: '🏆',
      });
    });
  }

  let selectedCols: [IGridCriterion, IGridCriterion, IGridCriterion] | null = null;
  let selectedRows: [IGridCriterion, IGridCriterion, IGridCriterion] | null = null;

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  for (let attempt = 0; attempt < 40; attempt++) {
    const cShuffled = shuffle(colCandidates);
    const rShuffled = shuffle(rowCandidates);

    if (cShuffled.length < 3 || rShuffled.length < 3) break;

    const testCols: [IGridCriterion, IGridCriterion, IGridCriterion] = [
      cShuffled[0],
      cShuffled[1],
      cShuffled[2],
    ];
    const testRows: [IGridCriterion, IGridCriterion, IGridCriterion] = [
      rShuffled[0],
      rShuffled[1],
      rShuffled[2],
    ];

    let allValid = true;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const matches = getMatchingPlayersForCell(safePool, testRows[r], testCols[c]);
        if (matches.length === 0) {
          allValid = false;
          break;
        }
      }
      if (!allValid) break;
    }

    if (allValid) {
      selectedCols = testCols;
      selectedRows = testRows;
      break;
    }
  }

  if (!selectedCols || !selectedRows) {
    const fallbackClubs = topClubs.slice(0, 3);
    selectedCols = [
      {
        id: `club_${fallbackClubs[0] || 'Galatasaray'}`,
        type: 'club',
        value: fallbackClubs[0] || 'Galatasaray',
        label: fallbackClubs[0] || 'Galatasaray',
        subLabel: 'Kulüp',
        badgeText: '🛡️',
      },
      {
        id: `club_${fallbackClubs[1] || 'Fenerbahçe'}`,
        type: 'club',
        value: fallbackClubs[1] || 'Fenerbahçe',
        label: fallbackClubs[1] || 'Fenerbahçe',
        subLabel: 'Kulüp',
        badgeText: '🛡️',
      },
      {
        id: `club_${fallbackClubs[2] || 'Beşiktaş'}`,
        type: 'club',
        value: fallbackClubs[2] || 'Beşiktaş',
        label: fallbackClubs[2] || 'Beşiktaş',
        subLabel: 'Kulüp',
        badgeText: '🛡️',
      },
    ];
    selectedRows = [
      rowCandidates[0], 
      rowCandidates[1], 
      rowCandidates[2],
    ];
  }

  const cells: ITicTacToeCellState[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const matches = getMatchingPlayersForCell(safePool, selectedRows[r], selectedCols[c]);
      cells.push({
        row: r,
        col: c,
        cellIndex: r * 3 + c,
        isFilled: false,
        guessedPlayer: null,
        possibleCount: matches.length,
      });
    }
  }

  return {
    seedKey,
    rows: selectedRows,
    cols: selectedCols,
    cells,
  };
}
