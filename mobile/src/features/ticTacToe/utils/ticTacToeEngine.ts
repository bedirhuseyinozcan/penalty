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

const CLUB_TO_LEAGUE_FALLBACK: Record<string, string> = {
  'Real Madrid': 'la_liga',
  'Barcelona': 'la_liga',
  'Atlético': 'la_liga',
  'Atlético Madrid': 'la_liga',
  'Valencia': 'la_liga',
  'Sevilla FC': 'la_liga',
  'Villarreal': 'la_liga',
  'Real Sociedad': 'la_liga',
  'Real Betis': 'la_liga',
  'Athletic Club': 'la_liga',
  'Celta': 'la_liga',
  'Espanyol': 'la_liga',
  'Getafe': 'la_liga',
  'Dep. A Coruña': 'la_liga',
  'Málaga CF': 'la_liga',
  'Real Zaragoza': 'la_liga',
  'RCD Mallorca': 'la_liga',
  'Real Valladolid': 'la_liga',
  'Rayo Vallecano': 'la_liga',
  'CA Osasuna': 'la_liga',
  'Man Utd': 'premier_league',
  'Manchester United': 'premier_league',
  'Man City': 'premier_league',
  'Manchester City': 'premier_league',
  'Liverpool': 'premier_league',
  'Arsenal': 'premier_league',
  'Chelsea': 'premier_league',
  'Tottenham': 'premier_league',
  'Newcastle': 'premier_league',
  'Aston Villa': 'premier_league',
  'Everton': 'premier_league',
  'West Ham': 'premier_league',
  'Leicester': 'premier_league',
  'Southampton': 'premier_league',
  'Fulham': 'premier_league',
  'Crystal Palace': 'premier_league',
  'Brighton': 'premier_league',
  'Wolves': 'premier_league',
  'Leeds': 'premier_league',
  'Blackburn': 'premier_league',
  'Bolton': 'premier_league',
  'Middlesbrough': 'premier_league',
  'Stoke City': 'premier_league',
  'Sunderland': 'premier_league',
  'Portsmouth': 'premier_league',
  'AC Milan': 'serie_a',
  'Inter': 'serie_a',
  'Juventus': 'serie_a',
  'Roma': 'serie_a',
  'Napoli': 'serie_a',
  'Lazio': 'serie_a',
  'Fiorentina': 'serie_a',
  'Atalanta': 'serie_a',
  'Bologna': 'serie_a',
  'Torino': 'serie_a',
  'Udinese': 'serie_a',
  'Sampdoria': 'serie_a',
  'Parma': 'serie_a',
  'Genoa': 'serie_a',
  'Cagliari': 'serie_a',
  'Palermo': 'serie_a',
  'Chievo Verona': 'serie_a',
  'Brescia': 'serie_a',
  'Hellas Verona': 'serie_a',
  'Bayern Munich': 'bundesliga',
  'Dortmund': 'bundesliga',
  'Leverkusen': 'bundesliga',
  'Leipzig': 'bundesliga',
  'FC Schalke 04': 'bundesliga',
  'Werder Bremen': 'bundesliga',
  'Stuttgart': 'bundesliga',
  'Wolfsburg': 'bundesliga',
  'Hamburg': 'bundesliga',
  'Frankfurt': 'bundesliga',
  'Mönchengladbach': 'bundesliga',
  'Hertha BSC': 'bundesliga',
  '1.FC Köln': 'bundesliga',
  'Hoffenheim': 'bundesliga',
  'Freiburg': 'bundesliga',
  'Mainz': 'bundesliga',
  'PSG': 'ligue_1',
  'Monaco': 'ligue_1',
  'Marseille': 'ligue_1',
  'Lyon': 'ligue_1',
  'Lille': 'ligue_1',
  'Nice': 'ligue_1',
  'Lens': 'ligue_1',
  'Rennes': 'ligue_1',
  'G. Bordeaux': 'ligue_1',
  'Saint-Étienne': 'ligue_1',
  'FC Nantes': 'ligue_1',
  'Montpellier': 'ligue_1',
  'Toulouse': 'ligue_1',
  'Galatasaray': 'super_lig',
  'Fenerbahçe': 'super_lig',
  'Beşiktaş': 'super_lig',
  'Trabzonspor': 'super_lig',
  'Basaksehir': 'super_lig',
  'Başakşehir': 'super_lig',
  'Bursaspor': 'super_lig',
  'Sivasspor': 'super_lig',
  'Antalyaspor': 'super_lig',
  'Konyaspor': 'super_lig',
  'Alanyaspor': 'super_lig',
  'Kasimpasa': 'super_lig',
  'Kasımpaşa': 'super_lig',
  'Kayserispor': 'super_lig',
  'Göztepe': 'super_lig',
  'Samsunspor': 'super_lig',
  'Eyüpspor': 'super_lig',
  'C. Rizespor': 'super_lig',
  'Çaykur Rizespor': 'super_lig',
  'Gaziantep FK': 'super_lig',
  'Gaziantepspor': 'super_lig',
  'Ankaragücü': 'super_lig',
  'Genclerbirligi': 'super_lig',
  'Eskisehirspor': 'super_lig',
  'Adana Demirspor': 'super_lig',
  'Karagümrük': 'super_lig',
};

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
    if (CLUB_TO_LEAGUE_FALLBACK[clubName] === targetLeague) return true;
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
  const pool = searchEngine.getPlayersByLeagueMode(leagueMode);
  const safePool = pool.length >= 30 ? pool : searchEngine.getPlayersByLeagueMode();

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
        id: `col_club_${fallbackClubs[0] || 'Galatasaray'}`,
        type: 'club',
        value: fallbackClubs[0] || 'Galatasaray',
        label: fallbackClubs[0] || 'Galatasaray',
        subLabel: 'Kulüp',
        badgeText: '🛡️',
      },
      {
        id: `col_club_${fallbackClubs[1] || 'Fenerbahçe'}`,
        type: 'club',
        value: fallbackClubs[1] || 'Fenerbahçe',
        label: fallbackClubs[1] || 'Fenerbahçe',
        subLabel: 'Kulüp',
        badgeText: '🛡️',
      },
      {
        id: `col_club_${fallbackClubs[2] || 'Beşiktaş'}`,
        type: 'club',
        value: fallbackClubs[2] || 'Beşiktaş',
        label: fallbackClubs[2] || 'Beşiktaş',
        subLabel: 'Kulüp',
        badgeText: '🛡️',
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
