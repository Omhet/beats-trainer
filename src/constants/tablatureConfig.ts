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

