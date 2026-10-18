import { Router } from 'express';
import { playerRoutes } from './playerRoutes';
import { dailyChallengeRoutes } from './dailyChallengeRoutes';
import { levelRoutes } from './levelRoutes';
import { systemRoutes } from './systemRoutes';

const router = Router();

router.use('/players', playerRoutes);
router.use('/daily', dailyChallengeRoutes);
router.use('/levels', levelRoutes);
router.use('/system', systemRoutes);

export const apiRouter = router;
