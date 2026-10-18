import React, { useCallback } from 'react';
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
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface IHomeScreenProps {
  onNavigate: (screen: 'home' | 'whoAreYa' | 'careerPath', isDaily?: boolean) => void;
}

export const HomeScreen: React.FC<IHomeScreenProps> = React.memo(({ onNavigate }) => {
  const coins = useGameStore((s) => s.coins);
  const xp = useGameStore((s) => s.xp);
  const selectedLeagueMode = useSettingsStore((s) => s.selectedLeagueMode);
  const setLeagueMode = useSettingsStore((s) => s.setLeagueMode);

  const isSuperLig = selectedLeagueMode === 'super_lig';

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
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>🪙 {coins}</Text>
            </View>
            <View style={[styles.currencyBadge, styles.xpBadge]}>
              <Text style={styles.xpText}>⚡ {xp} XP</Text>
            </View>
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

        <View style={styles.gameCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🕵️‍♂️</Text>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Kim Bu Yıldız?</Text>
              <Text style={styles.cardSubtitle}>
                Bulanık fotoğraftan ve ipuçlarından futbolcuyu tahmin et
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.gameActionBtn, styles.dailyBtn]}
              activeOpacity={0.8}
              onPress={() => onNavigate('whoAreYa', true)}
            >
              <Text style={styles.dailyBtnText}>📅 Günün Sorusu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gameActionBtn, styles.careerBtn]}
              activeOpacity={0.8}
              onPress={() => onNavigate('whoAreYa', false)}
            >
              <Text style={styles.careerBtnText}>🚀 Kariyer Modu</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gameCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🧭</Text>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Transfer Rotası</Text>
              <Text style={styles.cardSubtitle}>
                Kariyerinde oynadığı kulüpleri takip ederek yıldızı bul
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.gameActionBtn, styles.dailyBtn]}
              activeOpacity={0.8}
              onPress={() => onNavigate('careerPath', true)}
            >
              <Text style={styles.dailyBtnText}>📅 Günün Sorusu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gameActionBtn, styles.careerBtn]}
              activeOpacity={0.8}
              onPress={() => onNavigate('careerPath', false)}
            >
              <Text style={styles.careerBtnText}>🚀 Kariyer Modu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
  gameCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardEmoji: {
    fontSize: 34,
    marginRight: Spacing.md,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  gameActionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  dailyBtnText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 13,
  },
  careerBtn: {
    backgroundColor: Colors.primary,
  },
  careerBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 13,
  },
});
