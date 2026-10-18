import { LevelModel, ILevel } from '../models/Level';
import { PlayerModel } from '../models/Player';
import { GameMode, LeagueMode } from '../config/constants';
import { AppError } from '../middlewares/errorHandler';

export interface ILevelClientResponse {
  levelNumber: number;
  gameMode: GameMode;
  leagueMode: LeagueMode;
  rewardCoins: number;
  rewardXp: number;
  hints: string[];
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

export class LevelService {
  public async getLevel(
    levelNumber: number,
    gameMode: GameMode,
    leagueMode: LeagueMode
  ): Promise<ILevelClientResponse> {
    const level = await LevelModel.findOne({ levelNumber, gameMode, leagueMode }).lean();
    if (!level) {
      throw new AppError(`Level ${levelNumber} not found`, 404);
    }

    const player = await PlayerModel.findOne({ playerId: level.playerId }).lean();
    if (!player) {
      throw new AppError('Player associated with this level not found', 404);
    }

    const response: ILevelClientResponse = {
      levelNumber: level.levelNumber,
      gameMode: level.gameMode,
      leagueMode: level.leagueMode,
      rewardCoins: level.rewardCoins,
      rewardXp: level.rewardXp,
      hints: level.hints,
    };

    if (gameMode === 'whoAreYa') {
      response.blurImages = player.blurImages;
      response.initialBlurImageUrl = player.blurImages?.[0] || player.originalImageUrl;
    } else if (gameMode === 'careerPath') {
      response.careerPath = player.careerPath;
    }

    return response;
  }

  public async verifyLevel(
    levelNumber: number,
    gameMode: GameMode,
    leagueMode: LeagueMode,
    guessedPlayerId: string
  ): Promise<{ isCorrect: boolean; rewardCoins: number; rewardXp: number; targetPlayerId?: string }> {
    const level = await LevelModel.findOne({ levelNumber, gameMode, leagueMode }).lean();
    if (!level) throw new AppError('Level not found', 404);

    const isCorrect = level.playerId === guessedPlayerId;

    return {
      isCorrect,
      rewardCoins: isCorrect ? level.rewardCoins : 0,
      rewardXp: isCorrect ? level.rewardXp : 0,
      targetPlayerId: isCorrect ? level.playerId : undefined,
    };
  }

  public async getLevelPack(
    gameMode: GameMode,
    leagueMode: LeagueMode,
    fromLevel = 1,
    toLevel = 50
  ): Promise<ILevelClientResponse[]> {
    const levels = await LevelModel.find({
      gameMode,
      leagueMode,
      levelNumber: { $gte: fromLevel, $lte: toLevel },
    })
      .sort({ levelNumber: 1 })
      .lean();

    const playerIds = levels.map((l) => l.playerId);
    const players = await PlayerModel.find({ playerId: { $in: playerIds } }).lean();
    const playerMap = new Map(players.map((p) => [p.playerId, p]));

    return levels.map((l) => {
      const p = playerMap.get(l.playerId);
      return {
        levelNumber: l.levelNumber,
        gameMode: l.gameMode,
        leagueMode: l.leagueMode,
        rewardCoins: l.rewardCoins,
        rewardXp: l.rewardXp,
        hints: l.hints,
        blurImages: l.gameMode === 'whoAreYa' ? p?.blurImages : undefined,
        initialBlurImageUrl: l.gameMode === 'whoAreYa' ? p?.blurImages?.[0] : undefined,
        careerPath: l.gameMode === 'careerPath' ? p?.careerPath : undefined,
      };
    });
  }
}

export const levelService = new LevelService();
