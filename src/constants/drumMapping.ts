export interface DrumInfo {
    label: string;
    color: string; // hex
    sampleFile: string;
}

export const DRUM_DEFINITION: Record<number, DrumInfo> = {
    36: { label: "Kick", color: "#FF0000", sampleFile: "kick.wav" }, // bright red
    38: { label: "Snare", color: "#FFFF00", sampleFile: "snare.wav" }, // yellow
    42: { label: "Hi-Hat", color: "#00FFFF", sampleFile: "hihat_closed.wav" }, // cyan - closed
    46: { label: "Hi-Hat", color: "#00FFFF", sampleFile: "hihat_open.wav" }, // cyan - open
    47: { label: "Tom High", color: "#00FF00", sampleFile: "tom_high.wav" }, // green
    45: { label: "Tom Mid", color: "#228B22", sampleFile: "tom_mid.wav" }, // forest green
    44: { label: "Tom Low", color: "#556B2F", sampleFile: "tom_floor_low.wav" }, // dark olive green
    49: { label: "Crash", color: "#FFA500", sampleFile: "crash_1.wav" }, // orange
    51: { label: "Ride", color: "#800080", sampleFile: "ride.wav" }, // purple
};

/**
 * Ordered list of drum labels to determine their vertical position.
 * The first item in the array will be at the bottom (or vice versa depending on rendering logic).
 * Based on common drum notation, let's keep it from top to bottom.
 */
export const DRUM_ORDER = [
    "Crash",
    "Ride",
    "Tom High",
    "Tom Mid",
    "Tom Low",
    "Hi-Hat",
    "Snare",
    "Kick",
];
