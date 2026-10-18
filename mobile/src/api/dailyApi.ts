import { apiClient } from './client';

export interface IDailyChallengeData {
  id: string;
  date: string;
  gameMode: 'whoAreYa' | 'careerPath';
  leagueMode: 'global' | 'super_lig';
  difficulty: string;
  targetPlayerId: string;
  playerName?: string;
  playerClub?: string;
  imageUrl?: string;
  initialBlurImageUrl?: string;
  blurImages?: string[];
  careerPath?: Array<{
    clubName: string;
    clubLogoUrl?: string;
    startYear: number;
    endYear?: number;
    apps?: number;
    goals?: number;
  }>;
  serverUtcTime: string;
}

export const dailyApi = {
  getTodayChallenge: async (
    gameMode: 'whoAreYa' | 'careerPath',
    leagueMode: 'global' | 'super_lig'
  ): Promise<IDailyChallengeData> => {
    const res = await apiClient.get('/daily/today', {
      params: { gameMode, leagueMode },
    });
    return res.data.data;
  },

  verifyDailyGuess: async (
    challengeId: string,
    guessedPlayerId: string
  ): Promise<{ isCorrect: boolean; targetPlayerId?: string }> => {
    const res = await apiClient.post('/daily/verify', {
      challengeId,
      guessedPlayerId,
    });
    return res.data.data;
  },
};
