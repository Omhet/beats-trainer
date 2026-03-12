import { AudioManager } from "@/audio/AudioManager";
import { useAppStore } from "@/store/useAppStore";
import { NoteEvent } from "@/types/midi";
import { useCallback, useEffect } from "react";

export interface LoadSongOptions {
    notes: NoteEvent[];
    bpm: number;
    backingTrackUrl?: string;
}

export function useAudio() {
    const volumes = useAppStore((s) => s.volumes);
    const metronomeEnabled = useAppStore((s) => s.metronomeEnabled);

    // Keep audio volumes in sync with store
    // Note: midiPlayback routed through sampler — no separate MIDI gain stage
    useEffect(() => {
        AudioManager.sampler.setVolume(volumes.userDrums);
        AudioManager.backing.setVolume(volumes.backingTrack);
    }, [volumes]);

    useEffect(() => {
        AudioManager.metronome.setVolume(
            metronomeEnabled ? volumes.metronome : 0,
        );
    }, [metronomeEnabled, volumes.metronome]);

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
        );
    }, []);

    const play = useCallback(async () => {
        await AudioManager.start();
        AudioManager.play();
    }, []);

    const pause = useCallback(() => {
        AudioManager.pause();
    }, []);

    return { loadSong, play, pause };
}
