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
  Image,
} from 'react-native';
import { useCareerPathGame } from '../features/careerPath/hooks/useCareerPathGame';
import { CareerTimeline } from '../features/careerPath/components/CareerTimeline';
import { CareerGuessHistory } from '../features/careerPath/components/CareerGuessHistory';
import { OfflinePlayerSearchModal } from '../features/search/components/OfflinePlayerSearchModal';
import { WhoAreYaWinModal } from '../features/whoAreYa/components/WhoAreYaWinModal';
import { useInterstitialAd } from '../features/monetization/hooks/useInterstitialAd';
import { HintWithAdButton } from '../features/monetization/components/HintWithAdButton';
import { DailyHeaderCard } from '../features/daily/components/DailyHeaderCard';
import { DailyCompletedBanner } from '../features/daily/components/DailyCompletedBanner';
import { GameNavbar } from '../components/common/GameNavbar';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
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

    const { showInterstitialIfDue } = useInterstitialAd();
    const [hintUnlocked, setHintUnlocked] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);

    const targetPlayerId = challengeData?.targetPlayerId ?? 'tmid_382528';
    const careerPath = challengeData?.careerPath ?? [];

    const targetPlayerInfo = useMemo(() => {
      if (challengeData?.targetPlayerId) {
        const found = searchEngine.getPlayerById(challengeData.targetPlayerId);
        if (found) return found;
      }
      if (challengeData?.playerName) {
        const foundByName = searchEngine.getPlayerByName(challengeData.playerName);
        if (foundByName) return foundByName;
      }
      return searchEngine.getPlayerById(targetPlayerId);
    }, [challengeData, targetPlayerId]);

    const resolvedPlayerImage = useMemo(() => {
      return (
        challengeData?.imageUrl ||
        targetPlayerInfo?.imageUrl ||
        targetPlayerInfo?.img ||
        searchEngine.getPlayerPhoto(targetPlayerInfo) ||
        searchEngine.getPlayerPhoto(challengeData?.playerName) ||
        (targetPlayerInfo?.id
          ? `https://img.a.transfermarkt.technology/portrait/big/${targetPlayerInfo.id.replace(/^tmid_/, '')}.jpg`
          : undefined) ||
        (challengeData?.targetPlayerId
          ? `https://img.a.transfermarkt.technology/portrait/big/${challengeData.targetPlayerId.replace(/^tmid_/, '')}.jpg`
          : undefined)
      );
    }, [challengeData, targetPlayerInfo]);

    const dynamicHintText = useMemo(() => {
      if (targetPlayerInfo) {
        return `İpucu Açıldı: Uyruk ${targetPlayerInfo.nationality} • Mevki ${targetPlayerInfo.position} • Yaş ${targetPlayerInfo.age ?? '?'}`;
      }
      if (challengeData?.hints && challengeData.hints.length > 0) {
        return `İpucu Açıldı: ${challengeData.hints[0]}`;
      }
      return `İpucu Açıldı: Güncel Kulüp — ${challengeData?.playerClub || 'Bilinmiyor'}`;
    }, [targetPlayerInfo, challengeData]);

    const isLegendLevel = !isDaily && currentLevel % 3 === 0;

    const {
      guesses,
      gameStatus,
      attemptsLeft,
      maxAttempts,
      canRevive,
      isSearchModalVisible,
      openSearch,
      closeSearch,
      submitGuess,
      reviveGame,
      finalizeLoss,
      resetGame,
    } = useCareerPathGame({
      targetPlayerId,
      targetPlayerName: challengeData?.playerName,
      isDaily,
      isReplay: isCurrentReplay,
      dailyKey,
      leagueModeKey: selectedLeagueMode,
      isLegendLevel,
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

          {gameStatus !== 'playing' && (
            <TouchableOpacity
              style={styles.revealedHeroCard}
              activeOpacity={0.85}
              onPress={() => setIsResultModalVisible(true)}
            >
              <PlayerAvatar
                imageUrl={resolvedPlayerImage}
                name={challengeData?.playerName || targetPlayerInfo?.name}
                size={64}
                isLegend={Boolean(isLegendLevel || targetPlayerInfo?.isLegend)}
                style={{ marginRight: Spacing.sm + 2 }}
              />
              <View style={styles.revealedCol}>
                <Text style={styles.revealedBadge}>
                  {gameStatus === 'won' ? '🎉 DOĞRU TAHMİN' : '💔 CEVAP'}
                </Text>
                <Text style={styles.revealedName} numberOfLines={1}>
                  {challengeData?.playerName || targetPlayerInfo?.name || 'Yıldız Futbolcu'}
                </Text>
                <Text style={styles.revealedMeta} numberOfLines={1}>
                  {challengeData?.playerClub || targetPlayerInfo?.club} • {targetPlayerInfo?.nationality || ''}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {isLegendLevel && (
            <View style={styles.legendBadgeContainer}>
              <Text style={styles.legendBadgeText}>👑 EFSANE ETABI • +50 BONUS COIN</Text>
            </View>
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
          includeLegends={true}
        />

        <WhoAreYaWinModal
          visible={isResultModalVisible}
          status={gameStatus === 'lost' ? 'lost' : 'won'}
          playerName={challengeData?.playerName || targetPlayerInfo?.name || 'Yıldız Futbolcu'}
          playerClub={challengeData?.playerClub || targetPlayerInfo?.club || 'Süper Lig'}
          finalImageUrl={resolvedPlayerImage}
          rewardCoins={isCurrentReplay ? 0 : isDaily ? 30 : isLegendLevel ? 70 : 20}
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
              showInterstitialIfDue(currentLevel, () => {
                resetGame();
                goToNextLevel();
              });
            }
          }}
          onRevive={
            canRevive
              ? () => {
                  setIsResultModalVisible(false);
                  reviveGame();
                }
              : undefined
          }
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
  revealedHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  revealedAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
    marginRight: Spacing.sm + 2,
  },
  revealedAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealedEmoji: {
    fontSize: 28,
  },
  revealedCol: {
    flex: 1,
  },
  revealedBadge: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  revealedName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontSize: 16,
    marginTop: 1,
  },
  revealedMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timelineHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  legendBadgeContainer: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.45)',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  legendBadgeText: {
    color: '#FACC15',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
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
    paddingBottom: Platform.OS === 'android' ? 44 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  guessBtn: {
    backgroundColor: Colors.primary,
    minHeight: 52,
    justifyContent: 'center',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 4 : 0,
  },
  guessBtnText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});
