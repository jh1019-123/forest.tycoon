// Web Audio API Synth Engine for 숲 타이쿤 (Forest Tycoon)
class CozySoundEngine {
  private ctx: AudioContext | null = null;
  private isBgmPlaying = false;
  private bgmTimeoutId: any = null;
  public enabled = true;

  constructor() {}

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleSound(forceState?: boolean) {
    this.enabled = forceState !== undefined ? forceState : !this.enabled;
    if (this.enabled) {
      this.initCtx();
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.enabled;
  }

  // Soft retro beep for talking
  playTalkBeep(pitchOffset = 0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // Cute high-pitched pitch adjustments
    osc.frequency.setValueAtTime(400 + pitchOffset, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500 + pitchOffset, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Watering sound (splash/bubbles)
  playWatering() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    for (let i = 0; i < 3; i++) {
      const delay = i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(300 + Math.random() * 200, this.ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + delay + 0.15);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 0.15);
    }
  }

  // Chopping sound (thud and pop)
  playChop() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Wood thump osc
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Mine sound (clink)
  playMine() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Cash / Sell register
  playRegister() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Coin high pitch chord
    const times = [0, 0.08];
    const notes = [987.77, 1318.51]; // B5, E6

    times.forEach((time, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(notes[index], this.ctx!.currentTime + time);

      gain.gain.setValueAtTime(0.07, this.ctx!.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + time + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + time);
      osc.stop(this.ctx!.currentTime + time + 0.25);
    });
  }

  // Cast Bobber Splosh
  playSplash() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Caught fish fanfare
  playSuccessFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const delay = idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);

      gain.gain.setValueAtTime(0.06, this.ctx!.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + delay + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + 0.4);
    });
  }

  // Background Music Loop: Generates soft lo-fi chords in C major pentatonic
  startBgm() {
    if (!this.enabled || this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.playNextBgmChord();
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId) {
      clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }

  private playNextBgmChord() {
    if (!this.isBgmPlaying || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Standard soft chord progression: Cmaj9 -> Fmaj7 -> Am9 -> Gsus4
    const progressions = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // C, E, G, B, D
      [349.23, 440.00, 523.25, 659.25, 783.99], // F, A, C, E, G
      [220.00, 261.63, 329.63, 392.00, 493.88], // A, C, E, G, B
      [293.66, 392.00, 440.00, 587.33, 698.46], // D, G, A, D, F
    ];

    const randomProgression = progressions[Math.floor(Math.random() * progressions.length)];

    // Play chord with very slow attack and decay (lush ambient feel)
    randomProgression.forEach((freq, i) => {
      const delay = i * 0.15 + (Math.random() * 0.1); // Arpeggiated
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + delay);

      // Very soft volume
      gain.gain.setValueAtTime(0.0, this.ctx!.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.015, this.ctx!.currentTime + delay + 1.5); // Slow attack
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + delay + 4.5); // Smooth decay

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + delay);
      osc.stop(this.ctx!.currentTime + delay + 4.5);
    });

    // Schedule next ambient chord in 5-7 seconds
    const nextInterval = 5500 + Math.random() * 2500;
    this.bgmTimeoutId = setTimeout(() => {
      this.playNextBgmChord();
    }, nextInterval);
  }
}

export const CozySound = new CozySoundEngine();
