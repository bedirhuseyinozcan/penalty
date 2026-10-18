import { Router } from 'express';
import { z } from 'zod';
import { getTodayChallenge, verifyDailyGuess } from '../controllers/dailyChallengeController';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const verifyDailyGuessSchema = z.object({
  body: z.object({
    challengeId: z.string().min(1, 'challengeId is required'),
    guessedPlayerId: z.string().min(1, 'guessedPlayerId is required'),
  }),
});

router.get('/today', getTodayChallenge);
router.post('/verify', validateRequest(verifyDailyGuessSchema), verifyDailyGuess);

export const dailyChallengeRoutes = router;
