import { EventBus } from "@/phaser/EventBus";
import { TablatureRenderer } from "@/phaser/renderers/TablatureRenderer";
import { AppEvent } from "@/phaser/types/events";
import { NoteEvent } from "@/types/midi";
import { Scene } from "phaser";
import * as Tone from "tone";

export class TablatureScene extends Scene {
    private tabRenderer!: TablatureRenderer;
    private notes: NoteEvent[] = [];
    private bpm = 120;
    private ready = false;
    private isPlaying = false;

    // Store handler references for targeted EventBus cleanup
    private onLoadTablature = (payload: {
        notes: NoteEvent[];
        bpm: number;
    }) => {
        this.notes = payload.notes;
        this.bpm = payload.bpm;
        this.isPlaying = false;
        this.tabRenderer.loadNotes(payload.notes, payload.bpm);
        this.tabRenderer.renderStaticLayer();
        this.ready = true;
    };
    private onTabPlay = () => {
        this.isPlaying = true;
    };
    private onTabPause = () => {
        this.isPlaying = false;
    };
    private onTabReset = () => {
        this.tabRenderer.clearUserHits();
    };
    private onMidiInputNote = (payload: {
        pitch: number;
        velocity: number;
        time: number;
    }) => {
        this.tabRenderer.recordUserHit(
            payload.pitch,
            Tone.getTransport().seconds,
            this.isPlaying,
        );
    };

    constructor() {
        super("TablatureScene");
    }

    create() {
        this.tabRenderer = new TablatureRenderer(this);

        const eventHandlers = [
            [AppEvent.LOAD_TABLATURE, this.onLoadTablature],
            [AppEvent.TAB_PLAY, this.onTabPlay],
            [AppEvent.TAB_PAUSE, this.onTabPause],
            [AppEvent.TAB_RESET, this.onTabReset],
            [AppEvent.MIDI_INPUT_NOTE, this.onMidiInputNote],
        ] as const;

        eventHandlers.forEach(([event, handler]) => {
            EventBus.on(event, handler);
        });

        // Handle canvas resize: re-render static layer
        const onResize = () => {
            if (this.ready) {
                this.tabRenderer.resize();
            }
        };
        this.scale.on("resize", onResize);

        this.events.once("shutdown", () => {
            eventHandlers.forEach(([event, handler]) => {
                EventBus.off(event, handler);
            });
            this.scale.off("resize", onResize);
        });

        EventBus.emit(AppEvent.CURRENT_SCENE_READY, this as any);
    }

    update() {
        if (!this.ready) return;
        const currentTime = Tone.getTransport().seconds;
        this.tabRenderer.render(currentTime);
    }
}
