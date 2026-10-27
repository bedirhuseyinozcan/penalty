import { Platform } from 'react-native';
import { useSettingsStore } from '../stores/useSettingsStore';

interface IToneStep {
  freq: number;
  durationMs: number;
  delayMs?: number;
  type?: OscillatorType;
  gain?: number;
}

class SoundService {
  private audioCtx: AudioContext | null = null;

  private isEnabled(): boolean {
    try {
      return useSettingsStore.getState().soundEnabled;
    } catch {
      return true;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (Platform.OS !== 'web') return null;
    try {
      if (!this.audioCtx && typeof window !== 'undefined') {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private playSequence(steps: IToneStep[]): void {
    if (!this.isEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      for (const step of steps) {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        const startSec = now + (step.delayMs ?? 0) / 1000;
        const durationSec = Math.max(0.02, step.durationMs / 1000);
        const peakGain = step.gain ?? 0.12;

        osc.type = step.type ?? 'sine';
        osc.frequency.setValueAtTime(step.freq, startSec);

        gainNode.gain.setValueAtTime(0.001, startSec);
        gainNode.gain.exponentialRampToValueAtTime(peakGain, startSec + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startSec + durationSec);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(startSec);
        osc.stop(startSec + durationSec + 0.01);
      }
    } catch {
    }
  }

  public playTap(): void {
    this.playSequence([
      { freq: 520, durationMs: 35, type: 'triangle', gain: 0.08 },
    ]);
  }

  public playSuccess(): void {
    this.playSequence([
      { freq: 523.25, durationMs: 90, delayMs: 0, type: 'triangle', gain: 0.12 },   // C5
      { freq: 659.25, durationMs: 110, delayMs: 75, type: 'triangle', gain: 0.13 }, // E5
      { freq: 783.99, durationMs: 180, delayMs: 150, type: 'sine', gain: 0.15 },    // G5
    ]);
  }

  public playWarning(): void {
    this.playSequence([
      { freq: 440, durationMs: 70, delayMs: 0, type: 'sine', gain: 0.09 },
      { freq: 370, durationMs: 90, delayMs: 65, type: 'sine', gain: 0.09 },
    ]);
  }

  public playError(): void {
    this.playSequence([
      { freq: 210, durationMs: 110, delayMs: 0, type: 'sawtooth', gain: 0.1 },
      { freq: 145, durationMs: 170, delayMs: 95, type: 'sawtooth', gain: 0.11 },
    ]);
  }

  public playWinFanfare(): void {
    this.playSequence([
      { freq: 523.25, durationMs: 100, delayMs: 0, type: 'triangle', gain: 0.13 },   // C5
      { freq: 659.25, durationMs: 100, delayMs: 90, type: 'triangle', gain: 0.13 },  // E5
      { freq: 783.99, durationMs: 100, delayMs: 180, type: 'triangle', gain: 0.14 }, // G5
      { freq: 1046.5, durationMs: 280, delayMs: 270, type: 'sine', gain: 0.16 },     // C6
    ]);
  }
}

export const soundService = new SoundService();
