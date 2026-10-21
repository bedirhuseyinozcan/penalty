import { ICosmeticItem } from './types';

export const DEFAULT_COSMETIC_ID = 'avatar_default';

export const COSMETIC_CATALOG: ICosmeticItem[] = [
  {
    id: 'bundle_fan_aslan',
    name: 'Kükreyen Aslan Paketi',
    category: 'fan_bundle',
    subtitle: 'Sarı & Kırmızı Asalet',
    description: 'Sarı-Kırmızı alevli çift çerçeve, Aslan maskot avatarı ve özel taraftar unvanı.',
    avatarEmoji: '🦁',
    frameBorderColor: '#EF4444', // Kırmızı
    frameSecondaryColor: '#EAB308', // Sarı
    themeGlowColor: 'rgba(239, 68, 68, 0.35)',
    titleBadge: 'Kükreyen Aslan',
    cost: 1200,
    badgeText: '🔥 ÇOK POPÜLER',
  },
  {
    id: 'bundle_fan_kanarya',
    name: 'Sarı Kanarya Paketi',
    category: 'fan_bundle',
    subtitle: 'Sarı & Lacivert Tutku',
    description: 'Sarı-Lacivert Kadıköy rüzgarı çerçevesi, Kanarya maskotu ve efsane taraftar unvanı.',
    avatarEmoji: '🐤',
    frameBorderColor: '#EAB308', // Sarı
    frameSecondaryColor: '#1E3A8A', // Lacivert
    themeGlowColor: 'rgba(234, 179, 8, 0.35)',
    titleBadge: 'Sarı Kanarya',
    cost: 1200,
    badgeText: '🔥 ÇOK POPÜLER',
  },
  {
    id: 'bundle_fan_kartal',
    name: 'Kara Kartal Paketi',
    category: 'fan_bundle',
    subtitle: 'Siyah & Beyaz Asalet',
    description: 'Boğazın Kartalı maskotu, monokrom siyah-beyaz elit halka ve taraftar unvanı.',
    avatarEmoji: '🦅',
    frameBorderColor: '#F4F4F5', // Beyaz
    frameSecondaryColor: '#18181B', // Siyah
    themeGlowColor: 'rgba(255, 255, 255, 0.3)',
    titleBadge: 'Kara Kartal',
    cost: 1200,
    badgeText: '⭐ ÖZEL SET',
  },
  {
    id: 'bundle_fan_firtina',
    name: 'Karadeniz Fırtınası Paketi',
    category: 'fan_bundle',
    subtitle: 'Bordo & Mavi Dalga',
    description: 'Fırtına dalgası maskotu, Bordo-Mavi çift renk çerçeve ve coşkulu taraftar unvanı.',
    avatarEmoji: '🌊',
    frameBorderColor: '#991B1B', // Bordo
    frameSecondaryColor: '#0284C7', // Mavi
    themeGlowColor: 'rgba(2, 132, 199, 0.35)',
    titleBadge: 'Karadeniz Fırtınası',
    cost: 1200,
    badgeText: '🌊 EFSANE',
  },
  {
    id: 'bundle_fan_madrid',
    name: 'Eflatun Krallar Paketi',
    category: 'fan_bundle',
    subtitle: 'Beyaz & Altın Taç',
    description: 'Şampiyonlar Ligi Fatihi Los Blancos tacı ve parlayan safir-altın çerçevesi.',
    avatarEmoji: '👑',
    frameBorderColor: '#FFFFFF',
    frameSecondaryColor: '#EAB308',
    themeGlowColor: 'rgba(234, 179, 8, 0.4)',
    titleBadge: 'Los Blancos',
    cost: 1500,
    badgeText: '👑 PRESTİJ',
  },
  {
    id: 'avatar_default',
    name: 'Klasik Scout',
    category: 'scout',
    subtitle: 'Gözlemci Başlangıç',
    description: 'Tüm futbol tutkunlarına açık temel yetenek avcısı avatarı.',
    avatarEmoji: '⚽',
    frameBorderColor: 'rgba(255, 255, 255, 0.2)',
    themeGlowColor: 'rgba(255, 255, 255, 0.1)',
    titleBadge: 'Çaylak Scout',
    cost: 0,
    badgeText: 'VARSAYILAN',
  },
  {
    id: 'avatar_keeper',
    name: 'Panter Kaleci',
    category: 'scout',
    subtitle: 'Geçilmez Kale',
    description: 'Yeşil neon eldiven avatarı ve kalesini gole kapatanlara özel yeşil çerçeve.',
    avatarEmoji: '🧤',
    frameBorderColor: '#10B981', // Emerald Yeşil
    themeGlowColor: 'rgba(16, 185, 129, 0.35)',
    titleBadge: 'Panter Eldiven',
    cost: 100,
  },
  {
    id: 'avatar_winger',
    name: 'Sihirbaz Kanat',
    category: 'scout',
    subtitle: 'Hız & Çalım',
    description: 'Elektrik sarısı şimşek avatarı ve hızlı kanat oyuncusu rozeti.',
    avatarEmoji: '⚡',
    frameBorderColor: '#F59E0B', // Amber
    themeGlowColor: 'rgba(245, 158, 11, 0.35)',
    titleBadge: 'Hız Canavarı',
    cost: 250,
  },
  {
    id: 'avatar_striker',
    name: 'Usta Golcü',
    category: 'scout',
    subtitle: 'Hedefi Bilen',
    description: 'Hedef tahtalı özel hücumcu ikonu ve ateş kırmızısı keskin çerçeve.',
    avatarEmoji: '🎯',
    frameBorderColor: '#EF4444', // Red
    themeGlowColor: 'rgba(239, 68, 68, 0.35)',
    titleBadge: 'Keskin Forvet',
    cost: 500,
  },
  {
    id: 'bundle_ucl_star',
    name: 'UCL Yıldızlar Ligi',
    category: 'scout',
    subtitle: 'Avrupa Zirvesi',
    description: 'Derin gece mavisi ve parlayan altın UCL yıldızı ile donatılmış şampiyon rozeti.',
    avatarEmoji: '⭐',
    frameBorderColor: '#3B82F6', // Mavi
    frameSecondaryColor: '#EAB308', // Altın
    themeGlowColor: 'rgba(59, 130, 246, 0.4)',
    titleBadge: 'UCL Yıldızı',
    cost: 900,
    badgeText: '⭐ ELİT',
  },
  {
    id: 'bundle_ballon_dor_legend',
    name: 'Ballon d\'Or Efsanesi',
    category: 'scout',
    subtitle: 'Dünyanın En İyisi',
    description: 'Saf altın parlaklığında Altın Top avatarı ve ışıldayan efsanevi şampiyonluk halkası.',
    avatarEmoji: '🏆',
    frameBorderColor: '#EAB308', // Saf Altın
    frameSecondaryColor: '#F59E0B',
    themeGlowColor: 'rgba(234, 179, 8, 0.5)',
    titleBadge: 'Altın Top Efsanesi',
    cost: 2000,
    badgeText: '💎 EFSANEVİ',
  },
];

export function getCosmeticById(id: string): ICosmeticItem {
  return (
    COSMETIC_CATALOG.find((c) => c.id === id) ||
    COSMETIC_CATALOG.find((c) => c.id === 'avatar_default') ||
    COSMETIC_CATALOG[0]
  );
}
