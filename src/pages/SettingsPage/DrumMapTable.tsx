import { DRUM_DEFINITION, DRUM_ORDER } from "@/constants/drumMapping";
import { useMidiStore } from "@/store/useMidiStore";
import { useMemo } from "react";
import styles from "./DrumMapTable.module.css";

interface Props {
    deviceId: string;
    deviceName: string;
}

/** Entries sorted by DRUM_ORDER; within same label, lower pitch first (closed before open Hi-Hat). */
const SORTED_ENTRIES = Object.entries(DRUM_DEFINITION)
    .map(([pitchStr, info]) => ({ pitch: Number(pitchStr), info }))
    .sort((a, b) => {
        const ai = DRUM_ORDER.indexOf(a.info.label);
        const bi = DRUM_ORDER.indexOf(b.info.label);
        if (ai !== bi) return ai - bi;
        return a.pitch - b.pitch;
    });

function getDisplayLabel(pitch: number): string {
    const info = DRUM_DEFINITION[pitch];
    if (!info) return `Note ${pitch}`;
    if (info.sampleFile.includes("closed")) return `${info.label} (Closed)`;
    if (info.sampleFile.includes("open")) return `${info.label} (Open)`;
    return info.label;
}

export function DrumMapTable({ deviceId, deviceName }: Props) {
    const deviceOverrides = useMidiStore((s) => s.deviceMaps[deviceId]);
    const getEffectiveMap = useMidiStore((s) => s.getEffectiveMap);
    const learnTarget = useMidiStore((s) => s.learnTarget);
    const startLearn = useMidiStore((s) => s.startLearn);
    const stopLearn = useMidiStore((s) => s.stopLearn);
    const removeDeviceNoteMapping = useMidiStore(
        (s) => s.removeDeviceNoteMapping,
    );

    // Build map: standardPitch → Array of deviceNotes, recomputed when overrides change
    const reverseMapGroups = useMemo<Record<number, number[]>>(() => {
        const effectiveMap = getEffectiveMap(deviceId, deviceName);
        const groups: Record<number, number[]> = {};
        for (const [deviceNoteStr, standardPitch] of Object.entries(
            effectiveMap,
        )) {
            const pitch = standardPitch as number;
            const note = Number(deviceNoteStr);
            if (!groups[pitch]) groups[pitch] = [];
            groups[pitch].push(note);
        }
        // Ensure notes are sorted
        for (const pitch in groups) {
            groups[pitch].sort((a, b) => a - b);
        }
        return groups;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId, deviceName, deviceOverrides, getEffectiveMap]);

    return (
        <table className={styles.table}>
            <thead>
                <tr className={styles.headRow}>
                    <th className={styles.th}>Drum</th>
                    <th className={styles.th}>MIDI Notes</th>
                    <th className={styles.th}></th>
                </tr>
            </thead>
            <tbody>
                {SORTED_ENTRIES.map(({ pitch, info }) => {
                    const isLearning =
                        learnTarget?.deviceId === deviceId &&
                        learnTarget?.standardPitch === pitch;
                    const mappedNotes = reverseMapGroups[pitch] ?? [];

                    return (
                        <tr
                            key={pitch}
                            className={`${styles.row} ${isLearning ? styles.rowLearning : ""}`}
                        >
                            <td className={styles.cell}>
                                <span
                                    className={styles.colorDot}
                                    style={{ backgroundColor: info.color }}
                                />
                                {getDisplayLabel(pitch)}
                            </td>
                            <td className={`${styles.cell} ${styles.noteCell}`}>
                                {mappedNotes.map((note) => (
                                    <span key={note} className={styles.noteTag}>
                                        {note}
                                        <span
                                            className={styles.noteDelete}
                                            onClick={() =>
                                                removeDeviceNoteMapping(
                                                    deviceId,
                                                    note,
                                                )
                                            }
                                            title="Remove mapping"
                                        >
                                            ×
                                        </span>
                                    </span>
                                ))}
                            </td>
                            <td className={styles.cell}>
                                <button
                                    className={`${styles.learnBtn} ${isLearning ? styles.learnBtnActive : ""}`}
                                    onClick={() =>
                                        isLearning
                                            ? stopLearn()
                                            : startLearn(deviceId, pitch)
                                    }
                                >
                                    {isLearning ? "Listening…" : "Learn"}
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
