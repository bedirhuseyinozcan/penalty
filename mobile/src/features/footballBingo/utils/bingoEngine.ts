import { ILightPlayer, searchEngine } from '../../../services/searchEngine';
import { IBingoBoardSetup, IBingoTile } from '../types';
import { getPlayerPositionGroup, doesPlayerMatchLeague } from '../../ticTacToe/utils/ticTacToeEngine';

export const BINGO_DECK_SIZE = 42;
export const BINGO_GRID_SIZE = 16; // 4x4

function createSeededRandom(seedStr: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;
    return (hash >>> 0) / 4294967296;
  };
}

const BAD_CLUBS = new Set(['Without Club', 'Unknown', 'Career break', 'Retired']);

export function doesPlayerMatchBingoTile(player: ILightPlayer, tile: IBingoTile): boolean {
  switch (tile.type) {
    case 'club': {
      const target = tile.value.toLowerCase().trim();
      if ((player.club || '').toLowerCase().trim() === target) return true;
      if (player.clubs && Array.isArray(player.clubs)) {
        return player.clubs.some((c) => (c || '').toLowerCase().trim() === target);
      }
      return false;
    }
    case 'nationality':
      return (player.nationality || '').toLowerCase().trim() === tile.value.toLowerCase().trim();
    case 'positionGroup':
      return getPlayerPositionGroup(player.position) === tile.value;
    case 'ageUnder23':
      return (player.age ?? 25) <= 23;
    case 'ageOver30':
      return (player.age ?? 25) >= 30;
    case 'shirt1to11': {
      const num = player.shirtNumber ?? 0;
      return num >= 1 && num <= 11;
    }
    case 'shirt20Plus': {
      const num = player.shirtNumber ?? 0;
      return num >= 20;
    }
    case 'league':
      return doesPlayerMatchLeague(player, tile.value);
    case 'trophy':
      return (player.trophies || []).includes(tile.value);
    default:
      return false;
  }
}

export function generateBingoSetup(
  seedKey: string,
  leagueMode: 'global' | 'super_lig'
): IBingoBoardSetup {
  const rng = createSeededRandom(seedKey);
  const rawPool = searchEngine.getPlayersByLeagueMode(leagueMode);
  const pool = rawPool.length >= 60 ? rawPool : searchEngine.getPlayersByLeagueMode();

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const clubCounts = new Map<string, number>();
  const natCounts = new Map<string, number>();

  for (const p of pool) {
    if (p.clubs && Array.isArray(p.clubs)) {
      for (const c of p.clubs) {
        if (c && !BAD_CLUBS.has(c)) {
          clubCounts.set(c, (clubCounts.get(c) || 0) + 1);
        }
      }
    } else if (p.club && !BAD_CLUBS.has(p.club)) {
      clubCounts.set(p.club, (clubCounts.get(p.club) || 0) + 1);
    }
    if (p.nationality) natCounts.set(p.nationality, (natCounts.get(p.nationality) || 0) + 1);
  }

  const topClubs = shuffle(
    Array.from(clubCounts.entries())
      .filter(([_, c]) => c >= 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name)
  ).slice(0, 5);

  const topNats = shuffle(
    Array.from(natCounts.entries())
      .filter(([_, c]) => c >= 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nat]) => nat)
  ).slice(0, 4);

  const rawTiles: Omit<IBingoTile, 'index' | 'isMatched' | 'matchedPlayer'>[] = [
    ...topClubs.map((club) => {
      const clubInfo = searchEngine.getClubByName(club);
      return {
        id: `club_${club}`,
        type: 'club' as const,
        value: club,
        title: clubInfo?.name || club,
        subtitle: 'Kulüp',
        emoji: '🛡️',
        logoUrl: clubInfo?.logoUrl,
      };
    }),
    ...topNats.map((nat) => ({
      id: `nat_${nat}`,
      type: 'nationality' as const,
      value: nat,
      title: nat,
      subtitle: 'Uyruk',
      emoji: '🌍',
    })),
    {
      id: 'pos_GK',
      type: 'positionGroup',
      value: 'GK',
      title: 'Kaleci',
      subtitle: 'Mevki (GK)',
      emoji: '🧤',
    },
    {
      id: 'pos_DEF',
      type: 'positionGroup',
      value: 'DEF',
      title: 'Defans',
      subtitle: 'Mevki (DEF)',
      emoji: '🧱',
    },
    {
      id: 'pos_MID',
      type: 'positionGroup',
      value: 'MID',
      title: 'Orta Saha',
      subtitle: 'Mevki (MID)',
      emoji: '🎯',
    },
    {
      id: 'pos_FWD',
      type: 'positionGroup',
      value: 'FWD',
      title: 'Forvet / Kanat',
      subtitle: 'Mevki (FWD)',
      emoji: '⚡',
    },
    {
      id: 'age_u23',
      type: 'ageUnder23',
      value: 'u23',
      title: '≤ 23 Yaş',
      subtitle: 'Genç Yetenek',
      emoji: '🌱',
    },
    {
      id: 'age_o30',
      type: 'ageOver30',
      value: 'o30',
      title: '≥ 30 Yaş',
      subtitle: 'Tecrübeli Kurt',
      emoji: '👑',
    },
    {
      id: 'shirt_1_11',
      type: 'shirt1to11',
      value: '1_11',
      title: '#1 - #11 Forma',
      subtitle: 'İlk 11 Numarası',
      emoji: '👕',
    },
  ];
  const candidateTrophyTiles: Omit<IBingoTile, 'index' | 'isMatched' | 'matchedPlayer'>[] = [
    {
      id: 'trophy_ucl',
      type: 'trophy',
      value: 'ucl',
      title: 'Şampiyonlar Ligi',
      subtitle: 'UCL Şampiyonu',
      emoji: '⭐',
    },
    {
      id: 'trophy_world_cup',
      type: 'trophy',
      value: 'world_cup',
      title: 'Dünya Kupası',
      subtitle: 'Kupa Sahibi',
      emoji: '🏆',
    },
    {
      id: 'trophy_league_champion',
      type: 'trophy',
      value: 'league_champion',
      title: 'Lig Şampiyonu',
      subtitle: 'Kupa Kaldırmış',
      emoji: '🥇',
    },
    {
      id: 'trophy_golden_boot',
      type: 'trophy',
      value: 'golden_boot',
      title: 'Gol Kralı',
      subtitle: 'Altın Ayakkabı',
      emoji: '👟',
    },
    {
      id: 'trophy_ballon_dor',
      type: 'trophy',
      value: 'ballon_dor',
      title: "Ballon d'Or",
      subtitle: 'Yılın Yıldızı',
      emoji: '🌟',
    },
  ];

  const validTrophyTiles = candidateTrophyTiles.filter((t) => {
    let count = 0;
    for (const p of pool) {
      if ((p.trophies || []).includes(t.value)) {
        count++;
        if (count >= 2) return true;
      }
    }
    return false;
  });

  rawTiles.push(...validTrophyTiles);

  const shuffledTiles = shuffle(rawTiles).slice(0, BINGO_GRID_SIZE);
  const tiles: IBingoTile[] = shuffledTiles.map((t, idx) => ({
    ...t,
    index: idx,
    isMatched: false,
    matchedPlayer: null,
  }));

  const selectedIds = new Set<string>();
  const deck: ILightPlayer[] = [];
  const shuffledPool = shuffle(pool);

  for (const tile of tiles) {
    let addedForTile = 0;
    for (const p of shuffledPool) {
      if (!selectedIds.has(p.id) && doesPlayerMatchBingoTile(p, tile)) {
        selectedIds.add(p.id);
        deck.push(p);
        addedForTile++;
        if (addedForTile >= 2) break;
      }
    }
  }

  for (const p of shuffledPool) {
    if (deck.length >= BINGO_DECK_SIZE) break;
    if (!selectedIds.has(p.id)) {
      selectedIds.add(p.id);
      deck.push(p);
    }
  }

  return {
    seedKey,
    tiles,
    deck: shuffle(deck).slice(0, BINGO_DECK_SIZE),
  };
}
