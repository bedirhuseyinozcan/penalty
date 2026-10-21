import { Router } from 'express';
import { z } from 'zod';
import { getLevel, verifyLevel, getLevelPack } from '../controllers/levelController';
import { validateRequest } from '../middlewares/validateRequest';
import { GAME_MODES } from '../config/constants';

const router = Router();

const verifyLevelSchema = z.object({
  body: z.object({
    gameMode: z.enum([
      'whoAreYa',
      'careerPath',
      'clubLogo',
      'contextinho',
      'ticTacToe',
      'footballBingo',
    ]),
    leagueMode: z.enum(['global', 'super_lig']),
    guessedPlayerId: z.string().min(1, 'guessedPlayerId is required'),
  }),
});

router.get('/pack', getLevelPack);
router.get('/:levelNumber', getLevel);
router.post('/:levelNumber/verify', validateRequest(verifyLevelSchema), verifyLevel);

export const levelRoutes = router;
