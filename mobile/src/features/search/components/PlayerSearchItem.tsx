import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ILightPlayer } from '../../../services/searchEngine';
import { ClubLogo } from '../../../components/common/ClubLogo';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface IPlayerSearchItemProps {
  player: ILightPlayer;
  onSelect: (player: ILightPlayer) => void;
}

export const PlayerSearchItem = React.memo<IPlayerSearchItemProps>(({ player, onSelect }) => {
  const logoUrl = player.logoUrl || player.logo;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onSelect(player)}
    >
      <View style={styles.clubBadge}>
        <ClubLogo
          logoUrl={logoUrl}
          clubName={player.club}
          size={24}
          fallbackEmoji="🛡️"
        />
      </View>
      <View style={styles.infoCol}>
        <Text style={styles.nameText} numberOfLines={1}>
          {player.name}
        </Text>
        <Text style={styles.clubText} numberOfLines={1}>
          {player.club} • {player.nationality}
        </Text>
      </View>
      <View style={styles.posBadge}>
        <Text style={styles.posText}>{player.position}</Text>
      </View>
    </TouchableOpacity>
  );
});

PlayerSearchItem.displayName = 'PlayerSearchItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  clubBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  nameText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  clubText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  posBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  posText: {
    ...Typography.statBadge,
    color: Colors.primary,
  },
});
