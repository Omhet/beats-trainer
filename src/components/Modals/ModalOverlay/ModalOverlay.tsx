import * as Dialog from "@radix-ui/react-dialog";
import React, { ReactNode } from "react";
import styles from "./ModalOverlay.module.css";

interface ModalOverlayProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
    width?: string | number;
    height?: string | number;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({
    open,
    onOpenChange,
    title,
    children,
    width,
    height,
}) => {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content
                    className={styles.container}
                    style={
                        {
                            "--modal-width": width || "auto",
                            "--modal-height": height || "auto",
                        } as React.CSSProperties
                    }
                >
                    <div className={styles.header}>
                        <Dialog.Title className={styles.title}>
                            {title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className={styles.closeButton}>×</button>
                        </Dialog.Close>
                    </div>
                    <div className={styles.content}>{children}</div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ModalOverlay;
