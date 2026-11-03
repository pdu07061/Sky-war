/**
 * Web Audio API synthesizer for zero-latency procedural sound effects & background music
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private bgmEnabled: boolean = false;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmInterval: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSfx(enabled?: boolean) {
    this.sfxEnabled = enabled !== undefined ? enabled : !this.sfxEnabled;
    return this.sfxEnabled;
  }

  public getSfxEnabled() {
    return this.sfxEnabled;
  }

  public getBgmEnabled() {
    return this.bgmEnabled;
  }

  public toggleBgm(enabled?: boolean) {
    this.bgmEnabled = enabled !== undefined ? enabled : !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.startAmbientBgm();
    } else {
      this.stopAmbientBgm();
    }
    return this.bgmEnabled;
  }

  public playLaser(freq = 600) {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // Audio fallback silent
    }
  }

  public playCannon() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  public playExplosion(heavy = false) {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const bufferSize = this.ctx.sampleRate * (heavy ? 0.6 : 0.3);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(heavy ? 280 : 450, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + (heavy ? 0.55 : 0.28));

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(heavy ? 0.6 : 0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (heavy ? 0.58 : 0.3));

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      whiteNoise.start();
      whiteNoise.stop(this.ctx.currentTime + (heavy ? 0.6 : 0.32));
    } catch {}
  }

  public playShieldHit() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {}
  }

  public playDeploy() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const notes = [440, 554, 659];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + idx * 0.05 + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(this.ctx!.currentTime + idx * 0.05);
        osc.stop(this.ctx!.currentTime + idx * 0.05 + 0.2);
      });
    } catch {}
  }

  public playThunder() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      // Crack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);

      // Rumble
      this.playExplosion(true);
    } catch {}
  }

  public playHeal() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.18, this.ctx!.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, this.ctx!.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.28);
      });
    } catch {}
  }

  public playHyperBeam() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, this.ctx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.35);
    } catch {}
  }

  public playVictory() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const fanfare = [
        { f: 523.25, d: 0.2 },
        { f: 659.25, d: 0.2 },
        { f: 783.99, d: 0.25 },
        { f: 1046.5, d: 0.6 },
      ];
      let t = 0;
      fanfare.forEach(({ f, d }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime + t);

        gain.gain.setValueAtTime(0.35, this.ctx!.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + t + d);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(this.ctx!.currentTime + t);
        osc.stop(this.ctx!.currentTime + t + d + 0.05);
        t += d;
      });
    } catch {}
  }

  public playDefeat() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const sadness = [
        { f: 440, d: 0.35 },
        { f: 415.3, d: 0.35 },
        { f: 392, d: 0.5 },
        { f: 349.23, d: 0.8 },
      ];
      let t = 0;
      sadness.forEach(({ f, d }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime + t);

        gain.gain.setValueAtTime(0.3, this.ctx!.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + t + d);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(this.ctx!.currentTime + t);
        osc.stop(this.ctx!.currentTime + t + d + 0.05);
        t += d;
      });
    } catch {}
  }

  private startAmbientBgm() {
    if (this.bgmInterval) return;
    this.initCtx();
    if (!this.ctx || !this.bgmGain) return;

    // Ambient floating celestial chords loop
    const chords = [
      [220, 261.63, 329.63, 392], // Am7
      [174.61, 220, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392, 493.88], // Cmaj7
      [196, 246.94, 293.66, 349.23], // G7
    ];
    let chordIdx = 0;

    const playChordStep = () => {
      if (!this.bgmEnabled || !this.ctx || !this.bgmGain) return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq) => {
        try {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

          gain.gain.setValueAtTime(0.02, this.ctx!.currentTime);
          gain.gain.linearRampToValueAtTime(0.06, this.ctx!.currentTime + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 3.8);

          osc.connect(gain);
          gain.connect(this.bgmGain!);

          osc.start();
          osc.stop(this.ctx!.currentTime + 4.0);
        } catch {}
      });
    };

    playChordStep();
    this.bgmInterval = window.setInterval(playChordStep, 4000);
  }

  private stopAmbientBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
