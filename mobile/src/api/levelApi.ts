import { apiClient } from './client';
import { GameModeType } from './dailyApi';

export interface ILevelData {
  levelNumber: number;
  gameMode: GameModeType;
  leagueMode: 'global' | 'super_lig';
  rewardCoins: number;
  rewardXp: number;
  hints: string[];
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
}

export const levelApi = {
  getLevel: async (
    levelNumber: number,
    gameMode: GameModeType,
    leagueMode: 'global' | 'super_lig'
  ): Promise<ILevelData> => {
    const res = await apiClient.get(`/levels/${levelNumber}`, {
      params: { gameMode, leagueMode },
    });
    return res.data.data;
  },

  verifyLevel: async (
    levelNumber: number,
    gameMode: GameModeType,
    leagueMode: 'global' | 'super_lig',
    guessedPlayerId: string
  ): Promise<{ isCorrect: boolean; rewardCoins: number; rewardXp: number; targetPlayerId?: string }> => {
    const res = await apiClient.post(`/levels/${levelNumber}/verify`, {
      gameMode,
      leagueMode,
      guessedPlayerId,
    });
    return res.data.data;
  },

  getLevelPack: async (
    gameMode: GameModeType,
    leagueMode: 'global' | 'super_lig',
    from = 1,
    to = 50
  ): Promise<ILevelData[]> => {
    const res = await apiClient.get('/levels/pack', {
      params: { gameMode, leagueMode, from, to },
    });
    return res.data.data;
  },
};
