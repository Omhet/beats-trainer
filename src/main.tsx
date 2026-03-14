import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { useMidiInput } from "@/hooks/useMidiInput";
import { MainPage } from "@/pages/MainPage";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

function AppRoot() {
    useMidiInput();
    return (
        <ErrorBoundary>
            <Outlet />
        </ErrorBoundary>
    );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <Routes>
            <Route element={<AppRoot />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
        </Routes>
    </BrowserRouter>,
);
