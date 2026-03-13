import { useAppStore } from "@/store/useAppStore";
import { WebMidi } from "webmidi";
import styles from "./MidiPermissionBanner.module.css";

export function MidiPermissionBanner() {
    const midiPermission = useAppStore((s) => s.midiPermission);
    const setMidiPermission = useAppStore((s) => s.setMidiPermission);

    if (midiPermission !== "denied") return null;

    function handleGrant() {
        WebMidi.enable()
            .then(() => setMidiPermission("granted"))
            .catch(() => setMidiPermission("denied"));
    }

    return (
        <div className={styles.banner} role="alert">
            <p className={styles.title}>⚠ MIDI Access Denied</p>
            <p className={styles.message}>
                This browser has denied MIDI device access. To use your drum
                pads, grant MIDI access permission and reload the page.
            </p>
            <button className={styles.grantBtn} onClick={handleGrant}>
                Grant MIDI Access
            </button>
        </div>
    );
}

