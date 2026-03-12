import { useAppStore } from "@/store/useAppStore";
import { loadSongIndex } from "@/utils/songLoader";
import { useEffect } from "react";

/**
 * Hook to manage song loading into the global store.
 * Returns the current list of songs.
 */
export function useSongs() {
    const songs = useAppStore((s) => s.songs);
    const setSongs = useAppStore((s) => s.setSongs);

    useEffect(() => {
        if (songs.length > 0) return; // already loaded

        loadSongIndex()
            .then(setSongs)
            .catch((err) => console.error("Failed to load song index:", err));
    }, [songs.length, setSongs]);

    return songs;
}
