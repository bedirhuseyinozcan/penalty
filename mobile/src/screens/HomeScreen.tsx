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
import { HomeGameCard } from '../features/home/components/HomeGameCard';
import { PlayerStatsModal } from '../features/stats/components/PlayerStatsModal';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface IHomeScreenProps {
  onNavigate: (
    screen: 'home' | 'whoAreYa' | 'careerPath' | 'levelMap',
    isDaily?: boolean,
    gameMode?: 'whoAreYa' | 'careerPath'
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

  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isWhoAreYaDailyCompleted = isDailyCompleted(`${todayDate}_whoAreYa_${selectedLeagueMode}`);
  const isCareerDailyCompleted = isDailyCompleted(`${todayDate}_careerPath_${selectedLeagueMode}`);

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
            {/* Streak / Stats Button */}
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
          onPressDaily={() => onNavigate('whoAreYa', true)}
          onPressCareer={() => onNavigate('levelMap', false, 'whoAreYa')}
        />

        <HomeGameCard
          emoji="🧭"
          title="Transfer Rotası"
          subtitle="Kariyerinde oynadığı kulüpleri takip ederek yıldızı bul"
          dailyBtnText={isCareerDailyCompleted ? '✅ Günün Sorusu (Çözüldü)' : '📅 Günün Sorusu'}
          onPressDaily={() => onNavigate('careerPath', true)}
          onPressCareer={() => onNavigate('levelMap', false, 'careerPath')}
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
    alignItems: 'center',
    gap: Spacing.xs,
  },
  currencyBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakBadge: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  streakText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '800',
  },
  statsBtn: {
    paddingHorizontal: 8,
    backgroundColor: Colors.surfaceLight,
  },
  statsIconText: {
    fontSize: 13,
  },
  currencyText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
  },
  xpBadge: {
    borderColor: Colors.secondary,
  },
  xpText: {
    ...Typography.caption,
    color: Colors.secondary,
    fontWeight: '700',
  },
  modeSwitcherContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeTabBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
