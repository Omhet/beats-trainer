import { LessonView } from "@/components/Views/LessonView/LessonView";
import { PerformView } from "@/components/Views/PerformView/PerformView";
import { PractiseView } from "@/components/Views/PractiseView/PractiseView";
import { useNavState } from "../../hooks/useNavState";
import { SelectedView } from "../../types/navigation";
import { useAppStore } from "@/store/useAppStore";
import React from "react";
import styles from "./MainContent.module.css";

export const MainContent: React.FC = () => {
    const { songId, view } = useNavState();
    const songs = useAppStore((s) => s.songs);

    const renderView = () => {
        const songExists = songs.find((s) => s.id === songId);
        
        if (!songId || !songExists) {
            return (
                <div className={styles.welcome}>
                    <p>Select a song from the sidebar to get started</p>
                </div>
            );
        }

        switch (view) {
            case SelectedView.Learn:
                return <LessonView />;
            case SelectedView.Practise:
                return <PractiseView />;
            case SelectedView.Perform:
                return <PerformView />;
            default:
                return (
                    <div className={styles.welcome}>
                        <p>Select a mode for the song</p>
                    </div>
                );
        }
    };

    return <main className={styles.mainContent}>{renderView()}</main>;
};
