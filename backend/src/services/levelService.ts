import { LevelModel } from '../models/Level';
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

    if (level && gameMode !== 'clubLogo') {
      player = await PlayerModel.findOne({ playerId: level.playerId }).lean();
    }

    const leagueFilter =
      leagueMode === 'super_lig'
        ? { 'currentClub.league': 'super_lig' }
        : { 'currentClub.league': { $ne: 'super_lig' } };

    if (!player) {
      if (gameMode === 'clubLogo') {
        const stars = await PlayerModel.find({ isActive: true, ...leagueFilter })
          .sort({ marketValueEur: -1 })
          .select('playerId name currentClub nationality position age originalImageUrl')
          .lean();

        const uniqueClubRepresentatives: any[] = [];
        const seenClubs = new Set<string>();
        for (const p of stars) {
          const cid = p.currentClub?.id || p.currentClub?.name;
          if (cid && !seenClubs.has(cid)) {
            seenClubs.add(cid);
            uniqueClubRepresentatives.push(p);
          }
        }

        if (uniqueClubRepresentatives.length > 0) {
          const idx = Math.max(0, (levelNumber - 1) % uniqueClubRepresentatives.length);
          player = uniqueClubRepresentatives[idx];
        }
      } else {
        const topPoolSize = 250;
        const stars = await PlayerModel.find({ isActive: true, ...leagueFilter })
          .sort({ marketValueEur: -1 })
          .limit(topPoolSize)
          .lean();

        if (stars.length > 0) {
          const offset = gameMode === 'contextinho' ? 17 : gameMode === 'careerPath' ? 7 : 0;
          const skipIndex = Math.max(0, (levelNumber - 1 + offset) % stars.length);
          player = stars[skipIndex];
        }
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
      rewardCoins: level ? level.rewardCoins : gameMode === 'careerPath' || gameMode === 'contextinho' ? 35 : 30,
      rewardXp: level ? level.rewardXp : gameMode === 'careerPath' || gameMode === 'contextinho' ? 60 : 50,
      hints: level ? level.hints : [`${player.nationality} - ${player.position}`],
    };

    if (gameMode === 'whoAreYa' || gameMode === 'contextinho') {
      response.blurImages = player.blurImages;
      response.initialBlurImageUrl = player.blurImages?.[0] || player.originalImageUrl;
      response.imageUrl = player.originalImageUrl;
    } else if (gameMode === 'clubLogo') {
      const logoUrl =
        player.currentClub?.logoUrl ||
        `https://tmssl.akamaized.net/images/wappen/head/${player.currentClub?.id || '36'}.png`;
      response.imageUrl = logoUrl;
      response.initialBlurImageUrl = logoUrl;
      response.hints = [`Kadrodaki Yıldız: ${player.name} (${player.position})`];
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
    const isCorrect =
      levelData.targetPlayerId === guessedPlayerId ||
      (gameMode === 'clubLogo' &&
        levelData.playerClub.toLowerCase() === guessedPlayerId.toLowerCase());

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
      .sort({ marketValueEur: -1 })
      .limit(300)
      .select('playerId name currentClub nationality position age careerPath blurImages originalImageUrl')
      .lean();

    const explicitPlayers = await PlayerModel.find({ playerId: { $in: explicitPlayerIds } })
      .select('playerId name currentClub nationality position age careerPath blurImages originalImageUrl')
      .lean();

    const playerMap = new Map<string, any>();
    activePlayers.forEach((p) => playerMap.set(p.playerId, p));
    explicitPlayers.forEach((p) => playerMap.set(p.playerId, p));

    let pool = activePlayers;
    if (gameMode === 'clubLogo') {
      const seenClubs = new Set<string>();
      pool = [];
      for (const p of activePlayers) {
        const cid = p.currentClub?.id || p.currentClub?.name;
        if (cid && !seenClubs.has(cid)) {
          seenClubs.add(cid);
          pool.push(p);
        }
      }
    }

    const result: ILevelClientResponse[] = [];
    const poolCount = pool.length;

    for (let lvl = fromLevel; lvl <= toLevel; lvl++) {
      const explicitLevel = explicitLevelMap.get(lvl);
      let player: any = null;

      if (explicitLevel && gameMode !== 'clubLogo') {
        player = playerMap.get(explicitLevel.playerId);
      }

      if (!player && poolCount > 0) {
        const offset = gameMode === 'contextinho' ? 17 : gameMode === 'careerPath' ? 7 : 0;
        const skipIndex = Math.max(0, (lvl - 1 + offset) % poolCount);
        player = pool[skipIndex];
      }

      if (!player) continue;

      const item: ILevelClientResponse = {
        levelNumber: lvl,
        gameMode,
        leagueMode,
        targetPlayerId: player.playerId,
        playerName: player.name,
        playerClub: player.currentClub?.name || '',
        rewardCoins: explicitLevel ? explicitLevel.rewardCoins : gameMode === 'careerPath' || gameMode === 'contextinho' ? 35 : 30,
        rewardXp: explicitLevel ? explicitLevel.rewardXp : gameMode === 'careerPath' || gameMode === 'contextinho' ? 60 : 50,
        hints: explicitLevel ? explicitLevel.hints : [`${player.nationality} - ${player.position}`],
      };

      if (gameMode === 'whoAreYa' || gameMode === 'contextinho') {
        item.blurImages = player.blurImages || [];
        item.initialBlurImageUrl = player.blurImages?.[0] || player.originalImageUrl;
        item.imageUrl = player.originalImageUrl;
      } else if (gameMode === 'clubLogo') {
        const logoUrl =
          player.currentClub?.logoUrl ||
          `https://tmssl.akamaized.net/images/wappen/head/${player.currentClub?.id || '36'}.png`;
        item.imageUrl = logoUrl;
        item.initialBlurImageUrl = logoUrl;
        item.hints = [`Kadrodaki Yıldız: ${player.name} (${player.position})`];
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
