import { LessonView } from "@/components/Views/LessonView/LessonView";
import { PerformView } from "@/components/Views/PerformView/PerformView";
import { PractiseView } from "@/components/Views/PractiseView/PractiseView";
import { SelectedView, useAppStore } from "@/store/useAppStore";
import React from "react";
import styles from "./MainContent.module.css";

export const MainContent: React.FC = () => {
    const selectedSongId = useAppStore((s) => s.selectedSongId);
    const selectedView = useAppStore((s) => s.selectedView);

    const renderView = () => {
        if (!selectedSongId) {
            return (
                <div className={styles.welcome}>
                    <p>Select a song from the sidebar to get started</p>
                </div>
            );
        }

        switch (selectedView) {
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
