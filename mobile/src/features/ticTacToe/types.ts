import { ILightPlayer } from '../../services/searchEngine';

export type GridCriterionType =
  | 'club'
  | 'nationality'
  | 'positionGroup'
  | 'league'
  | 'ageGroup'
  | 'trophy';

export interface IGridCriterion {
  id: string;
  type: GridCriterionType;
  value: string;
  label: string;
  subLabel?: string;
  badgeText: string;
  logoUrl?: string;
}

export interface ITicTacToeCellState {
  row: number;
  col: number;
  cellIndex: number;
  isFilled: boolean;
  guessedPlayer: ILightPlayer | null;
  possibleCount: number;
}

export interface ITicTacToeBoardData {
  seedKey: string;
  rows: [IGridCriterion, IGridCriterion, IGridCriterion];
  cols: [IGridCriterion, IGridCriterion, IGridCriterion];
  cells: ITicTacToeCellState[];
}
