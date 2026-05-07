import React, { useEffect, useState } from "react";
import { FiArrowDownCircle, FiDownloadCloud, FiX } from "react-icons/fi";
import { SuccessToast } from "./Toaster";

const PWAInstallBanner = () => {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isInstallPrompting, setIsInstallPrompting] = useState(false);

  const isAppInstalled = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    if (isAppInstalled()) {
      setShowInstallBanner(false);
      setDeferredInstallPrompt(null);
      return;
    }

    setShowInstallBanner(true);

    const syncInstallPrompt = () => {
      const prompt = window.__lbDeferredInstallPrompt || null;
      if (prompt && !isAppInstalled()) {
        setDeferredInstallPrompt(prompt);
      }
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      window.__lbDeferredInstallPrompt = event;
      setDeferredInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredInstallPrompt(null);
    };

    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (event) => {
      if (event.matches) handleAppInstalled();
    };

    syncInstallPrompt();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (displayModeQuery.addEventListener) {
      displayModeQuery.addEventListener("change", handleDisplayModeChange);
    } else {
      displayModeQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (displayModeQuery.removeEventListener) {
        displayModeQuery.removeEventListener("change", handleDisplayModeChange);
      } else {
        displayModeQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredInstallPrompt) {
      SuccessToast("Use the browser install popup/icon to complete installation.");
      return;
    }

    try {
      setIsInstallPrompting(true);
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        SuccessToast("App installation started.");
        setShowInstallBanner(false);
      }
      window.__lbDeferredInstallPrompt = null;
      setDeferredInstallPrompt(null);
    } catch (error) {
      console.error("Install prompt failed:", error);
    } finally {
      setIsInstallPrompting(false);
    }
  };

  if (!showInstallBanner) return null;

  return (
    <div
      className="fixed top-3 left-1/2 z-[90] w-[94%] max-w-[440px] -translate-x-1/2 overflow-hidden rounded-2xl border border-primary/25 bg-white shadow-[0_14px_30px_rgba(109,5,182,0.18)]"
      style={{ animation: "installPromptSlideDown 260ms ease-out" }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#6d05b6] via-primary to-[#c06cf3]" />
      <div className="flex items-center gap-3 p-3.5">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <FiDownloadCloud size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-900">Install Dexnive App</h4>
          <p className="mt-0.5 text-xs text-slate-600">
            Install for quick desktop access with an app-like experience.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleInstallApp}
            disabled={isInstallPrompting}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isInstallPrompting
                ? "cursor-not-allowed bg-primary/40 text-white"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
            title="Install app"
            aria-label="Install app"
          >
            <FiArrowDownCircle size={14} />
            {isInstallPrompting ? "Installing..." : "Install"}
          </button>
          <button
            type="button"
            onClick={() => setShowInstallBanner(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close install prompt"
          >
            <FiX size={15} />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes installPromptSlideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallBanner;
