import { useAppStore } from "@/store/useAppStore";
import styles from "./PractiseView.module.css";

export function PractiseView() {
    const selectedSongId = useAppStore((s) => s.selectedSongId);
    const selectedSection = useAppStore((s) => s.selectedSection);
    const songs = useAppStore((s) => s.songs);

    const selectedSong = songs.find((s) => s.id === selectedSongId);

    return (
        <div className={styles.container}>
            <h2 className={styles.songTitle}>
                Practise: {selectedSong?.title || selectedSongId}
            </h2>
            <p className={styles.sectionInfo}>
                Section: <strong>{selectedSection ?? "Full Song"}</strong>
            </p>
            <div className={styles.placeholder}>
                (Tablature coming in Phase 5)
            </div>
        </div>
    );
}
