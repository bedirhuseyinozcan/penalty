import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { GameNavbar } from '../components/common/GameNavbar';
import { DailyHeaderCard } from '../features/daily/components/DailyHeaderCard';
import { DailyCompletedBanner } from '../features/daily/components/DailyCompletedBanner';
import { TicTacToeBoard } from '../features/ticTacToe/components/TicTacToeBoard';
import { useTicTacToeGame } from '../features/ticTacToe/hooks/useTicTacToeGame';
import { OfflinePlayerSearchModal } from '../features/search/components/OfflinePlayerSearchModal';
import { HintWithAdButton } from '../features/monetization/components/HintWithAdButton';
import { WhoAreYaWinModal } from '../features/whoAreYa/components/WhoAreYaWinModal';
import { useChallengeDataLoader } from '../hooks/useChallengeDataLoader';
import { getAuthoritativeUtcDate } from '../services/authoritativeTime';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface ITicTacToeScreenProps {
  isDaily?: boolean;
  initialLevel?: number;
  isReplay?: boolean;
  onBack: () => void;
  onOpenMap?: () => void;
}

export const TicTacToeScreen: React.FC<ITicTacToeScreenProps> = React.memo(
  ({ isDaily = false, initialLevel, isReplay = false, onBack, onOpenMap }) => {
    const {
      isLoading,
      currentLevel,
      isCurrentReplay,
      dailyKey,
      alreadyCompleted,
      selectedLeagueMode,
      goToNextLevel,
    } = useChallengeDataLoader({
      gameMode: 'ticTacToe',
      initialLevel,
      isDaily,
      isReplay,
    });

    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [hintUnlocked, setHintUnlocked] = useState(false);
    const [hintText, setHintText] = useState('');

    const todayDate = useMemo(() => getAuthoritativeUtcDate(), []);
    const seedKey = useMemo(() => {
      return isDaily
        ? `${todayDate}_ticTacToe_${selectedLeagueMode}`
        : `level_${currentLevel}_ticTacToe_${selectedLeagueMode}`;
    }, [isDaily, todayDate, selectedLeagueMode, currentLevel]);

    const {
      rows,
      cols,
      cells,
      filledCount,
      selectedCellIndex,
      gameStatus,
      attemptsLeft,
      maxAttempts,
      canRevive,
      isSearchModalVisible,
      lastFeedback,
      handleSelectCell,
      closeSearch,
      submitCellGuess,
      revealRandomCellWithHint,
      reviveGame,
      finalizeLoss,
      resetGame,
    } = useTicTacToeGame({
      seedKey,
      leagueMode: selectedLeagueMode,
      isDaily,
      isReplay: isCurrentReplay,
      dailyKey,
    });

    useEffect(() => {
      if (gameStatus !== 'playing') {
        setIsResultModalVisible(true);
      }
    }, [gameStatus]);

    const handleUnlockHint = useCallback(() => {
      setHintUnlocked(true);
      const text = revealRandomCellWithHint();
      setHintText(text);
    }, [revealRandomCellWithHint]);

    if (isLoading) {
      return (
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Tiki-Taka Hazırlanıyor...</Text>
        </SafeAreaView>
      );
    }

    const navTitle = isDaily ? 'Tiki-Taka (3x3)' : `Seviye ${currentLevel}`;

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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {isDaily && (
            <DailyHeaderCard
              title="Tiki-Taka (3x3)"
              leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
              isCompleted={alreadyCompleted}
            />
          )}

          <View style={styles.metaRow}>
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>
                Doldurulan: <Text style={styles.progressHighlight}>{filledCount}/9</Text>
              </Text>
            </View>
            <Text style={styles.rulesHint}>Hücreye bas, kriterlere uyan futbolcuyu ara!</Text>
          </View>

          {lastFeedback && (
            <View style={styles.feedbackBanner}>
              <Text style={styles.feedbackBannerText}>{lastFeedback}</Text>
            </View>
          )}

          <TicTacToeBoard
            rows={rows}
            cols={cols}
            cells={cells}
            selectedCellIndex={selectedCellIndex}
            onSelectCell={handleSelectCell}
            disabled={gameStatus !== 'playing'}
          />

          <View style={styles.hintContainer}>
            <HintWithAdButton
              hintTitle="Rastgele Bir Kutu İpucu"
              isUnlocked={hintUnlocked}
              unlockedText={hintText}
              onHintUnlocked={handleUnlockHint}
            />
          </View>

          {isDaily && gameStatus !== 'playing' && (
            <DailyCompletedBanner
              status={gameStatus}
              attemptsUsed={maxAttempts - attemptsLeft}
              maxAttempts={maxAttempts}
              onOpenResultModal={() => setIsResultModalVisible(true)}
            />
          )}
        </ScrollView>

        <OfflinePlayerSearchModal
          visible={isSearchModalVisible}
          onClose={closeSearch}
          onSelectPlayer={submitCellGuess}
          includeLegends
        />

        <WhoAreYaWinModal
          visible={isResultModalVisible}
          status={gameStatus === 'lost' ? 'lost' : 'won'}
          playerName="Tiki-Taka (3x3)"
          playerClub={`${filledCount}/9 Hücre Tamamlandı`}
          rewardCoins={isCurrentReplay ? 0 : isDaily ? 35 : 25}
          attemptsUsed={maxAttempts - attemptsLeft}
          maxAttempts={maxAttempts}
          leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
          isDaily={isDaily}
          onRevive={
            canRevive
              ? () => {
                  setIsResultModalVisible(false);
                  reviveGame();
                }
              : undefined
          }
          onOpenMap={!isDaily ? onOpenMap : undefined}
          onNextLevel={() => {
            setIsResultModalVisible(false);
            setHintUnlocked(false);
            setHintText('');
            if (isDaily) {
              onBack();
            } else {
              resetGame();
              goToNextLevel();
            }
          }}
          onClose={() => {
            setIsResultModalVisible(false);
            if (gameStatus === 'lost') {
              finalizeLoss();
            }
          }}
        />
      </SafeAreaView>
    );
  }
);

TicTacToeScreen.displayName = 'TicTacToeScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: Platform.OS === 'android' ? 36 : Spacing.xl,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  progressPill: {
    backgroundColor: Colors.surface,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  rulesHint: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  feedbackBanner: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  feedbackBannerText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontSize: 11,
  },
  hintContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
});
