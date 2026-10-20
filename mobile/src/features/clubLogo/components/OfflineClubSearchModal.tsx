import React, { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { searchEngine, IClubSearchItem } from '../../../services/searchEngine';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { hapticsService } from '../../../services/hapticsService';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

const LEAGUE_LABELS: Record<string, string> = {
  super_lig: '🇹🇷 Süper Lig',
  premier_league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
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
            <Text style={styles.shieldEmoji}>🛡️</Text>
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
      <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>🛡️ Kulüp Seçin</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeText}>✕</Text>
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
                  <Text style={styles.emptyText}>Eşleşen kulüp bulunamadı.</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
);

OfflineClubSearchModal.displayName = 'OfflineClubSearchModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '82%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  clearText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shieldBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  shieldEmoji: {
    fontSize: 18,
  },
  infoCol: {
    flex: 1,
  },
  clubName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  leagueText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
