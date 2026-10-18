import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useCareerPathGame } from '../features/careerPath/hooks/useCareerPathGame';
import { CareerTimeline } from '../features/careerPath/components/CareerTimeline';
import { OfflinePlayerSearchModal } from '../features/search/components/OfflinePlayerSearchModal';
import { WhoAreYaWinModal } from '../features/whoAreYa/components/WhoAreYaWinModal';
import { HintWithAdButton } from '../features/monetization/components/HintWithAdButton';
import { DailyHeaderCard } from '../features/daily/components/DailyHeaderCard';
import { dailyApi } from '../api/dailyApi';
import { levelApi } from '../api/levelApi';
import { ICareerStepItem } from '../features/careerPath/types';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useGameStore } from '../stores/useGameStore';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface ICareerPathScreenProps {
  isDaily?: boolean;
  onBack: () => void;
}

export const CareerPathScreen: React.FC<ICareerPathScreenProps> = React.memo(
  ({ isDaily = false, onBack }) => {
    const selectedLeagueMode = useSettingsStore((s) => s.selectedLeagueMode);
    const getUnlockedLevel = useGameStore((s) => s.getUnlockedLevel);
    const isDailyCompleted = useGameStore((s) => s.isDailyCompleted);

    const [isLoading, setIsLoading] = useState(true);
    const [challengeData, setChallengeData] = useState<{
      targetPlayerId: string;
      careerPath: ICareerStepItem[];
      playerName?: string;
      playerClub?: string;
      dailyKey?: string;
    } | null>(null);

    const [hintUnlocked, setHintUnlocked] = useState(false);

    const currentLevel = getUnlockedLevel('careerPath', selectedLeagueMode);
    const todayDate = new Date().toISOString().split('T')[0];
    const dailyKey = `${todayDate}_careerPath_${selectedLeagueMode}`;
    const alreadyCompleted = isDaily && isDailyCompleted(dailyKey);

    useEffect(() => {
      let isMounted = true;

      const loadData = async () => {
        setIsLoading(true);
        try {
          if (isDaily) {
            const data = await dailyApi.getTodayChallenge('careerPath', selectedLeagueMode);
            if (isMounted) {
              setChallengeData({
                targetPlayerId: data.targetPlayerId || data.id,
                playerName: data.playerName,
                playerClub: data.playerClub,
                careerPath: data.careerPath || [],
                dailyKey,
              });
            }
          } else {
            const data = await levelApi.getLevel(currentLevel, 'careerPath', selectedLeagueMode);
            if (isMounted) {
              setChallengeData({
                targetPlayerId: data.targetPlayerId || `level_${currentLevel}`,
                playerName: data.playerName,
                playerClub: data.playerClub,
                careerPath: data.careerPath || [],
              });
            }
          }
        } catch {
          if (isMounted) {
            setChallengeData({
              targetPlayerId: selectedLeagueMode === 'super_lig' ? 'tmid_12348' : 'tmid_12346',
              playerName: selectedLeagueMode === 'super_lig' ? 'Edin Džeko' : 'Erling Haaland',
              playerClub: selectedLeagueMode === 'super_lig' ? 'Fenerbahçe' : 'Manchester City',
              careerPath:
                selectedLeagueMode === 'super_lig'
                  ? [
                      { clubName: 'Željezničar', startYear: 2003, endYear: 2005 },
                      { clubName: 'Teplice', startYear: 2005, endYear: 2007 },
                      { clubName: 'VfL Wolfsburg', startYear: 2007, endYear: 2011, apps: 142, goals: 85 },
                      { clubName: 'Manchester City', startYear: 2011, endYear: 2016, apps: 189, goals: 72 },
                      { clubName: 'AS Roma', startYear: 2015, endYear: 2021, apps: 260, goals: 119 },
                      { clubName: 'Inter', startYear: 2021, endYear: 2023, apps: 101, goals: 31 },
                      { clubName: 'Fenerbahçe', startYear: 2023 },
                    ]
                  : [
                      { clubName: 'Bryne FK', startYear: 2015, endYear: 2017 },
                      { clubName: 'Molde', startYear: 2017, endYear: 2019, apps: 50, goals: 20 },
                      { clubName: 'Red Bull Salzburg', startYear: 2019, endYear: 2020, apps: 27, goals: 29 },
                      { clubName: 'Borussia Dortmund', startYear: 2020, endYear: 2022, apps: 89, goals: 86 },
                      { clubName: 'Manchester City', startYear: 2022, apps: 100, goals: 90 },
                    ],
              dailyKey,
            });
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, [isDaily, selectedLeagueMode, currentLevel, dailyKey]);

    const targetPlayerId = challengeData?.targetPlayerId ?? 'tmid_12348';
    const careerPath = challengeData?.careerPath ?? [];

    const {
      guesses,
      gameStatus,
      attemptsLeft,
      maxAttempts,
      isSearchModalVisible,
      openSearch,
      closeSearch,
      submitGuess,
      resetGame,
    } = useCareerPathGame({
      targetPlayerId,
      isDaily,
      dailyKey,
      leagueModeKey: selectedLeagueMode,
    });

    if (isLoading) {
      return (
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Kariyer rotası yükleniyor...</Text>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Geri</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>
            {isDaily ? 'Günün Rotası' : `Seviye ${currentLevel}`}
          </Text>
          <View style={styles.attemptsBadge}>
            <Text style={styles.attemptsText}>
              Kalan Hak: {attemptsLeft}/{maxAttempts}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isDaily && (
            <DailyHeaderCard
              title="Transfer Rotası"
              leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
              isCompleted={alreadyCompleted}
            />
          )}
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Oynadığı Kulüpler</Text>
            <Text style={styles.timelineSubtitle}>
              Kariyer adımlarını inceleyip bu futbolcunun kim olduğunu tahmin edin.
            </Text>
          </View>

          <CareerTimeline careerPath={careerPath} />

          <View style={styles.hintContainer}>
            <HintWithAdButton
              hintTitle="Uyruk İpucu"
              isUnlocked={hintUnlocked}
              unlockedText="İpucu Açıldı: Balkan Ülkesi / Avrupa Vatandaşı"
              onHintUnlocked={() => setHintUnlocked(true)}
            />
          </View>

          {guesses.length > 0 && (
            <View style={styles.guessHistory}>
              <Text style={styles.historyTitle}>Yapılan Tahminler:</Text>
              {guesses.map((g, idx) => (
                <View
                  key={`${g.playerId}_${idx}`}
                  style={[styles.guessRow, g.isCorrect ? styles.correctRow : styles.wrongRow]}
                >
                  <Text style={styles.guessName}>
                    {g.isCorrect ? '✅ ' : '❌ '}
                    {g.playerName} ({g.club})
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {gameStatus === 'playing' ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.guessBtn} activeOpacity={0.8} onPress={openSearch}>
              <Text style={styles.guessBtnText}>🔍 Futbolcu Tahmin Et</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <OfflinePlayerSearchModal
          visible={isSearchModalVisible}
          onClose={closeSearch}
          onSelectPlayer={submitGuess}
        />

        <WhoAreYaWinModal
          visible={gameStatus !== 'playing'}
          status={gameStatus === 'won' ? 'won' : 'lost'}
          playerName={challengeData?.playerName || 'Yıldız Futbolcu'}
          playerClub={challengeData?.playerClub || 'Süper Lig'}
          rewardCoins={35}
          attemptsUsed={guesses.length}
          maxAttempts={maxAttempts}
          onClose={() => {
            resetGame();
            onBack();
          }}
          onNextLevel={
            !isDaily
              ? () => {
                  resetGame();
                  onBack();
                }
              : undefined
          }
        />
      </SafeAreaView>
    );
  }
);

CareerPathScreen.displayName = 'CareerPathScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  backBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 16,
  },
  navTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  attemptsBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attemptsText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  timelineHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  timelineTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  timelineSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hintContainer: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
  },
  guessHistory: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  historyTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  guessRow: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: 4,
  },
  correctRow: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  wrongRow: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  guessName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  bottomBar: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  guessBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guessBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
