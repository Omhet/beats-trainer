import { useSongs } from "@/hooks/useSongs";
import * as Accordion from "@radix-ui/react-accordion";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNavState } from "../../../hooks/useNavState";
import { SelectedView } from "../../../types/navigation";
import styles from "./Sidebar.module.css";
import { SongListItem } from "./SongListItem";

export const Sidebar: React.FC = () => {
    const songs = useSongs();
    const navigate = useNavigate();
    const { songId, view, section, setSongView } = useNavState();
    const [openItem, setOpenItem] = React.useState<string | undefined>(
        songId || undefined,
    );

    // Sync open item when songId changes via navigation (e.g. browser back/forward)
    useEffect(() => {
        if (songId) {
            setOpenItem(songId);
        }
    }, [songId]);

    const handleSectionClick = (
        clickedSongId: string,
        clickedSection: string | null,
    ) => {
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
                        value={openItem}
                        onValueChange={setOpenItem}
                    >
                        {songs.map((song) => (
                            <SongListItem
                                key={song.id}
                                song={song}
                                isActive={songId === song.id}
                                selectedView={songId === song.id ? view : null}
                                selectedSection={
                                    songId === song.id ? section : null
                                }
                                onSectionClick={(sectionName) =>
                                    handleSectionClick(song.id, sectionName)
                                }
                            />
                        ))}
                    </Accordion.Root>
                )}
            </div>

            <footer className={styles.footer}>
                <button
                    className={styles.settingsLink}
                    onClick={() => navigate("/settings")}
                >
                    ⚙ Settings
                </button>
            </footer>
        </aside>
    );
};
