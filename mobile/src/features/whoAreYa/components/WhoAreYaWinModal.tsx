import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';
import { IWhoAreYaGuess } from '../types';
import { shareService } from '../../../services/shareService';
import { useGameStore } from '../../../stores/useGameStore';
import { useRewardedAd } from '../../monetization/hooks/useRewardedAd';
import { hapticsService } from '../../../services/hapticsService';
import { searchEngine } from '../../../services/searchEngine';

interface IWhoAreYaWinModalProps {
  visible: boolean;
  status: 'won' | 'lost';
  playerName: string;
  playerClub: string;
  finalImageUrl?: string;
  rewardCoins?: number;
  attemptsUsed: number;
  maxAttempts: number;
  guesses?: IWhoAreYaGuess[];
  leagueLabel?: string;
  isDaily?: boolean;
  onNextLevel?: () => void;
  onOpenMap?: () => void;
  onClose: () => void;
  onRevive?: () => void;
}

interface IModalDisplayData {
  status: 'won' | 'lost';
  playerName: string;
  playerClub: string;
  finalImageUrl?: string;
  rewardCoins: number;
  attemptsUsed: number;
  maxAttempts: number;
  guesses: IWhoAreYaGuess[];
  leagueLabel?: string;
  isDaily: boolean;
}

export const WhoAreYaWinModal: React.FC<IWhoAreYaWinModalProps> = React.memo(
  ({
    visible,
    status,
    playerName,
    playerClub,
    finalImageUrl,
    rewardCoins = 30,
    attemptsUsed,
    maxAttempts,
    guesses = [],
    leagueLabel,
    isDaily = false,
    onNextLevel,
    onOpenMap,
    onClose,
    onRevive,
  }) => {
    const [frozenData, setFrozenData] = useState<IModalDisplayData | null>(null);

    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const [hasShared, setHasShared] = useState(false);
    const [isDoubled, setIsDoubled] = useState(false);

    const coins = useGameStore((s) => s.coins);
    const currentStreak = useGameStore((s) => s.currentStreak);
    const spendCoins = useGameStore((s) => s.spendCoins);
    const addCoins = useGameStore((s) => s.addCoins);
    const addXp = useGameStore((s) => s.addXp);

    const { showRewardedAd, isLoading: isAdLoading } = useRewardedAd();

    useEffect(() => {
      if (visible) {
        setFrozenData({
          status,
          playerName,
          playerClub,
          finalImageUrl,
          rewardCoins,
          attemptsUsed,
          maxAttempts,
          guesses,
          leagueLabel,
          isDaily,
        });
        setHasShared(false);
        setIsDoubled(false);
        scaleAnim.setValue(0.85);
        opacityAnim.setValue(0);
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 55,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        
        const timer = setTimeout(() => {
          setFrozenData(null);
        }, 350);
        return () => clearTimeout(timer);
      }
    }, [visible]);

    const activeData: IModalDisplayData = frozenData ?? {
      status,
      playerName,
      playerClub,
      finalImageUrl,
      rewardCoins,
      attemptsUsed,
      maxAttempts,
      guesses,
      leagueLabel,
      isDaily,
    };

    const isWon = activeData.status === 'won';
    const displayName = activeData.playerName;
    const displayClub = activeData.playerClub;

    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      setImageError(false);
    }, [visible, activeData.finalImageUrl, displayName]);

    const displayImage = useMemo(() => {
      if (activeData.finalImageUrl && typeof activeData.finalImageUrl === 'string' && activeData.finalImageUrl.startsWith('http')) {
        return activeData.finalImageUrl;
      }
      return searchEngine.getPlayerPhoto(displayName);
    }, [activeData.finalImageUrl, displayName]);

    const displayAttemptsUsed = activeData.attemptsUsed;
    const displayMaxAttempts = activeData.maxAttempts;
    const displayRewardCoins = activeData.rewardCoins;
    const displayIsDaily = activeData.isDaily;
    const displayGuesses = activeData.guesses;
    const displayLeagueLabel = activeData.leagueLabel;

    const handleShare = useCallback(async () => {
      hapticsService.selection();
      let success = false;
      if (displayGuesses && displayGuesses.length > 0) {
        success = await shareService.shareWhoAreYa({
          isWon,
          attemptsUsed: displayAttemptsUsed,
          maxAttempts: displayMaxAttempts,
          currentStreak,
          guesses: displayGuesses,
          leagueLabel: displayLeagueLabel,
        });
      } else {
        success = await shareService.shareGeneral({
          gameTitle: displayName,
          isWon,
          attemptsUsed: displayAttemptsUsed,
          maxAttempts: displayMaxAttempts,
          currentStreak,
        });
      }
      if (success) {
        setHasShared(true);
      }
    }, [isWon, displayAttemptsUsed, displayMaxAttempts, currentStreak, displayGuesses, displayLeagueLabel, displayName]);

    const handleReviveWithCoins = useCallback(() => {
      if (!onRevive) return;
      const success = spendCoins(150);
      if (success) {
        hapticsService.success();
        onClose();
        onRevive();
      } else {
        Alert.alert(
          '🪙 Yetersiz Altın',
          `Serinizi kurtarmak için 150 altına ihtiyacınız var (Mevcut: ${coins} 🪙).\n\nÜcretsiz devam etmek için reklam izleyebilirsiniz!`,
          [
            { text: 'Vazgeç', style: 'cancel' },
            {
              text: '🎬 Reklam İzle & Devam Et',
              onPress: () => {
                showRewardedAd('Serini Kurtar (+2 Hak)', () => {
                  hapticsService.success();
                  onClose();
                  onRevive();
                });
              },
            },
          ]
        );
      }
    }, [onRevive, spendCoins, onClose, coins, showRewardedAd]);

    const handleReviveWithAd = useCallback(() => {
      if (!onRevive) return;
      showRewardedAd('Serini Kurtar (+2 Hak)', () => {
        hapticsService.success();
        onClose();
        onRevive();
      });
    }, [onRevive, showRewardedAd, onClose]);

    const handleDoubleRewardWithAd = useCallback(() => {
      if (isDoubled) return;
      showRewardedAd('2x Ödül Katlama', () => {
        hapticsService.success();
        addCoins(40);
        addXp(80);
        setIsDoubled(true);
      });
    }, [isDoubled, showRewardedAd, addCoins, addXp]);

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.titleIcon}>{isWon ? '🏆' : '💔'}</Text>
            <Text style={styles.title}>{isWon ? 'TEBRİKLER!' : 'MAALESEF BİLEMEDİNİZ'}</Text>

            {displayImage && !imageError ? (
              <Image
                source={{
                  uri: displayImage,
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    Referer: 'https://www.transfermarkt.com/',
                  },
                }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.imageFallback}>
                <Text style={styles.imageFallbackEmoji}>👤</Text>
              </View>
            )}

            <Text style={styles.playerName}>{displayName}</Text>
            <Text style={styles.clubName}>{displayClub}</Text>

            <View style={styles.statsBox}>
              <Text style={styles.statsText}>
                {isWon
                  ? `${displayAttemptsUsed}/${displayMaxAttempts} tahminde bildiniz!`
                  : `Tüm haklarınızı (${displayMaxAttempts}/${displayMaxAttempts}) kullandınız.`}
              </Text>
              {isWon && (
                <Text style={styles.rewardText}>
                  {displayRewardCoins > 0 ? `+${displayRewardCoins} Altın Kazandınız 🪙` : '⭐ Seviye Tekrarı (Ödül Yok)'}
                </Text>
              )}
            </View>

            {!isWon && onRevive && (
              <View style={styles.reviveCard}>
                <Text style={styles.reviveTitle}>🔥 Serini Kurtar! (+2 Ekstra Hak)</Text>
                <Text style={styles.reviveSub}>
                  Oyun bitmesin, serin yanmasın! Reklam izleyerek veya 150 altın harcayarak devam et.
                </Text>
                <View style={styles.reviveBtnRow}>
                  <TouchableOpacity
                    style={[styles.reviveBtn, styles.reviveCoinBtn]}
                    activeOpacity={0.8}
                    onPress={handleReviveWithCoins}
                  >
                    <Text style={styles.reviveCoinText}>🪙 150 Altın</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.reviveBtn, styles.reviveAdBtn]}
                    activeOpacity={0.8}
                    onPress={handleReviveWithAd}
                    disabled={isAdLoading}
                  >
                    <Text style={styles.reviveAdText}>🎬 Reklam İzle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isWon && displayIsDaily && (
              <TouchableOpacity
                style={[styles.doubleRewardBtn, isDoubled && styles.doubleRewardDone]}
                activeOpacity={0.8}
                onPress={handleDoubleRewardWithAd}
                disabled={isDoubled || isAdLoading}
              >
                <Text style={styles.doubleRewardText}>
                  {isDoubled
                    ? '🎉 2x Ödül Hesabına Eklendi! (+40🪙, +80XP)'
                    : '🎬 Reklam İzle & Ödülü 2x Katla (+40🪙, +80XP)'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={handleShare}>
                <Text style={styles.shareBtnText}>
                  {hasShared ? '✅ Paylaşıldı / Kopyalandı!' : '📲 Sonucu Paylaş (Spoiler Yok)'}
                </Text>
              </TouchableOpacity>

              {onNextLevel && isWon ? (
                <TouchableOpacity style={styles.primaryBtn} onPress={onNextLevel} activeOpacity={0.8}>
                  <Text style={styles.primaryBtnText}>Sonraki Seviye ⏩</Text>
                </TouchableOpacity>
              ) : null}

              {onOpenMap ? (
                <TouchableOpacity style={styles.mapBtn} onPress={onOpenMap} activeOpacity={0.8}>
                  <Text style={styles.mapBtnText}>🗺️ Harita</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.secondaryBtnText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

WhoAreYaWinModal.displayName = 'WhoAreYaWinModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titleIcon: {
    fontSize: 44,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontSize: 20,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
  },
  imageFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackEmoji: {
    fontSize: 44,
  },
  playerName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontSize: 18,
  },
  clubName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  statsBox: {
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsText: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
    fontSize: 13,
  },
  rewardText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    textAlign: 'center',
    fontSize: 13,
  },
  reviveCard: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  reviveTitle: {
    ...Typography.bodyBold,
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 2,
  },
  reviveSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  reviveBtnRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    width: '100%',
  },
  reviveBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  reviveCoinBtn: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: Colors.accent,
  },
  reviveCoinText: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 12,
  },
  reviveAdBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reviveAdText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 12,
  },
  doubleRewardBtn: {
    width: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  doubleRewardDone: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: Colors.success,
  },
  doubleRewardText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 12,
  },
  buttonRow: {
    width: '100%',
    gap: Spacing.xs,
  },
  shareBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    width: '100%',
  },
  shareBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  mapBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBtnText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    width: '100%',
  },
  secondaryBtnText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
