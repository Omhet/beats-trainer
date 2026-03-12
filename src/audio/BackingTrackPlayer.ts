import * as Tone from "tone";

export class BackingTrackPlayer {
    private player: Tone.Player | null = null;
    private volume: Tone.Volume;

    constructor() {
        this.volume = new Tone.Volume(0).toDestination();
    }

    async load(url: string): Promise<void> {
        this.dispose();
        this.player = new Tone.Player(url).connect(this.volume);
        this.player.sync(); // syncs start/stop with Transport
        await Tone.loaded();
    }

    play(): void {
        this.player?.start(Tone.getTransport().seconds);
    }
    pause(): void {
        this.player?.stop();
    }

    seek(seconds: number): void {
        if (!this.player) return;
        const wasPlaying = Tone.getTransport().state === "started";
        this.player.stop();
        if (wasPlaying) this.player.start(seconds);
    }

    setVolume(zeroToOne: number): void {
        this.volume.volume.value =
            zeroToOne > 0 ? Tone.gainToDb(zeroToOne) : -Infinity;
    }

    dispose(): void {
        this.player?.dispose();
        this.player = null;
    }
}
