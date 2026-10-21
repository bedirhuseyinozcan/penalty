export type CosmeticCategory = 'scout' | 'fan_bundle';

export interface IThemeConfig {
  primaryColor: string;       
  secondaryColor: string;     
  accentGlow: string;       
  cardBorder: string;         
  headerGlow: string;         
  stadiumName: string;        
  tribuneName: string;       
  anthemChant: string;        
  teamBadgeEmojis: string;    
  fanBannerTitle: string;     
}

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
  themeConfig: IThemeConfig;
}
