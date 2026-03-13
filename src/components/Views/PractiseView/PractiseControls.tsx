import React, { useEffect, useState } from "react";
import styles from "./PractiseControls.module.css";

interface PractiseControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onReset: () => void;
    volumes: {
        metronome: number;
        userDrums: number;
        backingTrack: number;
    };
    onVolumeChange: (
        key: "metronome" | "userDrums" | "backingTrack",
        value: number,
    ) => void;
    showBackingTrack: boolean;
    songTitle: string;
    sectionName: string;
    bpm: number;
    onBpmChange: (bpm: number) => void;
}

export const PractiseControls: React.FC<PractiseControlsProps> = ({
    isPlaying,
    onTogglePlay,
    onReset,
    volumes,
    onVolumeChange,
    showBackingTrack,
    songTitle,
    sectionName,
    bpm,
    onBpmChange,
}) => {
    const [bpmInput, setBpmInput] = useState(String(bpm));

    // Keep local input in sync when the store BPM changes externally (e.g. song change)
    useEffect(() => {
        setBpmInput(String(bpm));
    }, [bpm]);

    return (
        <div className={styles.controls}>
            <div className={styles.songInfo}>
                <div className={styles.title}>{songTitle}</div>
                <div className={styles.section}>{sectionName}</div>
                <div className={styles.bpmRow}>
                    <label>BPM</label>
                    <input
                        type="number"
                        min={40}
                        max={300}
                        step={1}
                        value={bpmInput}
                        onChange={(e) => {
                            setBpmInput(e.target.value);
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 40 && val <= 300) {
                                onBpmChange(val);
                            }
                        }}
                        className={styles.bpmInput}
                    />
                </div>
            </div>

            <div className={styles.mainAction}>
                <button className={styles.resetButton} onClick={onReset}>
                    RESET
                </button>
                <button className={styles.playButton} onClick={onTogglePlay}>
                    {isPlaying ? "PAUSE" : "PLAY"}
                </button>
            </div>

            <div className={styles.settings}>
                <div className={styles.volumes}>
                    <div className={styles.volumeRow}>
                        <label>Metronome</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volumes.metronome}
                            onChange={(e) =>
                                onVolumeChange(
                                    "metronome",
                                    parseFloat(e.target.value),
                                )
                            }
                        />
                    </div>
                    <div className={styles.volumeRow}>
                        <label>Drums</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volumes.userDrums}
                            onChange={(e) =>
                                onVolumeChange(
                                    "userDrums",
                                    parseFloat(e.target.value),
                                )
                            }
                        />
                    </div>
                    {showBackingTrack && (
                        <div className={styles.volumeRow}>
                            <label>Track</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volumes.backingTrack}
                                onChange={(e) =>
                                    onVolumeChange(
                                        "backingTrack",
                                        parseFloat(e.target.value),
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
