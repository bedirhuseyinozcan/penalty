import { Schema, model, Document } from 'mongoose';

export interface ICareerStep {
  clubName: string;
  clubLogoUrl?: string;
  startYear: number;
  endYear?: number;
  apps?: number;
  goals?: number;
}

export interface ICurrentClub {
  id: string;
  name: string;
  logoUrl?: string;
  league: string;
}

export interface IPlayer extends Document {
  playerId: string;
  name: string;
  knownName?: string;
  leagues: string[];
  currentClub: ICurrentClub;
  nationality: string;
  nationalityFlagUrl?: string;
  position: string;
  age: number;
  shirtNumber?: number;
  marketValueEur?: number;
  careerPath: ICareerStep[];
  blurImages: string[];
  originalImageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerStepSchema = new Schema<ICareerStep>(
  {
    clubName: { type: String, required: true },
    clubLogoUrl: { type: String, default: '' },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
    apps: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
  },
  { _id: false }
);

const CurrentClubSchema = new Schema<ICurrentClub>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    league: { type: String, required: true },
  },
  { _id: false }
);

const PlayerSchema = new Schema<IPlayer>(
  {
    playerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    knownName: { type: String, index: true },
    leagues: [{ type: String, index: true }],
    currentClub: { type: CurrentClubSchema, required: true },
    nationality: { type: String, required: true, index: true },
    nationalityFlagUrl: { type: String, default: '' },
    position: { type: String, required: true, index: true },
    age: { type: Number, required: true },
    shirtNumber: { type: Number },
    marketValueEur: { type: Number, default: 0 },
    careerPath: [CareerStepSchema],
    blurImages: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length === 0 || v.length === 8;
        },
        message: 'blurImages must have exactly 8 pre-processed URLs or be empty.',
      },
    },
    originalImageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete (ret as Record<string, unknown>)._id;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

PlayerSchema.index({ leagues: 1, isActive: 1 });
PlayerSchema.index({ nationality: 1, isActive: 1 });
PlayerSchema.index({ position: 1, isActive: 1 });

export const PlayerModel = model<IPlayer>('Player', PlayerSchema);
