import { Router } from 'express';
import { z } from 'zod';
import { getSearchIndex, getPlayerDetails, compareGuess } from '../controllers/playerController';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const compareGuessSchema = z.object({
  body: z.object({
    targetPlayerId: z.string().min(1, 'targetPlayerId is required'),
    guessedPlayerId: z.string().min(1, 'guessedPlayerId is required'),
  }),
});

router.get('/search-index', getSearchIndex);
router.get('/:playerId', getPlayerDetails);
router.post('/compare', validateRequest(compareGuessSchema), compareGuess);

export const playerRoutes = router;
