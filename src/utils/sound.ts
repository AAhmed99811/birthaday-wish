// Gentle Web Audio music-box synthesizer & micro-interaction sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private isPlayingMusic = false;
  private musicTimer: number | null = null;
  private noteIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(freq: number, durationSec: number, volume = 0.08, type: OscillatorType = 'sine', delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.03);
  }

  playPop() {
    this.playTone(660, 0.09, 0.06, 'sine', 0);
    this.playTone(880, 0.11, 0.05, 'triangle', 0.04);
  }

  playCelebrate() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.25, 0.07, 'triangle', idx * 0.07);
    });
  }

  playBlow() {
    this.playTone(440, 0.18, 0.05, 'sine', 0);
    this.playTone(587.33, 0.2, 0.05, 'sine', 0.08);
    this.playTone(783.99, 0.3, 0.06, 'triangle', 0.16);
  }

  toggleMusic(): boolean {
    if (this.isPlayingMusic) {
      this.stopMusic();
      return false;
    }
    this.startMusic();
    return true;
  }

  startMusic() {
    if (this.isPlayingMusic) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.isPlayingMusic = true;
    // "Happy Birthday" music-box melody in C major (freq Hz, duration ms)
    const melody: Array<[number, number]> = [
      [392.0, 320], [392.0, 220], [440.0, 480], [392.0, 480], [523.25, 480], [493.88, 860],
      [392.0, 320], [392.0, 220], [440.0, 480], [392.0, 480], [587.33, 480], [523.25, 860],
      [392.0, 320], [392.0, 220], [783.99, 480], [659.25, 480], [523.25, 480], [493.88, 480], [440.0, 760],
      [698.46, 320], [698.46, 220], [659.25, 480], [523.25, 480], [587.33, 480], [523.25, 1050],
    ];

    const scheduleNext = () => {
      if (!this.isPlayingMusic) return;
      const [freq, ms] = melody[this.noteIndex % melody.length];
      this.playTone(freq, (ms / 1000) * 1.15, 0.055, 'sine', 0);
      this.playTone(freq * 2, (ms / 1000) * 0.6, 0.015, 'triangle', 0.01);
      this.noteIndex = (this.noteIndex + 1) % melody.length;
      this.musicTimer = window.setTimeout(scheduleNext, ms);
    };

    scheduleNext();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  get playing(): boolean {
    return this.isPlayingMusic;
  }
}

export const sound = new SoundManager();

