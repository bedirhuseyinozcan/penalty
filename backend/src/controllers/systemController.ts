import { Request, Response } from 'express';

export const getSystemTime = (_req: Request, res: Response): void => {
  const now = new Date();
  const utcDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const utcTimestamp = now.getTime();

  const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const secondsUntilReset = Math.floor((tomorrowUtc.getTime() - utcTimestamp) / 1000);

  res.status(200).json({
    success: true,
    serverUtcIso: now.toISOString(),
    serverUtcDate: utcDate,
    serverUtcTimestamp: utcTimestamp,
    secondsUntilDailyReset: secondsUntilReset,
  });
};

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
