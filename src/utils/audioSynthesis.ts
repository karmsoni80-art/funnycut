// Web Audio API synthesizer for comedy sound effects and background audio beds

class SoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Comic Record Scratch sound
  playRecordScratch() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;

      // Frequency drop mimicking vinyl needle scratch
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
      osc.frequency.setValueAtTime(300, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext not allowed before gesture
    }
  }

  // Classic Comedy Rimshot / Punchline Hit (Ba-dum-tss)
  playRimshot() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Drum 1 ("Ba")
      const drum1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      drum1.type = 'triangle';
      drum1.frequency.setValueAtTime(140, now);
      drum1.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      g1.gain.setValueAtTime(0.4, now);
      g1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      drum1.connect(g1);
      g1.connect(ctx.destination);
      drum1.start(now);
      drum1.stop(now + 0.1);

      // Drum 2 ("Dum")
      const drum2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      drum2.type = 'triangle';
      drum2.frequency.setValueAtTime(180, now + 0.12);
      drum2.frequency.exponentialRampToValueAtTime(60, now + 0.22);
      g2.gain.setValueAtTime(0.45, now + 0.12);
      g2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      drum2.connect(g2);
      g2.connect(ctx.destination);
      drum2.start(now + 0.12);
      drum2.stop(now + 0.22);

      // Cymbal ("Tss")
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5000, now + 0.24);

      const g3 = ctx.createGain();
      g3.gain.setValueAtTime(0.3, now + 0.24);
      g3.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      noise.connect(filter);
      filter.connect(g3);
      g3.connect(ctx.destination);

      noise.start(now + 0.24);
      noise.stop(now + 0.55);
    } catch {}
  }

  // Dramatic Bass Boom / Shock hit
  playDramaticBoom() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch {}
  }

  // Cartoon Pop / Boing
  playPop() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Plays specific comedy SFX by name
  playSfx(name: string) {
    const sfxLower = name.toLowerCase();
    if (sfxLower.includes('scratch')) {
      this.playRecordScratch();
    } else if (sfxLower.includes('rimshot') || sfxLower.includes('laugh') || sfxLower.includes('drum')) {
      this.playRimshot();
    } else if (sfxLower.includes('boom') || sfxLower.includes('dramatic') || sfxLower.includes('shock')) {
      this.playDramaticBoom();
    } else {
      this.playPop();
    }
  }
}

export const soundEngine = new SoundEngine();
