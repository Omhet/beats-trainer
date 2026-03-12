import { Midi } from "@tonejs/midi";
import * as fs from "fs";
import * as path from "path";

async function createDemoMidi() {
    const midi = new Midi();
    const track = midi.addTrack();

    // 120 BPM is default if not set, but let's be explicit
    midi.header.setTempo(120);

    // 4 bars of a simple rock beat
    // Kick: 36, Snare: 38, Hi-Hat: 42

    for (let bar = 0; bar < 4; bar++) {
        for (let beat = 0; beat < 4; beat++) {
            // Kick on 1 and 3
            if (beat === 0 || beat === 2) {
                track.addNote({
                    midi: 36,
                    time: (bar * 4 + beat) * 0.5,
                    duration: 0.1,
                    velocity: 0.8,
                });
            }

            // Snare on 2 and 4
            if (beat === 1 || beat === 3) {
                track.addNote({
                    midi: 38,
                    time: (bar * 4 + beat) * 0.5,
                    duration: 0.1,
                    velocity: 0.9,
                });
            }

            // Hi-hat on every 8th note
            track.addNote({
                midi: 42,
                time: (bar * 4 + beat) * 0.5,
                duration: 0.05,
                velocity: 0.6,
            });
            track.addNote({
                midi: 42,
                time: (bar * 4 + beat + 0.5) * 0.5,
                duration: 0.05,
                velocity: 0.5,
            });
        }
    }

    const outputDir = path.join(process.cwd(), "public/assets/songs/demo_song");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(outputDir, "full.mid"),
        Buffer.from(midi.toArray()),
    );
    console.log("Created demo MIDI at public/assets/songs/demo_song/full.mid");
}

createDemoMidi().catch(console.error);
