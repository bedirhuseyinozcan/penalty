import { DailyChallengeModel } from '../models/DailyChallenge';
import { PlayerModel } from '../models/Player';
import { GameMode, LeagueMode } from '../config/constants';
import { AppError } from '../middlewares/errorHandler';
import { fixAndOrderCareerPath } from '../utils/careerPathUtils';

export interface IDailyChallengeClientResponse {
  id: string;
  date: string;
  gameMode: GameMode;
  leagueMode: LeagueMode;
  difficulty: string;
  targetPlayerId: string;
  playerName: string;
  playerClub: string;
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

    let player: any = null;
    let challengeId = `auto_${today}_${gameMode}_${leagueMode}`;
    let difficulty = 'medium';

    if (challenge && gameMode !== 'clubLogo') {
      player = await PlayerModel.findOne({ playerId: challenge.playerId }).lean();
      challengeId = (challenge._id as unknown as string).toString();
      difficulty = challenge.difficulty;
    }

    if (!player) {
      const leagueFilter =
        leagueMode === 'super_lig'
          ? { 'currentClub.league': 'super_lig' }
          : { 'currentClub.league': { $ne: 'super_lig' } };

      const activePlayers = await PlayerModel.find({ isActive: true, ...leagueFilter })
        .sort({ marketValueEur: -1 })
        .limit(180)
        .select('playerId name currentClub nationality position age careerPath blurImages originalImageUrl')
        .lean();

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

      if (pool.length > 0) {
        let hash = 0;
        const seedStr = `${today}_${gameMode}_${leagueMode}`;
        for (let i = 0; i < seedStr.length; i++) {
          hash = (hash << 5) - hash + seedStr.charCodeAt(i);
          hash |= 0;
        }
        const index = Math.abs(hash) % pool.length;
        player = pool[index];
      }
    }

    if (!player) {
      throw new AppError(
        `Daily challenge not available for date ${today} (${gameMode}/${leagueMode})`,
        404
      );
    }

    const response: IDailyChallengeClientResponse = {
      id: challengeId,
      date: today,
      gameMode,
      leagueMode,
      targetPlayerId: player.playerId,
      playerName: player.name,
      playerClub: player.isLegend
        ? '👑 Efsane İkon'
        : player.currentClub?.name || '',
      difficulty,
      serverUtcTime: new Date().toISOString(),
    };

    if (gameMode === 'whoAreYa' || gameMode === 'contextinho') {
      response.blurImages = player.blurImages;
      response.initialBlurImageUrl = player.blurImages?.[0] || player.originalImageUrl;
      response.imageUrl = player.originalImageUrl;
    } else if (gameMode === 'clubLogo') {
      const cleanId = String(player.currentClub?.id || '36').replace(/^club_/, '');
      const logoUrl =
        player.currentClub?.logoUrl ||
        `https://tmssl.akamaized.net/images/wappen/head/${cleanId}.png`;
      response.imageUrl = logoUrl;
      response.initialBlurImageUrl = logoUrl;
    } else if (gameMode === 'careerPath') {
      response.imageUrl = player.originalImageUrl;
      response.careerPath = player.isLegend
        ? player.careerPath
        : fixAndOrderCareerPath(
            player.careerPath,
            player.currentClub?.name,
            player.age
          );
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
