import { ILightPlayer } from '../../services/searchEngine';

export type BingoCategoryType =
  | 'club'
  | 'nationality'
  | 'positionGroup'
  | 'ageUnder23'
  | 'ageOver30'
  | 'shirt1to11'
  | 'shirt20Plus'
  | 'league'
  | 'trophy';

export interface IBingoTile {
  index: number; 
  id: string;
  type: BingoCategoryType;
  value: string;
  title: string;
  subtitle: string;
  emoji: string;
  isMatched: boolean;
  matchedPlayer: ILightPlayer | null;
}

export interface IBingoBoardSetup {
  seedKey: string;
  tiles: IBingoTile[]; 
  deck: ILightPlayer[]; 
}
