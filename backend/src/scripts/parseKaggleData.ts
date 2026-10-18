import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import { PlayerModel, ICareerStep } from '../models/Player';
import { connectDatabase } from '../config/db';
import { fixAndOrderCareerPath } from '../utils/careerPathUtils';
import { SUPPORTED_LEAGUES } from '../config/constants';

const COMPETITION_LEAGUE_MAP: Record<string, string> = {
  TR1: SUPPORTED_LEAGUES.SUPER_LIG,
  GB1: SUPPORTED_LEAGUES.PREMIER_LEAGUE,
  ES1: SUPPORTED_LEAGUES.LA_LIGA,
  IT1: SUPPORTED_LEAGUES.SERIE_A,
  L1: SUPPORTED_LEAGUES.BUNDESLIGA,
  FR1: SUPPORTED_LEAGUES.LIGUE_1,
};

interface ITargetPlayerBrief {
  tmid: string;
  name: string;
  shirtNumber?: number;
  league: string;
  teamId: string;
  teamName: string;
}

function parseSafeInt(val: any): number | undefined {
  if (!val || val === 'NULL' || val === 'null' || val === '-' || val === 'NaN') return undefined;
  const num = parseInt(String(val).trim(), 10);
  return isNaN(num) ? undefined : num;
}

function parseSafeFloat(val: any): number {
  if (!val || val === 'NULL' || val === 'null' || val === 'NaN') return 0;
  const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? 0 : num;
}

export async function runKaggleImportPipeline(csvDirectoryPath: string): Promise<void> {
  await connectDatabase();

  console.log(`📁 Scanning Kaggle dataset at: ${csvDirectoryPath}`);

  const playerListFile = path.join(csvDirectoryPath, 'player_list.csv');
  const playerBioFile = path.join(csvDirectoryPath, 'player_bio.csv');
  const perfClubFile = path.join(csvDirectoryPath, 'player_perf_by_club.csv');

  if (!fs.existsSync(playerListFile) || !fs.existsSync(playerBioFile)) {
    console.error(`❌ Required CSV files missing in: ${csvDirectoryPath}`);
    return;
  }

  console.log('🔄 Step 1: Identifying active players in Super Lig & Top 5 European leagues...');
  const targetPlayers = new Map<string, ITargetPlayerBrief>();

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(playerListFile)
      .pipe(csv())
      .on('data', (row: any) => {
        const compId = (row.competition_id || '').toUpperCase().trim();
        const league = COMPETITION_LEAGUE_MAP[compId];

        if (league && row.tmid) {
          const tmid = String(row.tmid).trim();
          targetPlayers.set(tmid, {
            tmid,
            name: row.player || 'Unknown Player',
            shirtNumber: parseSafeInt(row.shirtNumber),
            league,
            teamId: String(row.team_id || ''),
            teamName: row.team || 'Unknown Club',
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Filtered ${targetPlayers.size} active players playing in target leagues.`);
        resolve();
      })
      .on('error', reject);
  });

  const careerPaths = new Map<string, ICareerStep[]>();
  if (fs.existsSync(perfClubFile)) {
    console.log('🔄 Step 2: Extracting career paths and club histories...');
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(perfClubFile)
        .pipe(csv())
        .on('data', (row: any) => {
          const tmid = String(row.tmid).trim();
          if (!targetPlayers.has(tmid)) return;

          const clubName = row.club_name;
          if (!clubName) return;

          if (!careerPaths.has(tmid)) {
            careerPaths.set(tmid, []);
          }

          const steps = careerPaths.get(tmid)!;
    
          if (!steps.some((s) => s.clubName.toLowerCase() === clubName.toLowerCase())) {
            steps.push({
              clubName,
              clubLogoUrl: row.club_logo || '',
              startYear: 2020, 
              apps: parseSafeInt(row.appearances) ?? 0,
              goals: parseSafeInt(row.goals_scored) ?? 0,
            });
          }
        })
        .on('end', () => {
          console.log(`✅ Loaded career paths for ${careerPaths.size} players.`);
          resolve();
        })
        .on('error', reject);
    });
  }

  
  console.log('🔄 Step 3: Merging bio data (nationality, age, position, image) and upserting into MongoDB...');
  let totalImported = 0;
  const batchSize = 300;
  let batch: any[] = [];

  const stream = fs.createReadStream(playerBioFile).pipe(csv());

  for await (const row of stream as AsyncIterable<any>) {
    const tmid = String(row.tmid).trim();
    const brief = targetPlayers.get(tmid);

    if (!brief) continue;

    const age = parseSafeInt(row.age) ?? 25;
    const position = row.main_position || row.position_group || 'MF';
    const nationality = row.nationality || 'Unknown';
    const marketValue = parseSafeFloat(row.market_value_cur);
    const imageUrl = row.image_url || '';

    const playerCareer = careerPaths.get(tmid);
    const rawCareer: ICareerStep[] =
      playerCareer && playerCareer.length > 0
        ? playerCareer
        : [
            {
              clubName: brief.teamName,
              startYear: 2024,
            },
          ];
    const careerPath = fixAndOrderCareerPath(rawCareer, brief.teamName, age);

    const playerDoc = {
      playerId: `tmid_${tmid}`,
      name: row.player_name || brief.name,
      knownName: row.player_short_name || row.player_nickname || brief.name,
      leagues: [brief.league],
      currentClub: {
        id: `club_${brief.teamId}`,
        name: brief.teamName,
        league: brief.league,
      },
      nationality,
      position,
      age,
      shirtNumber: brief.shirtNumber ?? parseSafeInt(row.jersey),
      marketValueEur: marketValue,
      originalImageUrl: imageUrl,
      blurImages: [], 
      careerPath,
      isActive: true,
    };

    batch.push({
      updateOne: {
        filter: { playerId: playerDoc.playerId },
        update: { $set: playerDoc },
        upsert: true,
      },
    });

    if (batch.length >= batchSize) {
      await PlayerModel.bulkWrite(batch);
      totalImported += batch.length;
      console.log(`⚡ Saved ${totalImported} / ${targetPlayers.size} players to MongoDB...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await PlayerModel.bulkWrite(batch);
    totalImported += batch.length;
  }

  console.log(`🎉 Pipeline successfully completed! Imported ${totalImported} players.`);
  await mongoose.disconnect();
}

if (require.main === module) {
  const targetDir = process.argv[2] || path.resolve(__dirname, '../../data/kaggle');
  runKaggleImportPipeline(targetDir).catch(console.error);
}
