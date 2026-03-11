import { useCallback, useEffect, useState } from "react";
import { EventBus } from "../phaser/EventBus";
import { AppEvent } from "../phaser/types/events";

export type ModalType = "confirmation" | null;

export interface ModalEntry {
    type: ModalType;
    props: any;
    id: string;
}

export const useModal = () => {
    const [modalStack, setModalStack] = useState<ModalEntry[]>([]);

    const openModal = useCallback((type: ModalType, props: any = {}) => {
        if (!type) return;

        const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setModalStack((prev) => [...prev, { type, props, id }]);
    }, []);

    const closeModal = useCallback(() => {
        setModalStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    }, []);

    const closeAllModals = useCallback(() => {
        setModalStack([]);
    }, []);

    const isModalOpen = modalStack.length > 0;

    useEffect(() => {
        const handleOpenModal = (data: { type: ModalType; props?: any }) => {
            openModal(data.type, data.props || {});
        };

        const handleCloseModal = () => {
            closeModal();
        };

        EventBus.on(AppEvent.OPEN_MODAL, handleOpenModal);
        EventBus.on(AppEvent.CLOSE_MODAL, handleCloseModal);

        return () => {
            EventBus.off(AppEvent.OPEN_MODAL, handleOpenModal);
            EventBus.off(AppEvent.CLOSE_MODAL, handleCloseModal);
        };
    }, [openModal, closeModal]);

    return {
        modalStack,
        openModal,
        closeModal,
        closeAllModals,
        isModalOpen,
    };
};
