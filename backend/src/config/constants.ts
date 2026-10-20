export const SUPPORTED_LEAGUES = {
  SUPER_LIG: 'super_lig',
  PREMIER_LEAGUE: 'premier_league',
  LA_LIGA: 'la_liga',
  SERIE_A: 'serie_a',
  BUNDESLIGA: 'bundesliga',
  LIGUE_1: 'ligue_1',
} as const;

export type SupportedLeague = (typeof SUPPORTED_LEAGUES)[keyof typeof SUPPORTED_LEAGUES];

export const TOP_5_LEAGUES: SupportedLeague[] = [
  SUPPORTED_LEAGUES.PREMIER_LEAGUE,
  SUPPORTED_LEAGUES.LA_LIGA,
  SUPPORTED_LEAGUES.SERIE_A,
  SUPPORTED_LEAGUES.BUNDESLIGA,
  SUPPORTED_LEAGUES.LIGUE_1,
];

export const ALL_LEAGUES: SupportedLeague[] = [
  ...TOP_5_LEAGUES,
  SUPPORTED_LEAGUES.SUPER_LIG,
];

export const GAME_MODES = {
  WHO_ARE_YA: 'whoAreYa',
  CAREER_PATH: 'careerPath',
  CLUB_LOGO: 'clubLogo',
  CONTEXTINHO: 'contextinho',
} as const;

export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES];

export const LEAGUE_MODES = {
  GLOBAL: 'global',
  SUPER_LIG: 'super_lig',
} as const;

export type LeagueMode = (typeof LEAGUE_MODES)[keyof typeof LEAGUE_MODES];

export const BLUR_LEVELS_COUNT = 8;
