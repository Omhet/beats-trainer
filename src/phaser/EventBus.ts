import type { EventPayloads, TypedEventBus } from "@/phaser/types/events";
import { AppEvent } from "@/phaser/types/events";
import { Events } from "phaser";

/**
 * Type-safe EventBus for communication between React components and Phaser scenes.
 *
 * Usage:
 * - Emit events: EventBus.emit(AppEvent.GOLD_UPDATED, { gold: 100 });
 * - Listen to events: EventBus.on(AppEvent.GOLD_UPDATED, (data) => console.log(data.gold));
 * - Remove listeners: EventBus.off(AppEvent.GOLD_UPDATED, handler);
 *
 * All event names are defined in AppEvent enum for type safety and autocomplete.
 */
class TypedEventBusImpl extends Events.EventEmitter implements TypedEventBus {
    private currentScene: any = null;

    emit<E extends AppEvent>(
        event: E,
        ...args: EventPayloads[E] extends void ? [] : [EventPayloads[E]]
    ): boolean {
        // Store the scene when CURRENT_SCENE_READY is emitted
        if (event === AppEvent.CURRENT_SCENE_READY && args[0]) {
            this.currentScene = args[0];
        }
        return super.emit(event, ...args);
    }

    getCurrentScene(): any {
        return this.currentScene;
    }

    on<E extends AppEvent>(
        event: E,
        fn: EventPayloads[E] extends void
            ? () => void
            : (data: EventPayloads[E]) => void,
        context?: any,
    ): this {
        return super.on(event, fn, context);
    }

    off<E extends AppEvent>(
        event: E,
        fn?: EventPayloads[E] extends void
            ? () => void
            : (data: EventPayloads[E]) => void,
        context?: any,
    ): this {
        return super.off(event, fn, context);
    }

    once<E extends AppEvent>(
        event: E,
        fn: EventPayloads[E] extends void
            ? () => void
            : (data: EventPayloads[E]) => void,
        context?: any,
    ): this {
        return super.once(event, fn, context);
    }
}

export const EventBus = new TypedEventBusImpl() as TypedEventBus;
