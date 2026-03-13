import { AudioManager } from "@/audio/AudioManager";
import { useAudio } from "@/hooks/useAudio";
import { useNavState } from "@/hooks/useNavState";
import { EventBus } from "@/phaser/EventBus";
import { AppEvent } from "@/phaser/types/events";
import { useAppStore } from "@/store/useAppStore";
import { NoteEvent } from "@/types/midi";
import { parseMidi } from "@/utils/midiParser";
import { loadSongMidi } from "@/utils/songLoader";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePractise() {
    const { songId, section } = useNavState();
    const songs = useAppStore((s) => s.songs);
    const practiseBpm = useAppStore((s) => s.practiseBpm);
    const setPractiseBpm = useAppStore((s) => s.setPractiseBpm);
    const { loadSong, play, pause, reset: audioReset } = useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const [parsedNotes, setParsedNotes] = useState<NoteEvent[] | null>(null);
    const isPlayingRef = useRef(false);

    // Keep ref in sync
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Effect 1: song changes → fetch + parse + reset BPM to song default
    useEffect(() => {
        if (!songId) return;
        const song = songs.find((s) => s.id === songId);
        if (!song) return;

        let cancelled = false;

        const fetchAndParse = async () => {
            try {
                const buffer = await loadSongMidi(songId, section ?? undefined);
                if (cancelled) return;
                const notes = parseMidi(buffer);
                setParsedNotes(notes);
                setPractiseBpm(song.bpm);
                // Stop playback when song changes
                if (isPlayingRef.current) {
                    pause();
                    EventBus.emit(AppEvent.TAB_PAUSE);
                    setIsPlaying(false);
                }
            } catch (err) {
                console.error("usePractise: failed to load song", err);
            }
        };

        fetchAndParse();
        return () => {
            cancelled = true;
        };
    }, [songId, section, songs, setPractiseBpm, pause]);

    // Effect 2: notes or BPM change → reload audio + Phaser (stop + reset)
    useEffect(() => {
        if (!parsedNotes || !songId) return;
        const song = songs.find((s) => s.id === songId);
        if (!song) return;

        const secondsPerBeat = 60 / practiseBpm;

        // Stop playback and reset
        if (isPlayingRef.current) {
            pause();
            EventBus.emit(AppEvent.TAB_PAUSE);
            setIsPlaying(false);
        }
        // Seek to start
        AudioManager.seek(0);

        loadSong({
            notes: parsedNotes,
            bpm: practiseBpm,
            backingTrackUrl: song.hasDrumlessTrack
                ? `/assets/songs/${songId}/drumless.mp3`
                : undefined,
        }).catch((err) =>
            console.error("usePractise: failed to reload song at new BPM", err),
        );

        EventBus.emit(AppEvent.LOAD_TABLATURE, {
            notes: parsedNotes,
            bpm: practiseBpm,
        });
    }, [parsedNotes, practiseBpm, songId, songs, loadSong, pause]);

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

    const resetPlayback = useCallback(() => {
        audioReset();
        EventBus.emit(AppEvent.TAB_PAUSE);
        EventBus.emit(AppEvent.TAB_RESET);
        setIsPlaying(false);
    }, [audioReset]);

    // Effect 3: when track ends, behave as if user pressed Reset then Play
    useEffect(() => {
        const handleTrackEnd = async () => {
            resetPlayback();
            await play();
            EventBus.emit(AppEvent.TAB_PLAY);
            setIsPlaying(true);
        };
        EventBus.on(AppEvent.TRACK_END, handleTrackEnd);
        return () => {
            EventBus.off(AppEvent.TRACK_END, handleTrackEnd);
        };
    }, [resetPlayback, play]);

    return { isPlaying, togglePlay, resetPlayback };
}
