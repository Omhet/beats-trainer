export interface DrumInfo {
    row: number;
    label: string;
    color: string; // hex
}

export const DRUM_MAP: Record<number, DrumInfo> = {
    35: { row: 8, label: "Kick", color: "#FF0000" }, // bright red
    36: { row: 8, label: "Kick", color: "#FF0000" },
    38: { row: 7, label: "Snare", color: "#FFFF00" }, // yellow
    40: { row: 7, label: "Snare", color: "#FFFF00" },
    42: { row: 6, label: "Hat Closed", color: "#00FFFF" }, // cyan
    46: { row: 5, label: "Hat Open", color: "#00CED1" }, // dark cyan
    47: { row: 2, label: "Tom High", color: "#00FF00" }, // green
    45: { row: 3, label: "Tom Mid", color: "#228B22" }, // forest green
    41: { row: 4, label: "Tom Low", color: "#556B2F" }, // dark olive green
    49: { row: 0, label: "Crash", color: "#FFA500" }, // orange
    51: { row: 1, label: "Ride", color: "#800080" }, // purple
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
