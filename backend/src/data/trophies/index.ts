import uclData from './uclWinners.json';
import worldCupData from './worldCupWinners.json';
import ballonDorData from './ballonDorWinners.json';
import goldenBootData from './goldenBootWinners.json';
import leagueChampionData from './leagueChampionWinners.json';
import leagueChampionClubYearsData from './leagueChampionClubYears.json';

export const UCL_WINNER_TMIDS = new Set<string>(uclData);
export const WORLD_CUP_WINNER_TMIDS = new Set<string>(worldCupData);
export const BALLON_DOR_WINNER_TMIDS = new Set<string>(ballonDorData);
export const GOLDEN_BOOT_WINNER_TMIDS = new Set<string>(goldenBootData);
export const LEAGUE_CHAMPION_WINNER_TMIDS = new Set<string>(leagueChampionData);
export const LEAGUE_CHAMPION_CLUB_YEARS: Record<string, number[]> = leagueChampionClubYearsData;

export const CALENDAR_YEAR_CHAMPION_CLUBS = new Set([
  'Palmeiras',
  'Flamengo',
  'Atlético Mineiro',
  'Fluminense',
  'São Paulo',
  'Corinthians',
  'Santos',
  'Internacional',
  'Grêmio',
  'Cruzeiro',
  'Vasco da Gama',
  'Botafogo',
]);
