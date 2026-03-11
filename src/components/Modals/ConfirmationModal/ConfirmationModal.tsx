import ModalOverlay from "@/components/Modals/ModalOverlay/ModalOverlay";
import React from "react";
import styles from "./ConfirmationModal.module.css";

interface ConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    onOpenChange,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {
    const handleClose = () => {
        onOpenChange(false);
    };

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        handleClose();
    };

    return (
        <ModalOverlay
            open={open}
            onOpenChange={onOpenChange}
            title="Are you sure?"
            width="400px"
        >
            <div className={styles.container}>
                <p className={styles.message}>{message}</p>
                <div className={styles.buttonGroup}>
                    <button
                        className={`${styles.button} ${styles.cancelButton}`}
                        onClick={handleCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </ModalOverlay>
    );
};

export default ConfirmationModal;
