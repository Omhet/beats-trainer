import { DRUM_DEFINITION } from "@/constants/drumMapping";
import { findPresetForDevice, PRESET_MAPS } from "@/constants/midiPresetMaps";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** All standard GM pitches that the app recognises (keys of DRUM_DEFINITION). */
const STANDARD_PITCHES = Object.keys(DRUM_DEFINITION).map(Number);

/** Build an identity map: device note N → standard pitch N for all known pitches. */
function identityMap(): Record<number, number> {
    return Object.fromEntries(STANDARD_PITCHES.map((p) => [p, p]));
}

interface MidiState {
    /**
     * Per-device user override maps.
     * Only stores explicitly customised entries; does NOT store the full map.
     * Key: device id (string from WebMidi input.id).
     * Value: Record<deviceNote, standardPitch>
     */
    deviceMaps: Record<string, Record<number, number>>;

    /**
     * When non-null, the app is waiting for the user to press a note on the
     * specified device so it can be mapped to the standard pitch.
     */
    learnTarget: { deviceId: string; standardPitch: number } | null;

    // ── Actions ────────────────────────────────────────────────────────────

    /** Save a single note mapping override for a device. */
    setDeviceNoteMapping: (
        deviceId: string,
        deviceNote: number,
        standardPitch: number,
    ) => void;

    /**
     * One-time import of a named preset as the device's overrides.
     * Writes all preset entries as explicit overrides so the user can further
     * customise individual notes afterwards. Existing overrides are replaced.
     */
    importPreset: (deviceId: string, presetName: string) => void;

    /** Start listening for the next note from `deviceId` to remap `standardPitch`. */
    startLearn: (deviceId: string, standardPitch: number) => void;

    /** Cancel / complete the current learn session. */
    stopLearn: () => void;

    // ── Selectors ──────────────────────────────────────────────────────────

    /**
     * Returns the effective map for a device: identity base, then preset overlay
     * (auto-detected from device name), then user overrides on top.
     *
     * @param deviceId  WebMidi input.id
     * @param deviceName  Human-readable device name used for preset auto-detection
     */
    getEffectiveMap: (
        deviceId: string,
        deviceName?: string,
    ) => Record<number, number>;
}

export const useMidiStore = create<MidiState>()(
    persist(
        (set, get) => ({
            deviceMaps: {},
            learnTarget: null,

            setDeviceNoteMapping: (deviceId, deviceNote, standardPitch) =>
                set((state) => ({
                    deviceMaps: {
                        ...state.deviceMaps,
                        [deviceId]: {
                            ...(state.deviceMaps[deviceId] ?? {}),
                            [deviceNote]: standardPitch,
                        },
                    },
                })),

            importPreset: (deviceId, presetName) => {
                const preset = PRESET_MAPS[presetName];
                if (!preset) return;
                set((state) => ({
                    deviceMaps: {
                        ...state.deviceMaps,
                        [deviceId]: { ...preset },
                    },
                }));
            },

            startLearn: (deviceId, standardPitch) =>
                set({ learnTarget: { deviceId, standardPitch } }),

            stopLearn: () => set({ learnTarget: null }),

            getEffectiveMap: (deviceId, deviceName) => {
                const base = identityMap();

                // Auto-detect preset from device name
                const presetKey = deviceName
                    ? findPresetForDevice(deviceName)
                    : null;
                const preset = presetKey ? PRESET_MAPS[presetKey] : null;

                // User overrides for this specific device id
                const overrides = get().deviceMaps[deviceId] ?? {};

                return { ...base, ...(preset ?? {}), ...overrides };
            },
        }),
        {
            name: "beat-trainer-midi",
            // Only persist user overrides and nothing else (learnTarget is transient)
            partialize: (state) => ({ deviceMaps: state.deviceMaps }),
        },
    ),
);

