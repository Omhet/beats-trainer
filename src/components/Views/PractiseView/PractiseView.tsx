import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePractise } from "@/hooks/usePractise";
import { PhaserApp } from "@/PhaserApp";
import { useAppStore } from "@/store/useAppStore";
import { PractiseControls } from "./PractiseControls";
import styles from "./PractiseView.module.css";

export function PractiseView() {
    const { isPlaying, togglePlay } = usePractise();
    const songs = useAppStore((s) => s.songs);
    const selectedSongId = useAppStore((s) => s.selectedSongId);
    const selectedSection = useAppStore((s) => s.selectedSection);
    const volumes = useAppStore((s) => s.volumes);
    const metronomeEnabled = useAppStore((s) => s.metronomeEnabled);
    const toggleMetronome = useAppStore((s) => s.toggleMetronome);
    const setVolume = useAppStore((s) => s.setVolume);

    const song = songs.find((s) => s.id === selectedSongId);

    useKeyboardShortcuts({ onPlayPause: togglePlay });

    return (
        <div className={styles.container}>
            <div className={styles.canvasWrapper}>
                <PhaserApp />
            </div>
            <PractiseControls
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                metronomeEnabled={metronomeEnabled}
                onToggleMetronome={toggleMetronome}
                volumes={{
                    metronome: volumes.metronome,
                    userDrums: volumes.userDrums,
                    backingTrack: volumes.backingTrack,
                }}
                onVolumeChange={(key, value) => setVolume(key, value)}
                showBackingTrack={song?.hasDrumlessTrack ?? false}
                songTitle={song?.title ?? ""}
                sectionName={selectedSection ?? "Full Song"}
            />
        </div>
    );
}
