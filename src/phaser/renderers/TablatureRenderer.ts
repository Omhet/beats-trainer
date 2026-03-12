import { DRUM_DEFINITION, DRUM_ORDER } from "@/constants/drumMapping";
import { NoteEvent } from "@/types/midi";
import * as Phaser from "phaser";

const LABEL_WIDTH = 120; // left margin for row labels
const ROW_HEIGHT = 80; // px per drum row
const TOP_PADDING = 24; // px above first row
const LOOKAHEAD_S = 4; // seconds visible ahead of playhead
const LOOKBEHIND_S = 2; // seconds visible behind playhead
const NOTE_MIN_R = 10;
const NOTE_MAX_R = 20;
const BAR_BEATS = 4; // beats per bar (4/4)

const CYMBAL_PITCHES = new Set([42, 46, 44, 49, 57, 51, 53, 59]);

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

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const { width, height } = scene.scale;
        this.staticTex = scene.add.renderTexture(0, 0, width, height);
        this.dynamicGfx = scene.add.graphics();
    }

    resize() {
        this.staticTex.destroy();
        this.dynamicGfx.destroy();
        this.labelText.forEach((t) => t.destroy());
        this.labelText = [];
        const { width, height } = this.scene.scale;
        this.staticTex = this.scene.add.renderTexture(0, 0, width, height);
        this.dynamicGfx = this.scene.add.graphics();
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
            const y = TOP_PADDING + rowInfo.row * ROW_HEIGHT + ROW_HEIGHT / 2;
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
            const y = TOP_PADDING + rowInfo.row * ROW_HEIGHT + ROW_HEIGHT / 2;
            const t = this.scene.add
                .text(LABEL_WIDTH - 10, y, rowInfo.label, {
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: rowInfo.color,
                    align: "right",
                })
                .setOrigin(1, 0.5)
                .setDepth(1);
            this.labelText.push(t);
        }
    }

    render(currentTime: number) {
        const { width, height } = this.scene.scale;
        const contentWidth = width - LABEL_WIDTH;
        const pps = contentWidth / (LOOKBEHIND_S + LOOKAHEAD_S); // pixels per second
        const playheadX = LABEL_WIDTH + LOOKBEHIND_S * pps;

        // 1. Draw static background handled by staticTex at depth 0
        this.dynamicGfx.clear();

        // 2. Draw bar lines
        const secondsPerBeat = 60 / this.bpm;
        const secondsPerBar = secondsPerBeat * BAR_BEATS;
        const startTime = currentTime - LOOKBEHIND_S - secondsPerBar;
        const endTime = currentTime + LOOKAHEAD_S + secondsPerBar;
        const firstBar = Math.ceil(startTime / secondsPerBar);
        const lastBar = Math.floor(endTime / secondsPerBar);

        this.dynamicGfx.lineStyle(1, 0x555555, 0.6);
        for (let b = firstBar; b <= lastBar; b++) {
            const barTime = b * secondsPerBar;
            const x = playheadX + (barTime - currentTime) * pps;
            if (x >= LABEL_WIDTH && x <= width) {
                this.dynamicGfx.lineBetween(x, 0, x, height);
            }
        }

        // 3. Advance cursor: skip notes that are no longer visible
        const minVisible = currentTime - LOOKBEHIND_S - 0.1;
        while (
            this.cursor < this.notes.length - 1 &&
            this.notes[this.cursor].time < minVisible
        ) {
            this.cursor++;
        }

        // 4. Draw notes
        for (let i = this.cursor; i < this.notes.length; i++) {
            const note = this.notes[i];
            const x = playheadX + (note.time - currentTime) * pps;
            if (x > width + NOTE_MAX_R) break; // past right edge, stop
            if (x < LABEL_WIDTH - NOTE_MAX_R) continue; // before label area, skip

            const rowIndex = this.pitchToRow[note.pitch];
            if (rowIndex === undefined) continue;

            const drumInfo = DRUM_DEFINITION[note.pitch];
            const y = TOP_PADDING + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
            const r =
                NOTE_MIN_R + (note.velocity / 127) * (NOTE_MAX_R - NOTE_MIN_R);

            const isActive = Math.abs(note.time - currentTime) < 0.06;
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
