import { LevelModel, ILevel } from '../models/Level';
import { PlayerModel } from '../models/Player';
import { GameMode, LeagueMode } from '../config/constants';
import { AppError } from '../middlewares/errorHandler';
import { fixAndOrderCareerPath } from '../utils/careerPathUtils';

export interface ILevelClientResponse {
  levelNumber: number;
  gameMode: GameMode;
  leagueMode: LeagueMode;
  rewardCoins: number;
  rewardXp: number;
  hints: string[];
  imageUrl?: string;
  initialBlurImageUrl?: string;
  blurImages?: string[];
  targetPlayerId: string;
  playerName: string;
  playerClub: string;
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
    let player: any = null;

    if (level) {
      player = await PlayerModel.findOne({ playerId: level.playerId }).lean();
    }

    if (!player) {
      const leagueFilter =
        leagueMode === 'super_lig'
          ? { 'currentClub.league': 'super_lig' }
          : { 'currentClub.league': { $ne: 'super_lig' } };

      const count = await PlayerModel.countDocuments({ isActive: true, ...leagueFilter });
      if (count > 0) {
        const skipIndex = Math.max(0, (levelNumber - 1) % count);
        player = await PlayerModel.findOne({ isActive: true, ...leagueFilter }).skip(skipIndex).lean();
      }
    }

    if (!player) {
      throw new AppError(`Level ${levelNumber} not found`, 404);
    }

    const response: ILevelClientResponse = {
      levelNumber: level ? level.levelNumber : levelNumber,
      gameMode,
      leagueMode,
      targetPlayerId: player.playerId,
      playerName: player.name,
      playerClub: player.currentClub.name,
      rewardCoins: level ? level.rewardCoins : (gameMode === 'careerPath' ? 35 : 30),
      rewardXp: level ? level.rewardXp : (gameMode === 'careerPath' ? 60 : 50),
      hints: level ? level.hints : [`${player.nationality} - ${player.position}`],
    };

    if (gameMode === 'whoAreYa') {
      response.blurImages = player.blurImages;
      response.initialBlurImageUrl = player.blurImages?.[0] || player.originalImageUrl;
      response.imageUrl = player.originalImageUrl;
    } else if (gameMode === 'careerPath') {
      response.careerPath = fixAndOrderCareerPath(
        player.careerPath,
        player.currentClub?.name,
        player.age
      );
    }

    return response;
  }

  public async verifyLevel(
    levelNumber: number,
    gameMode: GameMode,
    leagueMode: LeagueMode,
    guessedPlayerId: string
  ): Promise<{ isCorrect: boolean; rewardCoins: number; rewardXp: number; targetPlayerId?: string }> {
    const levelData = await this.getLevel(levelNumber, gameMode, leagueMode);
    const isCorrect = levelData.targetPlayerId === guessedPlayerId;

    return {
      isCorrect,
      rewardCoins: isCorrect ? levelData.rewardCoins : 0,
      rewardXp: isCorrect ? levelData.rewardXp : 0,
      targetPlayerId: isCorrect ? levelData.targetPlayerId : undefined,
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
        targetPlayerId: l.playerId,
        playerName: p?.name || '',
        playerClub: p?.currentClub?.name || '',
        rewardCoins: l.rewardCoins,
        rewardXp: l.rewardXp,
        hints: l.hints,
        blurImages: l.gameMode === 'whoAreYa' ? p?.blurImages : undefined,
        imageUrl: l.gameMode === 'whoAreYa' ? p?.originalImageUrl : undefined,
        initialBlurImageUrl: l.gameMode === 'whoAreYa' ? p?.blurImages?.[0] || p?.originalImageUrl : undefined,
        careerPath:
          l.gameMode === 'careerPath'
            ? fixAndOrderCareerPath(p?.careerPath, p?.currentClub?.name, p?.age)
            : undefined,
      };
    });
  }
}

export const levelService = new LevelService();
