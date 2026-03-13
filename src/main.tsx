import App from "@/App.tsx";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/settings" element={<div>Settings (coming soon)</div>} />
      <Route path="/profile" element={<div>Profile (coming soon)</div>} />
    </Routes>
  </BrowserRouter>
);
