import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { AssetManager } from "../managers/AssetManager";
import { AppEvent } from "../types/events";

export class MainScene extends Scene {
    // Managers
    public assetManager!: AssetManager;
    // More managers will be added here as needed

    constructor() {
        super("Main Scene");
    }

    preload() {
        // Initialize AssetManager FIRST in preload
        this.assetManager = new AssetManager(this);
        this.assetManager.createAllGraphics();
    }

    create() {
        // Set up event listeners for React → Phaser commands
        this.setupEventListeners();
        EventBus.emit(AppEvent.CURRENT_SCENE_READY, this);
    }

    update() {
        // Update managers that require per-frame updates
        // const delta = this.game.loop.delta;
    }

    /**
     * Set up event listeners for React → Phaser commands
     */
    private setupEventListeners() {}

    /**
     * Clean up event listeners to prevent memory leaks
     */
    shutdown() {}
}
