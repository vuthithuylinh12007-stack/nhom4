// Web Audio API Synthesizer for instant game sounds without external audio asset dependencies

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hango_sound_enabled');
      this.soundEnabled = saved !== null ? saved === 'true' : true;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hango_sound_enabled', String(this.soundEnabled));
    }
    return this.soundEnabled;
  }

  public playCardClick(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio playback failsafe
    }
  }

  public playSuccessSound(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio notes: C5, E5, G5
      const notes = [523.25, 659.25, 783.99];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.07;
        const duration = 0.18;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      });
    } catch {
      // Audio failsafe
    }
  }

  public playErrorSound(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio failsafe
    }
  }

  public playWinFanfare(): void {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Victory fanfare: C5, E5, G5, C6 (extended)
      const notes = [
        { f: 523.25, t: 0, d: 0.12 },
        { f: 659.25, t: 0.12, d: 0.12 },
        { f: 783.99, t: 0.24, d: 0.14 },
        { f: 1046.5, t: 0.38, d: 0.4 },
      ];

      notes.forEach((item) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + item.t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, startTime);

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + item.d + 0.02);
      });
    } catch {
      // Audio failsafe
    }
  }
}

export const soundEffects = new SoundEffectsService();
