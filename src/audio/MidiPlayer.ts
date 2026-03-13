import { NoteEvent } from "@/types/midi";
import * as Tone from "tone";

export class MidiPlayer {
    private part: Tone.Part | null = null;
    private onNote: ((note: NoteEvent, time: number) => void) | null = null;

    load(
        notes: NoteEvent[],
        bpm: number,
        onNote?: (note: NoteEvent, time: number) => void,
    ): void {
        this.dispose();
        Tone.getTransport().bpm.value = bpm;
        this.onNote = onNote ?? null;
        this.part = new Tone.Part(
            (time, note: NoteEvent) => {
                // Forward the precise WebAudio clock time for sample-accurate scheduling
                this.onNote?.(note, time);
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
