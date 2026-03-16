import { AudioManager } from "@/audio/AudioManager";
import { useAudio } from "@/hooks/useAudio";
import { ConnectedMidiDevice, useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeviceAccordion } from "./DeviceAccordion";
import { MidiPermissionBanner } from "./MidiPermissionBanner";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
    const navigate = useNavigate();
    const connectedMidiDevices = useAppStore((s) => s.connectedMidiDevices);
    const audioLatencyMs = useAppStore((s) => s.audioLatencyMs);
    const setAudioLatencyMs = useAppStore((s) => s.setAudioLatencyMs);
    const [detectedLatencyMs, setDetectedLatencyMs] = useState<number | null>(
        null,
    );
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

    useEffect(() => {
        // Read browser-reported output latency after AudioManager has started.
        // If the user hasn't manually set a value yet (still at default 0),
        // auto-apply the detected value as a sensible starting point.
        const ms = AudioManager.getOutputLatencyMs();
        if (ms > 0) {
            const rounded = Math.round(ms);
            setDetectedLatencyMs(rounded);
            if (audioLatencyMs === 0) {
                setAudioLatencyMs(rounded);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        {detectedLatencyMs !== null && (
                            <div className={styles.latencyDetected}>
                                <span>
                                    Browser-reported output latency:{" "}
                                    <strong>{detectedLatencyMs} ms</strong>
                                </span>
                                <button
                                    className={styles.latencyAutoBtn}
                                    onClick={() =>
                                        setAudioLatencyMs(detectedLatencyMs)
                                    }
                                >
                                    Use detected value
                                </button>
                            </div>
                        )}
                        <p className={styles.latencyHint}>
                            Positive values delay the visual scroll and shift
                            the hit window later, compensating for audio output
                            lag. Start with the detected value and fine-tune by
                            ear.
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
