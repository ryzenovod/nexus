// =========================================================
// NEXUS // Pure Web Audio API Cozy Ambiance Synthesizer
// 100% Client-Side Procedural Audio - 0 External MP3s Needed
// =========================================================

class CozyAudioEngine {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private chimesTimer: number | null = null;
  private isPlaying = false;
  private currentMode: 'rain' | 'fireplace' | 'chimes' | 'off' = 'off';
  private masterVolume = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate pink/brown noise buffer procedurally
  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds looping buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter algorithm (Paul Kellet)
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public startRain() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    // Buffer source with noise
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to simulate soft raindrops hitting window glass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.gainNode);
    noiseSource.start();

    this.noiseNode = noiseSource;
    this.isPlaying = true;
    this.currentMode = 'rain';

    // Random gentle raindrop transients
    this.chimesTimer = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying || this.currentMode !== 'rain') return;
      this.playRaindropTransient();
    }, 400);
  }

  private playRaindropTransient() {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();

    const freq = 1200 + Math.random() * 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.04);

    dropGain.gain.setValueAtTime(0.01 + Math.random() * 0.02, this.ctx.currentTime);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

    osc.connect(dropGain);
    dropGain.connect(this.gainNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  public startFireplace() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    // Deep brown rumble for cozy fireplace
    const noiseBuffer = this.createNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.gainNode);
    noiseSource.start();

    this.noiseNode = noiseSource;
    this.isPlaying = true;
    this.currentMode = 'fireplace';
  }

  public startChimes() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.masterVolume * 0.7, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    this.isPlaying = true;
    this.currentMode = 'chimes';

    // Pentatonic scale frequencies in Hz (A-minor pentatonic / C-major: C, D, E, G, A)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];

    const playChimeNote = () => {
      if (!this.ctx || !this.gainNode || !this.isPlaying) return;
      const note = notes[Math.floor(Math.random() * notes.length)];
      
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 3.5);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start();
      osc.stop(this.ctx.currentTime + 3.6);
    };

    // Play initial note
    playChimeNote();

    this.chimesTimer = window.setInterval(() => {
      if (Math.random() > 0.3) {
        playChimeNote();
      }
    }, 2200);
  }

  public playCelebrationChime() {
    this.initContext();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major triad + octave
    const now = this.ctx.currentTime;

    chords.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.08, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 1.3);
    });
  }

  public stop() {
    if (this.chimesTimer) {
      clearInterval(this.chimesTimer);
      this.chimesTimer = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
      } catch {
        // already stopped
      }
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    this.isPlaying = false;
    this.currentMode = 'off';
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      mode: this.currentMode,
      volume: this.masterVolume,
    };
  }
}

export const cozyAudio = new CozyAudioEngine();
