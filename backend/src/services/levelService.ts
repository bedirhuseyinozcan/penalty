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

    const explicitLevelMap = new Map(levels.map((l) => [l.levelNumber, l]));
    const explicitPlayerIds = levels.map((l) => l.playerId);

    const leagueFilter =
      leagueMode === 'super_lig'
        ? { 'currentClub.league': 'super_lig' }
        : { 'currentClub.league': { $ne: 'super_lig' } };

    const activePlayers = await PlayerModel.find({ isActive: true, ...leagueFilter })
      .select('playerId name currentClub nationality position age careerPath blurImages originalImageUrl')
      .lean();

    const explicitPlayers = await PlayerModel.find({ playerId: { $in: explicitPlayerIds } })
      .select('playerId name currentClub nationality position age careerPath blurImages originalImageUrl')
      .lean();

    const playerMap = new Map<string, any>();
    activePlayers.forEach((p) => playerMap.set(p.playerId, p));
    explicitPlayers.forEach((p) => playerMap.set(p.playerId, p));

    const result: ILevelClientResponse[] = [];
    const playerCount = activePlayers.length;

    for (let lvl = fromLevel; lvl <= toLevel; lvl++) {
      const explicitLevel = explicitLevelMap.get(lvl);
      let player: any = null;

      if (explicitLevel) {
        player = playerMap.get(explicitLevel.playerId);
      }

      if (!player && playerCount > 0) {
        const skipIndex = Math.max(0, (lvl - 1) % playerCount);
        player = activePlayers[skipIndex];
      }

      if (!player) continue;

      const item: ILevelClientResponse = {
        levelNumber: lvl,
        gameMode,
        leagueMode,
        targetPlayerId: player.playerId,
        playerName: player.name,
        playerClub: player.currentClub?.name || '',
        rewardCoins: explicitLevel ? explicitLevel.rewardCoins : (gameMode === 'careerPath' ? 35 : 30),
        rewardXp: explicitLevel ? explicitLevel.rewardXp : (gameMode === 'careerPath' ? 60 : 50),
        hints: explicitLevel ? explicitLevel.hints : [`${player.nationality} - ${player.position}`],
      };

      if (gameMode === 'whoAreYa') {
        item.blurImages = player.blurImages || [];
        item.initialBlurImageUrl = player.blurImages?.[0] || player.originalImageUrl;
        item.imageUrl = player.originalImageUrl;
      } else if (gameMode === 'careerPath') {
        item.careerPath = fixAndOrderCareerPath(
          player.careerPath,
          player.currentClub?.name,
          player.age
        );
      }

      result.push(item);
    }

    return result;
  }
}

export const levelService = new LevelService();
