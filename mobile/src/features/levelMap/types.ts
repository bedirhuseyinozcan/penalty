export type LevelStatus = 'completed' | 'current' | 'locked';

export interface ILevelItem {
  levelNumber: number;
  status: LevelStatus;
}
