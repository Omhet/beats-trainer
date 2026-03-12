export interface DrumInfo {
    label: string;
    color: string; // hex
}

export const DRUM_DEFINITION: Record<number, DrumInfo> = {
    35: { label: "Kick", color: "#FF0000" }, // bright red
    36: { label: "Kick", color: "#FF0000" },
    38: { label: "Snare", color: "#FFFF00" }, // yellow
    40: { label: "Snare", color: "#FFFF00" },
    42: { label: "Hat Closed", color: "#00FFFF" }, // cyan
    46: { label: "Hat Open", color: "#00CED1" }, // dark cyan
    47: { label: "Tom High", color: "#00FF00" }, // green
    45: { label: "Tom Mid", color: "#228B22" }, // forest green
    41: { label: "Tom Low", color: "#556B2F" }, // dark olive green
    49: { label: "Crash", color: "#FFA500" }, // orange
    51: { label: "Ride", color: "#800080" }, // purple
};

/**
 * Ordered list of drum labels to determine their vertical position.
 * The first item in the array will be at the bottom (or vice versa depending on rendering logic).
 * Based on common drum notation, let's keep it from top to bottom.
 */
export const DRUM_ORDER = [
    "Crash",
    "Ride",
    "Hat Open",
    "Hat Closed",
    "Tom High",
    "Tom Mid",
    "Tom Low",
    "Snare",
    "Kick",
];
