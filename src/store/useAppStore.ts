import { PerformanceResult } from "@/types/performance";
import { SongIndexEntry } from "@/types/song";
import { create } from "zustand";

interface Volumes {
    midiPlayback: number; // 0-1
    metronome: number; // 0-1
    userDrums: number; // 0-1
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
}

export const useAppStore = create<AppState>((set) => ({
    songs: [],
    setSongs: (songs) => set({ songs }),

    practiseBpm: 120,
    setPractiseBpm: (bpm) => set({ practiseBpm: bpm }),

    volumes: {
        midiPlayback: 0.8,
        metronome: 0.5,
        userDrums: 1.0,
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
}));
