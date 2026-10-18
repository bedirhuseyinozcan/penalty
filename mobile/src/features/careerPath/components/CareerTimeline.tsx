import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CareerStepBadge } from './CareerStepBadge';
import { ICareerStepItem } from '../types';
import { Spacing } from '../../../theme/spacing';

interface ICareerTimelineProps {
  careerPath: ICareerStepItem[];
}

export const CareerTimeline = React.memo<ICareerTimelineProps>(({ careerPath }) => {
  return (
    <View style={styles.container}>
      {careerPath.map((step, index) => (
        <CareerStepBadge
          key={`${step.clubName}_${step.startYear}`}
          step={step}
          stepIndex={index}
          isLast={index === careerPath.length - 1}
        />
      ))}
    </View>
  );
});

CareerTimeline.displayName = 'CareerTimeline';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
