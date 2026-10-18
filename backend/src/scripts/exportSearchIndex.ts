import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { PlayerModel } from '../models/Player';
import { connectDatabase } from '../config/db';

export async function exportSearchIndex(): Promise<void> {
  await connectDatabase();

  console.log('📦 Generating lightweight search index (~350KB)...');

  const players = await PlayerModel.find({ isActive: true })
    .select('playerId name nationality position currentClub leagues age shirtNumber')
    .lean();

  const lightList = players.map((p) => ({
    id: p.playerId,
    name: p.name,
    nationality: p.nationality,
    position: p.position,
    club: p.currentClub.name,
    league: p.currentClub.league,
    age: p.age,
    shirtNumber: p.shirtNumber,
  }));

  const jsonContent = JSON.stringify(lightList);
  const sizeKb = (Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(2);

  const backendOutputDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(backendOutputDir)) {
    fs.mkdirSync(backendOutputDir, { recursive: true });
  }
  const backendFilePath = path.join(backendOutputDir, 'search-index.json');
  fs.writeFileSync(backendFilePath, jsonContent, 'utf8');
  console.log(`✅ Saved backend search index: ${backendFilePath} (${sizeKb} KB, ${lightList.length} players)`);

  const mobileOutputDir = path.resolve(__dirname, '../../../mobile/src/assets/data');
  if (!fs.existsSync(mobileOutputDir)) {
    fs.mkdirSync(mobileOutputDir, { recursive: true });
  }
  const mobileFilePath = path.join(mobileOutputDir, 'search-index.json');
  fs.writeFileSync(mobileFilePath, jsonContent, 'utf8');
  console.log(`✅ Saved mobile bundled search index: ${mobileFilePath}`);

  await mongoose.disconnect();
}

if (require.main === module) {
  exportSearchIndex().catch(console.error);
}
