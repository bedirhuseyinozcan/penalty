import mongoose from 'mongoose';
import { PlayerModel } from '../models/Player';
import { DailyChallengeModel } from '../models/DailyChallenge';
import { LevelModel } from '../models/Level';
import { connectDatabase } from '../config/db';
import { SUPPORTED_LEAGUES } from '../config/constants';

const DEMO_PLAYERS = [
  {
    playerId: 'tmid_12345',
    name: 'Mauro Icardi',
    knownName: 'Icardi',
    leagues: [SUPPORTED_LEAGUES.SUPER_LIG, SUPPORTED_LEAGUES.SERIE_A, SUPPORTED_LEAGUES.LIGUE_1],
    currentClub: {
      id: 'club_galatasaray',
      name: 'Galatasaray',
      logoUrl: 'https://assets.penaltyhub.com/clubs/galatasaray.png',
      league: SUPPORTED_LEAGUES.SUPER_LIG,
    },
    nationality: 'Argentina',
    nationalityFlagUrl: 'https://assets.penaltyhub.com/flags/ar.png',
    position: 'CF',
    age: 33,
    shirtNumber: 9,
    marketValueEur: 15000000,
    careerPath: [
      { clubName: 'Barcelona (Youth)', startYear: 2008, endYear: 2011 },
      { clubName: 'Sampdoria', startYear: 2011, endYear: 2013, apps: 33, goals: 11 },
      { clubName: 'Inter', startYear: 2013, endYear: 2019, apps: 219, goals: 124 },
      { clubName: 'Paris Saint-Germain', startYear: 2019, endYear: 2022, apps: 92, goals: 38 },
      { clubName: 'Galatasaray', startYear: 2022, apps: 75, goals: 55 },
    ],
    blurImages: [],
    originalImageUrl: 'https://img.a.transfermarkt.technology/portrait/big/68863-1671105169.png',
    isActive: true,
  },
  {
    playerId: 'tmid_12346',
    name: 'Erling Haaland',
    knownName: 'Haaland',
    leagues: [SUPPORTED_LEAGUES.PREMIER_LEAGUE, SUPPORTED_LEAGUES.BUNDESLIGA],
    currentClub: {
      id: 'club_mancity',
      name: 'Manchester City',
      logoUrl: 'https://assets.penaltyhub.com/clubs/mancity.png',
      league: SUPPORTED_LEAGUES.PREMIER_LEAGUE,
    },
    nationality: 'Norway',
    nationalityFlagUrl: 'https://assets.penaltyhub.com/flags/no.png',
    position: 'CF',
    age: 26,
    shirtNumber: 9,
    marketValueEur: 180000000,
    careerPath: [
      { clubName: 'Bryne FK', startYear: 2015, endYear: 2017 },
      { clubName: 'Molde', startYear: 2017, endYear: 2019, apps: 50, goals: 20 },
      { clubName: 'Red Bull Salzburg', startYear: 2019, endYear: 2020, apps: 27, goals: 29 },
      { clubName: 'Borussia Dortmund', startYear: 2020, endYear: 2022, apps: 89, goals: 86 },
      { clubName: 'Manchester City', startYear: 2022, apps: 100, goals: 90 },
    ],
    blurImages: [],
    originalImageUrl: 'https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png',
    isActive: true,
  },
  {
    playerId: 'tmid_12347',
    name: 'Victor Osimhen',
    knownName: 'Osimhen',
    leagues: [SUPPORTED_LEAGUES.SUPER_LIG, SUPPORTED_LEAGUES.SERIE_A, SUPPORTED_LEAGUES.BUNDESLIGA, SUPPORTED_LEAGUES.LIGUE_1],
    currentClub: {
      id: 'club_galatasaray',
      name: 'Galatasaray',
      logoUrl: 'https://assets.penaltyhub.com/clubs/galatasaray.png',
      league: SUPPORTED_LEAGUES.SUPER_LIG,
    },
    nationality: 'Nigeria',
    nationalityFlagUrl: 'https://assets.penaltyhub.com/flags/ng.png',
    position: 'CF',
    age: 27,
    shirtNumber: 45,
    marketValueEur: 75000000,
    careerPath: [
      { clubName: 'Wolfsburg', startYear: 2017, endYear: 2019 },
      { clubName: 'Charleroi', startYear: 2018, endYear: 2019, apps: 36, goals: 20 },
      { clubName: 'Lille', startYear: 2019, endYear: 2020, apps: 38, goals: 18 },
      { clubName: 'Napoli', startYear: 2020, endYear: 2024, apps: 133, goals: 76 },
      { clubName: 'Galatasaray', startYear: 2024 },
    ],
    blurImages: [],
    originalImageUrl: 'https://img.a.transfermarkt.technology/portrait/big/401923-1737730981.jpg',
    isActive: true,
  },
  {
    playerId: 'tmid_12348',
    name: 'Edin Džeko',
    knownName: 'Dzeko',
    leagues: [SUPPORTED_LEAGUES.SUPER_LIG, SUPPORTED_LEAGUES.SERIE_A, SUPPORTED_LEAGUES.PREMIER_LEAGUE, SUPPORTED_LEAGUES.BUNDESLIGA],
    currentClub: {
      id: 'club_fenerbahce',
      name: 'Fenerbahçe',
      logoUrl: 'https://assets.penaltyhub.com/clubs/fenerbahce.png',
      league: SUPPORTED_LEAGUES.SUPER_LIG,
    },
    nationality: 'Bosnia-Herzegovina',
    nationalityFlagUrl: 'https://assets.penaltyhub.com/flags/ba.png',
    position: 'CF',
    age: 40,
    shirtNumber: 9,
    marketValueEur: 2500000,
    careerPath: [
      { clubName: 'Željezničar', startYear: 2003, endYear: 2005 },
      { clubName: 'Teplice', startYear: 2005, endYear: 2007 },
      { clubName: 'VfL Wolfsburg', startYear: 2007, endYear: 2011, apps: 142, goals: 85 },
      { clubName: 'Manchester City', startYear: 2011, endYear: 2016, apps: 189, goals: 72 },
      { clubName: 'AS Roma', startYear: 2015, endYear: 2021, apps: 260, goals: 119 },
      { clubName: 'Inter', startYear: 2021, endYear: 2023, apps: 101, goals: 31 },
      { clubName: 'Fenerbahçe', startYear: 2023, apps: 50, goals: 30 },
    ],
    blurImages: [],
    originalImageUrl: 'https://img.a.transfermarkt.technology/portrait/big/28396-1752151521.jpg',
    isActive: true,
  },
  {
    playerId: 'tmid_12349',
    name: 'Jude Bellingham',
    knownName: 'Bellingham',
    leagues: [SUPPORTED_LEAGUES.LA_LIGA, SUPPORTED_LEAGUES.BUNDESLIGA],
    currentClub: {
      id: 'club_realmadrid',
      name: 'Real Madrid',
      logoUrl: 'https://assets.penaltyhub.com/clubs/realmadrid.png',
      league: SUPPORTED_LEAGUES.LA_LIGA,
    },
    nationality: 'England',
    nationalityFlagUrl: 'https://assets.penaltyhub.com/flags/gb.png',
    position: 'MF',
    age: 23,
    shirtNumber: 5,
    marketValueEur: 180000000,
    careerPath: [
      { clubName: 'Birmingham City', startYear: 2019, endYear: 2020 },
      { clubName: 'Borussia Dortmund', startYear: 2020, endYear: 2023, apps: 132, goals: 24 },
      { clubName: 'Real Madrid', startYear: 2023, apps: 50, goals: 25 },
    ],
    blurImages: [],
    originalImageUrl: 'https://img.a.transfermarkt.technology/portrait/big/581678-1748102891.jpg',
    isActive: true,
  },
  {
    playerId: 'tmid_12350',
    name: 'Kylian Mbappé',
    knownName: 'Mbappe',
    leagues: [SUPPORTED_LEAGUES.LA_LIGA, SUPPORTED_LEAGUES.LIGUE_1],
    currentClub: {
      id: 'club_realmadrid',
      name: 'Real Madrid',
      logoUrl: 'https://assets.penaltyhub.com/clubs/realmadrid.png',
      league: SUPPORTED_LEAGUES.LA_LIGA,
    },
    nationality: 'France',
    nationalityFlagUrl: 'https://assets.penaltyhub.com/flags/fr.png',
    position: 'CF',
    age: 27,
    shirtNumber: 9,
    marketValueEur: 180000000,
    careerPath: [
      { clubName: 'Monaco', startYear: 2015, endYear: 2017, apps: 60, goals: 27 },
      { clubName: 'Paris Saint-Germain', startYear: 2017, endYear: 2024, apps: 308, goals: 256 },
      { clubName: 'Real Madrid', startYear: 2024 },
    ],
    blurImages: [],
    originalImageUrl: 'https://img.a.transfermarkt.technology/portrait/big/342229-1682683695.jpg',
    isActive: true,
  },
];

export async function seedDemoData(): Promise<void> {
  await connectDatabase();
  console.log('🌱 Seeding demo players, daily challenges and levels...');

  // 1. Upsert demo players
  const playerDocs: any[] = [];
  for (const player of DEMO_PLAYERS) {
    const doc = await PlayerModel.findOneAndUpdate(
      { playerId: player.playerId },
      { $set: player },
      { upsert: true, new: true }
    );
    playerDocs.push(doc);
  }
  console.log(`✅ Upserted ${playerDocs.length} demo star players.`);

  const icardi = playerDocs.find((p) => p.playerId === 'tmid_12345')!;
  const haaland = playerDocs.find((p) => p.playerId === 'tmid_12346')!;
  const dzeko = playerDocs.find((p) => p.playerId === 'tmid_12348')!;
  const bellingham = playerDocs.find((p) => p.playerId === 'tmid_12349')!;

  // 2. Seed Daily Challenges for today (UTC)
  const todayUtc = new Date().toISOString().split('T')[0];
  console.log(`📅 Seeding Daily Challenges for UTC date: ${todayUtc}`);

  const challenges = [
    {
      date: todayUtc,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      playerId: icardi.playerId,
      playerRef: icardi._id,
      hints: ['Played in Serie A', 'Argentine striker'],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      playerId: haaland.playerId,
      playerRef: haaland._id,
      hints: ['Nordic powerhouse', 'Premier League record breaker'],
      difficulty: 'easy',
    },
    {
      date: todayUtc,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      playerId: dzeko.playerId,
      playerRef: dzeko._id,
      hints: ['Wolfsburg champion', 'Manchester City icon'],
      difficulty: 'medium',
    },
    {
      date: todayUtc,
      gameMode: 'careerPath',
      leagueMode: 'global',
      playerId: bellingham.playerId,
      playerRef: bellingham._id,
      hints: ['Number 5 shirt in Madrid', 'Birmingham academy graduate'],
      difficulty: 'easy',
    },
  ];

  for (const ch of challenges) {
    await DailyChallengeModel.findOneAndUpdate(
      { date: ch.date, gameMode: ch.gameMode, leagueMode: ch.leagueMode },
      { $set: ch },
      { upsert: true }
    );
  }
  console.log('✅ Daily challenges seeded.');

  // 3. Seed Levels 1-5 for Career Mode
  const levels = [
    // Super Lig - Who Are Ya
    {
      levelNumber: 1,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      playerId: icardi.playerId,
      playerRef: icardi._id,
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Arjantinli yıldız golcü'],
    },
    {
      levelNumber: 2,
      gameMode: 'whoAreYa',
      leagueMode: 'super_lig',
      playerId: dzeko.playerId,
      playerRef: dzeko._id,
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Bosnalı kule forvet'],
    },
    // Global - Who Are Ya
    {
      levelNumber: 1,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      playerId: haaland.playerId,
      playerRef: haaland._id,
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['Norwegian goal machine'],
    },
    {
      levelNumber: 2,
      gameMode: 'whoAreYa',
      leagueMode: 'global',
      playerId: bellingham.playerId,
      playerRef: bellingham._id,
      rewardCoins: 30,
      rewardXp: 50,
      hints: ['English midfield star'],
    },
    // Global - Career Path
    {
      levelNumber: 1,
      gameMode: 'careerPath',
      leagueMode: 'global',
      playerId: haaland.playerId,
      playerRef: haaland._id,
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Started at Bryne, moved to Molde and Salzburg'],
    },
    {
      levelNumber: 1,
      gameMode: 'careerPath',
      leagueMode: 'super_lig',
      playerId: dzeko.playerId,
      playerRef: dzeko._id,
      rewardCoins: 35,
      rewardXp: 60,
      hints: ['Wolfsburg -> Man City -> Roma -> Inter -> Fenerbahçe'],
    },
  ];

  for (const lvl of levels) {
    await LevelModel.findOneAndUpdate(
      {
        levelNumber: lvl.levelNumber,
        gameMode: lvl.gameMode,
        leagueMode: lvl.leagueMode,
      },
      { $set: lvl },
      { upsert: true }
    );
  }
  console.log('✅ Career mode levels 1-2 seeded for both game modes and league modes.');

  console.log('🚀 Seeding completed successfully!');
  await mongoose.disconnect();
}

if (require.main === module) {
  seedDemoData().catch(console.error);
}
