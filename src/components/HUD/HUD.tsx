import { useAppState } from "@/hooks/useAppState";
import React from "react";
import styles from "./HUD.module.css";

interface HUDProps {}

export const HUD: React.FC<HUDProps> = () => {
    const {} = useAppState();

    return <div className={styles.container}></div>;
};
