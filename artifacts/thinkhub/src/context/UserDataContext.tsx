import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types for UserDataContext
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  institution: string;
  field: string;
  bio?: string;
  skills: Array<{ name: string; level: number }>;
  interests: string[];
  availableForCollab: boolean;
  openToMentoring: boolean;
  stats: {
    publications: number;
    citations: number;
    hIndex: number;
    followers: number;
    following: number;
  };
}

export interface ActivityEvent {
  id: string;
  type: "publication" | "citation" | "review" | "collaboration" | "discussion" | "follow" | "milestone";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface FollowedResearcher {
  id: string;
  name: string;
  field: string;
  institution: string;
  avatar: string;
  followDate: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  papersCount: number;
  created: string;
  public: boolean;
}

export interface PlatformStats {
  totalPapers: number;
  totalResearchers: number;
  totalCollections: number;
  activeUsers: number;
}

export interface UserDataContextType {
  // Profile
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Activity
  activities: ActivityEvent[];
  addActivity: (activity: Omit<ActivityEvent, "id" | "read">) => void;
  markActivityRead: (activityId: string) => void;
  getUnreadActivities: () => ActivityEvent[];
  
  // Following
  followedResearchers: FollowedResearcher[];
  followResearcher: (researcher: FollowedResearcher) => void;
  unfollowResearcher: (researcherId: string) => void;
  isFollowing: (researcherId: string) => boolean;
  
  // Collections
  collections: Collection[];
  addCollection: (collection: Omit<Collection, "id" | "created">) => void;
  removeCollection: (collectionId: string) => void;
  
  // Stats
  platformStats: PlatformStats;
  refreshStats: () => void;
  
  // Badge counts
  unreadActivitiesCount: number;
  notificationsCount: number;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  // Initialize from localStorage or defaults
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("sciconnect-profile");
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      id: "user-1",
      name: "Dr. Alex Thompson",
      email: "alex.thompson@university.edu",
      avatar: "AT",
      institution: "MIT",
      field: "Computer Science",
      bio: "Research scientist focused on machine learning and computational biology.",
      skills: [
        { name: "Machine Learning", level: 90 },
        { name: "Python", level: 95 },
        { name: "Deep Learning", level: 85 },
        { name: "Computational Biology", level: 75 }
      ],
      interests: ["Machine Learning", "Computational Biology", "NLP", "Quantum Computing"],
      availableForCollab: true,
      openToMentoring: false,
      stats: {
        publications: 23,
        citations: 1847,
        hIndex: 15,
        followers: 342,
        following: 89
      }
    };
  });

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const stored = localStorage.getItem("sciconnect-activities");
    return stored ? JSON.parse(stored) : [];
  });

  const [followedResearchers, setFollowedResearchers] = useState<FollowedResearcher[]>(() => {
    const stored = localStorage.getItem("sciconnect-following");
    return stored ? JSON.parse(stored) : [];
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    const stored = localStorage.getItem("sciconnect-collections");
    return stored ? JSON.parse(stored) : [
      {
        id: "default",
        name: "Reading List",
        description: "Papers to read and review",
        papersCount: 12,
        created: new Date().toISOString(),
        public: false
      }
    ];
  });

  const [platformStats, setPlatformStats] = useState<PlatformStats>(() => ({
    totalPapers: 2847349,
    totalResearchers: 892451,
    totalCollections: 145678,
    activeUsers: 23456
  }));

  // Persist to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem("sciconnect-profile", JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("sciconnect-activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("sciconnect-following", JSON.stringify(followedResearchers));
  }, [followedResearchers]);

  useEffect(() => {
    localStorage.setItem("sciconnect-collections", JSON.stringify(collections));
  }, [collections]);

  // Profile functions
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  // Activity functions
  const addActivity = (activity: Omit<ActivityEvent, "id" | "read">) => {
    const newActivity: ActivityEvent = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100)); // Keep last 100 activities
  };

  const markActivityRead = (activityId: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId ? { ...activity, read: true } : activity
      )
    );
  };

  const getUnreadActivities = () => {
    return activities.filter(activity => !activity.read);
  };

  // Following functions
  const followResearcher = (researcher: FollowedResearcher) => {
    if (!isFollowing(researcher.id)) {
      setFollowedResearchers(prev => [...prev, researcher]);
      addActivity({
        type: "follow",
        title: `Started following ${researcher.name}`,
        description: `${researcher.field} at ${researcher.institution}`,
        timestamp: new Date().toISOString()
      });
    }
  };

  const unfollowResearcher = (researcherId: string) => {
    setFollowedResearchers(prev => prev.filter(r => r.id !== researcherId));
  };

  const isFollowing = (researcherId: string) => {
    return followedResearchers.some(r => r.id === researcherId);
  };

  // Collection functions
  const addCollection = (collection: Omit<Collection, "id" | "created">) => {
    const newCollection: Collection = {
      ...collection,
      id: `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created: new Date().toISOString()
    };
    setCollections(prev => [...prev, newCollection]);
    addActivity({
      type: "milestone",
      title: `Created collection: ${collection.name}`,
      description: collection.description,
      timestamp: new Date().toISOString()
    });
  };

  const removeCollection = (collectionId: string) => {
    setCollections(prev => prev.filter(c => c.id !== collectionId));
  };

  // Stats functions
  const refreshStats = () => {
    // Simulate API call to refresh platform stats
    setPlatformStats({
      totalPapers: Math.floor(Math.random() * 100000) + 2800000,
      totalResearchers: Math.floor(Math.random() * 10000) + 890000,
      totalCollections: Math.floor(Math.random() * 5000) + 145000,
      activeUsers: Math.floor(Math.random() * 1000) + 23000
    });
  };

  // Badge counts
  const unreadActivitiesCount = getUnreadActivities().length;
  const notificationsCount = unreadActivitiesCount + 3; // +3 for system notifications

  const value: UserDataContextType = {
    profile,
    updateProfile,
    activities,
    addActivity,
    markActivityRead,
    getUnreadActivities,
    followedResearchers,
    followResearcher,
    unfollowResearcher,
    isFollowing,
    collections,
    addCollection,
    removeCollection,
    platformStats,
    refreshStats,
    unreadActivitiesCount,
    notificationsCount
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
