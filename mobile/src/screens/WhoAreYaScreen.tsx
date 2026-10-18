import React, { useState, useEffect } from 'react';
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
import { dailyApi } from '../api/dailyApi';
import { levelApi } from '../api/levelApi';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useGameStore } from '../stores/useGameStore';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
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
    const selectedLeagueMode = useSettingsStore((s) => s.selectedLeagueMode);
    const getUnlockedLevel = useGameStore((s) => s.getUnlockedLevel);
    const isDailyCompleted = useGameStore((s) => s.isDailyCompleted);

    const [isLoading, setIsLoading] = useState(true);
    const [challengeData, setChallengeData] = useState<{
      targetPlayerId: string;
      blurImages: string[];
      imageUrl?: string;
      playerName?: string;
      playerClub?: string;
      dailyKey?: string;
    } | null>(null);

    const [hintUnlocked, setHintUnlocked] = useState(false);

    const [currentLevel, setCurrentLevel] = useState(() =>
      initialLevel ?? getUnlockedLevel('whoAreYa', selectedLeagueMode)
    );
    const [isCurrentReplay, setIsCurrentReplay] = useState(isReplay);

    useEffect(() => {
      if (initialLevel != null) {
        setCurrentLevel(initialLevel);
        setIsCurrentReplay(isReplay);
      } else {
        setCurrentLevel(getUnlockedLevel('whoAreYa', selectedLeagueMode));
        setIsCurrentReplay(false);
      }
    }, [initialLevel, isReplay, selectedLeagueMode, getUnlockedLevel]);

    const todayDate = new Date().toISOString().split('T')[0];
    const dailyKey = `${todayDate}_whoAreYa_${selectedLeagueMode}`;
    const alreadyCompleted = isDaily && isDailyCompleted(dailyKey);

    useEffect(() => {
      let isMounted = true;

      const loadData = async () => {
        setIsLoading(true);
        try {
          if (isDaily) {
            const data = await dailyApi.getTodayChallenge('whoAreYa', selectedLeagueMode);
            if (isMounted) {
              setChallengeData({
                targetPlayerId: data.targetPlayerId || data.id,
                playerName: data.playerName,
                playerClub: data.playerClub,
                imageUrl: data.imageUrl || data.initialBlurImageUrl,
                blurImages: data.blurImages || [],
                dailyKey,
              });
            }
          } else {
            const data = await levelApi.getLevel(currentLevel, 'whoAreYa', selectedLeagueMode);
            if (isMounted) {
              setChallengeData({
                targetPlayerId: data.targetPlayerId || `level_${currentLevel}`,
                playerName: data.playerName,
                playerClub: data.playerClub,
                imageUrl: data.imageUrl || data.initialBlurImageUrl,
                blurImages: data.blurImages || [],
              });
            }
          }
        } catch {
          if (isMounted) {
            setChallengeData({
              targetPlayerId: selectedLeagueMode === 'super_lig' ? 'tmid_12345' : 'tmid_12346',
              imageUrl:
                selectedLeagueMode === 'super_lig'
                  ? 'https://img.a.transfermarkt.technology/portrait/big/68863-1671105169.png'
                  : 'https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png',
              blurImages: [],
              playerName: selectedLeagueMode === 'super_lig' ? 'Mauro Icardi' : 'Erling Haaland',
              playerClub: selectedLeagueMode === 'super_lig' ? 'Galatasaray' : 'Manchester City',
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

    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Geri</Text>
          </TouchableOpacity>

          <View style={styles.navTitleContainer}>
            <Text style={styles.navTitle}>
              {isDaily ? 'Günün Sorusu' : `Seviye ${currentLevel}`}
            </Text>
            {isCurrentReplay && !isDaily ? (
              <View style={styles.replayBadge}>
                <Text style={styles.replayBadgeText}>🔁 Tekrar</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.navRightRow}>
            {!isDaily && onOpenMap ? (
              <TouchableOpacity onPress={onOpenMap} style={styles.mapHeaderBtn}>
                <Text style={styles.mapHeaderBtnText}>🗺️ Harita</Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.attemptsBadge}>
              <Text style={styles.attemptsText}>
                {attemptsLeft}/{maxAttempts}
              </Text>
            </View>
          </View>
        </View>

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
            <TouchableOpacity
              style={styles.guessBtn}
              activeOpacity={0.8}
              onPress={openSearch}
            >
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
                  setIsCurrentReplay(false);
                  setCurrentLevel((prev) => prev + 1);
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
  navTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  replayBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  replayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
  },
  navRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mapHeaderBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapHeaderBtnText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '700',
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
  hintContainer: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  historyContainer: {
    flex: 1,
    marginTop: Spacing.xs,
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
