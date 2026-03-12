import { useSongs } from "@/hooks/useSongs";
import { SelectedView, useAppStore } from "@/store/useAppStore";
import * as Accordion from "@radix-ui/react-accordion";
import React from "react";
import styles from "./Sidebar.module.css";
import { SongListItem } from "./SongListItem";

export const Sidebar: React.FC = () => {
    const songs = useSongs();
    const selectedSongId = useAppStore((s) => s.selectedSongId);
    const selectedView = useAppStore((s) => s.selectedView);
    const selectedSection = useAppStore((s) => s.selectedSection);
    const setSelectedSong = useAppStore((s) => s.setSelectedSong);
    const setSelectedView = useAppStore((s) => s.setSelectedView);
    const setSelectedSection = useAppStore((s) => s.setSelectedSection);

    const handleSectionClick = (songId: string, section: string | null) => {
        setSelectedSong(songId);
        setSelectedView(SelectedView.Practise);
        setSelectedSection(section);
    };

    return (
        <aside className={styles.sidebar}>
            <header className={styles.header}>
                <h1 className={styles.title}>Beat Trainer</h1>
            </header>

            <div className={styles.songList}>
                {songs.length === 0 && (
                    <p style={{ padding: "1rem", color: "#888" }}>
                        Loading songs or no songs found...
                    </p>
                )}
                {songs.length > 0 && (
                    <Accordion.Root
                        type="single"
                        collapsible
                        className={styles.accordion}
                    >
                        {songs.map((song) => (
                            <SongListItem
                                key={song.id}
                                song={song}
                                isActive={selectedSongId === song.id}
                                selectedView={
                                    selectedSongId === song.id
                                        ? selectedView
                                        : null
                                }
                                selectedSection={
                                    selectedSongId === song.id
                                        ? selectedSection
                                        : null
                                }
                                onSectionClick={(section) =>
                                    handleSectionClick(song.id, section)
                                }
                            />
                        ))}
                    </Accordion.Root>
                )}
            </div>
        </aside>
    );
};
