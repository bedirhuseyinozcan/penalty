import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
  },
  statBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
};
