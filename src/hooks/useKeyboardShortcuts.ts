import { KEYBOARD_SHORTCUTS } from "@/constants/keyboardShortcuts";
import { useEffect } from "react";

interface Options {
    onPlayPause: () => void;
    onReset: () => void;
}

export function useKeyboardShortcuts({ onPlayPause, onReset }: Options) {
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
                case KEYBOARD_SHORTCUTS.RESET:
                    e.preventDefault();
                    onReset();
                    break;
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onPlayPause, onReset]);
}
