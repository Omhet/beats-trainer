import { useSongs } from "@/hooks/useSongs";
import { useNavState } from "../../../hooks/useNavState";
import { SelectedView } from "../../../types/navigation";
import * as Accordion from "@radix-ui/react-accordion";
import React from "react";
import styles from "./Sidebar.module.css";
import { SongListItem } from "./SongListItem";

export const Sidebar: React.FC = () => {
    const songs = useSongs();
    const { songId, view, section, setSongView } = useNavState();

    const handleSectionClick = (clickedSongId: string, clickedSection: string | null) => {
        setSongView(clickedSongId, SelectedView.Practise, clickedSection);
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
                                isActive={songId === song.id}
                                selectedView={
                                    songId === song.id
                                        ? view
                                        : null
                                }
                                selectedSection={
                                    songId === song.id
                                        ? section
                                        : null
                                }
                                onSectionClick={(sectionName) =>
                                    handleSectionClick(song.id, sectionName)
                                }
                            />
                        ))}
                    </Accordion.Root>
                )}
            </div>
        </aside>
    );
};
