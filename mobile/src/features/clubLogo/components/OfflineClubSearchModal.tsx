import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { searchEngine, IClubSearchItem } from '../../../services/searchEngine';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { hapticsService } from '../../../services/hapticsService';
import { ClubLogo } from '../../../components/common/ClubLogo';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

const LEAGUE_LABELS: Record<string, string> = {
  super_lig: '🇹🇷 Süper Lig',
  premier_league: '🏴 Premier League',
  la_liga: '🇪🇸 La Liga',
  serie_a: '🇮🇹 Serie A',
  bundesliga: '🇩🇪 Bundesliga',
  ligue_1: '🇫🇷 Ligue 1',
};

interface IOfflineClubSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectClub: (club: IClubSearchItem) => void;
}

export const OfflineClubSearchModal: React.FC<IOfflineClubSearchModalProps> = React.memo(
  ({ visible, onClose, onSelectClub }) => {
    const [query, setQuery] = useState('');
    const selectedLeagueMode = useSettingsStore((s) => s.selectedLeagueMode);

    const results = useMemo(() => {
      if (!query || query.trim().length < 2) {
        return [];
      }
      return searchEngine.searchClubs(query, selectedLeagueMode);
    }, [query, selectedLeagueMode]);

    const handleSelect = useCallback(
      (club: IClubSearchItem) => {
        hapticsService.light();
        setQuery('');
        onSelectClub(club);
      },
      [onSelectClub]
    );

    const handleClose = useCallback(() => {
      setQuery('');
      onClose();
    }, [onClose]);

    const renderItem = useCallback(
      ({ item }: { item: IClubSearchItem }) => (
        <TouchableOpacity
          style={styles.clubRow}
          activeOpacity={0.75}
          onPress={() => handleSelect(item)}
        >
          <View style={styles.shieldBadge}>
            <ClubLogo
              logoUrl={item.logoUrl}
              clubName={item.name}
              size={24}
              fallbackEmoji="🛡️"
            />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.clubName}>{item.name}</Text>
            <Text style={styles.leagueText}>
              {LEAGUE_LABELS[item.league] || item.league} • {item.playerCount} Oyuncu
            </Text>
          </View>
          <View style={styles.selectPill}>
            <Text style={styles.selectPillText}>Seç</Text>
          </View>
        </TouchableOpacity>
      ),
      [handleSelect]
    );

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.topPeekArea} />
          </TouchableWithoutFeedback>

          <View style={styles.sheet}>
            <View style={styles.dragHandle} />

            <View style={styles.headerRow}>
              <Text style={styles.title}>🛡️ Kulüp Tahmin Et</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeText}>Kapat ✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.input}
                placeholder="Kulüp adı yazın (örn: Fenerbahçe, Arsenal)..."
                placeholderTextColor={Colors.textMuted}
                value={query}
                onChangeText={setQuery}
                autoFocus
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Text style={styles.clearText}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={results}
              keyExtractor={(item) => `${item.id}_${item.name}`}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>
                    {query.trim().length >= 2
                      ? 'Eşleşen kulüp bulunamadı.'
                      : 'Yukarıdaki armaya bakarak en az 2 harf yazın...'}
                  </Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
);

OfflineClubSearchModal.displayName = 'OfflineClubSearchModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 17, 0.28)',
    justifyContent: 'flex-end',
  },
  topPeekArea: {
    flex: 1,
  },
  sheet: {
    height: '55%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.lg + 6,
    borderTopRightRadius: BorderRadius.lg + 6,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: 1.5,
    borderTopColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 16,
  },
  dragHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  clearText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shieldBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  shieldEmoji: {
    fontSize: 16,
  },
  infoCol: {
    flex: 1,
  },
  clubName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  leagueText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  selectPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  selectPillText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});
