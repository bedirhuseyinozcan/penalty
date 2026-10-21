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
import { HomeGameCard } from '../features/home/components/HomeGameCard';
import { PlayerStatsModal } from '../features/stats/components/PlayerStatsModal';
import { GameModeType } from '../api/dailyApi';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

export type AppScreenType = 'home' | 'whoAreYa' | 'careerPath' | 'clubLogo' | 'contextinho' | 'levelMap';

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

  const isSuperLig = selectedLeagueMode === 'super_lig';

  const todayDate = useMemo(() => getAuthoritativeUtcDate(), []);
  const isWhoAreYaDailyCompleted = isDailyCompleted(`${todayDate}_whoAreYa_${selectedLeagueMode}`);
  const isCareerDailyCompleted = isDailyCompleted(`${todayDate}_careerPath_${selectedLeagueMode}`);
  const isClubLogoDailyCompleted = isDailyCompleted(`${todayDate}_clubLogo_${selectedLeagueMode}`);
  const isContextinhoDailyCompleted = isDailyCompleted(`${todayDate}_contextinho_${selectedLeagueMode}`);

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

            <View style={[styles.currencyBadge, styles.xpBadge]}>
              <Text style={styles.xpText}>⚡ {xp} XP</Text>
            </View>

            <TouchableOpacity
              style={[styles.currencyBadge, styles.statsBtn]}
              activeOpacity={0.8}
              onPress={() => setIsStatsModalVisible(true)}
            >
              <Text style={styles.statsIconText}>📊</Text>
            </TouchableOpacity>
          </View>
        </View>

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
      </ScrollView>

      <PlayerStatsModal
        visible={isStatsModalVisible}
        onClose={() => setIsStatsModalVisible(false)}
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
