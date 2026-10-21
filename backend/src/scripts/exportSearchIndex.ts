import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { PlayerModel } from '../models/Player';
import { connectDatabase } from '../config/db';

const BAD_CLUB_NAMES = new Set(['Without Club', 'Unknown', 'Career break', 'Retired', 'Kulüp']);

function inferPlayerTrophies(player: any, allClubs: string[]): string[] {
  const trophies = new Set<string>();
  const nameLower = (player.name || '').toLowerCase();
  const natLower = (player.nationality || '').toLowerCase();
  const mv = player.marketValueEur || 0;

  const uclClubs = new Set([
    'Real Madrid',
    'Barcelona',
    'Bayern Munich',
    'Man City',
    'Manchester City',
    'Liverpool',
    'Chelsea',
    'Inter',
    'AC Milan',
  ]);

  const totalGoals = (player.careerPath || []).reduce(
    (acc: number, s: any) => acc + (s.goals || 0),
    0
  );

  if (allClubs.some((c) => uclClubs.has(c)) && (mv >= 25000000 || player.age >= 27)) {
    trophies.add('ucl');
  }

  if (
    ['argentina', 'france', 'germany', 'spain'].includes(natLower) &&
    (mv >= 20000000 || player.age >= 26)
  ) {
    trophies.add('world_cup');
  }

  if (allClubs.length >= 2 && (mv >= 10000000 || totalGoals >= 30 || player.age >= 28)) {
    trophies.add('league_champion');
  }

  if (
    totalGoals >= 50 ||
    ['mauro icardi', 'erling haaland', 'victor osimhen', 'edin džeko', 'kylian mbappé', 'harry kane', 'robert lewandowski'].some(
      (star) => nameLower.includes(star)
    )
  ) {
    trophies.add('golden_boot');
  }

  if (
    ['rodri', 'vinicius', 'bellingham', 'mbappé', 'haaland', 'messi', 'ronaldo', 'benzema', 'modric'].some(
      (star) => nameLower.includes(star)
    ) ||
    mv >= 85000000
  ) {
    trophies.add('ballon_dor');
  }

  return Array.from(trophies);
}

export async function exportSearchIndex(): Promise<void> {
  await connectDatabase();

  console.log('📦 Generating lightweight search index with career clubs & trophies...');

  const players = await PlayerModel.find({ isActive: true })
    .sort({ marketValueEur: -1 })
    .select(
      'playerId name nationality position currentClub leagues age shirtNumber careerPath marketValueEur originalImageUrl'
    )
    .lean();

  const lightList = players.map((p) => {
    const clubSet = new Set<string>();
    if (p.currentClub?.name && !BAD_CLUB_NAMES.has(p.currentClub.name)) {
      clubSet.add(p.currentClub.name.trim());
    }
    if (Array.isArray(p.careerPath)) {
      for (const step of p.careerPath) {
        const cName = step.clubName?.trim();
        if (cName && !BAD_CLUB_NAMES.has(cName)) {
          clubSet.add(cName);
        }
      }
    }

    const clubs = Array.from(clubSet);
    const trophies = inferPlayerTrophies(p, clubs);
    const cleanClubId = p.currentClub?.id ? String(p.currentClub.id).replace(/^club_/, '') : undefined;
    const clubLogo =
      p.currentClub?.logoUrl ||
      (cleanClubId ? `https://tmssl.akamaized.net/images/wappen/head/${cleanClubId}.png` : undefined);

    return {
      id: p.playerId,
      name: p.name,
      nationality: p.nationality,
      position: p.position,
      club: p.currentClub?.name || '',
      clubId: cleanClubId,
      league: p.currentClub?.league,
      age: p.age,
      shirtNumber: p.shirtNumber,
      imageUrl: p.originalImageUrl || undefined,
      logoUrl: clubLogo,
      clubs,
      ...(trophies.length > 0 ? { trophies } : {}),
    };
  });

  const jsonContent = JSON.stringify(lightList);
  const sizeKb = (Buffer.byteLength(jsonContent, 'utf8') / 1024).toFixed(2);

  const backendOutputDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(backendOutputDir)) {
    fs.mkdirSync(backendOutputDir, { recursive: true });
  }
  const backendFilePath = path.join(backendOutputDir, 'search-index.json');
  fs.writeFileSync(backendFilePath, jsonContent, 'utf8');
  console.log(
    `✅ Saved backend search index: ${backendFilePath} (${sizeKb} KB, ${lightList.length} players)`
  );

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
