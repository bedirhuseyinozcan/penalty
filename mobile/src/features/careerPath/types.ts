export interface ICareerStepItem {
  clubName: string;
  clubLogoUrl?: string;
  startYear: number;
  endYear?: number;
  apps?: number;
  goals?: number;
}

export interface ICareerPathGuess {
  playerId: string;
  playerName: string;
  club: string;
  isCorrect: boolean;
}
