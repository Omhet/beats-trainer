import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { EventBus } from "./phaser/EventBus";
import startPhaserApp from "./phaser/main";
import { AppEvent } from "./phaser/types/events";

export interface RefPhaserApp {
    phaserApp: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface PhaserAppProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserApp = forwardRef<RefPhaserApp, PhaserAppProps>(
    function PhaserApp({ currentActiveScene }, ref) {
        const phaserApp = useRef<Phaser.Game | null>(null!);

        useLayoutEffect(() => {
            if (phaserApp.current === null) {
                phaserApp.current = startPhaserApp("phaser-app-container");

                if (typeof ref === "function") {
                    ref({ phaserApp: phaserApp.current, scene: null });
                } else if (ref) {
                    ref.current = { phaserApp: phaserApp.current, scene: null };
                }
            }

            return () => {
                if (phaserApp.current) {
                    phaserApp.current.destroy(true);
                    if (phaserApp.current !== null) {
                        phaserApp.current = null;
                    }
                }
            };
        }, [ref]);

        useEffect(() => {
            EventBus.on(
                AppEvent.CURRENT_SCENE_READY,
                (scene_instance: Phaser.Scene) => {
                    if (
                        currentActiveScene &&
                        typeof currentActiveScene === "function"
                    ) {
                        currentActiveScene(scene_instance);
                    }

                    if (typeof ref === "function") {
                        ref({
                            phaserApp: phaserApp.current,
                            scene: scene_instance,
                        });
                    } else if (ref) {
                        ref.current = {
                            phaserApp: phaserApp.current,
                            scene: scene_instance,
                        };
                    }
                },
            );
            return () => {
                EventBus.off(AppEvent.CURRENT_SCENE_READY);
            };
        }, [currentActiveScene, ref]);

        return <div id="phaser-app-container"></div>;
    },
);
