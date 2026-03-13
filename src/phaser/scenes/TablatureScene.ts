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

        EventBus.on(AppEvent.LOAD_TABLATURE, this.onLoadTablature);
        EventBus.on(AppEvent.TAB_PLAY, this.onTabPlay);
        EventBus.on(AppEvent.TAB_PAUSE, this.onTabPause);
        EventBus.on(AppEvent.TAB_RESET, this.onTabReset);
        EventBus.on(AppEvent.MIDI_INPUT_NOTE, this.onMidiInputNote);

        // Handle canvas resize: re-render static layer
        this.scale.on("resize", () => {
            if (this.ready) {
                this.tabRenderer.resize();
                this.tabRenderer.renderStaticLayer();
            }
        });

        EventBus.emit(AppEvent.CURRENT_SCENE_READY, this as any);
    }

    update() {
        if (!this.ready) return;
        const currentTime = Tone.getTransport().seconds;
        this.tabRenderer.render(currentTime);
    }

    shutdown() {
        EventBus.off(AppEvent.LOAD_TABLATURE, this.onLoadTablature);
        EventBus.off(AppEvent.TAB_PLAY, this.onTabPlay);
        EventBus.off(AppEvent.TAB_PAUSE, this.onTabPause);
        EventBus.off(AppEvent.TAB_RESET, this.onTabReset);
        EventBus.off(AppEvent.MIDI_INPUT_NOTE, this.onMidiInputNote);
    }
}
