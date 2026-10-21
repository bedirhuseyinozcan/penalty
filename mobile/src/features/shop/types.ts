export type CosmeticCategory = 'scout' | 'fan_bundle';

export interface ICosmeticItem {
  id: string;
  name: string;
  category: CosmeticCategory;
  subtitle: string;
  description: string;
  avatarEmoji: string;
  frameBorderColor: string;
  frameSecondaryColor?: string;
  themeGlowColor: string;
  titleBadge: string;
  cost: number;
  badgeText?: string; 
}
