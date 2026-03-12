import { SongIndexEntry } from "@/types/song";

/**
 * Loads the song index from the public assets.
 * @returns A promise that resolves to an array of SongIndexEntry objects.
 * @throws An error if the fetch fails or the response is not valid JSON.
 */
export async function loadSongIndex(): Promise<SongIndexEntry[]> {
    const response = await fetch("/assets/songs/index.json");
    if (!response.ok) {
        throw new Error(
            `Failed to load song index: ${response.status} ${response.statusText}`,
        );
    }
    return response.json();
}

/**
 * Loads a MIDI file for a specific song and optionally a section.
 * @param songId The ID of the song (folder name).
 * @param section Optional section name.
 * @returns A promise that resolves to an ArrayBuffer containing the MIDI data.
 * @throws An error if the fetch fails.
 */
export async function loadSongMidi(
    songId: string,
    section?: string,
): Promise<ArrayBuffer> {
    const url = section
        ? `/assets/songs/${songId}/sections/${section}.mid`
        : `/assets/songs/${songId}/full.mid`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `Failed to load MIDI for song ${songId}${section ? ` section ${section}` : ""}: ${response.status} ${response.statusText}`,
        );
    }
    return response.arrayBuffer();
}
