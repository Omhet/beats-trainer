import { AudioManager } from "@/audio/AudioManager";
import { useAppStore } from "@/store/useAppStore";
import { NoteEvent } from "@/types/midi";
import { useCallback, useEffect } from "react";

export interface LoadSongOptions {
    notes: NoteEvent[];
    bpm: number;
    backingTrackUrl?: string;
    totalDuration?: number;
}

export function useAudio() {
    const volumes = useAppStore((s) => s.volumes);

    // Keep audio volumes in sync with store
    // Note: midiPlayback routed through sampler — no separate MIDI gain stage
    useEffect(() => {
        AudioManager.sampler.setVolume(volumes.userDrums);
        AudioManager.backing.setVolume(volumes.backingTrack);
        AudioManager.metronome.setVolume(volumes.metronome);
    }, [volumes]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            AudioManager.dispose();
        };
    }, []);

    const loadSong = useCallback(async (options: LoadSongOptions) => {
        await AudioManager.start(); // safe to call multiple times
        await AudioManager.loadSong(
            options.notes,
            options.bpm,
            "/assets/samples/drums",
            options.backingTrackUrl,
            options.totalDuration,
        );
    }, []);

    const play = useCallback(async () => {
        await AudioManager.start();
        AudioManager.play();
    }, []);

    const pause = useCallback(() => {
        AudioManager.pause();
    }, []);

    const reset = useCallback(() => {
        AudioManager.reset();
    }, []);

    return { loadSong, play, pause, reset };
}
