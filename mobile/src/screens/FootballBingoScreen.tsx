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
import { BingoCurrentPlayerCard } from '../features/footballBingo/components/BingoCurrentPlayerCard';
import { BingoGrid } from '../features/footballBingo/components/BingoGrid';
import { useBingoGame } from '../features/footballBingo/hooks/useBingoGame';
import { HintWithAdButton } from '../features/monetization/components/HintWithAdButton';
import { useInterstitialAd } from '../features/monetization/hooks/useInterstitialAd';
import { WhoAreYaWinModal } from '../features/whoAreYa/components/WhoAreYaWinModal';
import { useChallengeDataLoader } from '../hooks/useChallengeDataLoader';
import { getAuthoritativeUtcDate } from '../services/authoritativeTime';
import { shareService } from '../services/shareService';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface IFootballBingoScreenProps {
  isDaily?: boolean;
  initialLevel?: number;
  isReplay?: boolean;
  onBack: () => void;
  onOpenMap?: () => void;
}

export const FootballBingoScreen: React.FC<IFootballBingoScreenProps> = React.memo(
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
      gameMode: 'footballBingo',
      initialLevel,
      isDaily,
      isReplay,
    });

    const { showInterstitialIfDue } = useInterstitialAd();
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [hintUnlocked, setHintUnlocked] = useState(false);
    const [hintText, setHintText] = useState('');

    const todayDate = useMemo(() => getAuthoritativeUtcDate(), []);
    const seedKey = useMemo(() => {
      return isDaily
        ? `${todayDate}_footballBingo_${selectedLeagueMode}`
        : `level_${currentLevel}_footballBingo_${selectedLeagueMode}`;
    }, [isDaily, todayDate, selectedLeagueMode, currentLevel]);

    const {
      tiles,
      currentPlayer,
      totalDeckSize,
      playersLeftInDeck,
      matchedCount,
      totalTilesCount,
      wrongFlashTileIndex,
      feedbackBanner,
      gameStatus,
      canRevive,
      handleSelectTile,
      handleSkipPlayer,
      autoMatchOneTileHint,
      reviveGame,
      finalizeLoss,
      resetGame,
    } = useBingoGame({
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
      const text = autoMatchOneTileHint();
      setHintText(text);
    }, [autoMatchOneTileHint]);

    if (isLoading) {
      return (
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Bingo Tahtası & Deste Hazırlanıyor...</Text>
        </SafeAreaView>
      );
    }

    const navTitle = isDaily ? 'Futbol Bingo (4x4)' : `Seviye ${currentLevel}`;

    return (
      <SafeAreaView style={styles.safeArea}>
        <GameNavbar
          title={navTitle}
          isReplay={isCurrentReplay && !isDaily}
          attemptsLeft={playersLeftInDeck}
          maxAttempts={totalDeckSize}
          onBack={onBack}
          onOpenMap={onOpenMap}
          showMapButton={!isDaily}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {isDaily && (
            <DailyHeaderCard
              title="Futbol Bingo (4x4)"
              leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
              isCompleted={alreadyCompleted}
            />
          )}

          <BingoCurrentPlayerCard
            player={currentPlayer}
            playersLeftInDeck={playersLeftInDeck}
            totalDeckSize={totalDeckSize}
            matchedCount={matchedCount}
            totalTilesCount={totalTilesCount}
            feedbackBanner={feedbackBanner}
            onSkip={handleSkipPlayer}
            disabled={gameStatus !== 'playing'}
          />

          <BingoGrid
            tiles={tiles}
            wrongFlashTileIndex={wrongFlashTileIndex}
            onSelectTile={handleSelectTile}
            disabled={gameStatus !== 'playing'}
          />

          <View style={styles.hintContainer}>
            <HintWithAdButton
              hintTitle="Otomatik Kutu İpucu"
              isUnlocked={hintUnlocked}
              unlockedText={hintText}
              onHintUnlocked={handleUnlockHint}
            />
          </View>

          {isDaily && gameStatus !== 'playing' && (
            <DailyCompletedBanner
              status={gameStatus}
              attemptsUsed={totalDeckSize - playersLeftInDeck}
              maxAttempts={totalDeckSize}
              onOpenResultModal={() => setIsResultModalVisible(true)}
            />
          )}
        </ScrollView>

        <WhoAreYaWinModal
          visible={isResultModalVisible}
          status={gameStatus === 'lost' ? 'lost' : 'won'}
          playerName="Futbol Bingo (4x4)"
          playerClub={`${matchedCount}/${totalTilesCount} Kutu Tamamlandı`}
          rewardCoins={isCurrentReplay ? 0 : isDaily ? 40 : 25}
          attemptsUsed={totalDeckSize - playersLeftInDeck}
          maxAttempts={totalDeckSize}
          customShareGrid={shareService.generateBingoGrid(tiles)}
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
              showInterstitialIfDue(currentLevel, () => {
                resetGame();
                goToNextLevel();
              });
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

FootballBingoScreen.displayName = 'FootballBingoScreen';

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
  hintContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
});
