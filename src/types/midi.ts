export interface NoteEvent {
    beat: number; // position in beats from start
    pitch: number; // MIDI note number (0-127)
    velocity: number; // 0-1 normalized
    duration: number; // duration in beats
}
