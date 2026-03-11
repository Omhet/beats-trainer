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
