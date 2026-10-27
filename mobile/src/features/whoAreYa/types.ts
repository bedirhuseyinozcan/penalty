import { ILightPlayer } from '../../services/searchEngine';

export interface IGuessAttributeComparison {
  club: 'correct' | 'wrong';
  league: 'correct' | 'wrong';
  nationality: 'correct' | 'wrong';
  position: 'correct' | 'wrong';
  age: 'correct' | 'higher' | 'lower';
}

export interface IWhoAreYaGuess {
  player: ILightPlayer & { age?: number };
  comparison: IGuessAttributeComparison;
  isTarget: boolean;
}

export type GameStatus = 'playing' | 'won' | 'lost';
