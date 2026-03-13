import { PerformanceResult } from "@/types/performance";
import { SongIndexEntry } from "@/types/song";
import { create } from "zustand";

export enum SelectedView {
    Learn = "learn",
    Practise = "practise",
    Perform = "perform",
}

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
    selectedSongId: string | null;
    selectedView: SelectedView | null;
    selectedSection: string | null; // section name or null for full song
    practiseBpm: number;
    setSelectedSong: (id: string | null) => void;
    setSelectedView: (view: SelectedView | null) => void;
    setSelectedSection: (section: string | null) => void;
    setPractiseBpm: (bpm: number) => void;

    // Audio volumes
    volumes: Volumes;
    setVolume: (key: keyof Volumes, value: number) => void;
    metronomeEnabled: boolean;
    toggleMetronome: () => void;

    // Sidebar
    sidebarOpen: boolean;
    toggleSidebar: () => void;

    // Performance history
    performanceHistory: PerformanceResult[];
    addPerformanceResult: (result: PerformanceResult) => void;
}

export const useAppStore = create<AppState>((set) => ({
    songs: [],
    setSongs: (songs) => set({ songs }),

    selectedSongId: null,
    selectedView: null,
    selectedSection: null,
    practiseBpm: 120,
    setSelectedSong: (id) => set({ selectedSongId: id, selectedSection: null }),
    setSelectedView: (view) => set({ selectedView: view }),
    setSelectedSection: (section) => set({ selectedSection: section }),
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

    metronomeEnabled: true,
    toggleMetronome: () =>
        set((state) => ({ metronomeEnabled: !state.metronomeEnabled })),

    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    performanceHistory: [],
    addPerformanceResult: (result) =>
        set((state) => ({
            performanceHistory: [...state.performanceHistory, result],
        })),
}));
