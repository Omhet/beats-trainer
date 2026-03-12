import { DRUM_MAP, DRUM_ROWS } from "@/constants/drumMapping";
import { NoteEvent } from "@/types/midi";
import * as Phaser from "phaser";

const LABEL_WIDTH = 120; // left margin for row labels
const ROW_HEIGHT = 44; // px per drum row
const TOP_PADDING = 24; // px above first row
const LOOKAHEAD_S = 3.5; // seconds visible ahead of playhead
const LOOKBEHIND_S = 0.8; // seconds visible behind playhead
const NOTE_MIN_R = 4;
const NOTE_MAX_R = 9;
const BAR_BEATS = 4; // beats per bar (4/4)

const CYMBAL_PITCHES = new Set([42, 46, 44, 49, 57, 51, 53, 59]);

export class TablatureRenderer {
    private scene: Phaser.Scene;
    private staticTex!: Phaser.GameObjects.RenderTexture;
    private dynamicGfx!: Phaser.GameObjects.Graphics;
    private labelText: Phaser.GameObjects.Text[] = [];
    private notes: NoteEvent[] = [];
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
    }

    loadNotes(notes: NoteEvent[], bpm: number) {
        this.notes = notes;
        this.bpm = bpm;
        this.resetCursor();
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
        for (const drumInfo of DRUM_ROWS) {
            const y = TOP_PADDING + drumInfo.row * ROW_HEIGHT + ROW_HEIGHT / 2;
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
        for (const drumInfo of DRUM_ROWS) {
            const y = TOP_PADDING + drumInfo.row * ROW_HEIGHT + ROW_HEIGHT / 2;
            const t = this.scene.add
                .text(LABEL_WIDTH - 10, y, drumInfo.label, {
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: drumInfo.color,
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

            const drumInfo = DRUM_MAP[note.pitch];
            if (!drumInfo) continue;

            const y = TOP_PADDING + drumInfo.row * ROW_HEIGHT + ROW_HEIGHT / 2;
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
