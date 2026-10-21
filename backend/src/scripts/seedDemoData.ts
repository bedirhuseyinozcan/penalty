import mongoose from 'mongoose';
import { PlayerModel } from '../models/Player';
import { DailyChallengeModel } from '../models/DailyChallenge';
import { LevelModel } from '../models/Level';
import { connectDatabase } from '../config/db';
import { exportSearchIndex } from './exportSearchIndex';

export async function seedDemoData(): Promise<void> {
  await connectDatabase();
  console.log('🧹 Eski sezonlardan (25-26) kalan sabit Level ve DailyChallenge kayıtları temizleniyor...');

  // 1. Eski sabit Level ve DailyChallenge kayıtlarını sıfırla ki 26-27 havuzundan yeniden üretilsin
  await DailyChallengeModel.deleteMany({});
  await LevelModel.deleteMany({});

  // 2. Veritabanındaki gerçek 2026-27 aktif oyuncularını kontrol et
  const superLigStars = await PlayerModel.find({
    isActive: true,
    'currentClub.league': 'super_lig',
  })
    .sort({ marketValueEur: -1 })
    .limit(20)
    .lean();

  const globalStars = await PlayerModel.find({
    isActive: true,
    'currentClub.league': { $ne: 'super_lig' },
  })
    .sort({ marketValueEur: -1 })
    .limit(20)
    .lean();

  if (superLigStars.length === 0 || globalStars.length === 0) {
    console.warn(
      '⚠️ Veritabanında 2026-27 canlı oyuncu bulunamadı! Lütfen önce "npm run pipeline:sync-live" komutunu çalıştırın.'
    );
    await mongoose.disconnect();
    return;
  }

  console.log(
    `✅ 2026-27 Canlı Havuz Doğrulandı: Süper Lig (${superLigStars.length} yıldız), Global (${globalStars.length} yıldız)`
  );

  // 3. Bugünün (UTC) Günün Sorularını 2026-27 canlı yıldızlarından ata
  const todayUtc = new Date().toISOString().split('T')[0];
  const challenges = [
    {
      date: todayUtc,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      playerId: superLigStars[0].playerId,
      playerRef: superLigStars[0]._id,
      hints: [`${superLigStars[0].nationality} • ${superLigStars[0].position}`],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      playerId: globalStars[0].playerId,
      playerRef: globalStars[0]._id,
      hints: [`${globalStars[0].nationality} • ${globalStars[0].position}`],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      playerId: superLigStars[1]?.playerId || superLigStars[0].playerId,
      playerRef: superLigStars[1]?._id || superLigStars[0]._id,
      hints: [`Güncel Kulüp: ${superLigStars[1]?.currentClub?.name || superLigStars[0].currentClub.name}`],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'careerPath',
      leagueMode: 'global',
      playerId: globalStars[1]?.playerId || globalStars[0].playerId,
      playerRef: globalStars[1]?._id || globalStars[0]._id,
      hints: [`Güncel Kulüp: ${globalStars[1]?.currentClub?.name || globalStars[0].currentClub.name}`],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'clubLogo',
      leagueMode: 'super_lig',
      playerId: superLigStars[2]?.playerId || superLigStars[0].playerId,
      playerRef: superLigStars[2]?._id || superLigStars[0]._id,
      hints: [`Kadrodaki Yıldız: ${superLigStars[2]?.name || superLigStars[0].name}`],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'clubLogo',
      leagueMode: 'global',
      playerId: globalStars[2]?.playerId || globalStars[0].playerId,
      playerRef: globalStars[2]?._id || globalStars[0]._id,
      hints: [`Kadrodaki Yıldız: ${globalStars[2]?.name || globalStars[0].name}`],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'contextinho',
      leagueMode: 'super_lig',
      playerId: superLigStars[3]?.playerId || superLigStars[0].playerId,
      playerRef: superLigStars[3]?._id || superLigStars[0]._id,
      hints: [`${superLigStars[3]?.nationality || superLigStars[0].nationality} • ${superLigStars[3]?.position || superLigStars[0].position}`],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'contextinho',
      leagueMode: 'global',
      playerId: globalStars[3]?.playerId || globalStars[0].playerId,
      playerRef: globalStars[3]?._id || globalStars[0]._id,
      hints: [`${globalStars[3]?.nationality || globalStars[0].nationality} • ${globalStars[3]?.position || globalStars[0].position}`],
      difficulty: 'medium',
    },
  ];

  for (const ch of challenges) {
    await DailyChallengeModel.findOneAndUpdate(
      { date: ch.date, gameMode: ch.gameMode, leagueMode: ch.leagueMode },
      { $set: ch },
      { upsert: true }
    );
  }

  // 4. Search Index'i de 2026-27 verisiyle yeniden dışa aktar
  await exportSearchIndex();

  console.log('🚀 2026-27 Sezonu Daily Challenge ve Search Index senkronizasyonu tamamlandı!');
  await mongoose.disconnect();
}

if (require.main === module) {
  seedDemoData().catch(console.error);
}
