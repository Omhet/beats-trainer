import { ModalRenderer } from "@/components/Modals/ModalRenderer/ModalRenderer";
import styles from "./AppLayout.module.css";
import { MainContent } from "./MainContent";
import { Sidebar } from "./Sidebar/Sidebar";

export function AppLayout() {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <MainContent />
            <ModalRenderer />
        </div>
    );
}
