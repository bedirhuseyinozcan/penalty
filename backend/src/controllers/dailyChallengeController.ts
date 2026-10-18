import { Request, Response, NextFunction } from 'express';
import { dailyChallengeService } from '../services/dailyChallengeService';
import { GameMode, LeagueMode } from '../config/constants';

export const getTodayChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameMode = (req.query.gameMode as GameMode) || 'whoAreYa';
    const leagueMode = (req.query.leagueMode as LeagueMode) || 'global';

    const challenge = await dailyChallengeService.getTodayChallenge(gameMode, leagueMode);

    res.status(200).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDailyGuess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { challengeId, guessedPlayerId } = req.body;
    const result = await dailyChallengeService.verifyDailyGuess(challengeId, guessedPlayerId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
