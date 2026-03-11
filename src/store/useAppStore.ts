import { create } from "zustand";

export interface AppState {}

export const useAppStore = create<AppState>((_set) => ({}));
