import { DRUM_DEFINITION } from "@/constants/drumMapping";
import * as Tone from "tone";

const PITCH_TO_SAMPLE: Record<number, string> = Object.fromEntries(
    Object.entries(DRUM_DEFINITION).map(([p, d]) => [Number(p), d.sampleFile]),
);

export class DrumSampler {
    private players: Map<string, Tone.Player> = new Map();
    private volume: Tone.Volume;
    private basePath: string = "";
    private loaded = false;

    constructor() {
        this.volume = new Tone.Volume(0).toDestination();
    }

    get isLoaded(): boolean {
        return this.loaded;
    }

    async load(basePath: string): Promise<void> {
        this.basePath = basePath;
        this.dispose();
        const uniqueFiles = [...new Set(Object.values(PITCH_TO_SAMPLE))];
        await Promise.all(
            uniqueFiles.map(
                (file) =>
                    new Promise<void>((resolve) => {
                        const player = new Tone.Player({
                            url: `${basePath}/${file}`,
                            onload: () => {
                                this.players.set(file, player);
                                resolve();
                            },
                            onerror: (e) => {
                                console.warn(
                                    `DrumSampler: Failed to load ${file}:`,
                                    e,
                                );
                                resolve(); // non-fatal
                            },
                        }).connect(this.volume);
                    }),
            ),
        );
        this.loaded = true;
    }

    trigger(pitch: number, velocity: number, time?: Tone.Unit.Time): void {
        if (!this.loaded) return;
        const file = PITCH_TO_SAMPLE[pitch];
        if (!file) return;
        const player = this.players.get(file);
        if (!player) return;
        // Scale volume by velocity
        player.volume.value = Tone.gainToDb(Math.max(0.01, velocity));
        player.start(time ?? Tone.immediate());
    }

    setVolume(zeroToOne: number): void {
        this.volume.volume.value =
            zeroToOne > 0 ? Tone.gainToDb(zeroToOne) : -Infinity;
    }

    dispose(): void {
        this.players.forEach((p) => p.dispose());
        this.players.clear();
        this.loaded = false;
    }
}
