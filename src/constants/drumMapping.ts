export interface DrumInfo {
    row: number;
    label: string;
    color: string; // hex
}

export const DRUM_MAP: Record<number, DrumInfo> = {
    35: { row: 0, label: "Bass Drum (Kick)", color: "#FF0000" }, // bright red
    36: { row: 0, label: "Bass Drum (Kick)", color: "#FF0000" },
    38: { row: 1, label: "Snare", color: "#FFFF00" }, // yellow
    40: { row: 1, label: "Snare", color: "#FFFF00" },
    37: { row: 2, label: "Snare Rim", color: "#FFD700" }, // gold
    42: { row: 3, label: "Hi-Hat Closed", color: "#00FFFF" }, // cyan
    46: { row: 4, label: "Hi-Hat Open", color: "#00CED1" }, // dark cyan
    44: { row: 5, label: "Hi-Hat Pedal", color: "#20B2AA" }, // light sea green
    47: { row: 6, label: "Tom High", color: "#00FF00" }, // green
    48: { row: 7, label: "Tom Mid-High", color: "#32CD32" }, // lime green
    45: { row: 8, label: "Tom Mid", color: "#228B22" }, // forest green
    43: { row: 9, label: "Tom Floor High", color: "#006400" }, // dark green
    41: { row: 10, label: "Tom Floor Low", color: "#556B2F" }, // dark olive green
    49: { row: 11, label: "Crash 1", color: "#FFA500" }, // orange
    57: { row: 12, label: "Crash 2", color: "#FF8C00" }, // dark orange
    51: { row: 13, label: "Ride", color: "#800080" }, // purple
    53: { row: 14, label: "Ride Bell", color: "#9370DB" }, // medium purple
    59: { row: 15, label: "Ride Edge", color: "#8A2BE2" }, // blue violet
};

// Derived unique rows for the staff
export const DRUM_ROWS = Object.values(DRUM_MAP)
    .reduce((acc, curr) => {
        if (!acc.find((r) => r.row === curr.row)) {
            acc.push(curr);
        }
        return acc;
    }, [] as DrumInfo[])
    .sort((a, b) => a.row - b.row);
