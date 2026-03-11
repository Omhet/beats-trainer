import React from "react";
import styles from "./HUD.module.css";

interface HUDProps {}

export const HUD: React.FC<HUDProps> = () => {
    return <div className={styles.container}></div>;
};
