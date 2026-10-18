import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ICareerStepItem } from '../types';
import { Colors } from '../../../theme/colors';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Typography } from '../../../theme/typography';

interface ICareerStepBadgeProps {
  step: ICareerStepItem;
  isLast: boolean;
  stepIndex: number;
}

export const CareerStepBadge = React.memo<ICareerStepBadgeProps>(
  ({ step, isLast, stepIndex }) => {
    const yearRange = step.endYear ? `${step.startYear} - ${step.endYear}` : `${step.startYear} - Günümüz`;

    return (
      <View style={styles.stepContainer}>
        {/* Step Marker */}
        <View style={styles.markerCol}>
          <View style={[styles.dot, isLast && styles.currentDot]}>
            <Text style={styles.stepNum}>{stepIndex + 1}</Text>
          </View>
          {!isLast && <View style={styles.line} />}
        </View>

        {/* Club Details Box */}
        <View style={styles.contentBox}>
          <Text style={styles.clubName}>{step.clubName}</Text>
          <Text style={styles.yearText}>{yearRange}</Text>
          {step.apps != null && step.apps > 0 ? (
            <Text style={styles.statsText}>
              {step.apps} maç • {step.goals ?? 0} gol
            </Text>
          ) : null}
        </View>
      </View>
    );
  }
);

CareerStepBadge.displayName = 'CareerStepBadge';

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  markerCol: {
    alignItems: 'center',
    width: 32,
    marginRight: Spacing.sm,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDot: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  contentBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clubName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  yearText: {
    ...Typography.caption,
    color: Colors.accent,
    marginTop: 2,
  },
  statsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
