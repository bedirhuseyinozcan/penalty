import { Request, Response, NextFunction } from 'express';
import { playerService } from '../services/playerService';
import { LeagueMode } from '../config/constants';

export const getSearchIndex = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leagueMode = req.query.leagueMode as LeagueMode | undefined;
    const items = await playerService.getSearchIndex(leagueMode);

    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlayerDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { playerId } = req.params;
    const player = await playerService.getPlayerById(playerId);
    res.status(200).json({
      success: true,
      data: player,
    });
  } catch (error) {
    next(error);
  }
};

export const compareGuess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetPlayerId, guessedPlayerId } = req.body;
    const comparison = await playerService.compareGuess(targetPlayerId, guessedPlayerId);
    res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};
