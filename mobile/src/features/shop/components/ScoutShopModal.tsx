import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useGameStore } from '../../../stores/useGameStore';
import { hapticsService } from '../../../services/hapticsService';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';
import { COSMETIC_CATALOG, getCosmeticById } from '../catalog';
import { ICosmeticItem, CosmeticCategory } from '../types';
import { useRewardedAd } from '../../monetization/hooks/useRewardedAd';

interface IScoutShopModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ScoutShopModal: React.FC<IScoutShopModalProps> = React.memo(({ visible, onClose }) => {
  const coins = useGameStore((s) => s.coins);
  const unlockedCosmetics = useGameStore((s) => s.unlockedCosmetics);
  const equippedCosmeticId = useGameStore((s) => s.equippedCosmeticId);
  const unlockCosmetic = useGameStore((s) => s.unlockCosmetic);
  const equipCosmetic = useGameStore((s) => s.equipCosmetic);
  const addCoins = useGameStore((s) => s.addCoins);

  const { showRewardedAd, isLoading: isAdLoading } = useRewardedAd();

  const [activeTab, setActiveTab] = useState<CosmeticCategory>('fan_bundle');
  const [previewId, setPreviewId] = useState<string>(equippedCosmeticId);

  // In-modal dialog state (replaces Alert.alert for 100% Web & Mobile reliability)
  const [confirmItem, setConfirmItem] = useState<ICosmeticItem | null>(null);
  const [insufficientItem, setInsufficientItem] = useState<ICosmeticItem | null>(null);
  const [bonusSuccessMsg, setBonusSuccessMsg] = useState<string | null>(null);

  // Sync preview with equipped item when modal opens
  React.useEffect(() => {
    if (visible) {
      setPreviewId(equippedCosmeticId);
      setConfirmItem(null);
      setInsufficientItem(null);
      setBonusSuccessMsg(null);
    }
  }, [visible, equippedCosmeticId]);

  const previewItem = useMemo(() => {
    return getCosmeticById(previewId);
  }, [previewId]);

  const isPreviewUnlocked = useMemo(() => {
    return (
      unlockedCosmetics.includes(previewItem.id) || previewItem.id === 'avatar_default'
    );
  }, [unlockedCosmetics, previewItem.id]);

  const isPreviewEquipped = useMemo(() => {
    return equippedCosmeticId === previewItem.id;
  }, [equippedCosmeticId, previewItem.id]);

  const filteredItems = useMemo(() => {
    return COSMETIC_CATALOG.filter((c) => c.category === activeTab);
  }, [activeTab]);

  const handleAction = useCallback(
    (item: ICosmeticItem) => {
      const isUnlocked = unlockedCosmetics.includes(item.id) || item.id === 'avatar_default';
      const isEquipped = equippedCosmeticId === item.id;

      if (isEquipped) {
        hapticsService.light();
        return;
      }

      if (isUnlocked) {
        hapticsService.selection();
        equipCosmetic(item.id);
        setPreviewId(item.id);
        return;
      }

      if (coins < item.cost) {
        hapticsService.warning();
        setPreviewId(item.id);
        setInsufficientItem(item);
        return;
      }

      hapticsService.selection();
      setPreviewId(item.id);
      setConfirmItem(item);
    },
    [coins, unlockedCosmetics, equippedCosmeticId, equipCosmetic]
  );

  const confirmPurchase = useCallback(() => {
    if (!confirmItem) return;
    const success = unlockCosmetic(confirmItem.id, confirmItem.cost);
    if (success) {
      hapticsService.success();
      setPreviewId(confirmItem.id);
    } else {
      hapticsService.error();
    }
    setConfirmItem(null);
  }, [confirmItem, unlockCosmetic]);

  const handleWatchAdForCoins = useCallback(() => {
    showRewardedAd('100 Altın Ödülü', () => {
      addCoins(100);
      hapticsService.success();
      setBonusSuccessMsg('+100 Altın Hesabına Eklendi! 🪙');
      setTimeout(() => setBonusSuccessMsg(null), 2500);
      setInsufficientItem(null);
    });
  }, [showRewardedAd, addCoins]);

  const handleClaimFreeCoins = useCallback(() => {
    addCoins(500);
    hapticsService.success();
    setBonusSuccessMsg('+500 Altın Hesabına Eklendi! 🪙');
    setTimeout(() => setBonusSuccessMsg(null), 2500);
    setInsufficientItem(null);
  }, [addCoins]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>🛍️ Scout Dükkanı</Text>
              <Text style={styles.modalSubtitle}>Kozmetik Çerçeveler & Taraftar Setleri</Text>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceText}>🪙 {coins}</Text>
              </View>

              <TouchableOpacity
                style={styles.addCoinsHeaderBtn}
                activeOpacity={0.8}
                onPress={handleClaimFreeCoins}
              >
                <Text style={styles.addCoinsHeaderText}>+ Altın</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {bonusSuccessMsg ? (
            <View style={styles.bonusBanner}>
              <Text style={styles.bonusBannerText}>🎉 {bonusSuccessMsg}</Text>
            </View>
          ) : null}

          <View style={[styles.showcaseCard, { borderColor: previewItem.frameBorderColor }]}>
            <View style={styles.showcaseTopRow}>
              <View
                style={[
                  styles.showcaseAvatarCircle,
                  {
                    borderColor: previewItem.frameBorderColor,
                    shadowColor: previewItem.frameBorderColor,
                  },
                ]}
              >
                <Text style={styles.showcaseAvatarEmoji}>{previewItem.avatarEmoji}</Text>
              </View>

              <View style={styles.showcaseInfo}>
                <View style={styles.showcaseBadgeRow}>
                  <View
                    style={[
                      styles.titlePill,
                      { backgroundColor: previewItem.themeGlowColor },
                    ]}
                  >
                    <Text style={styles.titlePillText}>{previewItem.titleBadge}</Text>
                  </View>
                  {previewItem.badgeText ? (
                    <Text style={styles.badgeLabelText}>{previewItem.badgeText}</Text>
                  ) : null}
                </View>

                <Text style={styles.showcaseTitle}>{previewItem.name}</Text>
                <Text style={styles.showcaseDesc} numberOfLines={2}>
                  {previewItem.description}
                </Text>

                <View style={styles.showcaseThemeDetails}>
                  <Text style={[styles.showcaseStadiumText, { color: previewItem.themeConfig.primaryColor }]}>
                    {previewItem.themeConfig.teamBadgeEmojis} {previewItem.themeConfig.stadiumName}
                  </Text>
                  <Text style={styles.showcaseChantText} numberOfLines={1}>
                    {previewItem.themeConfig.anthemChant}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.showcaseActionRow}>
              {isPreviewEquipped ? (
                <View style={[styles.showcaseBtn, styles.showcaseEquippedBtn]}>
                  <Text style={styles.showcaseEquippedBtnText}>✓ Profilinde Kuşanıldı (Aktif)</Text>
                </View>
              ) : isPreviewUnlocked ? (
                <TouchableOpacity
                  style={[styles.showcaseBtn, styles.showcaseEquipBtn]}
                  activeOpacity={0.8}
                  onPress={() => {
                    hapticsService.selection();
                    equipCosmetic(previewItem.id);
                  }}
                >
                  <Text style={styles.showcaseEquipBtnText}>🛡️ Kuşan & Profilde Göster</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.showcaseBtn,
                    coins >= previewItem.cost
                      ? styles.showcaseBuyBtn
                      : styles.showcaseLockedBtn,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleAction(previewItem)}
                >
                  <Text
                    style={
                      coins >= previewItem.cost
                        ? styles.showcaseBuyBtnText
                        : styles.showcaseLockedBtnText
                    }
                  >
                    {coins >= previewItem.cost
                      ? `🪙 ${previewItem.cost} Altın ile Satın Al & Kuşan`
                      : `🪙 ${previewItem.cost} Altın (Yetersiz Altın — Dokun)`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'fan_bundle' && styles.activeTabButton]}
              onPress={() => {
                hapticsService.light();
                setActiveTab('fan_bundle');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'fan_bundle' && styles.activeTabButtonText,
                ]}
              >
                🏟️ Taraftar Paketleri
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'scout' && styles.activeTabButton]}
              onPress={() => {
                hapticsService.light();
                setActiveTab('scout');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'scout' && styles.activeTabButtonText,
                ]}
              >
                🎭 Scout Rozetleri
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
            {filteredItems.map((item) => {
              const isUnlocked =
                unlockedCosmetics.includes(item.id) || item.id === 'avatar_default';
              const isEquipped = equippedCosmeticId === item.id;
              const isPreviewed = previewId === item.id;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    isPreviewed && styles.previewedItemCard,
                    { borderLeftColor: item.frameBorderColor },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.itemCardContent}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPreviewId(item.id);
                      hapticsService.light();
                    }}
                  >
                    <View
                      style={[
                        styles.itemAvatarBox,
                        {
                          borderColor: item.frameBorderColor,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      ]}
                    >
                      <Text style={styles.itemEmoji}>{item.avatarEmoji}</Text>
                    </View>

                    <View style={styles.itemInfoCol}>
                      <View style={styles.itemNameRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.badgeText ? (
                          <View style={styles.itemMiniBadge}>
                            <Text style={styles.itemMiniBadgeText}>{item.badgeText}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      isEquipped && styles.equippedBtn,
                      !isEquipped && isUnlocked && styles.equipBtn,
                      !isUnlocked && coins >= item.cost && styles.buyBtn,
                      !isUnlocked && coins < item.cost && styles.lockedBtn,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleAction(item)}
                  >
                    {isEquipped ? (
                      <Text style={styles.equippedBtnText}>✓ Aktif</Text>
                    ) : isUnlocked ? (
                      <Text style={styles.equipBtnText}>Kullan</Text>
                    ) : (
                      <Text style={styles.buyBtnText}>🪙 {item.cost}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {confirmItem ? (
            <View style={styles.dialogOverlay}>
              <View style={[styles.dialogCard, { borderColor: confirmItem.frameBorderColor }]}>
                <View
                  style={[
                    styles.dialogAvatarCircle,
                    {
                      borderColor: confirmItem.frameBorderColor,
                      shadowColor: confirmItem.frameBorderColor,
                    },
                  ]}
                >
                  <Text style={styles.dialogAvatarEmoji}>{confirmItem.avatarEmoji}</Text>
                </View>

                <Text style={styles.dialogTitle}>Satın Alma Onayı</Text>
                <Text style={styles.dialogItemName}>{confirmItem.name}</Text>
                <Text style={styles.dialogDesc}>{confirmItem.description}</Text>

                <View style={styles.dialogCostBox}>
                  <Text style={styles.dialogCostLabel}>Paket Ücreti:</Text>
                  <Text style={styles.dialogCostValue}>🪙 {confirmItem.cost} Altın</Text>
                </View>

                <View style={styles.dialogBalanceRow}>
                  <Text style={styles.dialogBalanceText}>
                    Mevcut: {coins} 🪙  ➔  Kalan: {coins - confirmItem.cost} 🪙
                  </Text>
                </View>

                <View style={styles.dialogBtnRow}>
                  <TouchableOpacity
                    style={styles.dialogCancelBtn}
                    activeOpacity={0.8}
                    onPress={() => setConfirmItem(null)}
                  >
                    <Text style={styles.dialogCancelBtnText}>Vazgeç</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dialogConfirmBtn}
                    activeOpacity={0.8}
                    onPress={confirmPurchase}
                  >
                    <Text style={styles.dialogConfirmBtnText}>🔥 Satın Al & Kuşan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          {insufficientItem ? (
            <View style={styles.dialogOverlay}>
              <View style={[styles.dialogCard, { borderColor: Colors.warning }]}>
                <Text style={styles.dialogWarningIcon}>🪙</Text>
                <Text style={styles.dialogTitle}>Yetersiz Altın</Text>
                <Text style={styles.dialogItemName}>{insufficientItem.name}</Text>
                <Text style={styles.dialogDesc}>
                  Bu paketi açmak için {insufficientItem.cost} altına ihtiyacınız var. Mevcut bakiyeniz: {coins} 🪙.
                </Text>

                <View style={styles.dialogBtnCol}>
                  <TouchableOpacity
                    style={styles.dialogAdBtn}
                    activeOpacity={0.8}
                    disabled={isAdLoading}
                    onPress={handleWatchAdForCoins}
                  >
                    <Text style={styles.dialogAdBtnText}>🎬 Reklam İzle (+100 Altın Kazan)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dialogFreeBtn}
                    activeOpacity={0.8}
                    onPress={handleClaimFreeCoins}
                  >
                    <Text style={styles.dialogFreeBtnText}>🎁 +500 Test Altını Al</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dialogCancelBtnFull}
                    activeOpacity={0.8}
                    onPress={() => setInsufficientItem(null)}
                  >
                    <Text style={styles.dialogCancelBtnText}>Kapat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
});

ScoutShopModal.displayName = 'ScoutShopModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.lg + 8,
    borderTopRightRadius: BorderRadius.lg + 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontSize: 20,
  },
  modalSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  balanceText: {
    ...Typography.captionBold,
    color: Colors.accent,
    fontSize: 12,
  },
  addCoinsHeaderBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: Colors.success,
    paddingVertical: 4,
    paddingHorizontal: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
  },
  addCoinsHeaderText: {
    ...Typography.captionBold,
    color: Colors.success,
    fontSize: 11,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bonusBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: Colors.success,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  bonusBannerText: {
    ...Typography.bodyBold,
    color: Colors.success,
    fontSize: 12,
  },
  showcaseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  showcaseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showcaseAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  showcaseAvatarEmoji: {
    fontSize: 30,
  },
  showcaseInfo: {
    flex: 1,
  },
  showcaseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  titlePill: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  titlePillText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  badgeLabelText: {
    ...Typography.captionBold,
    color: Colors.accent,
    fontSize: 9,
  },
  showcaseTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  showcaseDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  showcaseThemeDetails: {
    marginTop: 4,
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  showcaseStadiumText: {
    ...Typography.captionBold,
    fontSize: 10,
    fontWeight: '800',
  },
  showcaseChantText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  showcaseActionRow: {
    marginTop: Spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: Spacing.xs + 2,
  },
  showcaseBtn: {
    width: '100%',
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseEquippedBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  showcaseEquippedBtnText: {
    ...Typography.bodyBold,
    color: Colors.success,
    fontSize: 12,
  },
  showcaseEquipBtn: {
    backgroundColor: Colors.primary,
  },
  showcaseEquipBtnText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontSize: 13,
  },
  showcaseBuyBtn: {
    backgroundColor: Colors.accent,
  },
  showcaseBuyBtnText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontSize: 13,
  },
  showcaseLockedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  showcaseLockedBtnText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  activeTabButtonText: {
    color: Colors.textPrimary,
  },
  scrollList: {
    paddingBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderLeftWidth: 4,
  },
  previewedItemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  itemCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  itemEmoji: {
    fontSize: 22,
  },
  itemInfoCol: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  itemName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 13,
  },
  itemMiniBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  itemMiniBadgeText: {
    color: Colors.accent,
    fontSize: 8,
    fontWeight: '700',
  },
  itemSubtitle: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 10,
    marginTop: 1,
  },
  itemDescription: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  equippedBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  equippedBtnText: {
    ...Typography.captionBold,
    color: Colors.success,
    fontSize: 11,
  },
  equipBtn: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  equipBtnText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 11,
  },
  buyBtn: {
    backgroundColor: 'rgba(234, 179, 8, 0.18)',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  buyBtnText: {
    ...Typography.captionBold,
    color: Colors.accent,
    fontSize: 11,
  },
  lockedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // In-modal dialog styles
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    zIndex: 100,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  dialogWarningIcon: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  dialogAvatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 6,
  },
  dialogAvatarEmoji: {
    fontSize: 34,
  },
  dialogTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontSize: 18,
    marginBottom: 2,
  },
  dialogItemName: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 15,
    marginBottom: Spacing.xs,
  },
  dialogDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  dialogCostBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  dialogCostLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dialogCostValue: {
    ...Typography.bodyBold,
    color: Colors.accent,
    fontSize: 14,
  },
  dialogBalanceRow: {
    marginBottom: Spacing.md,
  },
  dialogBalanceText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
  },
  dialogBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
  },
  dialogCancelBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dialogCancelBtnText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  dialogConfirmBtn: {
    flex: 1.4,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  dialogConfirmBtnText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontSize: 13,
  },
  dialogBtnCol: {
    width: '100%',
    gap: Spacing.sm,
  },
  dialogAdBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  dialogAdBtnText: {
    ...Typography.bodyBold,
    color: Colors.background,
    fontSize: 12,
  },
  dialogFreeBtn: {
    width: '100%',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: Colors.success,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  dialogFreeBtnText: {
    ...Typography.bodyBold,
    color: Colors.success,
    fontSize: 12,
  },
  dialogCancelBtnFull: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
