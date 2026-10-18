import { DailyChallengeModel, IDailyChallenge } from '../models/DailyChallenge';
import { PlayerModel } from '../models/Player';
import { GameMode, LeagueMode } from '../config/constants';
import { AppError } from '../middlewares/errorHandler';

export interface IDailyChallengeClientResponse {
  id: string;
  date: string;
  gameMode: GameMode;
  leagueMode: LeagueMode;
  difficulty: string;
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

export class DailyChallengeService {
  public getCurrentUtcDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  public async getTodayChallenge(
    gameMode: GameMode,
    leagueMode: LeagueMode
  ): Promise<IDailyChallengeClientResponse> {
    const today = this.getCurrentUtcDate();

    const challenge = await DailyChallengeModel.findOne({
      date: today,
      gameMode,
      leagueMode,
    }).populate('playerRef');

    if (!challenge) {
      throw new AppError(
        `Daily challenge not scheduled for date ${today} (${gameMode}/${leagueMode})`,
        404
      );
    }

    const player = await PlayerModel.findOne({ playerId: challenge.playerId }).lean();
    if (!player) {
      throw new AppError('Underlying challenge player not found', 404);
    }

    const response: IDailyChallengeClientResponse = {
      id: (challenge._id as unknown as string).toString(),
      date: challenge.date,
      gameMode: challenge.gameMode,
      leagueMode: challenge.leagueMode,
      difficulty: challenge.difficulty,
      serverUtcTime: new Date().toISOString(),
    };

    if (gameMode === 'whoAreYa') {
      response.blurImages = player.blurImages;
      response.initialBlurImageUrl = player.blurImages?.[0] || player.originalImageUrl;
    } else if (gameMode === 'careerPath') {
      response.careerPath = player.careerPath;
    }

    return response;
  }

  public async verifyDailyGuess(
    challengeId: string,
    guessedPlayerId: string
  ): Promise<{ isCorrect: boolean; targetPlayerId?: string }> {
    const challenge = await DailyChallengeModel.findById(challengeId).lean();
    if (!challenge) {
      throw new AppError('Challenge not found or expired', 404);
    }

    const isCorrect = challenge.playerId === guessedPlayerId;
    return {
      isCorrect,
      targetPlayerId: isCorrect ? challenge.playerId : undefined,
    };
  }
}

export const dailyChallengeService = new DailyChallengeService();
