import { useState } from "react";

export interface AppState {}

// Will be reworked to use Zustand
export const useAppState = () => {
    const [state] = useState<AppState>({});

    return state;
};
