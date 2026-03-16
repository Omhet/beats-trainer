import { EventBus } from "@/phaser/EventBus";
import { AppEvent } from "@/phaser/types/events";
import { NoteEvent } from "@/types/midi";
import * as Tone from "tone";
import { BackingTrackPlayer } from "./BackingTrackPlayer";
import { DrumSampler } from "./DrumSampler";
import { MetronomePlayer } from "./MetronomePlayer";
import { MidiPlayer } from "./MidiPlayer";

class AudioManagerClass {
    readonly midi = new MidiPlayer();
    readonly metronome = new MetronomePlayer();
    readonly playbackSampler = new DrumSampler();
    readonly userInputSampler = new DrumSampler();
    readonly backing = new BackingTrackPlayer();

    private _started = false;

    /** Must be called inside a user gesture handler to unlock Web Audio */
    async start(): Promise<void> {
        if (this._started) return;
        await Tone.start();
        this._started = true;
    }

    get isStarted(): boolean {
        return this._started;
    }

    async loadSong(
        notes: NoteEvent[],
        bpm: number,
        samplesBasePath: string,
        backingTrackUrl?: string,
    ): Promise<void> {
        Tone.getTransport().stop();
        Tone.getTransport().seconds = 0;

        // Load samplers (fire and forget, graceful if samples missing)
        this.playbackSampler.load(samplesBasePath).catch(() => {
            console.warn(
                "DrumSampler: some samples failed to load, continuing without them",
            );
        });
        this.userInputSampler.load(samplesBasePath).catch(() => {
            console.warn(
                "DrumSampler: some samples failed to load, continuing without them",
            );
        });

        // Load MIDI — wire playbackSampler as the note callback; emit TRACK_END on the last note
        this.midi.load(
            notes,
            bpm,
            (note, time) => {
                this.playbackSampler.trigger(note.pitch, note.velocity, time);
            },
            () => {
                EventBus.emit(AppEvent.TRACK_END);
            },
        );

        // Load metronome (re-arms at new BPM)
        this.metronome.start(bpm);
        // Don't start Transport yet — wait for user to press Play

        // Load backing track if provided
        if (backingTrackUrl) {
            await this.backing.load(backingTrackUrl).catch(() => {
                console.warn(
                    "BackingTrackPlayer: failed to load backing track",
                );
            });
        }
    }

    play(): void {
        Tone.getTransport().start();
    }

    pause(): void {
        Tone.getTransport().pause();
    }

    reset(): void {
        Tone.getTransport().stop();
    }

    seek(seconds: number): void {
        Tone.getTransport().seconds = seconds;
    }

    get isPlaying(): boolean {
        return Tone.getTransport().state === "started";
    }

    get currentTime(): number {
        return Tone.getTransport().seconds;
    }

    dispose(): void {
        Tone.getTransport().stop();
        this.midi.dispose();
        this.metronome.dispose();
        this.playbackSampler.dispose();
        this.userInputSampler.dispose();
        this.backing.dispose();
        this._started = false;
    }
}

export const AudioManager = new AudioManagerClass();
