import { Request, Response, NextFunction } from 'express';
import { playerService } from '../services/playerService';

export const getSearchIndex = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = await playerService.getSearchIndex();

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
