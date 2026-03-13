import { KEYBOARD_SHORTCUTS } from "@/constants/keyboardShortcuts";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

interface Options {
    onPlayPause: () => void;
}

export function useKeyboardShortcuts({ onPlayPause }: Options) {
    const toggleMetronome = useAppStore((s) => s.toggleMetronome);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Ignore shortcuts when typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return;

            switch (e.key) {
                case KEYBOARD_SHORTCUTS.PLAY_PAUSE:
                    e.preventDefault();
                    onPlayPause();
                    break;
                case KEYBOARD_SHORTCUTS.METRONOME_TOGGLE:
                    toggleMetronome();
                    break;
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onPlayPause, toggleMetronome]);
}
