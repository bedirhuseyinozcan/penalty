import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useWhoAreYaGame } from '../features/whoAreYa/hooks/useWhoAreYaGame';
import { BlurredImageHero } from '../features/whoAreYa/components/BlurredImageHero';
import { GuessHistoryList } from '../features/whoAreYa/components/GuessHistoryList';
import { OfflinePlayerSearchModal } from '../features/search/components/OfflinePlayerSearchModal';
import { WhoAreYaWinModal } from '../features/whoAreYa/components/WhoAreYaWinModal';
import { HintWithAdButton } from '../features/monetization/components/HintWithAdButton';
import { DailyHeaderCard } from '../features/daily/components/DailyHeaderCard';
import { GameNavbar } from '../components/common/GameNavbar';
import { useChallengeDataLoader } from '../hooks/useChallengeDataLoader';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface IWhoAreYaScreenProps {
  isDaily?: boolean;
  initialLevel?: number;
  isReplay?: boolean;
  onBack: () => void;
  onOpenMap?: () => void;
}

export const WhoAreYaScreen: React.FC<IWhoAreYaScreenProps> = React.memo(
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
      gameMode: 'whoAreYa',
      isDaily,
      initialLevel,
      isReplay,
    });

    const [hintUnlocked, setHintUnlocked] = useState(false);

    const targetPlayerId = challengeData?.targetPlayerId ?? 'tmid_12345';
    const blurImages = challengeData?.blurImages ?? [];

    const {
      guesses,
      gameStatus,
      currentBlurImageUrl,
      isSearchModalVisible,
      attemptsLeft,
      maxAttempts,
      openSearch,
      closeSearch,
      submitGuess,
      resetGame,
    } = useWhoAreYaGame({
      targetPlayerId,
      targetPlayerName: challengeData?.playerName,
      blurImages,
      isDaily,
      isReplay: isCurrentReplay,
      dailyKey,
      leagueModeKey: selectedLeagueMode,
    });

    if (isLoading) {
      return (
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Yıldız hazırlanıyor...</Text>
        </SafeAreaView>
      );
    }

    const navTitle = isDaily ? 'Günün Sorusu' : `Seviye ${currentLevel}`;

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

        {isDaily && (
          <DailyHeaderCard
            title="Kim Bu Yıldız?"
            leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
            isCompleted={alreadyCompleted}
          />
        )}

        <BlurredImageHero
          imageUrl={challengeData?.imageUrl || currentBlurImageUrl}
          currentAttempt={guesses.length}
          maxAttempts={maxAttempts}
        />

        <View style={styles.hintContainer}>
          <HintWithAdButton
            hintTitle="Mevki ve Yaş İpucu"
            isUnlocked={hintUnlocked}
            unlockedText="İpucu Açıldı: Santrafor (CF), 30+ Yaşında"
            onHintUnlocked={() => setHintUnlocked(true)}
          />
        </View>

        <View style={styles.historyContainer}>
          <GuessHistoryList guesses={guesses} />
        </View>

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
          finalImageUrl={challengeData?.imageUrl || blurImages[blurImages.length - 1]}
          rewardCoins={isCurrentReplay ? 0 : 30}
          attemptsUsed={guesses.length}
          maxAttempts={maxAttempts}
          onClose={() => {
            resetGame();
            onBack();
          }}
          onOpenMap={
            !isDaily && onOpenMap
              ? () => {
                  resetGame();
                  onOpenMap();
                }
              : undefined
          }
          onNextLevel={
            !isDaily
              ? () => {
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

WhoAreYaScreen.displayName = 'WhoAreYaScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  hintContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  historyContainer: {
    flex: 1,
    marginTop: Spacing.sm,
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
