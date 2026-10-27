export interface IRankInfo {
  tier: number;
  title: string;
  badge: string;
  minXp: number;
  maxXp: number;
  currentProgressInTier: number;
  xpNeededForNext: number;
}

export const getRankByXp = (xp: number): IRankInfo => {
  const safeXp = Math.max(0, xp);

  if (safeXp < 250) {
    const min = 0;
    const max = 250;
    const progress = Math.min(100, Math.round(((safeXp - min) / (max - min)) * 100));
    return {
      tier: 1,
      title: 'Stajyer Gözlemci',
      badge: '🥉',
      minXp: min,
      maxXp: max,
      currentProgressInTier: progress,
      xpNeededForNext: Math.max(0, max - safeXp),
    };
  }

  if (safeXp < 750) {
    const min = 250;
    const max = 750;
    const progress = Math.min(100, Math.round(((safeXp - min) / (max - min)) * 100));
    return {
      tier: 2,
      title: "Altyapı Scout'u",
      badge: '🥈',
      minXp: min,
      maxXp: max,
      currentProgressInTier: progress,
      xpNeededForNext: Math.max(0, max - safeXp),
    };
  }

  if (safeXp < 2000) {
    const min = 750;
    const max = 2000;
    const progress = Math.min(100, Math.round(((safeXp - min) / (max - min)) * 100));
    return {
      tier: 3,
      title: "Süper Lig Baş Scout'u",
      badge: '🥇',
      minXp: min,
      maxXp: max,
      currentProgressInTier: progress,
      xpNeededForNext: Math.max(0, max - safeXp),
    };
  }

  const min = 2000;
  const max = 5000;
  const progress = Math.min(100, Math.round(((safeXp - min) / (max - min)) * 100));
  return {
    tier: 4,
    title: 'Avrupa Futbol Direktörü',
    badge: '👑',
    minXp: min,
    maxXp: max,
    currentProgressInTier: progress,
    xpNeededForNext: Math.max(0, max - safeXp),
  };
};
