import { Share, Platform } from 'react-native';
import { IWhoAreYaGuess } from '../features/whoAreYa/types';

export interface IShareWhoAreYaParams {
  isWon: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  currentStreak: number;
  guesses: IWhoAreYaGuess[];
  leagueLabel?: string;
}

export interface IShareGeneralParams {
  gameTitle: string;
  isWon: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  currentStreak: number;
  customGrid?: string[];
}

class ShareService {
  public generateWhoAreYaGrid(guesses: IWhoAreYaGuess[]): string {
    return guesses
      .map((guess) => {
        const { club, league, nationality, position, age } = guess.comparison;
        const clubEmoji = club === 'correct' ? '🟩' : '🟥';
        const leagueEmoji = league === 'correct' ? '🟩' : '🟥';
        const nationEmoji = nationality === 'correct' ? '🟩' : '🟥';
        const posEmoji = position === 'correct' ? '🟩' : '🟥';
        const ageEmoji = age === 'correct' ? '🟩' : age === 'higher' ? '⬆️' : '⬇️';

        return `${clubEmoji}${leagueEmoji}${nationEmoji}${posEmoji}${ageEmoji}`;
      })
      .join('\n');
  }

  public async shareWhoAreYa(params: IShareWhoAreYaParams): Promise<boolean> {
    const { isWon, attemptsUsed, maxAttempts, currentStreak, guesses, leagueLabel } = params;

    const outcomeText = isWon ? `${attemptsUsed}/${maxAttempts} Tahmin` : 'X/8 (Kaybetti)';
    const leagueHeader = leagueLabel ? ` (${leagueLabel})` : '';
    const grid = this.generateWhoAreYaGrid(guesses);

    const message = [
      `⚽ PENALTY - Kim Bu Yıldız?${leagueHeader}`,
      `🕵️‍♂️ ${outcomeText}`,
      currentStreak > 0 ? `🔥 Güncel Seri: ${currentStreak}` : '',
      '',
      grid,
      '',
      'Sen de tahmin et! 📲 penalty.app',
    ]
      .filter((line) => line !== '')
      .join('\n');

    return this.openShareDialog(message, 'Penalty - Günün Yıldızı');
  }

  public async shareGeneral(params: IShareGeneralParams): Promise<boolean> {
    const { gameTitle, isWon, attemptsUsed, maxAttempts, currentStreak, customGrid } = params;
    const outcomeText = isWon ? `${attemptsUsed}/${maxAttempts} Tahmin` : `X/${maxAttempts}`;

    const lines = [
      `⚽ PENALTY - ${gameTitle}`,
      `🎯 ${outcomeText}`,
      currentStreak > 0 ? `🔥 Güncel Seri: ${currentStreak}` : '',
    ];

    if (customGrid && customGrid.length > 0) {
      lines.push('');
      lines.push(...customGrid);
    }

    lines.push('');
    lines.push('Sen de oyna! 📲 penalty.app');

    const message = lines.filter((line) => line !== '').join('\n');
    return this.openShareDialog(message, `Penalty - ${gameTitle}`);
  }

  private async openShareDialog(message: string, title: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(message);
          return true;
        }
      }

      const result = await Share.share({
        message,
        title,
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.warn('ShareService error:', error);
      return false;
    }
  }
}

export const shareService = new ShareService();
