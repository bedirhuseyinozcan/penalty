import { Request, Response, NextFunction } from 'express';
import { levelService } from '../services/levelService';
import { GameMode, LeagueMode } from '../config/constants';

export const getLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const levelNumber = parseInt(req.params.levelNumber, 10);
    const gameMode = (req.query.gameMode as GameMode) || 'whoAreYa';
    const leagueMode = (req.query.leagueMode as LeagueMode) || 'global';

    const level = await levelService.getLevel(levelNumber, gameMode, leagueMode);
    res.status(200).json({
      success: true,
      data: level,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const levelNumber = parseInt(req.params.levelNumber, 10);
    const { gameMode, leagueMode, guessedPlayerId } = req.body;

    const result = await levelService.verifyLevel(
      levelNumber,
      gameMode,
      leagueMode,
      guessedPlayerId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getLevelPack = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const gameMode = (req.query.gameMode as GameMode) || 'whoAreYa';
    const leagueMode = (req.query.leagueMode as LeagueMode) || 'global';
    const fromLevel = req.query.from ? parseInt(req.query.from as string, 10) : 1;
    const toLevel = req.query.to ? parseInt(req.query.to as string, 10) : 50;

    const pack = await levelService.getLevelPack(gameMode, leagueMode, fromLevel, toLevel);

    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
    res.status(200).json({
      success: true,
      count: pack.length,
      data: pack,
    });
  } catch (error) {
    next(error);
  }
};
