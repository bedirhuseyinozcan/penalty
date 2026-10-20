import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useCareerPathGame } from '../features/careerPath/hooks/useCareerPathGame';
import { CareerTimeline } from '../features/careerPath/components/CareerTimeline';
import { CareerGuessHistory } from '../features/careerPath/components/CareerGuessHistory';
import { OfflinePlayerSearchModal } from '../features/search/components/OfflinePlayerSearchModal';
import { WhoAreYaWinModal } from '../features/whoAreYa/components/WhoAreYaWinModal';
import { HintWithAdButton } from '../features/monetization/components/HintWithAdButton';
import { DailyHeaderCard } from '../features/daily/components/DailyHeaderCard';
import { DailyCompletedBanner } from '../features/daily/components/DailyCompletedBanner';
import { GameNavbar } from '../components/common/GameNavbar';
import { useChallengeDataLoader } from '../hooks/useChallengeDataLoader';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface ICareerPathScreenProps {
  isDaily?: boolean;
  initialLevel?: number;
  isReplay?: boolean;
  onBack: () => void;
  onOpenMap?: () => void;
}

export const CareerPathScreen: React.FC<ICareerPathScreenProps> = React.memo(
  ({ isDaily = false, initialLevel, isReplay = false, onBack, onOpenMap }) => {
    const {
      isLoading,
      challengeData,
      currentLevel,
      isCurrentReplay,
      dailyKey,
      alreadyCompleted,
      selectedLeagueMode,
      goToNextLevel,
    } = useChallengeDataLoader({
      gameMode: 'careerPath',
      isDaily,
      initialLevel,
      isReplay,
    });

    const [hintUnlocked, setHintUnlocked] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);

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
      targetPlayerName: challengeData?.playerName,
      isDaily,
      isReplay: isCurrentReplay,
      dailyKey,
      leagueModeKey: selectedLeagueMode,
    });

    useEffect(() => {
      if (gameStatus !== 'playing') {
        setIsResultModalVisible(true);
      }
    }, [gameStatus]);

    if (isLoading) {
      return (
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Kariyer rotası yükleniyor...</Text>
        </SafeAreaView>
      );
    }

    const navTitle = isDaily ? 'Günün Rotası' : `Seviye ${currentLevel}`;

    return (
      <SafeAreaView style={styles.safeArea}>
        <GameNavbar
          title={navTitle}
          isReplay={isCurrentReplay && !isDaily}
          attemptsLeft={attemptsLeft}
          maxAttempts={maxAttempts}
          onBack={onBack}
          onOpenMap={onOpenMap}
          showMapButton={!isDaily}
        />

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

          <CareerGuessHistory guesses={guesses} />
        </ScrollView>

        {gameStatus === 'playing' ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.guessBtn} activeOpacity={0.8} onPress={openSearch}>
              <Text style={styles.guessBtnText}>🔍 Futbolcu Tahmin Et</Text>
            </TouchableOpacity>
          </View>
        ) : isDaily ? (
          <DailyCompletedBanner
            status={gameStatus}
            attemptsUsed={guesses.length}
            maxAttempts={maxAttempts}
            onOpenResultModal={() => setIsResultModalVisible(true)}
          />
        ) : null}

        <OfflinePlayerSearchModal
          visible={isSearchModalVisible}
          onClose={closeSearch}
          onSelectPlayer={submitGuess}
        />

        <WhoAreYaWinModal
          visible={isResultModalVisible}
          status={gameStatus === 'won' ? 'won' : 'lost'}
          playerName={challengeData?.playerName || 'Yıldız Futbolcu'}
          playerClub={challengeData?.playerClub || 'Süper Lig'}
          rewardCoins={isCurrentReplay ? 0 : 35}
          attemptsUsed={guesses.length}
          maxAttempts={maxAttempts}
          onClose={() => {
            setIsResultModalVisible(false);
            if (!isDaily) {
              resetGame();
              onBack();
            }
          }}
          onOpenMap={
            !isDaily && onOpenMap
              ? () => {
                  setIsResultModalVisible(false);
                  resetGame();
                  onOpenMap();
                }
              : undefined
          }
          onNextLevel={
            !isDaily
              ? () => {
                  setIsResultModalVisible(false);
                  resetGame();
                  goToNextLevel();
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
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  timelineHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
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
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
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
    borderRadius: 8,
    alignItems: 'center',
  },
  guessBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
