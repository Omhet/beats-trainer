import { NoteEvent } from "@/types/midi";
import * as Tone from "tone";

export class MidiPlayer {
    private part: Tone.Part | null = null;
    private endEventId: number | null = null;
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

        // Find the last beat
        const lastBeat =
            notes.length > 0
                ? Math.max(...notes.map((n) => n.beat))
                : -Infinity;

        // Calculate the start of the bar after the last note (assuming 4/4 time for now)
        const beatsPerBar = 4;
        const endBeat = Math.ceil((lastBeat + 0.001) / beatsPerBar) * beatsPerBar;

        this.part = new Tone.Part(
            (time, note: NoteEvent) => {
                // Forward the precise WebAudio clock time for sample-accurate scheduling
                this.onNote?.(note, time);
            },
            notes.map((n) => [n.beat * (60 / bpm), n]),
        );

        // Schedule onEnd at the start of the next bar
        if (notes.length > 0) {
            this.endEventId = Tone.getTransport().schedule(() => {
                this.onEnd?.();
            }, endBeat * (60 / bpm));
        }

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
        if (this.endEventId !== null) {
            Tone.getTransport().clear(this.endEventId);
            this.endEventId = null;
        }
    }
}
