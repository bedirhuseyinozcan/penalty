export interface IDailySavedSession<TGuess = any> {
  dailyKey: string;
  status: 'won' | 'lost';
  guesses: TGuess[];
  attemptsUsed: number;
  completedAt: string;
}
