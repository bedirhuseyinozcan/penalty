import { Schema, model, Document, Types } from 'mongoose';
import { GameMode, LeagueMode } from '../config/constants';

export interface ILevel extends Document {
  levelNumber: number;
  gameMode: GameMode;
  leagueMode: LeagueMode;
  playerId: string;
  playerRef: Types.ObjectId;
  rewardCoins: number;
  rewardXp: number;
  hints: string[];
}

const LevelSchema = new Schema<ILevel>(
  {
    levelNumber: { type: Number, required: true, index: true },
    gameMode: { type: String, required: true, enum: ['whoAreYa', 'careerPath'], index: true },
    leagueMode: { type: String, required: true, enum: ['global', 'super_lig'], index: true },
    playerId: { type: String, required: true },
    playerRef: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
    rewardCoins: { type: Number, default: 25 },
    rewardXp: { type: Number, default: 50 },
    hints: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

LevelSchema.index({ levelNumber: 1, gameMode: 1, leagueMode: 1 }, { unique: true });

export const LevelModel = model<ILevel>('Level', LevelSchema);
