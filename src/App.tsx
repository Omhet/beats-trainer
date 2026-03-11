import { useRef } from "react";
import { PhaserApp, RefPhaserApp } from "./PhaserApp";
import { HUD } from "./components/HUD/HUD";
import ModalRenderer from "./components/Modals/ModalRenderer/ModalRenderer";

function App() {
    // References to the PhaserApp component
    const phaserRef = useRef<RefPhaserApp | null>(null);

    // Event emitted from the PhaserApp component
    const currentScene = (_scene: Phaser.Scene) => {
        // We can handle scene changes here if needed
    };

    return (
        <div id="app">
            <PhaserApp ref={phaserRef} currentActiveScene={currentScene} />
            <HUD />
            <ModalRenderer />
        </div>
    );
}

export default App;
