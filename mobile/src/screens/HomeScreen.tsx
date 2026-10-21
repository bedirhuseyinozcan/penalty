import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
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
          <View style={styles.brandCol}>
            <Text style={[styles.brandTitle, { color: theme.primaryColor }]}>PENALTY</Text>
            <Text style={styles.brandSubtitle}>Futbol Oyun Portalı</Text>
          </View>

          <View style={styles.currencyRow}>
            <TouchableOpacity
              style={[styles.currencyBadge, styles.streakBadge]}
              activeOpacity={0.8}
              onPress={() => setIsStatsModalVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
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
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text style={[styles.shopBtnText, { color: theme.primaryColor }]}>🛍️ Dükkan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.currencyBadge, styles.statsBtn]}
              activeOpacity={0.8}
              onPress={() => setIsStatsModalVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text style={styles.statsIconText}>📊</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.heroScoutCard,
            {
              borderColor: theme.cardBorder,
              borderLeftColor: theme.primaryColor,
              shadowColor: theme.primaryColor,
            },
          ]}
          activeOpacity={0.88}
          onPress={() => setIsStatsModalVisible(true)}
        >
          {/* Üst Kısım: Avatar + Rütbe & Kozmetik Başlık + İlerleme Yüzdesi */}
          <View style={styles.heroScoutHeader}>
            <View
              style={[
                styles.heroAvatarCircle,
                {
                  borderColor: theme.primaryColor,
                  shadowColor: theme.primaryColor,
                },
              ]}
            >
              <Text style={styles.heroAvatarEmoji}>{equippedCosmetic.avatarEmoji}</Text>
            </View>

            <View style={styles.heroScoutInfoCol}>
              <View style={styles.heroScoutTitleRow}>
                <Text style={styles.heroScoutRankTitle} numberOfLines={1}>
                  {rankInfo.title}
                </Text>
                <View
                  style={[
                    styles.heroCosmeticPill,
                    { backgroundColor: equippedCosmetic.themeGlowColor },
                  ]}
                >
                  <Text style={[styles.heroCosmeticPillText, { color: theme.primaryColor }]}>
                    {theme.teamBadgeEmojis} {equippedCosmetic.titleBadge}
                  </Text>
                </View>
              </View>

              <View style={styles.heroScoutMetaRow}>
                <Text style={styles.heroStadiumText}>
                  🏟️ {theme.stadiumName}
                </Text>
                <Text style={styles.heroMetaDot}>•</Text>
                <Text style={styles.heroXpText}>
                  {rankInfo.tier === 4
                    ? 'Zirve Rütbe'
                    : `${rankInfo.xpNeededForNext} XP kaldı`}
                </Text>
              </View>
            </View>

            <View style={styles.heroProgressCol}>
              <Text style={[styles.heroProgressPercent, { color: theme.primaryColor }]}>
                %{rankInfo.currentProgressInTier}
              </Text>
              <Text style={styles.heroStatsHint}>İstatistik ➔</Text>
            </View>
          </View>

          {/* İlerleme Çubuğu */}
          <View style={styles.heroProgressBarBg}>
            <View
              style={[
                styles.heroProgressBarFill,
                {
                  width: `${rankInfo.currentProgressInTier}%`,
                  backgroundColor: theme.primaryColor,
                },
              ]}
            />
          </View>

          {/* Alt Kısım: Canlı Tribün Tezahüratı Şeridi */}
          <View style={[styles.heroAtmosphereStrip, { backgroundColor: theme.accentGlow }]}>
            <View style={[styles.pulseDot, { backgroundColor: theme.primaryColor }]} />
            <Text style={styles.heroChantText} numberOfLines={1}>
              {theme.anthemChant}
            </Text>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + Spacing.xs : 0,
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
  brandCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    ...Typography.h1,
    fontWeight: '900',
    letterSpacing: 1.2,
    fontSize: 22,
  },
  brandSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  currencyBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 12,
  },
  currencyText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 12,
  },
  statsBtn: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 7,
  },
  statsIconText: {
    fontSize: 13,
  },
  shopBtn: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 8,
  },
  shopBtnText: {
    ...Typography.bodyBold,
    fontSize: 11,
  },
  heroScoutCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  heroScoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  heroAvatarEmoji: {
    fontSize: 20,
  },
  heroScoutInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroScoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  heroScoutRankTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  heroCosmeticPill: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.xs,
  },
  heroCosmeticPillText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroScoutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  heroStadiumText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  heroMetaDot: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  heroXpText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  heroProgressCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroProgressPercent: {
    ...Typography.captionBold,
    fontSize: 14,
    fontWeight: '900',
  },
  heroStatsHint: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginTop: 1,
  },
  heroProgressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 6,
  },
  heroProgressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  heroAtmosphereStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroChantText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 10,
    fontStyle: 'italic',
    flex: 1,
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
    minHeight: 42,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
});
