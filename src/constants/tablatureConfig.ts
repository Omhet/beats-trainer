/**
 * Configurable constants for tablature visual feedback on user drum hits.
 * Edit these values to tune the feel.
 */

/** How close (in ms) a user hit must be to a track note to count as "good" (green). */
export const GOOD_HIT_WINDOW_MS = 100;

/** How long (in ms) the row label flashes after any hit. */
export const LABEL_FLASH_DURATION_MS = 200;

/** How long (in ms) the green circle pulsates before settling into a steady dot. */
export const GREEN_PULSE_DURATION_MS = 300;

// Layout
export const LABEL_WIDTH = 120; // left margin for row labels
export const ROW_HEIGHT = 80; // px per drum row
export const LOOKAHEAD_BEATS = 16; // beats visible ahead of playhead
export const LOOKBEHIND_BEATS = 4; // beats visible behind playhead
export const NOTE_MIN_R = 10;
export const NOTE_MAX_R = 20;
export const BAR_BEATS = 4; // beats per bar (4/4)

// Grid Styling
export const GRID_BAR_COLOR = 0x555555;
export const GRID_BAR_ALPHA = 0.75;
export const GRID_BAR_WIDTH = 1;
export const GRID_BEAT_COLOR = 0x4a4a4a;
export const GRID_BEAT_ALPHA = 0.45;
export const GRID_BEAT_WIDTH = 1;
export const GRID_HALFBEAT_COLOR = 0x444444;
export const GRID_HALFBEAT_ALPHA = 0.2;
export const GRID_HALFBEAT_WIDTH = 1;

// Rendering constants
export const ACTIVE_NOTE_WINDOW_SECONDS = 0.06;
export const CYMBAL_SCALE_ACTIVE = 1.4;
export const NOTE_SCALE_ACTIVE = 1.3;
export const HIT_MARKER_SCALE = 0.65;
export const PULSE_SCALE_MAX = 1.8;
export const PULSE_ALPHA_MAX = 0.65;
export const LABEL_FLASH_ALPHA_MAX = 0.45;

export const BG_COLOR = 0x0d0d0d;
export const STAFF_LINE_COLOR = 0x333333;
export const STAFF_LINE_ALPHA = 0.8;
export const SEPARATOR_LINE_COLOR = 0x444444;
export const PLAYHEAD_COLOR = 0xffffff;
export const PLAYHEAD_ALPHA = 0.9;
export const PLAYHEAD_WIDTH = 2;

export const GOOD_HIT_COLOR = 0x00cc55;
export const BAD_HIT_COLOR = 0xff3333;
export const PULSE_COLOR = 0x00ff66;
