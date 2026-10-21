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
import { useContextinhoGame } from '../features/contextinho/hooks/useContextinhoGame';
import { IContextinhoRankedEntry, TemperatureTier } from '../features/contextinho/utils/contextinhoEngine';
import { OfflinePlayerSearchModal } from '../features/search/components/OfflinePlayerSearchModal';
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

interface IContextinhoScreenProps {
  isDaily?: boolean;
  initialLevel?: number;
  isReplay?: boolean;
  onBack: () => void;
  onOpenMap?: () => void;
}

const TIER_COLORS: Record<TemperatureTier, { bar: string; border: string; label: string }> = {
  win: {
    bar: 'rgba(16, 185, 129, 0.42)',
    border: Colors.primary,
    label: '🎯 BULDUN!',
  },
  hot: {
    bar: 'rgba(16, 185, 129, 0.25)',
    border: '#10B981',
    label: '🔥 Çok Sıcak',
  },
  warm: {
    bar: 'rgba(245, 158, 11, 0.25)',
    border: '#F59E0B',
    label: '☀️ Ilık',
  },
  cold: {
    bar: 'rgba(239, 68, 68, 0.20)',
    border: '#EF4444',
    label: '❄️ Soğuk',
  },
};

export const ContextinhoScreen: React.FC<IContextinhoScreenProps> = React.memo(
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
      gameMode: 'contextinho',
      isDaily,
      initialLevel,
      isReplay,
    });

    const [hintUnlocked, setHintUnlocked] = useState(false);
    const [hintText, setHintText] = useState('');
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);

    const targetPlayerId = challengeData?.targetPlayerId ?? 'tmid_382528';
    const targetPlayerInfo = useMemo(
      () => searchEngine.getPlayerById(targetPlayerId),
      [targetPlayerId]
    );

    const {
      guesses,
      lastGuess,
      gameStatus,
      isSearchModalVisible,
      attemptsLeft,
      maxAttempts,
      openSearch,
      closeSearch,
      submitGuess,
      giveClosePlayerClue,
      resetGame,
    } = useContextinhoGame({
      targetPlayerId,
      targetPlayerName: challengeData?.playerName || targetPlayerInfo?.name,
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

    const renderRankedRow = (item: IContextinhoRankedEntry, isSpotlight = false) => {
      const theme = TIER_COLORS[item.tier];
      return (
        <View
          key={`${item.player.id}_${isSpotlight ? 'last' : 'list'}`}
          style={[
            styles.rankCard,
            { borderColor: theme.border },
            isSpotlight && styles.spotlightCard,
          ]}
        >
          <View
            style={[
              styles.heatBarFill,
              {
                width: `${item.heatPercent}%`,
                backgroundColor: theme.bar,
              },
            ]}
          />

          <View style={styles.rankCardContent}>
            <View style={styles.leftCol}>
              <Text style={styles.playerName}>{item.player.name}</Text>
              <Text style={styles.playerSub}>
                {item.player.club} • {item.player.position} • {item.player.nationality}
              </Text>
              {item.sharedTags.length > 0 && (
                <View style={styles.tagRow}>
                  {item.sharedTags.map((tag) => (
                    <View key={tag} style={styles.sharedTagPill}>
                      <Text style={styles.sharedTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.rightCol}>
              <Text style={[styles.rankNumber, { color: theme.border }]}>#{item.rank}</Text>
              <Text style={styles.tierLabel}>{theme.label}</Text>
            </View>
          </View>
        </View>
      );
    };

    if (isLoading) {
      return (
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Sıcak Temas sıralaması hazırlanıyor...</Text>
        </SafeAreaView>
      );
    }

    const navTitle = isDaily ? 'Günün Sıcak Temas’ı' : `Seviye ${currentLevel}`;

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
              title="Sıcak Temas"
              leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
              isCompleted={alreadyCompleted}
            />
          )}

          <View style={styles.introBanner}>
            <Text style={styles.introTitle}>🔥 Sıcak - Soğuk Futbolcu Avı</Text>
            <Text style={styles.introDesc}>
              Gizli yıldız #1 numarada! Kulüp, lig, uyruk, mevki ve yaş benzerliğine göre
              tahminlerinin yakınlık sırasını takip ederek #1’e ulaş.
            </Text>
            <View style={styles.legendRow}>
              <Text style={[styles.legendPill, { color: '#10B981' }]}>🔥 #1 - #45 Sıcak</Text>
              <Text style={[styles.legendPill, { color: '#F59E0B' }]}>☀️ #46 - #200 Ilık</Text>
              <Text style={[styles.legendPill, { color: '#EF4444' }]}>❄️ #201+ Soğuk</Text>
            </View>
          </View>

          <View style={styles.hintContainer}>
            <HintWithAdButton
              hintTitle="Yakın Sıradan Oyuncu İpucu Al"
              isUnlocked={hintUnlocked}
              unlockedText={hintText}
              onHintUnlocked={() => {
                setHintText(giveClosePlayerClue());
                setHintUnlocked(true);
              }}
            />
          </View>

          {lastGuess && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Son Tahminin</Text>
              {renderRankedRow(lastGuess, true)}
            </View>
          )}

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>
              Yakınlık Sıralaması ({guesses.length}/{maxAttempts})
            </Text>
            {guesses.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🧭</Text>
                <Text style={styles.emptyTitle}>İlk Tahminini Yap!</Text>
                <Text style={styles.emptySub}>
                  Herhangi bir futbolcu seçerek hedef yıldıza ne kadar yakın olduğunu gör.
                </Text>
              </View>
            ) : (
              guesses.map((g) => renderRankedRow(g, false))
            )}
          </View>
        </ScrollView>

        {gameStatus === 'playing' ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.guessBtn}
              activeOpacity={0.8}
              onPress={openSearch}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.guessBtnText}>🔥 Futbolcu Tahmin Et</Text>
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
          playerName={challengeData?.playerName || targetPlayerInfo?.name || 'Gizli Yıldız'}
          playerClub={challengeData?.playerClub || targetPlayerInfo?.club || ''}
          finalImageUrl={challengeData?.imageUrl}
          rewardCoins={isCurrentReplay ? 0 : isDaily ? 35 : 25}
          attemptsUsed={guesses.length}
          maxAttempts={maxAttempts}
          leagueLabel={selectedLeagueMode === 'super_lig' ? 'Süper Lig' : 'Global 5 Lig'}
          isDaily={isDaily}
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
          onClose={() => setIsResultModalVisible(false)}
        />
      </SafeAreaView>
    );
  }
);

ContextinhoScreen.displayName = 'ContextinhoScreen';

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
  introBanner: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  introTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 16,
    marginBottom: 4,
  },
  introDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendPill: {
    fontSize: 11,
    fontWeight: '700',
  },
  hintContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionBlock: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  rankCard: {
    position: 'relative',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  spotlightCard: {
    borderWidth: 2,
  },
  heatBarFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  rankCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  leftCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  playerName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  playerSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  sharedTagPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sharedTagText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '900',
  },
  tierLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomBar: {
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'android' ? 26 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  guessBtn: {
    backgroundColor: Colors.primary,
    minHeight: 52,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guessBtnText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontSize: 16,
  },
});
