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
import { useBlockchainNotificationService } from '@/lib/blockchain-notification-service';

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

// Mock data with blockchain notifications
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
    category: 'research'
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
    explorerUrl: 'https://hashscan.io/testnet/transaction/0xa1b2c3d4e5f67890abcdef1234567890abcdef12'
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
    explorerUrl: 'https://hashscan.io/testnet/transaction/0xf1e2d3c4b5a67890fedcba0987654321fedcba09'
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
      case 'low': return 'border-border bg-secondary/30';
      default: return 'border-border bg-card';
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
      case 'system': return 'bg-secondary text-foreground';
      case 'blockchain': return 'bg-purple-100 text-purple-800';
      default: return 'bg-secondary text-foreground';
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
        notification.read ? "bg-card border-border" : getPriorityColor(notification.priority),
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
                  notification.read ? "text-muted-foreground" : "text-foreground"
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
                notification.read ? "text-muted-foreground" : "text-foreground/80"
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
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
            <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
          </div>
          
          {notification.description && isExpanded && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[13px] text-muted-foreground font-display">{notification.description}</p>
            </div>
          )}
          
          {/* Blockchain-specific display */}
          {notification.type === 'blockchain' && notification.txId && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground font-display">Transaction ID:</span>
                  <code className="text-[11px] font-mono bg-secondary px-2 py-1 rounded">
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

// Main component
const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<NotificationSettings>(mockSettings);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Initialize blockchain notification service
  const { triggerContributionVerified, triggerSBTEarned } = useBlockchainNotificationService();

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by read status
    if (filter === 'unread') filtered = filtered.filter(n => !n.read);
    if (filter === 'read') filtered = filtered.filter(n => n.read);

    // Filter by type
    if (typeFilter !== 'all') filtered = filtered.filter(n => n.type === typeFilter);

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, filter, typeFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCategory: notifications.reduce((acc, n) => {
      if (n.category) acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }), [notifications]);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleAction = useCallback((id: string, action: string) => {
    // Handle notification actions
    toast.info(`Action: ${action} for notification ${id}`);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleArchive = useCallback((id: string) => {
    // For now, just mark as read and remove
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {stats.unread > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.unread}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {stats.unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
              >
                Mark All Read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-6">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({stats.unread})
            </Button>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="blockchain">Blockchain</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1">
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        {/* Test Buttons for Blockchain */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerContributionVerified('Test Document')}
          >
            Test Verification
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerSBTEarned('Research Pioneer', 'rare')}
          >
            Test SBT
          </Button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkRead}
                  onAction={handleAction}
                  onDelete={handleDelete}
                  onArchive={handleArchive}
                />
              ))}
              {filteredNotifications.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No notifications found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;