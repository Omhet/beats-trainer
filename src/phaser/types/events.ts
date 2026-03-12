import { NoteEvent } from "@/types/midi";

/**
 * Centralized app event definitions.
 * All EventBus communications should use these typed event constants.
 */
export enum AppEvent {
    // ============================================================================
    // COMMANDS (React → Phaser)
    // User actions from UI that trigger app logic
    // ============================================================================

    // Will be added as needed

    // ============================================================================
    // UI CONTROL (Bidirectional)
    // Modal and UI state management
    // ============================================================================

    /** Open a specific modal with optional data */
    OPEN_MODAL = "open-modal",

    /** Close the currently open modal */
    CLOSE_MODAL = "close-modal",

    // ============================================================================
    // SCENE LIFECYCLE (Phaser → React)
    // Communication about Phaser scene state
    // ============================================================================

    /** Phaser scene is initialized and ready for interaction */
    CURRENT_SCENE_READY = "current-scene-ready",

    SCENE_SWITCH = "scene-switch",
    LOAD_TABLATURE = "load-tablature",
    TAB_PLAY = "tab-play",
    TAB_PAUSE = "tab-pause",
    MIDI_INPUT_NOTE = "midi-input-note",
}

/**
 * Type definitions for event payloads.
 * Each event in AppEvent enum must have a corresponding payload type.
 */
export interface EventPayloads {
    // UI control payloads
    [AppEvent.OPEN_MODAL]: {
        type: "confirmation";
        props?: any;
    };
    [AppEvent.CLOSE_MODAL]: void;

    [AppEvent.SCENE_SWITCH]: { sceneName: string };
    [AppEvent.LOAD_TABLATURE]: {
        notes: NoteEvent[];
        bpm: number;
        totalDuration: number;
    };
    [AppEvent.TAB_PLAY]: void;
    [AppEvent.TAB_PAUSE]: void;
    [AppEvent.MIDI_INPUT_NOTE]: {
        pitch: number;
        velocity: number;
        time: number;
    };
    // Scene lifecycle payloads
    [AppEvent.CURRENT_SCENE_READY]: Phaser.Scene;
}

/**
 * Type-safe EventBus interface.
 * Provides compile-time type checking for event names and payloads.
 */
export interface TypedEventBus {
    /**
     * Emit a typed event with payload.
     * @example EventBus.emit(AppEvent.GOLD_UPDATED, { gold: 100 });
     */
    emit<E extends AppEvent>(
        event: E,
        ...args: EventPayloads[E] extends void ? [] : [EventPayloads[E]]
    ): boolean;

    /**
     * Subscribe to a typed event.
     * @example EventBus.on(AppEvent.GOLD_UPDATED, (data) => { console.log(data.gold); });
     */
    on<E extends AppEvent>(
        event: E,
        fn: EventPayloads[E] extends void
            ? () => void
            : (data: EventPayloads[E]) => void,
        context?: any,
    ): TypedEventBus;

    /**
     * Unsubscribe from a typed event.
     * @example EventBus.off(AppEvent.GOLD_UPDATED, handler);
     */
    off<E extends AppEvent>(
        event: E,
        fn?: EventPayloads[E] extends void
            ? () => void
            : (data: EventPayloads[E]) => void,
        context?: any,
    ): TypedEventBus;

    /**
     * Subscribe to a typed event once.
     * @example EventBus.once(AppEvent.CURRENT_SCENE_READY, (scene) => { console.log('Ready!'); });
     */
    once<E extends AppEvent>(
        event: E,
        fn: EventPayloads[E] extends void
            ? () => void
            : (data: EventPayloads[E]) => void,
        context?: any,
    ): TypedEventBus;
}
