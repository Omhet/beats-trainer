import { NoteEvent } from "@/types/midi";
import * as Tone from "tone";

export class MidiPlayer {
    private part: Tone.Part | null = null;
    private onNote: ((note: NoteEvent, time: number) => void) | null = null;
    private onEnd: (() => void) | null = null;

    load(
        notes: NoteEvent[],
        bpm: number,
        onNote?: (note: NoteEvent, time: number) => void,
        onEnd?: () => void,
    ): void {
        this.dispose();
        Tone.getTransport().bpm.value = bpm;
        this.onNote = onNote ?? null;
        this.onEnd = onEnd ?? null;

        const lastBeat =
            notes.length > 0
                ? Math.max(...notes.map((n) => n.beat))
                : -Infinity;

        this.part = new Tone.Part(
            (time, note: NoteEvent) => {
                // Forward the precise WebAudio clock time for sample-accurate scheduling
                this.onNote?.(note, time);
                if (note.beat === lastBeat) {
                    this.onEnd?.();
                }
            },
            notes.map((n) => [n.beat * (60 / bpm), n]),
        );
        this.part.start(0);
    }

    play(): void {
        Tone.getTransport().start();
    }
    pause(): void {
        Tone.getTransport().pause();
    }

    seek(seconds: number): void {
        Tone.getTransport().seconds = seconds;
    }

    dispose(): void {
        this.part?.dispose();
        this.part = null;
    }
}
