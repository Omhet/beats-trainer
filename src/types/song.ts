export interface SongMeta {
    title: string;
    artist: string;
    genre: string;
    bpm: number;
}

export interface SongIndexEntry extends SongMeta {
    id: string; // folder name, e.g. "demo_song"
    path: string; // relative path under /assets/songs/, e.g. "demo_song"
    sections: string[]; // section names without extension, e.g. ["verse_1", "chorus"]
    hasDrumlessTrack: boolean;
}
