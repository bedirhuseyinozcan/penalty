import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
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
import { searchEngine } from '../services/searchEngine';
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

    const targetPlayerId = challengeData?.targetPlayerId ?? 'tmid_382528';
    const careerPath = challengeData?.careerPath ?? [];

    const targetPlayerInfo = useMemo(
      () => searchEngine.getPlayerById(targetPlayerId),
      [targetPlayerId]
    );

    const dynamicHintText = useMemo(() => {
      if (targetPlayerInfo) {
        return `İpucu Açıldı: Uyruk ${targetPlayerInfo.nationality} • Mevki ${targetPlayerInfo.position} • Yaş ${targetPlayerInfo.age ?? '?'}`;
      }
      if (challengeData?.hints && challengeData.hints.length > 0) {
        return `İpucu Açıldı: ${challengeData.hints[0]}`;
      }
      return `İpucu Açıldı: Güncel Kulüp — ${challengeData?.playerClub || 'Bilinmiyor'}`;
    }, [targetPlayerInfo, challengeData]);

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
              hintTitle="Uyruk ve Mevki İpucu"
              isUnlocked={hintUnlocked}
              unlockedText={dynamicHintText}
              onHintUnlocked={() => setHintUnlocked(true)}
            />
          </View>

          <CareerGuessHistory guesses={guesses} />
        </ScrollView>

        {gameStatus === 'playing' ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.guessBtn}
              activeOpacity={0.7}
              onPress={openSearch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
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
          status={gameStatus === 'lost' ? 'lost' : 'won'}
          playerName={challengeData?.playerName || targetPlayerInfo?.name || 'Yıldız Futbolcu'}
          playerClub={challengeData?.playerClub || targetPlayerInfo?.club || 'Süper Lig'}
          finalImageUrl={challengeData?.imageUrl}
          rewardCoins={isCurrentReplay ? 0 : isDaily ? 30 : 20}
          attemptsUsed={guesses.length}
          maxAttempts={maxAttempts}
          leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
          isDaily={isDaily}
          onOpenMap={!isDaily ? onOpenMap : undefined}
          onNextLevel={() => {
            setIsResultModalVisible(false);
            setHintUnlocked(false);
            if (isDaily) {
              onBack();
            } else {
              resetGame();
              goToNextLevel();
            }
          }}
          onClose={() => setIsResultModalVisible(false)}
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
    paddingBottom: Spacing.xl,
  },
  timelineHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.xs,
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
    marginVertical: Spacing.sm,
  },
  bottomBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'android' ? 26 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  guessBtn: {
    backgroundColor: Colors.primary,
    minHeight: 52,
    justifyContent: 'center',
    borderRadius: 12,
    alignItems: 'center',
  },
  guessBtnText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});
