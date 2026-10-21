import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { GameModeType } from '../api/dailyApi';
import { useGameStore } from '../stores/useGameStore';
import { useSettingsStore, LeagueMode } from '../stores/useSettingsStore';
import { getRankByXp } from '../features/stats/utils/rankUtils';
import { getAuthoritativeUtcDate } from '../services/authoritativeTime';
import { PlayerStatsModal } from '../features/stats/components/PlayerStatsModal';
import { ScoutShopModal } from '../features/shop/components/ScoutShopModal';
import { getCosmeticById } from '../features/shop/catalog';
import { HomeGameCard } from '../features/home/components/HomeGameCard';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

export type AppScreenType =
  | 'home'
  | 'whoAreYa'
  | 'careerPath'
  | 'clubLogo'
  | 'contextinho'
  | 'ticTacToe'
  | 'footballBingo'
  | 'levelMap';

interface IHomeScreenProps {
  onNavigate: (
    screen: AppScreenType,
    isDaily?: boolean,
    gameMode?: GameModeType
  ) => void;
}

export const HomeScreen: React.FC<IHomeScreenProps> = React.memo(({ onNavigate }) => {
  const coins = useGameStore((s) => s.coins);
  const xp = useGameStore((s) => s.xp);
  const currentStreak = useGameStore((s) => s.currentStreak);
  const isDailyCompleted = useGameStore((s) => s.isDailyCompleted);
  const selectedLeagueMode = useSettingsStore((s) => s.selectedLeagueMode);
  const setLeagueMode = useSettingsStore((s) => s.setLeagueMode);

  const [isStatsModalVisible, setIsStatsModalVisible] = useState(false);
  const [isShopModalVisible, setIsShopModalVisible] = useState(false);

  const equippedCosmeticId = useGameStore((s) => s.equippedCosmeticId);
  const equippedCosmetic = useMemo(
    () => getCosmeticById(equippedCosmeticId),
    [equippedCosmeticId]
  );

  const theme = equippedCosmetic.themeConfig;
  const isSuperLig = selectedLeagueMode === 'super_lig';

  const isLightPrimary =
    theme.primaryColor === '#FBBF24' ||
    theme.primaryColor === '#FFFFFF' ||
    theme.primaryColor === '#F4F4F5' ||
    theme.primaryColor === '#EAB308';

  const rankInfo = useMemo(() => getRankByXp(xp), [xp]);
  const todayDate = useMemo(() => getAuthoritativeUtcDate(), []);
  const isWhoAreYaDailyCompleted = isDailyCompleted(`${todayDate}_whoAreYa_${selectedLeagueMode}`);
  const isCareerDailyCompleted = isDailyCompleted(`${todayDate}_careerPath_${selectedLeagueMode}`);
  const isClubLogoDailyCompleted = isDailyCompleted(`${todayDate}_clubLogo_${selectedLeagueMode}`);
  const isContextinhoDailyCompleted = isDailyCompleted(`${todayDate}_contextinho_${selectedLeagueMode}`);
  const isTicTacToeDailyCompleted = isDailyCompleted(`${todayDate}_ticTacToe_${selectedLeagueMode}`);
  const isBingoDailyCompleted = isDailyCompleted(`${todayDate}_footballBingo_${selectedLeagueMode}`);

  const handleSelectMode = useCallback(
    (mode: LeagueMode) => {
      setLeagueMode(mode);
    },
    [setLeagueMode]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View
        style={[styles.ambientGlow, { backgroundColor: theme.accentGlow }]}
        pointerEvents="none"
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <Text style={[styles.brandTitle, { color: theme.primaryColor }]}>PENALTY</Text>
              <View style={[styles.themeMiniPill, { backgroundColor: theme.accentGlow }]}>
                <Text style={[styles.themeMiniPillText, { color: theme.primaryColor }]}>
                  {theme.teamBadgeEmojis} {equippedCosmetic.titleBadge}
                </Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>
              Futbol Oyun Portalı • {theme.stadiumName}
            </Text>
          </View>

          <View style={styles.currencyRow}>
            <TouchableOpacity
              style={[styles.currencyBadge, styles.streakBadge]}
              activeOpacity={0.8}
              onPress={() => setIsStatsModalVisible(true)}
            >
              <Text style={styles.streakText}>🔥 {currentStreak}</Text>
            </TouchableOpacity>

            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>🪙 {coins}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.currencyBadge,
                styles.shopBtn,
                { borderColor: theme.primaryColor },
              ]}
              activeOpacity={0.8}
              onPress={() => setIsShopModalVisible(true)}
            >
              <Text style={[styles.shopBtnText, { color: theme.primaryColor }]}>🛍️ Dükkan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.currencyBadge, styles.statsBtn]}
              activeOpacity={0.8}
              onPress={() => setIsStatsModalVisible(true)}
            >
              <Text style={styles.statsIconText}>📊</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.fanAtmosphereCard,
            {
              borderColor: theme.cardBorder,
              borderLeftWidth: 4,
              borderLeftColor: theme.primaryColor,
            },
          ]}
        >
          <View style={styles.fanAtmosphereTop}>
            <View style={[styles.fanBadgePill, { backgroundColor: theme.accentGlow }]}>
              <View style={[styles.pulseDot, { backgroundColor: theme.primaryColor }]} />
              <Text style={[styles.fanBadgePillText, { color: theme.primaryColor }]}>
                {theme.fanBannerTitle}
              </Text>
            </View>

            <Text style={styles.fanStadiumText}>{theme.stadiumName}</Text>
          </View>

          <Text style={styles.fanChantText}>{theme.anthemChant}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.rankCard,
            {
              borderColor: theme.primaryColor,
              shadowColor: theme.primaryColor,
            },
          ]}
          activeOpacity={0.85}
          onPress={() => setIsStatsModalVisible(true)}
        >
          <View style={styles.rankHeader}>
            <View style={styles.rankTitleCol}>
              <View
                style={[
                  styles.equippedAvatarCircle,
                  {
                    borderColor: theme.primaryColor,
                    shadowColor: theme.primaryColor,
                  },
                ]}
              >
                <Text style={styles.equippedAvatarEmoji}>{equippedCosmetic.avatarEmoji}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.rankBadgeRow}>
                  <Text style={styles.rankTitle}>{rankInfo.title}</Text>
                  <View
                    style={[
                      styles.cosmeticTitlePill,
                      { backgroundColor: equippedCosmetic.themeGlowColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cosmeticTitleText,
                        { color: theme.primaryColor },
                      ]}
                    >
                      {equippedCosmetic.titleBadge}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rankSub}>
                  {rankInfo.tier === 4
                    ? 'Zirve Rütbe • Efsane Direktör'
                    : `Sonraki Rütbeye ${rankInfo.xpNeededForNext} XP kaldı`}
                </Text>
              </View>
            </View>
            <Text style={[styles.rankPercentText, { color: theme.primaryColor }]}>
              %{rankInfo.currentProgressInTier}
            </Text>
          </View>
          <View style={styles.rankProgressBarBg}>
            <View
              style={[
                styles.rankProgressBarFill,
                {
                  width: `${rankInfo.currentProgressInTier}%`,
                  backgroundColor: theme.primaryColor,
                },
              ]}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.modeSwitcherContainer}>
          <Text style={styles.sectionTitle}>Lig Modu Seçimi</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                isSuperLig && { backgroundColor: theme.primaryColor },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelectMode('super_lig')}
            >
              <Text
                style={[
                  styles.tabText,
                  isSuperLig && {
                    color: isLightPrimary ? '#0B0E14' : '#FFFFFF',
                    fontWeight: '900',
                  },
                ]}
              >
                🇹🇷 Süper Lig
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                !isSuperLig && { backgroundColor: theme.primaryColor },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelectMode('global')}
            >
              <Text
                style={[
                  styles.tabText,
                  !isSuperLig && {
                    color: isLightPrimary ? '#0B0E14' : '#FFFFFF',
                    fontWeight: '900',
                  },
                ]}
              >
                🌍 5 Büyük Lig (Global)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <HomeGameCard
          emoji="🕵️‍♂️"
          title="Kim Bu Yıldız?"
          subtitle="Bulanık fotoğraftan ve ipuçlarından futbolcuyu tahmin et"
          dailyBtnText={isWhoAreYaDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          themePrimaryColor={theme.primaryColor}
          themeBorderColor={theme.cardBorder}
          onPressDaily={() => onNavigate('whoAreYa', true, 'whoAreYa')}
          onPressCareer={() => onNavigate('levelMap', false, 'whoAreYa')}
        />

        <HomeGameCard
          emoji="🧭"
          title="Transfer Rotası"
          subtitle="Kariyerinde oynadığı kulüpleri takip ederek yıldızı bul"
          dailyBtnText={isCareerDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          themePrimaryColor={theme.primaryColor}
          themeBorderColor={theme.cardBorder}
          onPressDaily={() => onNavigate('careerPath', true, 'careerPath')}
          onPressCareer={() => onNavigate('levelMap', false, 'careerPath')}
        />

        <HomeGameCard
          emoji="🛡️"
          title="Arma Avcısı"
          subtitle="Gizlenmiş ve bulanıklaştırılmış kulüp armasından takımı bul"
          dailyBtnText={isClubLogoDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          themePrimaryColor={theme.primaryColor}
          themeBorderColor={theme.cardBorder}
          onPressDaily={() => onNavigate('clubLogo', true, 'clubLogo')}
          onPressCareer={() => onNavigate('levelMap', false, 'clubLogo')}
        />

        <HomeGameCard
          emoji="🔥"
          title="Sıcak Temas"
          subtitle="Sıcak-soğuk benzerlik sinyallerini takip ederek #1 numaralı yıldızı bul"
          dailyBtnText={isContextinhoDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          themePrimaryColor={theme.primaryColor}
          themeBorderColor={theme.cardBorder}
          onPressDaily={() => onNavigate('contextinho', true, 'contextinho')}
          onPressCareer={() => onNavigate('levelMap', false, 'contextinho')}
        />

        <HomeGameCard
          emoji="🎯"
          title="Tiki-Taka (3x3)"
          subtitle="Kriter kesişimlerine (Kulüp × Mevki/Uyruk) uyan futbolcuları bul"
          dailyBtnText={isTicTacToeDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          themePrimaryColor={theme.primaryColor}
          themeBorderColor={theme.cardBorder}
          onPressDaily={() => onNavigate('ticTacToe', true, 'ticTacToe')}
          onPressCareer={() => onNavigate('levelMap', false, 'ticTacToe')}
        />

        <HomeGameCard
          emoji="🔢"
          title="Futbol Bingo (4x4)"
          subtitle="42 kişilik desteden gelen futbolcuları doğru kriter kutularına yerleştir"
          dailyBtnText={isBingoDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          themePrimaryColor={theme.primaryColor}
          themeBorderColor={theme.cardBorder}
          onPressDaily={() => onNavigate('footballBingo', true, 'footballBingo')}
          onPressCareer={() => onNavigate('levelMap', false, 'footballBingo')}
        />
      </ScrollView>

      <PlayerStatsModal
        visible={isStatsModalVisible}
        onClose={() => setIsStatsModalVisible(false)}
      />

      <ScoutShopModal
        visible={isShopModalVisible}
        onClose={() => setIsShopModalVisible(false)}
      />
    </SafeAreaView>
  );
});

HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    opacity: 0.65,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandTitle: {
    ...Typography.h1,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontSize: 24,
  },
  themeMiniPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.xs,
  },
  themeMiniPillText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  brandSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  currencyBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakBadge: {
    borderColor: Colors.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  streakText: {
    ...Typography.bodyBold,
    color: Colors.warning,
    fontSize: 13,
  },
  currencyText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 13,
  },
  statsBtn: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  statsIconText: {
    fontSize: 14,
  },
  shopBtn: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  shopBtnText: {
    ...Typography.bodyBold,
    fontSize: 12,
  },
  fanAtmosphereCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  fanAtmosphereTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  fanBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fanBadgePillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  fanStadiumText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  fanChantText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 11,
    fontStyle: 'italic',
  },
  equippedAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  equippedAvatarEmoji: {
    fontSize: 22,
  },
  rankBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cosmeticTitlePill: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.xs,
  },
  cosmeticTitleText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rankCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rankTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  rankTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  rankSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  rankPercentText: {
    ...Typography.captionBold,
    fontSize: 13,
  },
  rankProgressBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  rankProgressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  modeSwitcherContainer: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
});
