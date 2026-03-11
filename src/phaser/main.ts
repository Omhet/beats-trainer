import { CONFIG } from "@/phaser/config";
import { MainScene } from "@/phaser/scenes/MainScene";
import { AUTO, Game, Scale } from "phaser";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: "phaser-app-container",
    backgroundColor: CONFIG.backgroundColor,
    scene: [MainScene],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
    scale: {
        mode: Scale.RESIZE,
        autoCenter: Scale.CENTER_BOTH,
    },
    input: {
        keyboard: true,
    },
};

const startPhaserApp = (parent: string) => {
    const phaserApp = new Game({ ...config, parent });

    // Handle window resize
    window.addEventListener("resize", () => {
        phaserApp.scale.resize(window.innerWidth, window.innerHeight);
    });

    return phaserApp;
};

export default startPhaserApp;
