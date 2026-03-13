import { NoteEvent } from "@/types/midi";
import { Midi } from "@tonejs/midi";

/**
 * Parses a MIDI file from an ArrayBuffer and extracts drum note events.
 * @param buffer The raw ArrayBuffer of the MIDI file.
 * @returns An array of NoteEvent objects sorted by time.
 */
export function parseMidi(buffer: ArrayBuffer): NoteEvent[] {
    const midi = new Midi(buffer);

    // Get the first tempo entry's BPM or default to 120
    const embeddedBpm = midi.header.tempos[0]?.bpm || 120;
    const secondsPerBeat = 60 / embeddedBpm;

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
                beat: note.time / secondsPerBeat, // position in beats
                pitch: note.midi, // MIDI note number
                velocity: note.velocity, // normalized 0-1
                duration: note.duration / secondsPerBeat, // duration in beats
            });
        });
    });

    // Sort by beat ascending
    return events.sort((a, b) => a.beat - b.beat);
}
