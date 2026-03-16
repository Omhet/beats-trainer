import { AudioManager } from "@/audio/AudioManager";
import { EventBus } from "@/phaser/EventBus";
import { AppEvent } from "@/phaser/types/events";
import { ConnectedMidiDevice, useAppStore } from "@/store/useAppStore";
import { useMidiStore } from "@/store/useMidiStore";
import { useEffect } from "react";
import * as Tone from "tone";
import { WebMidi } from "webmidi";

export function useMidiInput() {
    const setMidiPermission = useAppStore((s) => s.setMidiPermission);
    const setConnectedMidiDevices = useAppStore(
        (s) => s.setConnectedMidiDevices,
    );

    useEffect(() => {
        let enabled = false;

        function refreshDeviceList() {
            const devices: ConnectedMidiDevice[] = WebMidi.inputs.map(
                (input) => ({ id: input.id, name: input.name }),
            );
            setConnectedMidiDevices(devices);
        }

        function attachNoteListener(input: (typeof WebMidi.inputs)[number]) {
            input.addListener("noteon", (e) => {
                const deviceNote = e.note.number;
                const deviceId = input.id;
                const velocity = e.note.attack; // 0-1 in webmidi v3

                const {
                    learnTarget,
                    setDeviceNoteMapping,
                    stopLearn,
                    getEffectiveMap,
                } = useMidiStore.getState();

                // Learn mode: capture next note for remapping
                if (learnTarget !== null && learnTarget.deviceId === deviceId) {
                    const effectiveMap = getEffectiveMap(deviceId, input.name);

                    // If note is already mapped to the target, just stop (already unique)
                    if (
                        effectiveMap[deviceNote] === learnTarget.standardPitch
                    ) {
                        stopLearn();
                        return;
                    }

                    setDeviceNoteMapping(
                        deviceId,
                        deviceNote,
                        learnTarget.standardPitch,
                    );
                    stopLearn();
                    return;
                }

                // Normal mode: resolve through effective map and trigger audio
                const effectiveMap = getEffectiveMap(deviceId, input.name);
                const standardPitch = effectiveMap[deviceNote];

                // Only handle notes that map to a known drum sound
                if (standardPitch === undefined) return;

                AudioManager.userInputSampler.trigger(
                    standardPitch,
                    velocity,
                    Tone.immediate(),
                );

                EventBus.emit(AppEvent.MIDI_INPUT_NOTE, {
                    pitch: standardPitch,
                    velocity,
                    time: Tone.now(),
                });
            });
        }

        function onConnected(e: { port: (typeof WebMidi.inputs)[number] }) {
            // Small delay to let WebMidi register the input fully
            setTimeout(() => {
                attachNoteListener(e.port as (typeof WebMidi.inputs)[number]);
                refreshDeviceList();
            }, 100);
        }

        function onDisconnected() {
            refreshDeviceList();
        }

        WebMidi.enable()
            .then(() => {
                enabled = true;
                setMidiPermission("granted");

                // Attach listeners to already-connected devices
                for (const input of WebMidi.inputs) {
                    attachNoteListener(input);
                }
                refreshDeviceList();

                WebMidi.addListener("connected", onConnected);
                WebMidi.addListener("disconnected", onDisconnected);
            })
            .catch(() => {
                setMidiPermission("denied");
            });

        return () => {
            if (enabled) {
                WebMidi.removeListener("connected", onConnected);
                WebMidi.removeListener("disconnected", onDisconnected);
                // Remove all noteon listeners added by this hook
                for (const input of WebMidi.inputs) {
                    input.removeListener("noteon");
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
