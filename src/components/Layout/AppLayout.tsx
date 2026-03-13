import { ModalRenderer } from "@/components/Modals/ModalRenderer/ModalRenderer";
import { useMidiInput } from "@/hooks/useMidiInput";
import styles from "./AppLayout.module.css";
import { MainContent } from "./MainContent";
import { Sidebar } from "./Sidebar/Sidebar";

export function AppLayout() {
    useMidiInput();

    return (
        <div className={styles.layout}>
            <Sidebar />
            <MainContent />
            <ModalRenderer />
        </div>
    );
}
