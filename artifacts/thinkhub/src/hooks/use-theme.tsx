import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Theme = "light" | "hitech" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ALL_CLASSES = ["light", "hitech", "dark", "system-dark"] as const;

function resolveSystem(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("scihub-theme");
    if (stored === "light" || stored === "hitech" || stored === "dark" || stored === "system") return stored as Theme;
    return "dark";
  });

  // Apply theme classes to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    ALL_CLASSES.forEach(c => root.classList.remove(c));

    if (theme === "system") {
      const resolved = resolveSystem();
      if (resolved === "dark") {
        root.classList.add("dark", "system-dark");
      } else {
        root.classList.add("light");
      }
    } else if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "hitech") {
      root.classList.add("hitech");
    }
    // "light" = :root defaults, no extra class needed

    const timer = setTimeout(() => root.classList.remove("theme-transitioning"), 500);
    return () => clearTimeout(timer);
  }, [theme]);

  // Listen for OS-level changes when system
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      // Re-trigger effect by forcing state update
      setThemeState(prev => prev === "system" ? "system" : prev);
      // Manually re-apply
      const root = document.documentElement;
      ALL_CLASSES.forEach(c => root.classList.remove(c));
      if (mq.matches) {
        root.classList.add("dark", "system-dark");
      } else {
        root.classList.add("light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("scihub-theme", t);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && resolveSystem() === "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
