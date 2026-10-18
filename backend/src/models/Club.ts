import { Schema, model, Document } from 'mongoose';

export interface IClub extends Document {
  clubId: string;
  name: string;
  shortName?: string;
  league: string;
  country: string;
  logoUrl?: string;
  stadium?: string;
}

const ClubSchema = new Schema<IClub>(
  {
    clubId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    shortName: { type: String },
    league: { type: String, required: true, index: true },
    country: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    stadium: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ClubModel = model<IClub>('Club', ClubSchema);
