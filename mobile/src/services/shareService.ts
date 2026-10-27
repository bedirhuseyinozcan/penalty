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

  public generateTicTacToeGrid(cells: Array<{ isFilled: boolean }>): string[] {
    if (!cells || cells.length < 9) return [];
    const rows: string[] = [];
    for (let r = 0; r < 3; r++) {
      const rowStr = [0, 1, 2]
        .map((c) => (cells[r * 3 + c]?.isFilled ? '🟩' : '⬜'))
        .join('');
      rows.push(rowStr);
    }
    return rows;
  }

  public generateBingoGrid(tiles: Array<{ isMatched: boolean }>): string[] {
    if (!tiles || tiles.length < 16) return [];
    const rows: string[] = [];
    for (let r = 0; r < 4; r++) {
      const rowStr = [0, 1, 2, 3]
        .map((c) => (tiles[r * 4 + c]?.isMatched ? '🟩' : '⬜'))
        .join('');
      rows.push(rowStr);
    }
    return rows;
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
