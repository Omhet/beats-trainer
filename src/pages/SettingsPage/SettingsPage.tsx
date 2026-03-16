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
