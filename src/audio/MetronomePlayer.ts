import * as Tone from 'tone';

export class MetronomePlayer {
  private loop: Tone.Loop | null = null;
  private synth: Tone.Synth;
  private volume: Tone.Volume;

  constructor() {
    this.volume = new Tone.Volume(-6).toDestination();
    this.synth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    }).connect(this.volume);
  }

  start(bpm: number): void {
    this.stop();
    Tone.getTransport().bpm.value = bpm;
    this.loop = new Tone.Loop((time) => {
      this.synth.triggerAttackRelease('C5', '32n', time);
    }, '4n');
    this.loop.start(0);
  }

  stop(): void {
    this.loop?.dispose();
    this.loop = null;
  }

  setVolume(zeroToOne: number): void {
    this.volume.volume.value = zeroToOne > 0 ? Tone.gainToDb(zeroToOne) : -Infinity;
  }

  dispose(): void {
    this.stop();
    this.synth.dispose();
    this.volume.dispose();
  }
}
