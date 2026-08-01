import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Spinner from "../components/ui/Spinner.jsx";

const UiContext = createContext(null);

export function UiProvider({ children }) {
  // Global loading overlay (for big operations)
  const [isAppLoading, setIsAppLoading] = useState(false);

  // Mobile sidebar state (optional, you can wire MainLayout to this later)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme: "dark" | "light"
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem("couple_theme");
    if (stored === "dark" || stored === "light") return stored;

    // fallback: prefers-color-scheme
    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  });

  /* ---------------------- Theme handling ---------------------- */
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("couple_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  /* ------------------ Global loading helpers ------------------ */
  const showLoader = useCallback(() => setIsAppLoading(true), []);
  const hideLoader = useCallback(() => setIsAppLoading(false), []);

  /* ------------------ Sidebar helpers (optional) ------------------ */
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );

  const value = {
    // loading
    isAppLoading,
    showLoader,
    hideLoader,

    // sidebar (use in MainLayout if you want)
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,

    // theme
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <UiContext.Provider value={value}>
      {children}

      {/* Global loading overlay */}
      {isAppLoading && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="xl" />
            <p className="text-sm text-secondary">
              Updating your love space...
            </p>
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
}

export default UiContext;
