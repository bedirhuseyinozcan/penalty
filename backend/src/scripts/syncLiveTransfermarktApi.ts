import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PlayerModel, ICareerStep } from '../models/Player';
import { connectDatabase } from '../config/db';
import { SUPPORTED_LEAGUES, SupportedLeague } from '../config/constants';
import { exportSearchIndex } from './exportSearchIndex';

const TM_API_BASE = 'https://tmapi-alpha.transfermarkt.technology';
const CACHE_DIR = path.resolve(__dirname, '../../data/tm_live_cache');

const COMPETITION_LEAGUE_MAP: Record<string, SupportedLeague> = {
  TR1: SUPPORTED_LEAGUES.SUPER_LIG,
  GB1: SUPPORTED_LEAGUES.PREMIER_LEAGUE,
  ES1: SUPPORTED_LEAGUES.LA_LIGA,
  IT1: SUPPORTED_LEAGUES.SERIE_A,
  L1: SUPPORTED_LEAGUES.BUNDESLIGA,
  FR1: SUPPORTED_LEAGUES.LIGUE_1,
};

const COUNTRY_ID_FALLBACK: Record<number, string> = {
  174: 'Türkiye',
  189: 'England',
  157: 'Spain',
  75: 'Italy',
  40: 'Germany',
  50: 'France',
  24: 'Brazil',
  9: 'Argentina',
  136: 'Portugal',
  122: 'Netherlands',
  19: 'Belgium',
  37: 'Croatia',
  150: 'Serbia',
  124: 'Nigeria',
  149: 'Senegal',
  107: 'Morocco',
  38: "Cote d'Ivoire",
  54: 'Ghana',
  2: 'Egypt',
  4: 'Algeria',
  31: 'Cameroon',
  103: 'Mali',
  59: 'Guinea',
  125: 'Norway',
  147: 'Sweden',
  39: 'Denmark',
  135: 'Poland',
  190: 'Scotland',
  191: 'Wales',
  72: 'Republic of Ireland',
  167: 'Switzerland',
  127: 'Austria',
  177: 'Ukraine',
  53: 'Georgia',
  66: 'Hungary',
  140: 'Romania',
  56: 'Greece',
  172: 'Czech Republic',
  154: 'Slovakia',
  155: 'Slovenia',
  22: 'Bosnia-Herzegovina',
  83: 'Kosovo',
  3: 'Albania',
  100: 'North Macedonia',
  112: 'Montenegro',
  185: 'Uruguay',
  830: 'Colombia',
  32: 'Colombia',
  29: 'Chile',
  44: 'Ecuador',
  132: 'Paraguay',
  188: 'Venezuela',
  133: 'Peru',
  110: 'Mexico',
  184: 'United States',
  80: 'Canada',
  77: 'Japan',
  87: 'Korea, South',
  12: 'Australia',
  71: 'Iran',
  173: 'Tunisia',
  35: 'DR Congo',
  28: 'Burkina Faso',
  52: 'Gambia',
  192: 'Zambia',
  193: 'Zimbabwe',
  159: 'South Africa',
  74: 'Israel',
  73: 'Iceland',
  49: 'Finland',
};

interface IClubMeta {
  id: string;
  name: string;
  fullName: string;
  typeId: number;
  isSpecial: boolean;
  crestUrl: string;
  primaryCompetitionId?: string;
}

interface IClubPerfStat {
  clubKey: string;
  apps: number;
  goals: number;
}

function normalizeClubKey(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(jimnastik kulubu|spor kulubu|futbol kulubu|fk|sk|fc|as|s\.p\.a\.|a\.s\.|acf|bsc|vfb|tsv|sc|cf|cd|ud|rcd|real|club|sporting)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function fetchJsonWithRetry(url: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404) return null;
    } catch (err) {
      if (attempt === retries) throw err;
    }
    await new Promise((r) => setTimeout(r, 250 * attempt));
  }
  return null;
}

async function loadLocalBioAndPerfMaps(): Promise<{
  playerNationalityByTmid: Map<string, string>;
  perfByTmid: Map<string, IClubPerfStat[]>;
}> {
  const playerNationalityByTmid = new Map<string, string>();
  const perfByTmid = new Map<string, IClubPerfStat[]>();

  const bioPath = path.resolve(__dirname, '../../data/kaggle/player_bio.csv');
  if (fs.existsSync(bioPath)) {
    await new Promise<void>((resolve) => {
      fs.createReadStream(bioPath)
        .pipe(csv())
        .on('data', (row: any) => {
          if (row.tmid && row.nationality) {
            playerNationalityByTmid.set(String(row.tmid).trim(), String(row.nationality).trim());
          }
        })
        .on('end', () => resolve())
        .on('error', () => resolve());
    });
  }

  const perfPath = path.resolve(__dirname, '../../data/kaggle/player_perf_by_club.csv');
  if (fs.existsSync(perfPath)) {
    await new Promise<void>((resolve) => {
      fs.createReadStream(perfPath)
        .pipe(csv())
        .on('data', (row: any) => {
          const tmid = String(row.tmid || '').trim();
          const clubName = String(row.club_name || '').trim();
          if (!tmid || !clubName) return;
          const apps = parseInt(String(row.appearances || '0'), 10) || 0;
          const goals = parseInt(String(row.goals_scored || '0'), 10) || 0;
          if (!perfByTmid.has(tmid)) perfByTmid.set(tmid, []);
          perfByTmid.get(tmid)!.push({
            clubKey: normalizeClubKey(clubName),
            apps,
            goals,
          });
        })
        .on('end', () => resolve())
        .on('error', () => resolve());
    });
  }

  return { playerNationalityByTmid, perfByTmid };
}

function buildChronologicalCareerPath(
  terminatedTransfers: any[],
  currentClubId: string,
  currentClubMeta: IClubMeta | undefined,
  clubMap: Map<string, IClubMeta>,
  perfStats: IClubPerfStat[]
): ICareerStep[] {
  const sorted = [...(terminatedTransfers || [])]
    .filter((t) => !t.details?.isPending && t.details?.date)
    .sort((a, b) => String(a.details.date).localeCompare(String(b.details.date)));

  // Filter out administrative RETURNED_FROM_PREVIOUS_LOAN when followed within 105 days by another departure
  const cleanedTransfers: any[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    if (
      cur.typeDetails?.type === 'RETURNED_FROM_PREVIOUS_LOAN' &&
      next &&
      next.transferSource?.clubId === cur.transferDestination?.clubId
    ) {
      const d1 = new Date(cur.details.date).getTime();
      const d2 = new Date(next.details.date).getTime();
      const diffDays = (d2 - d1) / (1000 * 3600 * 24);
      if (diffDays <= 105) {
        continue;
      }
    }
    cleanedTransfers.push(cur);
  }

  const steps: Array<ICareerStep & { clubId: string }> = [];

  for (const t of cleanedTransfers) {
    const year = parseInt(String(t.details.date).substring(0, 4), 10);
    if (isNaN(year)) continue;

    const fromId = String(t.transferSource?.clubId || '');
    const toId = String(t.transferDestination?.clubId || '');
    const fromClub = clubMap.get(fromId);
    const toClub = clubMap.get(toId);

    // If first transfer originates from a senior first team, add it as starting step
    if (steps.length === 0 && fromClub && fromClub.typeId === 1 && !fromClub.isSpecial) {
      steps.push({
        clubId: fromClub.id,
        clubName: fromClub.name,
        clubLogoUrl: fromClub.crestUrl,
        startYear: year - 1,
        endYear: year,
      });
    }

    // Close previous open senior club step
    if (steps.length > 0) {
      const prevStep = steps[steps.length - 1];
      if (prevStep.endYear === undefined) {
        prevStep.endYear = year;
      }
    }

    // Add destination if it is a senior first team (typeId === 1)
    if (toClub && toClub.typeId === 1 && !toClub.isSpecial) {
      const prevStep = steps[steps.length - 1];
      if (prevStep && prevStep.clubId === toClub.id) {
        delete prevStep.endYear;
      } else {
        steps.push({
          clubId: toClub.id,
          clubName: toClub.name,
          clubLogoUrl: toClub.crestUrl,
          startYear: year,
        });
      }
    }
  }

  // Ensure current club is at the end
  if (currentClubMeta) {
    const last = steps[steps.length - 1];
    if (!last) {
      steps.push({
        clubId: currentClubMeta.id,
        clubName: currentClubMeta.name,
        clubLogoUrl: currentClubMeta.crestUrl,
        startYear: 2025,
      });
    } else if (last.clubId !== currentClubId && normalizeClubKey(last.clubName) !== normalizeClubKey(currentClubMeta.name)) {
      if (!last.endYear || last.endYear < 2025) {
        last.endYear = 2025;
      }
      steps.push({
        clubId: currentClubMeta.id,
        clubName: currentClubMeta.name,
        clubLogoUrl: currentClubMeta.crestUrl,
        startYear: 2025,
      });
    } else {
      delete last.endYear;
    }
  }

  if (steps.length > 0) {
    delete steps[steps.length - 1].endYear;
  }

  // Enrich with apps/goals where available and strip internal clubId
  return steps.map((s) => {
    const stepKey = normalizeClubKey(s.clubName);
    const stat = perfStats.find(
      (p) => p.clubKey && stepKey && (p.clubKey === stepKey || p.clubKey.includes(stepKey) || stepKey.includes(p.clubKey))
    );
    const result: ICareerStep = {
      clubName: s.clubName,
      clubLogoUrl: s.clubLogoUrl || '',
      startYear: s.startYear,
      apps: stat?.apps || 0,
      goals: stat?.goals || 0,
    };
    if (s.endYear !== undefined) {
      result.endYear = s.endYear;
    }
    return result;
  });
}

export async function syncLiveTransfermarktApi(): Promise<void> {
  console.log('🚀 Starting Live 2026-27 Transfermarkt JSON API Sync Pipeline...');
  await connectDatabase();

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const { playerNationalityByTmid, perfByTmid } = await loadLocalBioAndPerfMaps();
  const countryIdToName = new Map<number, string>(
    Object.entries(COUNTRY_ID_FALLBACK).map(([k, v]) => [Number(k), v])
  );

  // Step 1: Fetch live 2026-27 league tables for target competitions
  console.log('🔄 Step 1: Fetching live league tables (TR1, GB1, ES1, IT1, L1, FR1)...');
  const clubLeagueMap = new Map<string, SupportedLeague>();
  const targetClubIds: string[] = [];

  for (const [compId, league] of Object.entries(COMPETITION_LEAGUE_MAP)) {
    const res = await fetchJsonWithRetry(`${TM_API_BASE}/competition/${compId}/table`);
    const clubs = res?.data?.tables?.[0]?.clubs || [];
    for (const c of clubs) {
      const cid = String(c.clubId);
      clubLeagueMap.set(cid, league);
      targetClubIds.push(cid);
    }
    console.log(`  ✅ ${compId} (${league}): ${clubs.length} live clubs`);
  }

  // Step 2: Fetch live squads for all 114 clubs concurrently
  console.log(`🔄 Step 2: Fetching live squads for ${targetClubIds.length} clubs...`);
  const playerClubAssignment = new Map<string, { clubId: string; league: SupportedLeague; shirtNumber?: number }>();

  const squadConcurrency = 25;
  for (let i = 0; i < targetClubIds.length; i += squadConcurrency) {
    const chunk = targetClubIds.slice(i, i + squadConcurrency);
    await Promise.all(
      chunk.map(async (clubId) => {
        const league = clubLeagueMap.get(clubId)!;
        const data = await fetchJsonWithRetry(`${TM_API_BASE}/club/${clubId}/squad`);
        const squadList: any[] = data?.data?.squad || [];
        for (const item of squadList) {
          const pid = String(item.playerId);
          playerClubAssignment.set(pid, {
            clubId,
            league,
            shirtNumber: typeof item.shirtNumber === 'number' && item.shirtNumber > 0 ? item.shirtNumber : undefined,
          });
        }
      })
    );
  }
  console.log(`✅ Found ${playerClubAssignment.size} active squad players across all 6 leagues.`);

  // Step 3: Batch-fetch player profiles from /players?ids[]=
  console.log('🔄 Step 3: Batch-fetching live player profiles...');
  const allPlayerIds = Array.from(playerClubAssignment.keys());
  const playerProfiles = new Map<string, any>();
  const batchSize = 35;

  for (let i = 0; i < allPlayerIds.length; i += batchSize) {
    const chunk = allPlayerIds.slice(i, i + batchSize);
    const qs = chunk.map((id) => `ids[]=${id}`).join('&');
    const res = await fetchJsonWithRetry(`${TM_API_BASE}/players?${qs}`);
    for (const p of res?.data || []) {
      const pid = String(p.id);
      playerProfiles.set(pid, p);

      // Learn nationalityId -> country name from local bio map if available
      const natId = p.nationalityDetails?.nationalities?.nationalityId;
      const knownNat = playerNationalityByTmid.get(pid);
      if (natId && knownNat && !countryIdToName.has(Number(natId))) {
        countryIdToName.set(Number(natId), knownNat);
      }
    }
    if ((i / batchSize) % 15 === 0) {
      console.log(`  📥 Loaded ${playerProfiles.size} / ${allPlayerIds.length} player profiles...`);
    }
  }
  console.log(`✅ Loaded ${playerProfiles.size} live player profiles.`);

  // Step 4: Fetch transfer histories for all active players (using disk cache + 40x concurrency)
  console.log('🔄 Step 4: Fetching player transfer histories...');
  const historyCacheFile = path.join(CACHE_DIR, 'transfer_histories_26_27.json');
  let cachedHistories: Record<string, any> = {};
  if (fs.existsSync(historyCacheFile)) {
    try {
      cachedHistories = JSON.parse(fs.readFileSync(historyCacheFile, 'utf8'));
      console.log(`  ⚡ Loaded ${Object.keys(cachedHistories).length} cached transfer histories from disk.`);
    } catch {
      cachedHistories = {};
    }
  }

  const missingHistoryIds = allPlayerIds.filter((id) => !cachedHistories[id]);
  const historyConcurrency = 45;

  for (let i = 0; i < missingHistoryIds.length; i += historyConcurrency) {
    const chunk = missingHistoryIds.slice(i, i + historyConcurrency);
    await Promise.all(
      chunk.map(async (pid) => {
        const res = await fetchJsonWithRetry(`${TM_API_BASE}/transfer/history/player/${pid}`);
        if (res?.data) {
          cachedHistories[pid] = {
            terminated: res.data.history?.terminated || [],
            clubIds: res.data.clubIds || [],
          };
        } else {
          cachedHistories[pid] = { terminated: [], clubIds: [] };
        }
      })
    );
    if ((i / historyConcurrency) % 10 === 0 || i + historyConcurrency >= missingHistoryIds.length) {
      console.log(
        `  📥 Fetched ${Math.min(i + historyConcurrency, missingHistoryIds.length)} / ${missingHistoryIds.length} transfer histories...`
      );
    }
  }

  fs.writeFileSync(historyCacheFile, JSON.stringify(cachedHistories), 'utf8');
  console.log('✅ All player transfer histories ready and cached.');

  // Step 5: Collect all unique clubIds (current clubs + historical clubs) and batch-fetch metadata
  console.log('🔄 Step 5: Resolving metadata & logos for all career clubs...');
  const allUniqueClubIds = new Set<string>(targetClubIds);
  for (const pid of allPlayerIds) {
    const h = cachedHistories[pid];
    if (h?.clubIds) {
      for (const cid of h.clubIds) {
        if (cid) allUniqueClubIds.add(String(cid));
      }
    }
  }

  const clubCacheFile = path.join(CACHE_DIR, 'clubs_meta_26_27.json');
  let cachedClubs: Record<string, IClubMeta> = {};
  if (fs.existsSync(clubCacheFile)) {
    try {
      cachedClubs = JSON.parse(fs.readFileSync(clubCacheFile, 'utf8'));
    } catch {
      cachedClubs = {};
    }
  }

  const missingClubIds = Array.from(allUniqueClubIds).filter((cid) => !cachedClubs[cid]);
  const clubBatchSize = 40;
  for (let i = 0; i < missingClubIds.length; i += clubBatchSize) {
    const chunk = missingClubIds.slice(i, i + clubBatchSize);
    const qs = chunk.map((id) => `ids[]=${id}`).join('&');
    const res = await fetchJsonWithRetry(`${TM_API_BASE}/clubs?${qs}`);
    for (const c of res?.data || []) {
      const cid = String(c.id);
      cachedClubs[cid] = {
        id: cid,
        name: c.baseDetails?.shortName || c.name || 'Kulüp',
        fullName: c.name || c.baseDetails?.shortName || 'Kulüp',
        typeId: c.baseDetails?.clubTypeId ?? 1,
        isSpecial: Boolean(c.isSpecialClub),
        crestUrl: c.crestUrl || `https://tmssl.akamaized.net/images/wappen/head/${cid}.png`,
        primaryCompetitionId: c.baseDetails?.primaryCompetitionId,
      };
    }
    if ((i / clubBatchSize) % 15 === 0 && i > 0) {
      console.log(`  📥 Resolved ${i} / ${missingClubIds.length} clubs...`);
    }
  }
  fs.writeFileSync(clubCacheFile, JSON.stringify(cachedClubs), 'utf8');

  const clubMap = new Map<string, IClubMeta>(Object.entries(cachedClubs));
  console.log(`✅ Resolved ${clubMap.size} unique clubs with official names, types, and logos.`);

  // Step 6: Preserve existing blurImages in MongoDB & upsert live 2026-27 players
  console.log('🔄 Step 6: Updating MongoDB with live 2026-27 players and chronological career paths...');
  const existingDocs = await PlayerModel.find({}).select('playerId blurImages').lean();
  const existingBlurMap = new Map<string, string[]>();
  for (const doc of existingDocs) {
    if (doc.blurImages && doc.blurImages.length === 8) {
      existingBlurMap.set(doc.playerId, doc.blurImages);
    }
  }

  // Mark old players inactive first so relegated/departed players don't pollute active pool
  await PlayerModel.updateMany({}, { $set: { isActive: false } });

  const bulkOps: any[] = [];
  for (const pid of allPlayerIds) {
    const p = playerProfiles.get(pid);
    const assignment = playerClubAssignment.get(pid);
    if (!p || !assignment) continue;

    const playerId = `tmid_${pid}`;
    const currentClubMeta = clubMap.get(assignment.clubId);
    const clubName = currentClubMeta?.name || 'Kulüp';
    const clubLogo = currentClubMeta?.crestUrl || `https://tmssl.akamaized.net/images/wappen/head/${assignment.clubId}.png`;

    const historyData = cachedHistories[pid] || { terminated: [] };
    const perfStats = perfByTmid.get(pid) || [];
    const careerPath = buildChronologicalCareerPath(
      historyData.terminated,
      assignment.clubId,
      currentClubMeta,
      clubMap,
      perfStats
    );

    const natId = Number(p.nationalityDetails?.nationalities?.nationalityId || 0);
    const nationality =
      playerNationalityByTmid.get(pid) ||
      countryIdToName.get(natId) ||
      'Unknown';

    const position =
      p.attributes?.position?.shortName ||
      p.attributes?.positionGroup ||
      'MF';

    const age = p.lifeDates?.age || 25;
    const marketValueEur = p.marketValueDetails?.current?.value || 0;
    const originalImageUrl = p.portraitUrl || '';
    const blurImages = existingBlurMap.get(playerId) || [];

    const currentAssignment = (p.clubAssignments || []).find((a: any) => a.type === 'current');
    const shirtNumber = assignment.shirtNumber ?? currentAssignment?.shirtNumber;

    bulkOps.push({
      updateOne: {
        filter: { playerId },
        update: {
          $set: {
            playerId,
            name: p.name || p.displayName || 'Unknown Player',
            knownName: p.shortName || p.name,
            leagues: [assignment.league],
            currentClub: {
              id: assignment.clubId,
              name: clubName,
              logoUrl: clubLogo,
              league: assignment.league,
            },
            nationality,
            position,
            age,
            marketValueEur,
            careerPath,
            originalImageUrl,
            isActive: true,
            ...(typeof shirtNumber === 'number' && shirtNumber > 0 ? { shirtNumber } : {}),
            ...(blurImages.length === 8 ? { blurImages } : {}),
          },
        },
        upsert: true,
      },
    });
  }

  const writeChunkSize = 500;
  for (let i = 0; i < bulkOps.length; i += writeChunkSize) {
    const chunk = bulkOps.slice(i, i + writeChunkSize);
    await PlayerModel.bulkWrite(chunk);
    console.log(`  💾 Upserted ${Math.min(i + writeChunkSize, bulkOps.length)} / ${bulkOps.length} players...`);
  }

  // Step 7: Spotlight Verification
  console.log('\n🔍 Live 2026-27 Spotlight Verification:');
  const spotlightIds = [
    'tmid_382528', // Kerem Aktürkoğlu
    'tmid_292199', // Uğurcan Çakır
    'tmid_401923', // Victor Osimhen
    'tmid_68863',  // Mauro Icardi
    'tmid_581678', // Jude Bellingham
    'tmid_861410', // Arda Güler
    'tmid_369316', // Ferdi Kadıoğlu
    'tmid_418560', // Erling Haaland
  ];

  const spotlightDocs = await PlayerModel.find({ playerId: { $in: spotlightIds } }).lean();
  for (const doc of spotlightDocs) {
    console.log(
      `\n⭐ ${doc.name} (#${doc.shirtNumber ?? '-'} | ${doc.currentClub.name} | ${doc.position} | Yaş: ${doc.age} | ${doc.nationality})`
    );
    doc.careerPath.forEach((step, idx) => {
      const yrs = step.endYear ? `${step.startYear} - ${step.endYear}` : `${step.startYear} - Günümüz`;
      const stats = step.apps ? ` [${step.apps} maç, ${step.goals ?? 0} gol]` : '';
      console.log(`   ${idx + 1}. ${step.clubName} (${yrs})${stats}`);
    });
  }

  // Step 8: Export Search Index
  console.log('\n📦 Exporting updated search-index.json to backend & mobile...');
  await exportSearchIndex();

  console.log('🎉 Live 2026-27 Transfermarkt API Sync completed successfully!');
}

if (require.main === module) {
  syncLiveTransfermarktApi()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Fatal error in syncLiveTransfermarktApi:', err);
      process.exit(1);
    });
}
