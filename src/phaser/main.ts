import { TablatureScene } from "@/phaser/scenes/TablatureScene";
import { AUTO, Game, Scale } from "phaser";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: "100%",
    height: "100%",
    parent: "phaser-app-container",
    backgroundColor: "#0d0d0d",
    scene: [TablatureScene],
    scale: {
        mode: Scale.RESIZE,
        autoCenter: Scale.NO_CENTER,
    },
    audio: {
        noAudio: true,
    },
};

const startPhaserApp = (parent: string) => {
    return new Game({ ...config, parent });
};

export default startPhaserApp;
