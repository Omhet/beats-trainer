import { PerformanceResult } from "@/types/performance";
import { SongIndexEntry } from "@/types/song";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MidiPermission = "unknown" | "granted" | "denied";

export interface ConnectedMidiDevice {
    id: string;
    name: string;
}

interface Volumes {
    midiPlayback: number; // 0-1
    metronome: number; // 0-1
    playbackDrums: number; // 0-1
    userInputDrums: number; // 0-1
    backingTrack: number; // 0-1
}

interface AppState {
    // Song catalogue
    songs: SongIndexEntry[];
    setSongs: (songs: SongIndexEntry[]) => void;

    // Navigation
    practiseBpm: number;
    setPractiseBpm: (bpm: number) => void;

    // Audio volumes
    volumes: Volumes;
    setVolume: (key: keyof Volumes, value: number) => void;

    // Performance history
    performanceHistory: PerformanceResult[];
    addPerformanceResult: (result: PerformanceResult) => void;

    // Latency compensation
    audioLatencyMs: number;
    setAudioLatencyMs: (ms: number) => void;

    // MIDI device state (non-persisted, runtime only)
    midiPermission: MidiPermission;
    setMidiPermission: (permission: MidiPermission) => void;
    connectedMidiDevices: ConnectedMidiDevice[];
    setConnectedMidiDevices: (devices: ConnectedMidiDevice[]) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            songs: [],
            setSongs: (songs) => set({ songs }),

            practiseBpm: 120,
            setPractiseBpm: (bpm) => set({ practiseBpm: bpm }),

            volumes: {
                midiPlayback: 0.8,
                metronome: 0.5,
                playbackDrums: 1.0,
                userInputDrums: 1.0,
                backingTrack: 0.7,
            },
            setVolume: (key, value) =>
                set((state) => ({
                    volumes: { ...state.volumes, [key]: value },
                })),

            performanceHistory: [],
            addPerformanceResult: (result) =>
                set((state) => ({
                    performanceHistory: [...state.performanceHistory, result],
                })),

            audioLatencyMs: 0,
            setAudioLatencyMs: (ms) => set({ audioLatencyMs: ms }),

            midiPermission: "unknown",
            setMidiPermission: (permission) =>
                set({ midiPermission: permission }),
            connectedMidiDevices: [],
            setConnectedMidiDevices: (devices) =>
                set({ connectedMidiDevices: devices }),
        }),
        {
            name: "beat-trainer-app",
            partialize: (state) => ({
                volumes: state.volumes,
                audioLatencyMs: state.audioLatencyMs,
            }),
        },
    ),
);
