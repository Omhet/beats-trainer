import { useAudio } from "@/hooks/useAudio";
import { EventBus } from "@/phaser/EventBus";
import { AppEvent } from "@/phaser/types/events";
import { useAppStore } from "@/store/useAppStore";
import { parseMidi } from "@/utils/midiParser";
import { loadSongMidi } from "@/utils/songLoader";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePractise() {
    const selectedSongId = useAppStore((s) => s.selectedSongId);
    const selectedSection = useAppStore((s) => s.selectedSection);
    const songs = useAppStore((s) => s.songs);
    const { loadSong, play, pause } = useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const isPlayingRef = useRef(false);

    // Keep ref in sync for use in callbacks
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Load song whenever selection changes
    useEffect(() => {
        if (!selectedSongId) return;

        const song = songs.find((s) => s.id === selectedSongId);
        if (!song) return;

        let cancelled = false;

        const load = async () => {
            try {
                const buffer = await loadSongMidi(
                    selectedSongId,
                    selectedSection ?? undefined,
                );
                if (cancelled) return;

                const notes = parseMidi(buffer);
                const totalDuration =
                    notes.length > 0 ? notes[notes.length - 1].time + 0.5 : 0;

                await loadSong({
                    notes,
                    bpm: song.bpm,
                    backingTrackUrl: song.hasDrumlessTrack
                        ? `/assets/songs/${selectedSongId}/drumless.mp3`
                        : undefined,
                });
                if (cancelled) return;

                EventBus.emit(AppEvent.LOAD_TABLATURE, {
                    notes,
                    bpm: song.bpm,
                    totalDuration,
                });
                setIsPlaying(false);
            } catch (err) {
                console.error("usePractise: failed to load song", err);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [selectedSongId, selectedSection, songs, loadSong]);

    const togglePlay = useCallback(async () => {
        if (isPlayingRef.current) {
            pause();
            EventBus.emit(AppEvent.TAB_PAUSE);
            setIsPlaying(false);
        } else {
            await play();
            EventBus.emit(AppEvent.TAB_PLAY);
            setIsPlaying(true);
        }
    }, [play, pause]);

    return { isPlaying, togglePlay };
}
