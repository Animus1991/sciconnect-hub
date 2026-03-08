import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Theme = "light" | "dark";
type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setPreference: (pref: ThemePreference) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function resolveSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem("scihub-theme");
    if (stored === "dark" || stored === "light" || stored === "system") return stored;
    return "system";
  });

  const [theme, setTheme] = useState<Theme>(() => {
    if (preference === "system") return resolveSystemTheme();
    return preference;
  });

  // Listen for OS-level theme changes when preference is "system"
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  // Apply theme to DOM with transition
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    root.classList.remove("light", "dark", "system-dark");
    if (preference === "system" && theme === "dark") {
      root.classList.add("dark", "system-dark");
    } else {
      root.classList.add(theme);
    }
    const timer = setTimeout(() => root.classList.remove("theme-transitioning"), 500);
    return () => clearTimeout(timer);
  }, [theme, preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    localStorage.setItem("scihub-theme", pref);
    if (pref === "system") {
      setTheme(resolveSystemTheme());
    } else {
      setTheme(pref);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setPreferenceState(next);
    localStorage.setItem("scihub-theme", next);
    setTheme(next);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, preference, toggleTheme, setPreference, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
