import { KEYBOARD_SHORTCUTS } from "@/constants/keyboardShortcuts";
import { useEffect } from "react";

interface Options {
    onPlayPause: () => void;
}

export function useKeyboardShortcuts({ onPlayPause }: Options) {
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
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onPlayPause]);
}
