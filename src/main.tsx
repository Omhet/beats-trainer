import { MainPage } from "@/pages/MainPage";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/settings" element={<SettingsPage />} />
        </Routes>
    </BrowserRouter>,
);
