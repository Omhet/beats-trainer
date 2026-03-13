import { SelectedView } from "../../../types/navigation";
import { SongIndexEntry } from "@/types/song";
import * as Accordion from "@radix-ui/react-accordion";
import cn from "classnames";
import React from "react";
import styles from "./SongListItem.module.css";

interface SongListItemProps {
    song: SongIndexEntry;
    isActive: boolean;
    selectedView: SelectedView | null;
    selectedSection: string | null;
    onSectionClick: (section: string | null) => void;
}

export const SongListItem: React.FC<SongListItemProps> = ({
    song,
    isActive,
    selectedView,
    selectedSection,
    onSectionClick,
}) => {
    const isPractiseActive = isActive && selectedView === SelectedView.Practise;

    return (
        <Accordion.Item value={song.id} className={styles.root}>
            <Accordion.Header className={styles.itemHeader}>
                <Accordion.Trigger className={styles.trigger}>
                    <span className={styles.songTitle}>{song.title}</span>
                    <span className={styles.artistName}>{song.artist}</span>
                    <span className={styles.genreTag}>{song.genre}</span>
                </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Content className={styles.content}>
                <div className={styles.subList}>
                    {/* Learn Stub */}
                    <button
                        className={cn(
                            styles.viewButton,
                            styles.viewButtonDisabled,
                        )}
                        title="Coming soon"
                        disabled
                    >
                        Learn
                    </button>

                    {/* Practise Content */}
                    <div className={styles.practiseContainer}>
                        <button
                            className={cn(styles.viewButton, {
                                [styles.viewButtonActive]: isPractiseActive,
                            })}
                            onClick={() => onSectionClick(null)}
                        >
                            Practise
                        </button>
                        <div className={styles.sectionList}>
                            <button
                                className={cn(styles.sectionButton, {
                                    [styles.sectionButtonActive]:
                                        isPractiseActive &&
                                        selectedSection === null,
                                })}
                                onClick={() => onSectionClick(null)}
                            >
                                Full Song
                            </button>
                            {song.sections.map((section) => (
                                <button
                                    key={section}
                                    className={cn(styles.sectionButton, {
                                        [styles.sectionButtonActive]:
                                            isPractiseActive &&
                                            selectedSection === section,
                                    })}
                                    onClick={() => onSectionClick(section)}
                                >
                                    {section}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Perform Stub */}
                    <button
                        className={cn(
                            styles.viewButton,
                            styles.viewButtonDisabled,
                        )}
                        title="Coming soon"
                        disabled
                    >
                        Perform
                    </button>
                </div>
            </Accordion.Content>
        </Accordion.Item>
    );
};
