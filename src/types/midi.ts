export interface NoteEvent {
    time: number; // absolute time in seconds from start
    pitch: number; // MIDI note number (0-127)
    velocity: number; // 0-1 normalized
    duration: number; // duration in seconds
}
