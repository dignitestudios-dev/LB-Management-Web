import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { ToasterContainer } from "./components/global/Toaster.jsx";

if (typeof window !== "undefined") {
  if (window.__lbDeferredInstallPrompt === undefined) {
    window.__lbDeferredInstallPrompt = null;
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToasterContainer />
      <App />
    </BrowserRouter>
  </StrictMode>
);
