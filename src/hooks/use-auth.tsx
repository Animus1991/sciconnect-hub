import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  initials: string;
  title: string;
  institution: string;
  location: string;
  bio: string;
  website: string;
  joinedDate: string;
  researchInterests: string[];
  stats: {
    publications: number;
    followers: number;
    following: number;
    hIndex: number;
    citations: number;
  };
}

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateStats: (updates: Partial<UserProfile["stats"]>) => void;
  logout: () => void;
}

const defaultUser: UserProfile = {
  id: "usr_001",
  name: "Dr. Researcher",
  username: "@dr.researcher",
  email: "researcher@mit.edu",
  initials: "DR",
  title: "Computational Neuroscientist",
  institution: "MIT CSAIL",
  location: "Cambridge, MA",
  bio: "Computational neuroscientist exploring the intersection of AI and brain dynamics. Passionate about open science, reproducible research, and interdisciplinary collaboration.",
  website: "lab-website.edu",
  joinedDate: "2023",
  researchInterests: ["Computational Neuroscience", "Deep Learning", "Brain-Computer Interfaces", "Network Dynamics", "Open Science"],
  stats: {
    publications: 24,
    followers: 1247,
    following: 89,
    hIndex: 18,
    citations: 2891,
  },
};

const STORAGE_KEY = "scihub-user";

function loadUser(): UserProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultUser, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultUser;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(loadUser);

  const persist = useCallback((u: UserProfile) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch { /* ignore */ }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      persist(next);
      return next;
    });
  }, [persist]);

  const updateStats = useCallback((updates: Partial<UserProfile["stats"]>) => {
    setUser(prev => {
      const next = { ...prev, stats: { ...prev.stats, ...updates } };
      persist(next);
      return next;
    });
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(defaultUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: true, updateProfile, updateStats, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
