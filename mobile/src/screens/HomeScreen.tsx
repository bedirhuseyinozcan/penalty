import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useGameStore } from '../stores/useGameStore';
import { useSettingsStore, LeagueMode } from '../stores/useSettingsStore';
import { getAuthoritativeUtcDate } from '../services/authoritativeTime';
import { getRankByXp } from '../features/stats/utils/rankUtils';
import { HomeGameCard } from '../features/home/components/HomeGameCard';
import { PlayerStatsModal } from '../features/stats/components/PlayerStatsModal';
import { ScoutShopModal } from '../features/shop/components/ScoutShopModal';
import { getCosmeticById } from '../features/shop/catalog';
import { GameModeType } from '../api/dailyApi';
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

  const isSuperLig = selectedLeagueMode === 'super_lig';

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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>PENALTY</Text>
            <Text style={styles.brandSubtitle}>Futbol Oyun Portalı</Text>
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
              style={[styles.currencyBadge, styles.shopBtn]}
              activeOpacity={0.8}
              onPress={() => setIsShopModalVisible(true)}
            >
              <Text style={styles.shopBtnText}>🛍️ Dükkan</Text>
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

        <TouchableOpacity
          style={[
            styles.rankCard,
            { borderColor: equippedCosmetic.frameBorderColor },
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
                    borderColor: equippedCosmetic.frameBorderColor,
                    shadowColor: equippedCosmetic.frameBorderColor,
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
                        {
                          color:
                            equippedCosmetic.frameBorderColor === '#FFFFFF'
                              ? '#FBBF24'
                              : equippedCosmetic.frameBorderColor,
                        },
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
            <Text style={styles.rankPercentText}>%{rankInfo.currentProgressInTier}</Text>
          </View>
          <View style={styles.rankProgressBarBg}>
            <View
              style={[
                styles.rankProgressBarFill,
                { width: `${rankInfo.currentProgressInTier}%` },
              ]}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.modeSwitcherContainer}>
          <Text style={styles.sectionTitle}>Lig Modu Seçimi</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, isSuperLig && styles.activeTabBtn]}
              activeOpacity={0.8}
              onPress={() => handleSelectMode('super_lig')}
            >
              <Text style={[styles.tabText, isSuperLig && styles.activeTabText]}>
                🇹🇷 Süper Lig
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, !isSuperLig && styles.activeTabBtn]}
              activeOpacity={0.8}
              onPress={() => handleSelectMode('global')}
            >
              <Text style={[styles.tabText, !isSuperLig && styles.activeTabText]}>
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
          onPressDaily={() => onNavigate('whoAreYa', true, 'whoAreYa')}
          onPressCareer={() => onNavigate('levelMap', false, 'whoAreYa')}
        />

        <HomeGameCard
          emoji="🧭"
          title="Transfer Rotası"
          subtitle="Kariyerinde oynadığı kulüpleri takip ederek yıldızı bul"
          dailyBtnText={isCareerDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          onPressDaily={() => onNavigate('careerPath', true, 'careerPath')}
          onPressCareer={() => onNavigate('levelMap', false, 'careerPath')}
        />

        <HomeGameCard
          emoji="🛡️"
          title="Arma Avcısı"
          subtitle="Gizlenmiş ve bulanıklaştırılmış kulüp armasından takımı bul"
          dailyBtnText={isClubLogoDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          onPressDaily={() => onNavigate('clubLogo', true, 'clubLogo')}
          onPressCareer={() => onNavigate('levelMap', false, 'clubLogo')}
        />

        <HomeGameCard
          emoji="🔥"
          title="Sıcak Temas"
          subtitle="Sıcak-soğuk benzerlik sinyallerini takip ederek #1 numaralı yıldızı bul"
          dailyBtnText={isContextinhoDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          onPressDaily={() => onNavigate('contextinho', true, 'contextinho')}
          onPressCareer={() => onNavigate('levelMap', false, 'contextinho')}
        />

        <HomeGameCard
          emoji="🎯"
          title="Tiki-Taka (3x3)"
          subtitle="Kriter kesişimlerine (Kulüp × Mevki/Uyruk) uyan futbolcuları bul"
          dailyBtnText={isTicTacToeDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          onPressDaily={() => onNavigate('ticTacToe', true, 'ticTacToe')}
          onPressCareer={() => onNavigate('levelMap', false, 'ticTacToe')}
        />

        <HomeGameCard
          emoji="🔢"
          title="Futbol Bingo (4x4)"
          subtitle="42 kişilik desteden gelen futbolcuları doğru kriter kutularına yerleştir"
          dailyBtnText={isBingoDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
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
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  brandTitle: {
    ...Typography.h1,
    color: Colors.primary,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
  xpBadge: {
    borderColor: Colors.primary,
  },
  xpText: {
    ...Typography.bodyBold,
    color: Colors.primary,
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
    borderColor: Colors.accent,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  shopBtnText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 12,
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
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    marginBottom: Spacing.lg,
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
  rankBadgeEmoji: {
    fontSize: 26,
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
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  modeSwitcherContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
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
  activeTabBtn: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.background,
  },
});
