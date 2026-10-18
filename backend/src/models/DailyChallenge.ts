import { Schema, model, Document, Types } from 'mongoose';
import { GameMode, LeagueMode } from '../config/constants';

export interface IDailyChallenge extends Document {
  date: string;
  gameMode: GameMode;
  leagueMode: LeagueMode;
  playerId: string;
  playerRef: Types.ObjectId; 
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

const DailyChallengeSchema = new Schema<IDailyChallenge>(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    gameMode: {
      type: String,
      required: true,
      enum: ['whoAreYa', 'careerPath'],
      index: true,
    },
    leagueMode: {
      type: String,
      required: true,
      enum: ['global', 'super_lig'],
      index: true,
    },
    playerId: {
      type: String,
      required: true,
      index: true,
    },
    playerRef: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    hints: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

DailyChallengeSchema.index(
  { date: 1, gameMode: 1, leagueMode: 1 },
  { unique: true }
);

export const DailyChallengeModel = model<IDailyChallenge>(
  'DailyChallenge',
  DailyChallengeSchema
);
