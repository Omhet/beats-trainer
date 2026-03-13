import { DRUM_DEFINITION, DRUM_ORDER } from "@/constants/drumMapping";
import { NoteEvent } from "@/types/midi";
import * as Phaser from "phaser";

const LABEL_WIDTH = 120; // left margin for row labels
const ROW_HEIGHT = 80; // px per drum row
const LOOKAHEAD_BEATS = 16; // beats visible ahead of playhead
const LOOKBEHIND_BEATS = 4; // beats visible behind playhead
const NOTE_MIN_R = 10;
const NOTE_MAX_R = 20;
const BAR_BEATS = 4; // beats per bar (4/4)

const GRID_BAR_COLOR = 0x555555;
const GRID_BAR_ALPHA = 0.75;
const GRID_BAR_WIDTH = 1;
const GRID_BEAT_COLOR = 0x4a4a4a;
const GRID_BEAT_ALPHA = 0.45;
const GRID_BEAT_WIDTH = 1;
const GRID_HALFBEAT_COLOR = 0x444444;
const GRID_HALFBEAT_ALPHA = 0.2;
const GRID_HALFBEAT_WIDTH = 1;

const CYMBAL_PITCHES = new Set([42, 46, 49, 51]); // hi-hats and cymbals for special rendering
const OPEN_HAT_PITCHES = new Set([46]);

interface ActiveRow {
    label: string;
    row: number;
    color: string;
    pitches: number[];
}

export class TablatureRenderer {
    private scene: Phaser.Scene;
    private staticTex!: Phaser.GameObjects.RenderTexture;
    private dynamicGfx!: Phaser.GameObjects.Graphics;
    private labelText: Phaser.GameObjects.Text[] = [];
    private notes: NoteEvent[] = [];
    private activeRows: ActiveRow[] = [];
    private pitchToRow: Record<number, number> = {};
    private bpm = 120;
    private cursor = 0; // advancing cursor for O(1) amortised note scan
    private lastRenderTime = -1; // used to detect backward seeks

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const { width, height } = scene.scale;
        this.staticTex = scene.add
            .renderTexture(0, 0, width, height)
            .setOrigin(0, 0)
            .setDepth(0);
        this.dynamicGfx = scene.add.graphics().setDepth(1);
    }

    resize() {
        this.staticTex.destroy();
        this.dynamicGfx.destroy();
        this.labelText.forEach((t) => t.destroy());
        this.labelText = [];
        const { width, height } = this.scene.scale;
        this.staticTex = this.scene.add
            .renderTexture(0, 0, width, height)
            .setOrigin(0, 0)
            .setDepth(0);
        this.dynamicGfx = this.scene.add.graphics().setDepth(1);
        this.renderStaticLayer();
    }

    loadNotes(notes: NoteEvent[], bpm: number) {
        this.notes = notes;
        this.bpm = bpm;
        this.calculateActiveRows();
        this.resetCursor();
        this.renderStaticLayer();
    }

    private calculateActiveRows() {
        const uniquePitches = Array.from(
            new Set(this.notes.map((n) => n.pitch)),
        );
        const activeLabels = new Set<string>();
        const labelToPitches: Record<string, number[]> = {};

        for (const pitch of uniquePitches) {
            const def = DRUM_DEFINITION[pitch];
            if (def) {
                activeLabels.add(def.label);
                if (!labelToPitches[def.label]) {
                    labelToPitches[def.label] = [];
                }
                labelToPitches[def.label].push(pitch);
            }
        }

        // Filter and sort the rows based on the defined order
        this.activeRows = DRUM_ORDER.filter((label) =>
            activeLabels.has(label),
        ).map((label, index) => {
            const pitches = labelToPitches[label];
            return {
                label,
                row: index,
                color: DRUM_DEFINITION[pitches[0]].color,
                pitches,
            };
        });

        // Update the pitchToRow lookup table
        this.pitchToRow = {};
        for (const rowInfo of this.activeRows) {
            for (const pitch of rowInfo.pitches) {
                this.pitchToRow[pitch] = rowInfo.row;
            }
        }
    }

    resetCursor() {
        this.cursor = 0;
        this.lastRenderTime = -1;
    }

    private getRowY(rowIndex: number, totalRows: number): number {
        const { height } = this.scene.scale;
        const totalStaffHeight = totalRows * ROW_HEIGHT;
        const startY = (height - totalStaffHeight) / 2;
        return startY + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
    }

    renderStaticLayer() {
        const { width, height } = this.scene.scale;
        const gfx = this.scene.add.graphics();

        // Background
        gfx.fillStyle(0x0d0d0d, 1);
        gfx.fillRect(0, 0, width, height);

        // Staff lines + separator
        gfx.lineStyle(1, 0x333333, 0.8);
        for (const rowInfo of this.activeRows) {
            const y = this.getRowY(rowInfo.row, this.activeRows.length);
            gfx.lineBetween(LABEL_WIDTH, y, width, y);
        }
        gfx.lineStyle(1, 0x444444, 1);
        gfx.lineBetween(LABEL_WIDTH, 0, LABEL_WIDTH, height);

        this.staticTex.clear();
        this.staticTex.draw(gfx, 0, 0);
        gfx.destroy();

        // Draw label texts
        this.labelText.forEach((t) => t.destroy());
        this.labelText = [];
        for (const rowInfo of this.activeRows) {
            const y = this.getRowY(rowInfo.row, this.activeRows.length);
            const t = this.scene.add
                .text(LABEL_WIDTH - 10, y, rowInfo.label, {
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: rowInfo.color,
                    align: "right",
                })
                .setOrigin(1, 0.5)
                .setDepth(2);
            this.labelText.push(t);
        }
    }

    render(currentTime: number) {
        const { width, height } = this.scene.scale;
        const contentWidth = width - LABEL_WIDTH;
        const ppb = contentWidth / (LOOKBEHIND_BEATS + LOOKAHEAD_BEATS); // pixels per beat
        const secondsPerBeat = 60 / this.bpm;
        const currentBeat = currentTime / secondsPerBeat;
        const playheadX = LABEL_WIDTH + LOOKBEHIND_BEATS * ppb;

        // 1. Draw static background handled by staticTex at depth 0
        this.dynamicGfx.clear();

        // 2. Draw bar, beat, and half-beat lines
        const secondsPerBar = secondsPerBeat * BAR_BEATS;
        const startBeat = currentBeat - LOOKBEHIND_BEATS;
        const endBeat = currentBeat + LOOKAHEAD_BEATS;

        // Half-beat lines
        const firstHalfBeat = Math.ceil(startBeat * 2);
        const lastHalfBeat = Math.floor(endBeat * 2);
        this.dynamicGfx.lineStyle(
            GRID_HALFBEAT_WIDTH,
            GRID_HALFBEAT_COLOR,
            GRID_HALFBEAT_ALPHA,
        );
        for (let h = firstHalfBeat; h <= lastHalfBeat; h++) {
            const b = h / 2;
            // Skip positions that will be drawn as beat or bar lines
            if (h % 2 === 0) continue;
            const x = playheadX + (b - currentBeat) * ppb;
            if (x >= LABEL_WIDTH && x <= width) {
                this.dynamicGfx.lineBetween(x, 0, x, height);
            }
        }

        // Beat lines
        const firstBeat = Math.ceil(startBeat);
        const lastBeat = Math.floor(endBeat);
        this.dynamicGfx.lineStyle(
            GRID_BEAT_WIDTH,
            GRID_BEAT_COLOR,
            GRID_BEAT_ALPHA,
        );
        for (let b = firstBeat; b <= lastBeat; b++) {
            // Skip positions that will be drawn as bar lines
            if (b % BAR_BEATS === 0) continue;
            const x = playheadX + (b - currentBeat) * ppb;
            if (x >= LABEL_WIDTH && x <= width) {
                this.dynamicGfx.lineBetween(x, 0, x, height);
            }
        }

        // Bar lines
        const firstBar = Math.ceil(startBeat / BAR_BEATS);
        const lastBar = Math.floor(endBeat / BAR_BEATS);
        this.dynamicGfx.lineStyle(
            GRID_BAR_WIDTH,
            GRID_BAR_COLOR,
            GRID_BAR_ALPHA,
        );
        for (let b = firstBar; b <= lastBar; b++) {
            const barBeat = b * BAR_BEATS;
            const x = playheadX + (barBeat - currentBeat) * ppb;
            if (x >= LABEL_WIDTH && x <= width) {
                this.dynamicGfx.lineBetween(x, 0, x, height);
            }
        }

        // 3. Advance cursor: skip notes that are no longer visible
        // Reset cursor if time jumped backward (e.g. after Reset)
        if (currentTime < this.lastRenderTime - 0.1) {
            this.cursor = 0;
        }
        this.lastRenderTime = currentTime;

        const minVisibleBeat = currentBeat - LOOKBEHIND_BEATS - 0.1;
        while (
            this.cursor < this.notes.length - 1 &&
            this.notes[this.cursor].beat < minVisibleBeat
        ) {
            this.cursor++;
        }

        // 4. Draw notes
        for (let i = this.cursor; i < this.notes.length; i++) {
            const note = this.notes[i];
            const x = playheadX + (note.beat - currentBeat) * ppb;
            if (x > width + NOTE_MAX_R) break; // past right edge, stop
            if (x < LABEL_WIDTH - NOTE_MAX_R) continue; // before label area, skip

            const rowIndex = this.pitchToRow[note.pitch];
            if (rowIndex === undefined) continue;

            const drumInfo = DRUM_DEFINITION[note.pitch];
            const y = this.getRowY(rowIndex, this.activeRows.length);
            const r =
                NOTE_MIN_R + (note.velocity / 127) * (NOTE_MAX_R - NOTE_MIN_R);

            const isActive =
                Math.abs(note.beat - currentBeat) < 0.06 / secondsPerBeat;
            const colorHex = parseInt(drumInfo.color.replace("#", ""), 16);
            const alpha = isActive ? 1.0 : 0.85;

            if (CYMBAL_PITCHES.has(note.pitch)) {
                const size = isActive ? r * 1.4 : r;
                this.dynamicGfx.lineStyle(isActive ? 3 : 2, colorHex, alpha);
                this.dynamicGfx.lineBetween(
                    x - size,
                    y - size,
                    x + size,
                    y + size,
                );
                this.dynamicGfx.lineBetween(
                    x - size,
                    y + size,
                    x + size,
                    y - size,
                );
                if (OPEN_HAT_PITCHES.has(note.pitch)) {
                    this.dynamicGfx.strokeCircle(x, y, size * 1.4);
                }
            } else {
                const radius = isActive ? r * 1.3 : r;
                this.dynamicGfx.fillStyle(colorHex, alpha);
                this.dynamicGfx.fillCircle(x, y, radius);
            }
        }

        // 5. Draw playhead
        this.dynamicGfx.lineStyle(2, 0xffffff, 0.9);
        this.dynamicGfx.lineBetween(playheadX, 0, playheadX, height);
    }
}
