import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { PlayerModel } from '../models/Player';
import { connectDatabase } from '../config/db';
import { fixAndOrderCareerPath } from '../utils/careerPathUtils';

import { CLUB_TO_LEAGUE_MAP } from '../data/clubs/clubToLeagueMap';
import {
  UCL_WINNER_TMIDS,
  WORLD_CUP_WINNER_TMIDS,
  BALLON_DOR_WINNER_TMIDS,
  GOLDEN_BOOT_WINNER_TMIDS,
  LEAGUE_CHAMPION_WINNER_TMIDS,
  LEAGUE_CHAMPION_CLUB_YEARS,
  CALENDAR_YEAR_CHAMPION_CLUBS,
} from '../data/trophies';

export {
  CLUB_TO_LEAGUE_MAP,
  UCL_WINNER_TMIDS,
  WORLD_CUP_WINNER_TMIDS,
  BALLON_DOR_WINNER_TMIDS,
  GOLDEN_BOOT_WINNER_TMIDS,
  LEAGUE_CHAMPION_WINNER_TMIDS,
  LEAGUE_CHAMPION_CLUB_YEARS,
  CALENDAR_YEAR_CHAMPION_CLUBS,
};

const BAD_CLUB_NAMES = new Set(['Without Club', 'Unknown', 'Career break', 'Retired', 'Kulüp']);

function normalizeTrophyName(str: string): string {
  return (str || '')
    .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/ß/g, 'ss')
    .replace(/đ/g, 'd')
    .replace(/ð/g, 'd')
    .replace(/þ/g, 'th')
    .replace(/ł/g, 'l')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function didWinLeagueByCareerPath(careerPath?: any[]): boolean {
  if (!Array.isArray(careerPath) || careerPath.length === 0) return false;
  for (const step of careerPath) {
    const clubName = (step.clubName || '').trim();
    const yrs = LEAGUE_CHAMPION_CLUB_YEARS[clubName];
    if (!yrs || typeof step.startYear !== 'number') continue;
    const end = step.endYear ?? 2026;
    const isCal = CALENDAR_YEAR_CHAMPION_CLUBS.has(clubName);
    const won = yrs.some(
      (y) =>
        (step.startYear <= y - 1 && end >= y) ||
        (isCal && step.startYear === y && end >= y)
    );
    if (won) return true;
  }
  return false;
}

function inferPlayerLeagues(player: any, allClubs: string[]): string[] {
  const leagueSet = new Set<string>();
  const isLegend = Boolean(player.isLegend);

  if (!isLegend && player.currentClub?.league && player.currentClub.league !== 'global') {
    leagueSet.add(player.currentClub.league);
  }
  for (const club of allClubs) {
    const mapped = CLUB_TO_LEAGUE_MAP[club.trim()];
    if (mapped) {
      leagueSet.add(mapped);
    }
  }

  return Array.from(leagueSet);
}

// 🏆 Oyuncu Kupalarını TMID Kümesi ve Sezon Doğrulamasıyla Belirler
export function inferPlayerTrophies(player: any, _allClubs: string[] = []): string[] {
  const trophies = new Set<string>();
  const rawId = String(player.playerId || player.id || '').trim();
  const pid = rawId ? (rawId.startsWith('tmid_') ? rawId : `tmid_${rawId}`) : '';

  if (pid) {
    if (UCL_WINNER_TMIDS.has(pid)) {
      trophies.add('ucl');
    }
    if (WORLD_CUP_WINNER_TMIDS.has(pid)) {
      trophies.add('world_cup');
    }
    if (BALLON_DOR_WINNER_TMIDS.has(pid)) {
      trophies.add('ballon_dor');
    }
    if (GOLDEN_BOOT_WINNER_TMIDS.has(pid)) {
      trophies.add('golden_boot');
    }
    if (LEAGUE_CHAMPION_WINNER_TMIDS.has(pid)) {
      trophies.add('league_champion');
    }
  }

  if (!trophies.has('league_champion') && didWinLeagueByCareerPath(player.careerPath)) {
    trophies.add('league_champion');
  }

  return Array.from(trophies);
}

export async function exportSearchIndex(): Promise<void> {
  await connectDatabase();

  console.log('📦 Generating lightweight search index with chronological careerPath, leagues & trophies...');

  const players = await PlayerModel.find({
    $or: [{ isActive: true }, { isLegend: true }],
  })
    .sort({ isLegend: 1, marketValueEur: -1 })
    .select(
      'playerId name nationality position currentClub leagues age shirtNumber careerPath marketValueEur originalImageUrl isLegend'
    )
    .lean();

  const lightList = players.map((p) => {
    const isLegend = Boolean((p as any).isLegend);
    const currentClubName = isLegend ? '' : p.currentClub?.name?.trim() || '';

    const orderedCareer = isLegend
      ? (p.careerPath || []).filter((s) => s.clubName && !BAD_CLUB_NAMES.has(s.clubName.trim()))
      : fixAndOrderCareerPath(p.careerPath, currentClubName, p.age);

    const clubSet = new Set<string>();
    for (const step of orderedCareer) {
      const cName = step.clubName?.trim();
      if (cName && !BAD_CLUB_NAMES.has(cName)) {
        clubSet.add(cName);
      }
    }
    if (currentClubName && !BAD_CLUB_NAMES.has(currentClubName)) {
      clubSet.add(currentClubName);
    }

    let displayName = (p.name || '').replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '').trim();
    if (p.playerId === 'tmid_18537') displayName = 'Alex de Souza';
    if (p.playerId === 'tmid_3140') displayName = 'Ronaldo Nazário';
    if (p.playerId === 'tmid_34495') displayName = 'Adriano Correia';
    if (p.playerId === 'tmid_52920') displayName = 'Marcelo Guedes';

    const NATIONALITY_FIXES: Record<string, string> = {
      'miralem pjanic': 'Bosnia-Herzegovina',
      'senad lulic': 'Bosnia-Herzegovina',
      'zvjezdan misimovic': 'Bosnia-Herzegovina',
      'elvir bolic': 'Bosnia-Herzegovina',
      'hristo stoichkov': 'Bulgaria',
      'dimitar berbatov': 'Bulgaria',
      'ivan cordoba': 'Colombia',
      'fredy guarin': 'Colombia',
      'jackson martinez': 'Colombia',
      'faryd mondragon': 'Colombia',
      'oscar cordoba': 'Colombia',
      'shabani nonda': 'DR Congo',
    };
    const fixedNationality =
      NATIONALITY_FIXES[normalizeTrophyName(displayName)] || p.nationality;

    const clubs = Array.from(clubSet);
    const leagues = inferPlayerLeagues(p, clubs);
    const trophies = inferPlayerTrophies(
      { ...p, name: displayName, nationality: fixedNationality, careerPath: orderedCareer },
      clubs
    );

    const cleanClubId =
      !isLegend && p.currentClub?.id
        ? String(p.currentClub.id).replace(/^club_/, '')
        : undefined;
    const clubLogo = isLegend
      ? undefined
      : p.currentClub?.logoUrl ||
        (cleanClubId
          ? `https://tmssl.akamaized.net/images/wappen/head/${cleanClubId}.png`
          : undefined);

    const compactCareerPath = orderedCareer.map((s) => ({
      clubName: s.clubName,
      startYear: s.startYear,
      ...(s.endYear !== undefined ? { endYear: s.endYear } : {}),
      ...(s.apps ? { apps: s.apps } : {}),
      ...(s.goals ? { goals: s.goals } : {}),
    }));

    return {
      id: p.playerId,
      name: displayName,
      nationality: fixedNationality,
      position: p.position,
      club: currentClubName,
      clubId: cleanClubId,
      league: p.currentClub?.league,
      leagues,
      age: p.age,
      shirtNumber: p.shirtNumber,
      imageUrl: p.originalImageUrl || undefined,
      logoUrl: clubLogo,
      clubs,
      careerPath: compactCareerPath,
      ...(trophies.length > 0 ? { trophies } : {}),
      ...(isLegend ? { isLegend: true } : {}),
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
