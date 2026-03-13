import { PRESET_MAPS } from "@/constants/midiPresetMaps";
import { ConnectedMidiDevice } from "@/store/useAppStore";
import { useMidiStore } from "@/store/useMidiStore";
import * as Accordion from "@radix-ui/react-accordion";
import { useState } from "react";
import styles from "./DeviceAccordion.module.css";
import { DrumMapTable } from "./DrumMapTable";

interface Props {
    devices: ConnectedMidiDevice[];
}

function DeviceItem({ device }: { device: ConnectedMidiDevice }) {
    const importPreset = useMidiStore((s) => s.importPreset);
    const [selectedPreset, setSelectedPreset] = useState("");

    function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const preset = e.target.value;
        if (preset) {
            importPreset(device.id, preset);
        }
        setSelectedPreset("");
    }

    return (
        <Accordion.Item value={device.id} className={styles.item}>
            <Accordion.Header className={styles.itemHeader}>
                <Accordion.Trigger className={styles.trigger}>
                    <span>{device.name}</span>
                    <span className={styles.chevron}>▼</span>
                </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Content className={styles.content}>
                <div className={styles.presetRow}>
                    <span className={styles.presetLabel}>Apply preset:</span>
                    <select
                        className={styles.presetSelect}
                        value={selectedPreset}
                        onChange={handlePresetChange}
                    >
                        <option value="">— select —</option>
                        {Object.keys(PRESET_MAPS).map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <DrumMapTable deviceId={device.id} deviceName={device.name} />
            </Accordion.Content>
        </Accordion.Item>
    );
}

export function DeviceAccordion({ devices }: Props) {
    return (
        <Accordion.Root type="multiple" className={styles.root}>
            {devices.map((device) => (
                <DeviceItem key={device.id} device={device} />
            ))}
        </Accordion.Root>
    );
}

