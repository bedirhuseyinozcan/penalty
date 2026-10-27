import { Router } from 'express';
import { getSearchIndex } from '../controllers/playerController';

const router = Router();

router.get('/search-index', getSearchIndex);

export const playerRoutes = router;
