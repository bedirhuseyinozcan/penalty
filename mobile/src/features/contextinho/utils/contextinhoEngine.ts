import { ILightPlayer, searchEngine } from '../../../services/searchEngine';

export type TemperatureTier = 'win' | 'hot' | 'warm' | 'cold';

export interface IContextinhoRankedEntry {
  player: ILightPlayer;
  rank: number;
  totalPool: number;
  heatPercent: number;
  tier: TemperatureTier;
  sharedTags: string[];
}

function getPositionGroup(pos: string): string {
  const p = (pos || '').toUpperCase();
  if (p === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DF'].includes(p)) return 'DEF';
  if (['DM', 'CM', 'AM', 'LM', 'RM', 'MF'].includes(p)) return 'MID';
  return 'FWD';
}

export function buildContextinhoRankMap(
  targetPlayerId: string,
  targetPlayerFallbackName?: string,
  leagueMode?: 'global' | 'super_lig'
): Map<string, IContextinhoRankedEntry> {
  const pool = searchEngine.getPlayersByLeagueMode(leagueMode);
  const allPlayers = pool.length > 0 ? pool : searchEngine.getPlayersByLeagueMode();

  let target =
    allPlayers.find((p) => p.id === targetPlayerId) ||
    searchEngine.getPlayerById(targetPlayerId);

  if (!target && targetPlayerFallbackName) {
    const lowerName = targetPlayerFallbackName.toLowerCase().trim();
    target = allPlayers.find((p) => p.name.toLowerCase().trim() === lowerName);
  }

  if (!target && allPlayers.length > 0) {
    target = allPlayers[0];
  }

  const map = new Map<string, IContextinhoRankedEntry>();
  if (!target) return map;

  const targetGroup = getPositionGroup(target.position);
  const targetClubLower = (target.club || '').toLowerCase().trim();
  const targetNatLower = (target.nationality || '').toLowerCase().trim();

  // Ensure target is in pool
  const workingPool = allPlayers.some((p) => p.id === target!.id)
    ? allPlayers
    : [target, ...allPlayers];

  const scored = workingPool.map((p) => {
    if (p.id === target!.id) {
      return {
        player: p,
        score: 10000,
        sharedTags: ['Hedef Yıldız 🎯'],
      };
    }

    let score = 0;
    const sharedTags: string[] = [];

    const pClub = (p.club || '').toLowerCase().trim();
    const pNat = (p.nationality || '').toLowerCase().trim();

    if (pClub && pClub === targetClubLower) {
      score += 380;
      sharedTags.push('Aynı Kulüp');
    } else if (p.league === target!.league) {
      score += 150;
      sharedTags.push('Aynı Lig');
    }

    if (pNat && pNat === targetNatLower) {
      score += 230;
      sharedTags.push('Aynı Uyruk');
    }

    if (p.position === target!.position) {
      score += 150;
      sharedTags.push(`Aynı Mevki (${p.position})`);
    } else if (getPositionGroup(p.position) === targetGroup) {
      score += 75;
      sharedTags.push('Aynı Bölge');
    }

    const ageDiff = Math.abs((target!.age ?? 26) - (p.age ?? 26));
    const ageScore = Math.max(0, 65 - ageDiff * 9);
    score += ageScore;
    if (ageDiff <= 1) {
      sharedTags.push('Yaşıt');
    }

    const shirtDiff = Math.abs((target!.shirtNumber ?? 50) - (p.shirtNumber ?? 80));
    score += Math.max(0, 25 - shirtDiff * 1.5);

    // Deterministic tie-breaker
    let tieHash = 0;
    for (let i = 0; i < p.id.length; i++) {
      tieHash = (tieHash * 31 + p.id.charCodeAt(i)) % 997;
    }
    score += tieHash / 10000;

    return {
      player: p,
      score,
      sharedTags,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const totalPool = scored.length;
  scored.forEach((item, index) => {
    const rank = index + 1;
    let tier: TemperatureTier = 'cold';
    if (rank === 1) tier = 'win';
    else if (rank <= 45) tier = 'hot';
    else if (rank <= 200) tier = 'warm';

    // Heat bar width percentage (logarithmic feel like Contexto)
    const heatPercent =
      rank === 1
        ? 100
        : rank <= 45
        ? Math.max(68, Math.round(98 - (rank / 45) * 30))
        : rank <= 200
        ? Math.max(35, Math.round(67 - ((rank - 45) / 155) * 32))
        : Math.max(10, Math.round(34 - Math.min(1, (rank - 200) / Math.max(1, totalPool - 200)) * 24));

    map.set(item.player.id, {
      player: item.player,
      rank,
      totalPool,
      heatPercent,
      tier,
      sharedTags: item.sharedTags.slice(0, 3),
    });
  });

  return map;
}
