import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  MessageSquare, 
  Heart, 
  Share2, 
  Download, 
  Star, 
  Award, 
  Users, 
  Calendar, 
  Settings, 
  ChevronDown, 
  ExternalLink, 
  Archive, 
  Trash2, 
  Filter, 
  Search,
  MoreVertical,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'social' | 'research' | 'collaboration' | 'blockchain';
  title: string;
  message: string;
  description?: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'general' | 'research' | 'social' | 'system' | 'collaboration' | 'blockchain';
  actions?: Array<{
    id: string;
    label: string;
    action: string;
    icon?: React.ReactNode;
    primary?: boolean;
  }>;
  metadata?: Record<string, any>;
  from?: {
    name: string;
    avatar?: string;
    id: string;
  };
  to?: {
    name: string;
    avatar?: string;
    id: string;
  };
  related?: {
    type: 'paper' | 'author' | 'project' | 'workspace';
    id: string;
    title: string;
    url?: string;
  };
  expiresAt?: string;
  persistent?: boolean;
  txId?: string;
  blockchainStatus?: 'pending' | 'anchored' | 'verified';
  blockchainNetwork?: string;
  explorerUrl?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sound: boolean;
  categories: {
    research: boolean;
    social: boolean;
    system: boolean;
    collaboration: boolean;
    blockchain: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Paper Published Successfully',
    message: 'Your paper "Deep Learning Applications in Climate Science" has been published and is now available.',
    description: 'The paper has been assigned DOI: 10.1234/climate.2024.001 and is now indexed in major academic databases.',
    timestamp: '2024-03-15T10:30:00Z',
    read: false,
    priority: 'high',
    category: 'research',
    actions: [
      { id: 'view', label: 'View Paper', action: 'view_paper', icon: <FileText className="w-4 h-4" />, primary: true },
      { id: 'share', label: 'Share', action: 'share', icon: <Share2 className="w-4 h-4" /> },
      { id: 'cite', label: 'Cite', action: 'cite', icon: <Star className="w-4 h-4" /> }
    ],
    metadata: {
      doi: '10.1234/climate.2024.001',
      journal: 'Nature Climate Change',
      impactFactor: 25.8
    },
    related: {
      type: 'paper',
      id: 'paper-1',
      title: 'Deep Learning Applications in Climate Science',
      url: '/papers/1'
    }
  },
  {
    id: '2',
    type: 'social',
    title: 'New Follower',
    message: 'Dr. Sarah Chen started following you',
    description: 'Dr. Sarah Chen from MIT is now following your research activities.',
    timestamp: '2024-03-15T09:15:00Z',
    read: false,
    priority: 'medium',
    category: 'social',
    actions: [
      { id: 'profile', label: 'View Profile', action: 'view_profile', icon: <User className="w-4 h-4" />, primary: true },
      { id: 'follow-back', label: 'Follow Back', action: 'follow_back', icon: <Users className="w-4 h-4" /> }
    ],
    from: {
      name: 'Dr. Sarah Chen',
      avatar: 'SC',
      id: 'user-1'
    },
    related: {
      type: 'author',
      id: 'author-1',
      title: 'Dr. Sarah Chen',
      url: '/authors/1'
    }
  },
  {
    id: '3',
    type: 'collaboration',
    title: 'Collaboration Request',
    message: 'Prof. Michael Brown invited you to collaborate on "Quantum Computing Applications"',
    description: 'Join a research project exploring quantum computing applications in climate science.',
    timestamp: '2024-03-15T08:45:00Z',
    read: false,
    priority: 'high',
    category: 'collaboration',
    actions: [
      { id: 'accept', label: 'Accept', action: 'accept', icon: <CheckCircle className="w-4 h-4" />, primary: true },
      { id: 'decline', label: 'Decline', action: 'decline', icon: <XCircle className="w-4 h-4" /> },
      { id: 'view', label: 'View Project', action: 'view_project', icon: <FileText className="w-4 h-4" /> }
    ],
    from: {
      name: 'Prof. Michael Brown',
      avatar: 'MB',
      id: 'user-2'
    },
    related: {
      type: 'project',
      id: 'project-1',
      title: 'Quantum Computing Applications',
      url: '/projects/1'
    }
  },
  {
    id: '4',
    type: 'info',
    title: 'Research Milestone',
    message: 'Your paper reached 100 citations',
    description: 'Congratulations! Your paper has reached a significant milestone with 100 citations.',
    timestamp: '2024-03-14T15:30:00Z',
    read: true,
    priority: 'medium',
    category: 'research',
    actions: [
      { id: 'view-stats', label: 'View Statistics', action: 'view_stats', icon: <Award className="w-4 h-4" />, primary: true },
      { id: 'share', label: 'Share Achievement', action: 'share', icon: <Share2 className="w-4 h-4" /> }
    ],
    metadata: {
      citations: 100,
      milestone: '100-citations',
      date: '2024-03-14'
    },
    related: {
      type: 'paper',
      id: 'paper-1',
      title: 'Deep Learning Applications in Climate Science',
      url: '/papers/1'
    }
  },
  {
    id: '5',
    type: 'warning',
    title: 'Review Deadline Approaching',
    message: 'Paper review deadline is in 3 days',
    description: 'You have been assigned to review a paper. The deadline is approaching.',
    timestamp: '2024-03-14T12:20:00Z',
    read: true,
    priority: 'medium',
    category: 'research',
    actions: [
      { id: 'review', label: 'Start Review', action: 'start_review', icon: <FileText className="w-4 h-4" />, primary: true },
      { id: 'extend', label: 'Request Extension', action: 'extend', icon: <Calendar className="w-4 h-4" /> }
    ],
    metadata: {
      deadline: '2024-03-17',
      paperId: 'paper-2',
      reviewType: 'peer-review'
    },
    expiresAt: '2024-03-17T23:59:59Z'
  },
  {
    id: '6',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance tonight',
    description: 'The system will undergo maintenance from 2:00 AM to 4:00 AM EST.',
    timestamp: '2024-03-14T10:15:00Z',
    read: true,
    priority: 'low',
    category: 'system',
    actions: [
      { id: 'details', label: 'View Details', action: 'view_details', icon: <Info className="w-4 h-4" /> }
    ],
    metadata: {
      maintenanceType: 'scheduled',
      duration: '2 hours',
      startTime: '2024-03-16T02:00:00Z',
      endTime: '2024-03-16T04:00:00Z'
    },
    persistent: true
  },
  {
    id: '7',
    type: 'blockchain',
    title: 'Contribution Verified On-Chain',
    message: 'Your research contribution has been cryptographically verified and anchored to the blockchain.',
    description: 'The document hash has been permanently recorded on Hedera Hashgraph network for immutable verification.',
    timestamp: '2024-03-15T14:20:00Z',
    read: false,
    priority: 'high',
    category: 'blockchain',
    txId: '0xa1b2c3d4e5f67890abcdef1234567890abcdef12',
    blockchainStatus: 'verified',
    blockchainNetwork: 'hedera-testnet',
    explorerUrl: 'https://hashscan.io/testnet/transaction/0xa1b2c3d4e5f67890abcdef1234567890abcdef12',
    actions: [
      { id: 'view-hash', label: 'View Hash', action: 'view_hash', icon: <ExternalLink className="w-4 h-4" />, primary: true }
    ]
  },
  {
    id: '8',
    type: 'blockchain',
    title: 'Soulbound Token Earned: Research Pioneer',
    message: 'Congratulations! You earned a rare SBT credential that is permanently bound to your academic identity.',
    description: 'This SBT represents your contribution to cutting-edge research in climate science and cannot be transferred.',
    timestamp: '2024-03-15T12:45:00Z',
    read: false,
    priority: 'high',
    category: 'blockchain',
    txId: '0xf1e2d3c4b5a67890fedcba0987654321fedcba09',
    blockchainStatus: 'verified',
    blockchainNetwork: 'hedera-testnet',
    explorerUrl: 'https://hashscan.io/testnet/transaction/0xf1e2d3c4b5a67890fedcba0987654321fedcba09',
    actions: [
      { id: 'view-nft', label: 'View SBT', action: 'view_sbt', icon: <Award className="w-4 h-4" />, primary: true }
    ]
  }
];

const mockSettings: NotificationSettings = {
  email: true,
  push: true,
  desktop: true,
  sound: true,
  categories: {
    research: true,
    social: true,
    system: true,
    collaboration: true,
    blockchain: true
  },
  priorities: {
    low: true,
    medium: true,
    high: true,
    urgent: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

// Components
const NotificationItem: React.FC<{
  notification: Notification;
  onRead: (id: string) => void;
  onAction: (id: string, action: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}> = ({ notification, onRead, onAction, onDelete, onArchive }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'info': return <Info className="w-4 h-4 text-info" />;
      case 'social': return <Users className="w-4 h-4 text-purple-600" />;
      case 'research': return <FileText className="w-4 h-4 text-primary" />;
      case 'collaboration': return <Users className="w-4 h-4 text-orange-600" />;
      case 'system': return <Settings className="w-4 h-4 text-muted-foreground" />;
      case 'blockchain': return <span className="text-purple-600">🔗</span>;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'research': return 'bg-indigo-100 text-indigo-800';
      case 'collaboration': return 'bg-orange-100 text-orange-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'blockchain': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNotificationClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group cursor-pointer border rounded-lg p-4 transition-all duration-200",
        notification.read ? "bg-white border-gray-200" : getPriorityColor(notification.priority),
        !notification.read && "shadow-sm"
      )}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "font-semibold text-sm line-clamp-1",
                  notification.read ? "text-gray-700" : "text-gray-900"
                )}>
                  {notification.title}
                </h3>
                <Badge className={getTypeColor(notification.type)}>
                  {notification.type}
                </Badge>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </div>
              <p className={cn(
                "text-sm line-clamp-2",
                notification.read ? "text-gray-600" : "text-gray-700"
              )}>
                {notification.message}
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(notification.id); }}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {notification.from && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center text-xs font-medium">
                {notification.from.avatar}
              </div>
              <span className="text-xs text-gray-600">From {notification.from.name}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
            <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
          </div>
          
          {notification.description && isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">{notification.description}</p>
            </div>
          )}
          
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {notification.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.primary ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(notification.id, action.action);
                    }}
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {notification.related && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Related:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (notification.related?.url) {
                      window.location.href = notification.related.url;
                    }
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {notification.related.title}
                </Button>
              </div>
            </div>
          )}
          
          {notification.type === 'blockchain' && notification.txId && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Transaction ID:</span>
                  <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {notification.txId.slice(0, 12)}...{notification.txId.slice(-8)}
                  </code>
                </div>
                {notification.blockchainStatus && (
                  <Badge variant={
                    notification.blockchainStatus === 'verified' ? 'default' : 
                    notification.blockchainStatus === 'anchored' ? 'secondary' : 
                    'outline'
                  }>
                    {notification.blockchainStatus}
                  </Badge>
                )}
              </div>
              {notification.explorerUrl && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(notification.explorerUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View on Explorer
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const NotificationStats: React.FC<{ stats: NotificationStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="academic-stats-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gold-600">{stats.total}</div>
          <div className="text-sm font-medium text-gold-700">Total</div>
        </CardContent>
      </Card>
      <Card className="academic-stats-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gold-600">{stats.unread}</div>
          <div className="text-sm font-medium text-gold-700">Unread</div>
        </CardContent>
      </Card>
      <Card className="academic-stats-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gold-600">{stats.byPriority.high || 0}</div>
          <div className="text-sm font-medium text-gold-700">High Priority</div>
        </CardContent>
      </Card>
      <Card className="academic-stats-card">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gold-600">{stats.byCategory.research || 0}</div>
          <div className="text-sm font-medium text-gold-700">Research</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Component
export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<NotificationSettings>(mockSettings);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedNotifications, setArchivedNotifications] = useState<Notification[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byCategory = notifications.reduce((acc, n) => {
      acc[n.category || 'general'] = (acc[n.category || 'general'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType,
      byPriority,
      byCategory
    };
  }, [notifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications.filter(n => !showArchived || archivedNotifications.includes(n));
    
    if (searchQuery) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }
    
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, searchQuery, selectedType, selectedPriority, selectedCategory, showArchived, archivedNotifications]);

  // Handle notification actions
  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleAction = useCallback((id: string, action: string) => {
    toast.info(`Action: ${action} for notification ${id}`);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  }, []);

  const handleArchive = useCallback((id: string) => {
    setArchivedNotifications(prev => [...prev, notifications.find(n => n.id === id)!]);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification archived');
  }, [notifications]);

  const handleSettingsUpdate = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const playNotificationSound = useCallback(() => {
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Handle audio play error silently
      });
    }
  }, [isSoundEnabled]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification-sound.mp3');
    audioRef.current.volume = 0.3;
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                {stats.unread} unread • {stats.total} total
              </p>
            </div>
          </div>
          {stats.unread > 0 && (
            <Badge className="academic-badge-primary">
              {stats.unread}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0}
          >
            Mark all as read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="w-4 h-4 mr-2" />
            {showArchived ? 'Active' : 'Archived'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
                {isSoundEnabled ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                Sound {isSoundEnabled ? 'On' : 'Off'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4 border-b border-border">
        <NotificationStats stats={stats} />
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="collaboration">Collaboration</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="collaboration">Collaboration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkAsRead}
                onAction={handleAction}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-sm text-gray-600">
                {searchQuery || selectedType !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You\'re all caught up!'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Notification Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Notification Types */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Notification Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-gray-600">Receive notifications via email</div>
                      </div>
                      <Switch
                        checked={settings.email}
                        onCheckedChange={(checked) => handleSettingsUpdate({ email: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-gray-600">Receive push notifications</div>
                      </div>
                      <Switch
                        checked={settings.push}
                        onCheckedChange={(checked) => handleSettingsUpdate({ push: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Desktop Notifications</div>
                        <div className="text-sm text-gray-600">Show desktop notifications</div>
                      </div>
                      <Switch
                        checked={settings.desktop}
                        onCheckedChange={(checked) => handleSettingsUpdate({ desktop: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Sound</div>
                        <div className="text-sm text-gray-600">Play notification sounds</div>
                      </div>
                      <Switch
                        checked={settings.sound}
                        onCheckedChange={(checked) => handleSettingsUpdate({ sound: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(settings.categories).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{key}</div>
                          <div className="text-sm text-gray-600">Receive {key} notifications</div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            handleSettingsUpdate({ 
                              categories: { ...settings.categories, [key]: checked }
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priorities */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Priorities</h3>
                  <div className="space-y-3">
                    {Object.entries(settings.priorities).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{key}</div>
                          <div className="text-sm text-gray-600">Receive {key} priority notifications</div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            handleSettingsUpdate({ 
                              priorities: { ...settings.priorities, [key]: checked }
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiet Hours */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Quiet Hours</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Enable Quiet Hours</div>
                        <div className="text-sm text-gray-600">Limit notifications during quiet hours</div>
                      </div>
                      <Switch
                        checked={settings.quietHours.enabled}
                        onCheckedChange={(checked) => 
                          handleSettingsUpdate({ 
                            quietHours: { ...settings.quietHours, enabled: checked }
                          })
                        }
                      />
                    </div>
                    {settings.quietHours.enabled && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm">From:</label>
                          <Input
                            type="time"
                            value={settings.quietHours.start}
                            onChange={(e) => 
                              handleSettingsUpdate({ 
                                quietHours: { ...settings.quietHours, start: e.target.value }
                              })
                            }
                            className="w-24"
                          />
                         </div>
                         <div className="flex items-center gap-2">
                           <label className="text-sm">To:</label>
                           <Input
                             type="time"
                             value={settings.quietHours.end}
                             onChange={(e) => 
                               handleSettingsUpdate({ 
                                 quietHours: { ...settings.quietHours, end: e.target.value }
                               })
                             }
                             className="w-24"
                           />
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
                 
                 {/* Blockchain Testing */}
                 <div>
                   <h3 className="font-medium text-foreground mb-3">Blockchain Testing</h3>
                   <div className="space-y-3">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => toast.success('Test Contribution Verified', { description: 'Test blockchain notification sent' })}
                     >
                       Test Verification
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => toast.success('Test SBT Earned', { description: 'Test SBT notification sent' })}
                     >
                       Test SBT
                     </Button>
                   </div>
                 </div>
                      </div>
                    )}
                  </div>
                 </div>
               </div>
               
               <div className="flex justify-end gap-2 mt-6">
                 <Button variant="outline" onClick={() => setShowSettings(false)}>
                   Cancel
                 </Button>
                 <Button onClick={() => setShowSettings(false)}>
                   Save Settings
                 </Button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
export default NotificationCenter;
