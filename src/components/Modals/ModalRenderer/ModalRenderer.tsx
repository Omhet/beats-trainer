import React from "react";
import { useModal } from "../../../hooks/useModal";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

/**
 * ModalRenderer component
 * Responsible for rendering all modals currently in the modal stack.
 * Radix UI's Dialog component handles the portal and stacking order automatically.
 */
export const ModalRenderer: React.FC = () => {
    const { modalStack, closeModal } = useModal();

    if (modalStack.length === 0) {
        return null;
    }

    return (
        <>
            {modalStack.map((entry) => {
                const handleOpenChange = (open: boolean) => {
                    if (!open) {
                        closeModal();
                    }
                };

                // Base props for all modals
                const baseProps = {
                    open: true,
                    onOpenChange: handleOpenChange,
                };

                switch (entry.type) {
                    case "confirmation":
                        return (
                            <ConfirmationModal
                                key={entry.id}
                                {...baseProps}
                                {...entry.props}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    );
};

export default ModalRenderer;
