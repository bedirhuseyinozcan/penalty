import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { apiRouter } from './routes';
import { errorHandler, AppError } from './middlewares/errorHandler';
import { ENV } from './config/env';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(compression());

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  const staticPath = path.resolve(ENV.BLUR_STORAGE_PATH);
  app.use('/static/blurred', express.static(staticPath));

  app.use('/api/v1', apiRouter);

  app.use((req: Request, _res: Response, next) => {
    next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
  });

  app.use(errorHandler);

  return app;
};
