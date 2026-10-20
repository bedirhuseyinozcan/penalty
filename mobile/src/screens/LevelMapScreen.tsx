import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useLevelMap } from '../features/levelMap/hooks/useLevelMap';
import { LevelMapNavbar } from '../features/levelMap/components/LevelMapNavbar';
import { LevelMapHeader } from '../features/levelMap/components/LevelMapHeader';
import { LevelGridCard } from '../features/levelMap/components/LevelGridCard';
import { LevelReplayModal } from '../features/levelMap/components/LevelReplayModal';
import { LevelLockedModal } from '../features/levelMap/components/LevelLockedModal';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

interface ILevelMapScreenProps {
  gameMode: 'whoAreYa' | 'careerPath';
  onSelectLevel: (levelNumber: number, isReplay: boolean) => void;
  onBack: () => void;
}

export const LevelMapScreen: React.FC<ILevelMapScreenProps> = React.memo(
  ({ gameMode, onSelectLevel, onBack }) => {
    const {
      coins,
      xp,
      unlockedLevel,
      completedCount,
      progressPercent,
      levels,
      gameTitle,
      gameEmoji,
      leagueLabel,
      replayConfirmLevel,
      lockedAlertLevel,
      handleLevelPress,
      confirmReplay,
      cancelReplay,
      dismissLockedAlert,
    } = useLevelMap({ gameMode, onSelectLevel });

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

        <LevelMapNavbar coins={coins} xp={xp} onBack={onBack} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LevelMapHeader
            gameEmoji={gameEmoji}
            gameTitle={gameTitle}
            leagueLabel={leagueLabel}
            completedCount={completedCount}
            progressPercent={progressPercent}
          />

          <View style={styles.gridContainer}>
            {levels.map((item) => (
              <LevelGridCard
                key={item.levelNumber}
                item={item}
                onPress={handleLevelPress}
              />
            ))}
          </View>
        </ScrollView>

        <LevelReplayModal
          levelNumber={replayConfirmLevel}
          onConfirm={confirmReplay}
          onCancel={cancelReplay}
        />

        <LevelLockedModal
          lockedLevel={lockedAlertLevel}
          unlockedLevel={unlockedLevel}
          onDismiss={dismissLockedAlert}
        />
      </SafeAreaView>
    );
  }
);

LevelMapScreen.displayName = 'LevelMapScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
});
