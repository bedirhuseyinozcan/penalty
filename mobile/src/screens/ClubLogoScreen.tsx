import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useClubLogoGame } from '../features/clubLogo/hooks/useClubLogoGame';
import { OfflineClubSearchModal } from '../features/clubLogo/components/OfflineClubSearchModal';
import { WhoAreYaWinModal } from '../features/whoAreYa/components/WhoAreYaWinModal';
import { HintWithAdButton } from '../features/monetization/components/HintWithAdButton';
import { DailyHeaderCard } from '../features/daily/components/DailyHeaderCard';
import { DailyCompletedBanner } from '../features/daily/components/DailyCompletedBanner';
import { GameNavbar } from '../components/common/GameNavbar';
import { useChallengeDataLoader } from '../hooks/useChallengeDataLoader';
import { searchEngine } from '../services/searchEngine';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme/spacing';
import { Typography } from '../theme/typography';

const LEAGUE_LABELS: Record<string, string> = {
  super_lig: 'Süper Lig',
  premier_league: 'Premier League',
  la_liga: 'La Liga',
  serie_a: 'Serie A',
  bundesliga: 'Bundesliga',
  ligue_1: 'Ligue 1',
};

interface IClubLogoScreenProps {
  isDaily?: boolean;
  initialLevel?: number;
  isReplay?: boolean;
  onBack: () => void;
  onOpenMap?: () => void;
}

export const ClubLogoScreen: React.FC<IClubLogoScreenProps> = React.memo(
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
      gameMode: 'clubLogo',
      isDaily,
      initialLevel,
      isReplay,
    });

    const [hintUnlocked, setHintUnlocked] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);

    const targetClubName = challengeData?.playerClub || 'Fenerbahçe';
    const targetClubInfo = useMemo(
      () => searchEngine.getClubByName(targetClubName),
      [targetClubName]
    );

    const logoUrl =
      challengeData?.imageUrl ||
      targetClubInfo?.logoUrl ||
      'https://tmssl.akamaized.net/images/wappen/head/36.png';

    const starPlayerHint = useMemo(() => {
      if (challengeData?.hints && challengeData.hints.length > 0) {
        return `İpucu Açıldı: ${challengeData.hints[0]}`;
      }
      if (targetClubInfo?.starPlayer) {
        return `İpucu Açıldı: Kadrodaki Yıldız — ${targetClubInfo.starPlayer}`;
      }
      if (challengeData?.playerName) {
        return `İpucu Açıldı: Kadrodaki Yıldız — ${challengeData.playerName}`;
      }
      return 'İpucu Açıldı: Ligin köklü ekiplerinden biri';
    }, [challengeData, targetClubInfo]);

    const {
      guesses,
      gameStatus,
      isSearchModalVisible,
      attemptsLeft,
      maxAttempts,
      openSearch,
      closeSearch,
      submitClubGuess,
      resetGame,
    } = useClubLogoGame({
      targetClubName,
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
          <Text style={styles.loadingText}>Kulüp arması hazırlanıyor...</Text>
        </SafeAreaView>
      );
    }

    const navTitle = isDaily ? 'Günün Arması' : `Seviye ${currentLevel}`;
    const isRevealed = gameStatus !== 'playing';
    const blurRadius = isRevealed
      ? 0
      : Math.max(4, (maxAttempts - guesses.length) * 5);
    const clarityPercent = isRevealed
      ? 100
      : Math.min(90, Math.round(((guesses.length + 1) / maxAttempts) * 85));

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
              title="Arma Avcısı"
              leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
              isCompleted={alreadyCompleted}
            />
          )}

          <View style={styles.heroCard}>
            <View style={styles.clarityBadge}>
              <Text style={styles.clarityText}>🔍 Netlik: %{clarityPercent}</Text>
            </View>

            <View style={styles.crestCircle}>
              <Image
                source={{ uri: logoUrl }}
                style={[
                  styles.crestImage,
                  !isRevealed && {
                    transform: [{ scale: 1 + (maxAttempts - guesses.length) * 0.08 }],
                  },
                ]}
                blurRadius={blurRadius}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.heroCaption}>
              {isRevealed
                ? `🛡️ ${targetClubName}`
                : 'Her yanlış tahminde kulüp arması biraz daha netleşir!'}
            </Text>
          </View>

          <View style={styles.hintContainer}>
            <HintWithAdButton
              hintTitle="Kadrodaki Yıldız Oyuncu İpucu"
              isUnlocked={hintUnlocked}
              unlockedText={starPlayerHint}
              onHintUnlocked={() => setHintUnlocked(true)}
            />
          </View>

          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Tahminlerin ({guesses.length}/{maxAttempts})</Text>
            {guesses.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  Henüz tahmin yapmadın. İlk kulüp tahminini seç!
                </Text>
              </View>
            ) : (
              guesses.map((g, idx) => (
                <View
                  key={`${g.club.name}_${idx}`}
                  style={[
                    styles.guessRow,
                    g.isCorrect ? styles.guessRowCorrect : styles.guessRowWrong,
                  ]}
                >
                  <View style={styles.guessMain}>
                    <Text style={styles.guessClubName}>
                      {g.isCorrect ? '✅ ' : '❌ '}
                      {g.club.name}
                    </Text>
                    <Text style={styles.guessSub}>
                      {LEAGUE_LABELS[g.club.league] || g.club.league}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.leaguePill,
                      g.isSameLeague ? styles.pillSuccess : styles.pillWrong,
                    ]}
                  >
                    <Text style={styles.pillText}>
                      {g.isSameLeague ? 'Aynı Lig ✓' : 'Farklı Lig ✕'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {gameStatus === 'playing' ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.guessBtn}
              activeOpacity={0.7}
              onPress={openSearch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.guessBtnText}>🛡️ Kulüp Tahmin Et</Text>
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

        <OfflineClubSearchModal
          visible={isSearchModalVisible}
          onClose={closeSearch}
          onSelectClub={submitClubGuess}
        />

        <WhoAreYaWinModal
          visible={isResultModalVisible}
          status={gameStatus === 'lost' ? 'lost' : 'won'}
          playerName={targetClubName}
          playerClub={`Yıldız: ${challengeData?.playerName || targetClubInfo?.starPlayer || ''}`}
          finalImageUrl={logoUrl}
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

ClubLogoScreen.displayName = 'ClubLogoScreen';

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
  heroCard: {
    margin: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  clarityBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  clarityText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  crestCircle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  crestImage: {
    width: 108,
    height: 108,
  },
  heroCaption: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  hintContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  historySection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  guessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  guessRowCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderColor: Colors.primary,
  },
  guessRowWrong: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  guessMain: {
    flex: 1,
  },
  guessClubName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  guessSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  leaguePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  pillSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  pillWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  pillText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
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
