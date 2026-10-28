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

export function doesPlayerMatchLeague(player: ILightPlayer, targetLeague: string): boolean {
  if (!player.isLegend && player.league === targetLeague) return true;
  if (Array.isArray(player.leagues) && player.leagues.includes(targetLeague)) return true;

  const allClubs = new Set<string>();
  if (player.club) allClubs.add(player.club.trim());
  if (Array.isArray(player.clubs)) {
    for (const c of player.clubs) {
      if (c) allClubs.add(c.trim());
    }
  }

  for (const clubName of allClubs) {
    const clubMeta = searchEngine.getClubByNameStrict(clubName);
    if (clubMeta && clubMeta.league === targetLeague) return true;
  }

  return false;
}

export function doesPlayerMatchCriterion(player: ILightPlayer, criterion: IGridCriterion): boolean {
  switch (criterion.type) {
    case 'club': {
      const target = criterion.value.toLowerCase().trim();
      if ((player.club || '').toLowerCase().trim() === target) return true;
      if (player.clubs && Array.isArray(player.clubs)) {
        return player.clubs.some((c) => (c || '').toLowerCase().trim() === target);
      }
      return false;
    }
    case 'nationality':
      return (player.nationality || '').toLowerCase().trim() === criterion.value.toLowerCase().trim();
    case 'league':
      return doesPlayerMatchLeague(player, criterion.value);
    case 'positionGroup':
      return getPlayerPositionGroup(player.position) === criterion.value;
    case 'ageGroup': {
      if (player.isLegend) return false;
      const age = player.age ?? 25;
      if (criterion.value === 'u24') return age <= 24;
      if (criterion.value === 'o30') return age >= 30;
      return age >= 25 && age <= 29;
    }
    case 'trophy':
      return (player.trophies || []).includes(criterion.value);
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

const BAD_CLUBS = new Set(['Without Club', 'Unknown', 'Career break', 'Retired']);

export function generateTicTacToeBoard(
  seedKey: string,
  leagueMode: 'global' | 'super_lig'
): ITicTacToeBoardData {
  const rng = createSeededRandom(seedKey);
  const pool = searchEngine.getPlayersByLeagueMode(leagueMode, { includeLegends: true });
  const safePool =
    pool.length >= 30
      ? pool
      : searchEngine.getPlayersByLeagueMode(undefined, { includeLegends: true });

  const clubCounts = new Map<string, number>();
  const natCounts = new Map<string, number>();

  for (const p of safePool) {
    if (p.clubs && Array.isArray(p.clubs)) {
      for (const c of p.clubs) {
        if (c && !BAD_CLUBS.has(c)) {
          clubCounts.set(c, (clubCounts.get(c) || 0) + 1);
        }
      }
    } else if (p.club && !BAD_CLUBS.has(p.club)) {
      clubCounts.set(p.club, (clubCounts.get(p.club) || 0) + 1);
    }
    if (p.nationality) natCounts.set(p.nationality, (natCounts.get(p.nationality) || 0) + 1);
  }

  const topClubs = Array.from(clubCounts.entries())
    .filter(([_, count]) => count >= 8)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18)
    .map(([name]) => name);

  const topNats = Array.from(natCounts.entries())
    .filter(([_, count]) => count >= 6)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([nat]) => nat);

  const colCandidates: IGridCriterion[] = topClubs.map((clubName) => {
    const clubInfo = searchEngine.getClubByName(clubName);
    return {
      id: `col_club_${clubName}`,
      type: 'club',
      value: clubName,
      label: clubInfo?.name || clubName,
      subLabel: 'Kulüp',
      badgeText: '🛡️',
      logoUrl: clubInfo?.logoUrl,
    };
  });

  const positionCandidates: IGridCriterion[] = [
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
  ];

  const rowCandidates: IGridCriterion[] = [
    ...topClubs.map((clubName) => {
      const clubInfo = searchEngine.getClubByName(clubName);
      return {
        id: `row_club_${clubName}`,
        type: 'club' as const,
        value: clubName,
        label: clubInfo?.name || clubName,
        subLabel: 'Kulüp',
        badgeText: '🛡️',
        logoUrl: clubInfo?.logoUrl,
      };
    }),
    ...positionCandidates,
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
    ...topNats.slice(0, 8).map((nat) => ({
      id: `row_nat_${nat}`,
      type: 'nationality' as const,
      value: nat,
      label: nat,
      subLabel: 'Uyruk',
      badgeText: '🌍',
    })),
    {
      id: 'row_trophy_ucl',
      type: 'trophy',
      value: 'ucl',
      label: 'Şampiyonlar Ligi',
      subLabel: 'UCL Şampiyonu',
      badgeText: '⭐',
    },
    {
      id: 'row_trophy_world_cup',
      type: 'trophy',
      value: 'world_cup',
      label: 'Dünya Kupası',
      subLabel: 'Kupa Sahibi',
      badgeText: '🏆',
    },
    {
      id: 'row_trophy_league_champion',
      type: 'trophy',
      value: 'league_champion',
      label: 'Lig Şampiyonu',
      subLabel: 'Kupa Kaldırmış',
      badgeText: '🥇',
    },
    {
      id: 'row_trophy_golden_boot',
      type: 'trophy',
      value: 'golden_boot',
      label: 'Gol Kralı',
      subLabel: 'Altın Ayakkabı',
      badgeText: '👟',
    },
  ];

  if (leagueMode === 'global') {
    ['premier_league', 'la_liga', 'serie_a', 'bundesliga'].forEach((lg) => {
      colCandidates.push({
        id: `col_league_${lg}`,
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
  for (let attempt = 0; attempt < 100; attempt++) {
    const cShuffled = shuffle(colCandidates);
    if (cShuffled.length < 3) break;

    const testCols: [IGridCriterion, IGridCriterion, IGridCriterion] = [
      cShuffled[0],
      cShuffled[1],
      cShuffled[2],
    ];
    const colClubValues = new Set(
      testCols.filter((c) => c.type === 'club').map((c) => c.value.toLowerCase())
    );
    const availableRows = rowCandidates.filter(
      (r) => r.type !== 'club' || !colClubValues.has(r.value.toLowerCase())
    );

    const rShuffled = shuffle(availableRows);
    if (rShuffled.length < 3) continue;

    const testRows: [IGridCriterion, IGridCriterion, IGridCriterion] = [
      rShuffled[0],
      rShuffled[1],
      rShuffled[2],
    ];

    let allValid = true;
    const minMatchesRequired = attempt < 70 ? 3 : 2;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const matches = getMatchingPlayersForCell(safePool, testRows[r], testCols[c]);
        if (matches.length < minMatchesRequired) {
          allValid = false;
          break;
        }
        const hasRecognizable = matches.some(
          (p) =>
            p.isLegend ||
            (p.trophies && p.trophies.length > 0) ||
            (p.age && p.age >= 21 && p.club)
        );

        if (!hasRecognizable) {
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
    const globalFallbackPresets: [string, string, string][] = [
      ['Real Madrid', 'Barcelona', 'Bayern München'],
      ['Manchester City', 'Liverpool', 'Arsenal'],
      ['Paris Saint-Germain', 'Juventus', 'Chelsea'],
    ];

    const superLigFallbackPresets: [string, string, string][] = [
      ['Galatasaray', 'Fenerbahçe', 'Beşiktaş'],
      ['Galatasaray', 'Trabzonspor', 'Başakşehir'],
      ['Fenerbahçe', 'Beşiktaş', 'Trabzonspor'],
    ];

    const presets = leagueMode === 'super_lig' ? superLigFallbackPresets : globalFallbackPresets;
    const presetIndex = Math.floor(rng() * presets.length);
    const chosenClubs = presets[presetIndex];

    selectedCols = [
      {
        id: `col_club_${chosenClubs[0]}`,
        type: 'club',
        value: chosenClubs[0],
        label: searchEngine.getClubByName(chosenClubs[0])?.name || chosenClubs[0],
        subLabel: 'Kulüp',
        badgeText: '🛡️',
        logoUrl: searchEngine.getClubByName(chosenClubs[0])?.logoUrl,
      },
      {
        id: `col_club_${chosenClubs[1]}`,
        type: 'club',
        value: chosenClubs[1],
        label: searchEngine.getClubByName(chosenClubs[1])?.name || chosenClubs[1],
        subLabel: 'Kulüp',
        badgeText: '🛡️',
        logoUrl: searchEngine.getClubByName(chosenClubs[1])?.logoUrl,
      },
      {
        id: `col_club_${chosenClubs[2]}`,
        type: 'club',
        value: chosenClubs[2],
        label: searchEngine.getClubByName(chosenClubs[2])?.name || chosenClubs[2],
        subLabel: 'Kulüp',
        badgeText: '🛡️',
        logoUrl: searchEngine.getClubByName(chosenClubs[2])?.logoUrl,
      },
    ];
    selectedRows = [
      positionCandidates[0],
      positionCandidates[1],
      positionCandidates[2],
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
