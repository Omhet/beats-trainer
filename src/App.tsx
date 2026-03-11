import { PhaserApp, RefPhaserApp } from "@/PhaserApp";
import ModalRenderer from "@/components/Modals/ModalRenderer/ModalRenderer";
import { useRef } from "react";

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
            <ModalRenderer />
        </div>
    );
}

export default App;
