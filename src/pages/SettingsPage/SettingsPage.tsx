import { AudioManager } from "@/audio/AudioManager";
import { useAudio } from "@/hooks/useAudio";
import { ConnectedMidiDevice, useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DeviceAccordion } from "./DeviceAccordion";
import { MidiPermissionBanner } from "./MidiPermissionBanner";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
    const navigate = useNavigate();
    const connectedMidiDevices = useAppStore((s) => s.connectedMidiDevices);
    const audioLatencyMs = useAppStore((s) => s.audioLatencyMs);
    const setAudioLatencyMs = useAppStore((s) => s.setAudioLatencyMs);
    useAudio(); // Synchronizes volumes

    useEffect(() => {
        // Ensure samples are loaded for user input even if no song is loaded
        if (!AudioManager.userInputSampler.isLoaded) {
            AudioManager.userInputSampler
                .load("/assets/samples/drums")
                .catch((err) => {
                    console.warn("Failed to load samples in SettingsPage", err);
                });
        }
    }, []);

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={handleBack}>
                    ← Back
                </button>
                <h1 className={styles.title}>Settings</h1>
            </header>

            <main className={styles.content}>
                <MidiPermissionBanner />

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        Latency Compensation
                    </h2>
                    <div className={styles.latencyCard}>
                        <div className={styles.latencyRow}>
                            <label className={styles.latencyLabel}>
                                Audio Output Offset
                            </label>
                            <div className={styles.latencyControls}>
                                <input
                                    type="range"
                                    min={-300}
                                    max={300}
                                    step={1}
                                    value={audioLatencyMs}
                                    onChange={(e) =>
                                        setAudioLatencyMs(
                                            Number(e.target.value),
                                        )
                                    }
                                    className={styles.latencySlider}
                                />
                                <span className={styles.latencyValue}>
                                    {audioLatencyMs} ms
                                </span>
                            </div>
                        </div>
                        <p className={styles.latencyHint}>
                            Adjusts when notes are considered a hit and how the
                            scroll aligns with what you hear.
                            <br />
                            <strong>Negative</strong> (e.g. −20 to −80 ms) —
                            notes arrive visually earlier; use this when the
                            track feels ahead of the beat you hear.
                            <br />
                            <strong>Positive</strong> (e.g. +20 to +80 ms) —
                            notes arrive visually later; use this when you feel
                            you&apos;re hitting too early.
                            <br />
                            Start around −40 ms and nudge by ±10 ms until hits
                            feel natural. Bluetooth headphones may need −150 ms
                            or more.
                        </p>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        Connected MIDI Devices
                    </h2>
                    {connectedMidiDevices.length === 0 ? (
                        <p className={styles.emptyState}>
                            No MIDI devices connected. Plug in a device and it
                            will appear here.
                        </p>
                    ) : (
                        <DeviceAccordion
                            devices={
                                connectedMidiDevices as ConnectedMidiDevice[]
                            }
                        />
                    )}
                </section>
            </main>
        </div>
    );
}
