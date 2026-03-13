/**
 * Preset MIDI note maps for known drum kit devices.
 * Each entry maps device MIDI note numbers → standard GM drum pitches
 * (as defined in DRUM_DEFINITION keys: 36, 38, 42, 44, 45, 46, 47, 49, 51).
 *
 * Values are stubs — fill in correct device note numbers for each kit.
 */

// Standard GM pitches used as targets:
//   36 = Kick, 38 = Snare, 42 = Hi-Hat Closed, 46 = Hi-Hat Open,
//   47 = Tom High, 45 = Tom Mid, 44 = Tom Low, 49 = Crash, 51 = Ride

export const PRESET_MAPS: Record<string, Record<number, number>> = {
    "Roland TD": {
        // TODO: replace with correct Roland TD MIDI note numbers
        36: 36, // Kick
        38: 38, // Snare
        42: 42, // Hi-Hat Closed
        46: 46, // Hi-Hat Open
        47: 47, // Tom High
        45: 45, // Tom Mid
        44: 44, // Tom Low
        49: 49, // Crash
        51: 51, // Ride
    },
    "Maschine Mikro": {
        // TODO: replace with correct Maschine Mikro MK3 MIDI note numbers
        36: 36, // Kick
        38: 38, // Snare
        42: 42, // Hi-Hat Closed
        46: 46, // Hi-Hat Open
        47: 47, // Tom High
        45: 45, // Tom Mid
        44: 44, // Tom Low
        49: 49, // Crash
        51: 51, // Ride
    },
};

/** Returns the preset key whose name is contained in the given device name, or null. */
export function findPresetForDevice(deviceName: string): string | null {
    const lower = deviceName.toLowerCase();
    for (const key of Object.keys(PRESET_MAPS)) {
        if (lower.includes(key.toLowerCase())) return key;
    }
    return null;
}

