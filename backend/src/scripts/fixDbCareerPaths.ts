import mongoose from 'mongoose';
import { PlayerModel } from '../models/Player';
import { fixAndOrderCareerPath } from '../utils/careerPathUtils';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/penalty_hub';

async function fixDbCareerPaths() {
  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB connected.');

  const players = await PlayerModel.find({}).lean();
  console.log(`📦 Found ${players.length} players. Updating career paths...`);

  let updatedCount = 0;
  for (const player of players) {
    if (!player.careerPath || player.careerPath.length === 0) continue;

    const fixed = fixAndOrderCareerPath(
      player.careerPath,
      player.currentClub?.name,
      player.age
    );

    await PlayerModel.updateOne(
      { _id: player._id },
      { $set: { careerPath: fixed } }
    );
    updatedCount++;
  }

  console.log(`🎉 Successfully updated ${updatedCount} players career paths in DB!`);
  await mongoose.disconnect();
}

fixDbCareerPaths().catch((err) => {
  console.error('❌ Error updating career paths:', err);
  process.exit(1);
});
