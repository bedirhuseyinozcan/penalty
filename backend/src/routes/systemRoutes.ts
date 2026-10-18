import { Router } from 'express';
import { getSystemTime, getHealth } from '../controllers/systemController';

const router = Router();

router.get('/time', getSystemTime);
router.get('/health', getHealth);

export const systemRoutes = router;
