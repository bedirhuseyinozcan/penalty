import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/useSettingsStore';
import { soundService } from './soundService';

class HapticsService {
  private isEnabled(): boolean {
    if (Platform.OS === 'web') return false;
    try {
      return useSettingsStore.getState().hapticsEnabled;
    } catch {
      return true;
    }
  }

  public async selection(): Promise<void> {
    soundService.playTap();
    if (!this.isEnabled()) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
  }

  public async light(): Promise<void> {
    soundService.playTap();
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }

  public async medium(): Promise<void> {
    soundService.playTap();
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  }

  public async heavy(): Promise<void> {
    soundService.playTap();
    if (!this.isEnabled()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
  }

  public async success(): Promise<void> {
    soundService.playSuccess();
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  }

  public async warning(): Promise<void> {
    soundService.playWarning();
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  }

  public async error(): Promise<void> {
    soundService.playError();
    if (!this.isEnabled()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  }
}

export const hapticsService = new HapticsService();
