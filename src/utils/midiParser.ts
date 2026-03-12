import { NoteEvent } from "@/types/midi";
import { Midi } from "@tonejs/midi";

/**
 * Parses a MIDI file from an ArrayBuffer and extracts drum note events.
 * @param buffer The raw ArrayBuffer of the MIDI file.
 * @returns An array of NoteEvent objects sorted by time.
 */
export function parseMidi(buffer: ArrayBuffer): NoteEvent[] {
    const midi = new Midi(buffer);

    // Prefer tracks where instrumentation is percussion (MIDI channel 10/percussion flag)
    let tracks = midi.tracks.filter(
        (track) => track.instrument.percussion === true,
    );

    // Fall back to all tracks if no percussion tracks are found
    if (tracks.length === 0) {
        tracks = midi.tracks;
    }

    const events: NoteEvent[] = [];

    tracks.forEach((track) => {
        track.notes.forEach((note) => {
            events.push({
                time: note.time, // absolute seconds from start
                pitch: note.midi, // MIDI note number
                velocity: note.velocity, // normalized 0-1
                duration: note.duration, // seconds
            });
        });
    });

    // Sort by time ascending
    return events.sort((a, b) => a.time - b.time);
}
