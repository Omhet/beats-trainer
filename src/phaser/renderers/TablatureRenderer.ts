import { DRUM_DEFINITION, DRUM_ORDER } from "@/constants/drumMapping";
import {
    ACTIVE_NOTE_WINDOW_SECONDS,
    BAD_HIT_COLOR,
    BAR_BEATS,
    BG_COLOR,
    CYMBAL_SCALE_ACTIVE,
    GOOD_HIT_COLOR,
    GOOD_HIT_WINDOW_MS,
    GREEN_PULSE_DURATION_MS,
    GRID_BAR_ALPHA,
    GRID_BAR_COLOR,
    GRID_BAR_WIDTH,
    GRID_BEAT_ALPHA,
    GRID_BEAT_COLOR,
    GRID_BEAT_WIDTH,
    GRID_HALFBEAT_ALPHA,
    GRID_HALFBEAT_COLOR,
    GRID_HALFBEAT_WIDTH,
    HIT_MARKER_SCALE,
    LABEL_FLASH_ALPHA_MAX,
    LABEL_FLASH_DURATION_MS,
    LABEL_WIDTH,
    LOOKAHEAD_BEATS,
    LOOKBEHIND_BEATS,
    NOTE_MAX_R,
    NOTE_MIN_R,
    NOTE_SCALE_ACTIVE,
    PLAYHEAD_ALPHA,
    PLAYHEAD_COLOR,
    PLAYHEAD_WIDTH,
    PULSE_ALPHA_MAX,
    PULSE_COLOR,
    PULSE_SCALE_MAX,
    ROW_HEIGHT,
    SEPARATOR_LINE_COLOR,
    STAFF_LINE_ALPHA,
    STAFF_LINE_COLOR,
} from "@/constants/tablatureConfig";
import { NoteEvent } from "@/types/midi";
import * as Phaser from "phaser";

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

    // User hit feedback state
    private hitFlashes: Map<number, number> = new Map(); // pitch → Date.now() of last hit
    private userHitMarkers: Array<{
        beat: number;
        rowIndex: number;
        addedAt: number;
        good: boolean;
    }> = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initGfx();
    }

    private initGfx() {
        const { width, height } = this.scene.scale;
        this.staticTex = this.scene.add
            .renderTexture(0, 0, width, height)
            .setOrigin(0, 0)
            .setDepth(0);
        this.dynamicGfx = this.scene.add.graphics().setDepth(1);
    }

    resize() {
        this.staticTex.destroy();
        this.dynamicGfx.destroy();
        this.labelText.forEach((t) => t.destroy());
        this.labelText = [];
        this.initGfx();
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

    /**
     * Record a user drum hit for visual feedback.
     * @param pitch       Standard GM pitch (already resolved through device map)
     * @param currentTime Tone.Transport.seconds at the moment of the hit
     * @param isPlaying   Whether the track is currently playing
     */
    recordUserHit(pitch: number, currentTime: number, isPlaying: boolean) {
        // Always flash the row label
        this.hitFlashes.set(pitch, Date.now());

        // Only add beat-positioned markers when the track is playing
        const rowIndex = this.pitchToRow[pitch];
        if (!isPlaying || rowIndex === undefined) return;

        const secondsPerBeat = 60 / this.bpm;
        const currentBeat = currentTime / secondsPerBeat;
        const windowBeats = GOOD_HIT_WINDOW_MS / 1000 / secondsPerBeat;

        const rowInfo = this.activeRows[rowIndex];
        const rowPitchSet = new Set(rowInfo?.pitches ?? []);
        let good = false;
        for (const note of this.notes) {
            if (
                rowPitchSet.has(note.pitch) &&
                Math.abs(note.beat - currentBeat) <= windowBeats
            ) {
                good = true;
                break;
            }
        }

        this.userHitMarkers.push({
            beat: currentBeat,
            rowIndex,
            addedAt: Date.now(),
            good,
        });
    }

    /** Clear all user hit markers and flashes (call on playback reset). */
    clearUserHits() {
        this.hitFlashes.clear();
        this.userHitMarkers = [];
    }

    private getRowY(rowIndex: number, totalRows: number): number {
        const { height } = this.scene.scale;
        const totalStaffHeight = totalRows * ROW_HEIGHT;
        const startY = (height - totalStaffHeight) / 2;
        return startY + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
    }

    renderStaticLayer() {
        if (!this.scene || !this.scene.sys || !this.scene.sys.displayList) {
            return;
        }

        const { width, height } = this.scene.scale;
        const gfx = this.scene.add.graphics();

        // Background
        gfx.fillStyle(BG_COLOR, 1);
        gfx.fillRect(0, 0, width, height);

        // Staff lines + separator
        gfx.lineStyle(1, STAFF_LINE_COLOR, STAFF_LINE_ALPHA);
        for (const rowInfo of this.activeRows) {
            const y = this.getRowY(rowInfo.row, this.activeRows.length);
            gfx.lineBetween(LABEL_WIDTH, y, width, y);
        }
        gfx.lineStyle(1, SEPARATOR_LINE_COLOR, 1);
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

    private getPlayheadX(currentBeat: number, ppb: number): number {
        return LABEL_WIDTH + LOOKBEHIND_BEATS * ppb;
    }

    private getPPB(width: number): number {
        const contentWidth = width - LABEL_WIDTH;
        return contentWidth / (LOOKBEHIND_BEATS + LOOKAHEAD_BEATS);
    }

    private getNoteX(
        beat: number,
        currentBeat: number,
        ppb: number,
        playheadX: number,
    ): number {
        return playheadX + (beat - currentBeat) * ppb;
    }

    private drawGridLine(
        beat: number,
        currentBeat: number,
        ppb: number,
        playheadX: number,
        color: number,
        alpha: number,
        lineWidth: number,
        height: number,
    ) {
        const x = this.getNoteX(beat, currentBeat, ppb, playheadX);
        if (x >= LABEL_WIDTH && x <= this.scene.scale.width) {
            this.dynamicGfx.lineStyle(lineWidth, color, alpha);
            this.dynamicGfx.lineBetween(x, 0, x, height);
        }
    }

    render(currentTime: number) {
        const { width, height } = this.scene.scale;
        const ppb = this.getPPB(width); // pixels per beat
        const secondsPerBeat = 60 / this.bpm;
        const currentBeat = currentTime / secondsPerBeat;
        const playheadX = this.getPlayheadX(currentBeat, ppb);

        // 1. Draw static background handled by staticTex at depth 0
        this.dynamicGfx.clear();

        // 2. Draw bar, beat, and half-beat lines
        const startBeat = currentBeat - LOOKBEHIND_BEATS;
        const endBeat = currentBeat + LOOKAHEAD_BEATS;

        // Half-beat lines
        const firstHalfBeat = Math.ceil(startBeat * 2);
        const lastHalfBeat = Math.floor(endBeat * 2);
        for (let h = firstHalfBeat; h <= lastHalfBeat; h++) {
            const b = h / 2;
            if (h % 2 === 0) continue;
            this.drawGridLine(
                b,
                currentBeat,
                ppb,
                playheadX,
                GRID_HALFBEAT_COLOR,
                GRID_HALFBEAT_ALPHA,
                GRID_HALFBEAT_WIDTH,
                height,
            );
        }

        // Beat lines
        const firstBeat = Math.ceil(startBeat);
        const lastBeat = Math.floor(endBeat);
        for (let b = firstBeat; b <= lastBeat; b++) {
            if (b % BAR_BEATS === 0) continue;
            this.drawGridLine(
                b,
                currentBeat,
                ppb,
                playheadX,
                GRID_BEAT_COLOR,
                GRID_BEAT_ALPHA,
                GRID_BEAT_WIDTH,
                height,
            );
        }

        // Bar lines
        const firstBar = Math.ceil(startBeat / BAR_BEATS);
        const lastBar = Math.floor(endBeat / BAR_BEATS);
        for (let b = firstBar; b <= lastBar; b++) {
            this.drawGridLine(
                b * BAR_BEATS,
                currentBeat,
                ppb,
                playheadX,
                GRID_BAR_COLOR,
                GRID_BAR_ALPHA,
                GRID_BAR_WIDTH,
                height,
            );
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
            const x = this.getNoteX(note.beat, currentBeat, ppb, playheadX);
            if (x > width + NOTE_MAX_R) break; // past right edge, stop
            if (x < LABEL_WIDTH - NOTE_MAX_R) continue; // before label area, skip

            const rowIndex = this.pitchToRow[note.pitch];
            if (rowIndex === undefined) continue;

            const drumInfo = DRUM_DEFINITION[note.pitch];
            const y = this.getRowY(rowIndex, this.activeRows.length);
            const r =
                NOTE_MIN_R + (note.velocity / 127) * (NOTE_MAX_R - NOTE_MIN_R);

            const isActive =
                Math.abs(note.beat - currentBeat) <
                ACTIVE_NOTE_WINDOW_SECONDS / secondsPerBeat;
            const colorHex = parseInt(drumInfo.color.replace("#", ""), 16);
            const alpha = isActive ? 1.0 : 0.85;

            if (CYMBAL_PITCHES.has(note.pitch)) {
                const size = isActive ? r * CYMBAL_SCALE_ACTIVE : r;
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
                    this.dynamicGfx.strokeCircle(
                        x,
                        y,
                        size * CYMBAL_SCALE_ACTIVE,
                    );
                }
            } else {
                const radius = isActive ? r * NOTE_SCALE_ACTIVE : r;
                this.dynamicGfx.fillStyle(colorHex, alpha);
                this.dynamicGfx.fillCircle(x, y, radius);
            }
        }

        // 4.5. Draw label flash backgrounds (drawn on dynamicGfx at depth 1,
        //       so they appear behind label Text objects at depth 2)
        const flashNow = Date.now();
        for (const rowInfo of this.activeRows) {
            let latestFlash = 0;
            for (const pitch of rowInfo.pitches) {
                const t = this.hitFlashes.get(pitch);
                if (t !== undefined && t > latestFlash) latestFlash = t;
            }
            if (latestFlash > 0) {
                const elapsed = flashNow - latestFlash;
                if (elapsed < LABEL_FLASH_DURATION_MS) {
                    const alpha =
                        LABEL_FLASH_ALPHA_MAX *
                        (1 - elapsed / LABEL_FLASH_DURATION_MS);
                    const colorHex = parseInt(
                        rowInfo.color.replace("#", ""),
                        16,
                    );
                    const y = this.getRowY(rowInfo.row, this.activeRows.length);
                    this.dynamicGfx.fillStyle(colorHex, alpha);
                    this.dynamicGfx.fillRect(
                        0,
                        y - ROW_HEIGHT / 2,
                        LABEL_WIDTH,
                        ROW_HEIGHT,
                    );
                }
            }
        }

        // 4.6. Draw user hit markers (scrolling in beat-space)
        const markerNow = Date.now();
        const HIT_MARKER_R = NOTE_MIN_R * HIT_MARKER_SCALE;
        for (const marker of this.userHitMarkers) {
            const x = this.getNoteX(marker.beat, currentBeat, ppb, playheadX);
            if (x < LABEL_WIDTH - NOTE_MAX_R * 3 || x > width + NOTE_MAX_R * 3)
                continue;
            const y = this.getRowY(marker.rowIndex, this.activeRows.length);
            const elapsed = markerNow - marker.addedAt;

            if (marker.good) {
                // Pulse phase: expanding fading ring
                if (elapsed < GREEN_PULSE_DURATION_MS) {
                    const t = elapsed / GREEN_PULSE_DURATION_MS;
                    const pulseR = NOTE_MIN_R * (1 + t * PULSE_SCALE_MAX);
                    const pulseAlpha = PULSE_ALPHA_MAX * (1 - t);
                    this.dynamicGfx.fillStyle(PULSE_COLOR, pulseAlpha);
                    this.dynamicGfx.fillCircle(x, y, pulseR);
                }
                // Steady small green dot
                this.dynamicGfx.fillStyle(GOOD_HIT_COLOR, 0.9);
                this.dynamicGfx.fillCircle(x, y, HIT_MARKER_R);
            } else {
                // Steady small red dot
                this.dynamicGfx.fillStyle(BAD_HIT_COLOR, 0.85);
                this.dynamicGfx.fillCircle(x, y, HIT_MARKER_R);
            }
        }

        // 5. Draw playhead
        this.dynamicGfx.lineStyle(
            PLAYHEAD_WIDTH,
            PLAYHEAD_COLOR,
            PLAYHEAD_ALPHA,
        );
        this.dynamicGfx.lineBetween(playheadX, 0, playheadX, height);
    }
}
