import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Upload, 
  Search, 
  Settings, 
  Users, 
  BarChart3, 
  Brain, 
  Zap, 
  FolderOpen,
  Clock,
  TrendingUp,
  Award,
  Star,
  ChevronRight,
  Plus,
  Grid3x3,
  List,
  Filter,
  SortAsc,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface Document {
  id: string;
  title: string;
  type: 'paper' | 'report' | 'notes' | 'data' | 'presentation';
  size: string;
  modified: string;
  author: string;
  tags: string[];
  status: 'draft' | 'review' | 'published' | 'archived';
  downloads: number;
  views: number;
  progress?: number;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: 'research' | 'collaboration' | 'personal' | 'team';
  members: Array<{ name: string; avatar?: string; role?: string }>;
  projects: Array<{ name: string; status: string; progress?: number }>;
  documents: Document[];
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
  stats: Record<string, number>;
  lastModified: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  badge?: string | number;
}

interface ActivityItem {
  id: string;
  type: 'upload' | 'download' | 'share' | 'comment' | 'like' | 'follow' | 'join';
  description: string;
  timestamp: string;
  user?: string;
  metadata?: Record<string, any>;
}

// Mock data
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Machine Learning Research',
    description: 'Advanced ML algorithms and neural networks research',
    type: 'research',
    members: [
      { name: 'Dr. Sarah Chen', avatar: 'SC', role: 'Principal Investigator' },
      { name: 'Prof. Michael Brown', avatar: 'MB', role: 'Co-Investigator' },
      { name: 'Dr. Emily Davis', avatar: 'ED', role: 'Postdoc' }
    ],
    projects: [
      { name: 'Deep Learning for Climate Prediction', status: 'active', progress: 75 },
      { name: 'Quantum Computing Applications', status: 'planning', progress: 25 },
      { name: 'Natural Language Processing', status: 'completed', progress: 100 }
    ],
    documents: [],
    recentActivity: [
      { type: 'upload', description: 'New research paper uploaded', timestamp: '2 hours ago' },
      { type: 'comment', description: 'Discussion on methodology', timestamp: '5 hours ago' },
      { type: 'share', description: 'Shared results with collaborators', timestamp: '1 day ago' }
    ],
    stats: { documents: 24, projects: 3, citations: 156, downloads: 892 },
    lastModified: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Climate Science Collaboration',
    description: 'Multi-institutional climate research initiative',
    type: 'collaboration',
    members: [
      { name: 'Dr. James Wilson', avatar: 'JW', role: 'Lead Researcher' },
      { name: 'Dr. Maria Garcia', avatar: 'MG', role: 'Data Scientist' },
      { name: 'Prof. Robert Taylor', avatar: 'RT', role: 'Climate Modeler' }
    ],
    projects: [
      { name: 'Arctic Ice Melt Analysis', status: 'active', progress: 60 },
      { name: 'Carbon Cycle Modeling', status: 'active', progress: 45 }
    ],
    documents: [],
    recentActivity: [
      { type: 'join', description: 'New member joined the workspace', timestamp: '3 hours ago' },
      { type: 'upload', description: 'Climate dataset uploaded', timestamp: '6 hours ago' }
    ],
    stats: { documents: 18, projects: 2, members: 12, datasets: 45 },
    lastModified: '2024-03-15T09:15:00Z'
  }
];

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Deep Learning for Climate Prediction: A Comprehensive Study',
    type: 'paper',
    size: '2.4 MB',
    modified: '2024-03-14T15:30:00Z',
    author: 'Dr. Sarah Chen',
    tags: ['machine learning', 'climate', 'prediction'],
    status: 'published',
    downloads: 234,
    views: 1567,
    progress: 100
  },
  {
    id: '2',
    title: 'Quantum Computing Applications in Scientific Research',
    type: 'paper',
    size: '1.8 MB',
    modified: '2024-03-13T11:45:00Z',
    author: 'Prof. Michael Brown',
    tags: ['quantum', 'computing', 'research'],
    status: 'review',
    downloads: 89,
    views: 645,
    progress: 85
  },
  {
    id: '3',
    title: 'Climate Data Analysis Report Q1 2024',
    type: 'report',
    size: '3.1 MB',
    modified: '2024-03-12T14:20:00Z',
    author: 'Dr. Emily Davis',
    tags: ['climate', 'data', 'analysis'],
    status: 'draft',
    downloads: 45,
    views: 234,
    progress: 60
  }
];

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'upload',
    description: 'Dr. Sarah Chen uploaded "Deep Learning for Climate Prediction"',
    timestamp: '2 hours ago',
    user: 'Dr. Sarah Chen',
    metadata: { documentId: '1', documentType: 'paper' }
  },
  {
    id: '2',
    type: 'comment',
    description: 'New comment on "Quantum Computing Applications"',
    timestamp: '5 hours ago',
    user: 'Prof. Michael Brown',
    metadata: { documentId: '2', commentCount: 3 }
  },
  {
    id: '3',
    type: 'share',
    description: 'Research findings shared with 12 collaborators',
    timestamp: '1 day ago',
    user: 'Dr. Emily Davis',
    metadata: { collaborators: 12, workspaceId: '1' }
  },
  {
    id: '4',
    type: 'like',
    description: 'Your paper received 15 new likes',
    timestamp: '2 days ago',
    metadata: { likes: 15, documentId: '1' }
  },
  {
    id: '5',
    type: 'follow',
    description: 'Dr. James Wilson started following you',
    timestamp: '3 days ago',
    user: 'Dr. James Wilson',
    metadata: { followerId: 'jw123' }
  }
];

const quickActions: QuickAction[] = [
  {
    id: 'upload',
    title: 'Upload Document',
    description: 'Add new research paper or document',
    icon: <Upload className="w-5 h-5" />,
    color: 'text-blue-600',
    action: () => toast.info('Upload feature coming soon!'),
    badge: 'New'
  },
  {
    id: 'search',
    title: 'Advanced Search',
    description: 'Find papers and researchers',
    icon: <Search className="w-5 h-5" />,
    color: 'text-green-600',
    action: () => toast.info('Search feature coming soon!')
  },
  {
    id: 'workspace',
    title: 'Create Workspace',
    description: 'Start a new research collaboration',
    icon: <FolderOpen className="w-5 h-5" />,
    color: 'text-purple-600',
    action: () => toast.info('Workspace creation coming soon!')
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    description: 'Get AI-powered research help',
    icon: <Brain className="w-5 h-5" />,
    color: 'text-orange-600',
    action: () => toast.info('AI assistant coming soon!'),
    badge: 'Beta'
  },
  {
    id: 'analytics',
    title: 'View Analytics',
    description: 'Research impact and metrics',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'text-indigo-600',
    action: () => toast.info('Analytics dashboard coming soon!')
  },
  {
    id: 'collaborate',
    title: 'Find Collaborators',
    description: 'Connect with other researchers',
    icon: <Users className="w-5 h-5" />,
    color: 'text-pink-600',
    action: () => toast.info('Collaboration features coming soon!')
  }
];

// Components
const DocumentCard: React.FC<{ document: Document }> = ({ document }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paper': return <FileText className="w-4 h-4" />;
      case 'report': return <BarChart3 className="w-4 h-4" />;
      case 'notes': return <FileText className="w-4 h-4" />;
      case 'data': return <FolderOpen className="w-4 h-4" />;
      case 'presentation': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="academic-card hover:shadow-gold cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="academic-bg-gold p-2 rounded-lg text-gold-600">
                {getTypeIcon(document.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900 group-hover:text-gold-700 transition-colors line-clamp-2">
                  {document.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{document.author}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Download</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
            <span className="text-xs text-gray-500">{document.size}</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {document.progress !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{document.progress}%</span>
              </div>
              <Progress value={document.progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {document.views}
              </span>
              <span className="flex items-center gap-1">
                <Upload className="w-3 h-3" />
                {document.downloads}
              </span>
            </div>
            <span>{new Date(document.modified).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const WorkspaceCard: React.FC<{ workspace: Workspace }> = ({ workspace }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'research': return 'bg-blue-100 text-blue-800';
      case 'collaboration': return 'bg-green-100 text-green-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'team': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="academic-card hover:shadow-gold cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-gold-700 transition-colors">
                {workspace.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {workspace.description}
              </p>
            </div>
            <Badge className={getTypeColor(workspace.type)}>
              {workspace.type}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gold-600">{workspace.stats.documents}</div>
              <div className="text-xs text-gray-500">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gold-600">{workspace.stats.projects}</div>
              <div className="text-xs text-gray-500">Projects</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2">Members</div>
            <div className="flex -space-x-2">
              {workspace.members.slice(0, 3).map((member, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full bg-gold-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gold-700"
                  title={member.name}
                >
                  {member.avatar}
                </div>
              ))}
              {workspace.members.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                  +{workspace.members.length - 3}
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2">Active Projects</div>
            <div className="space-y-1">
              {workspace.projects.slice(0, 2).map((project, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 truncate">{project.name}</span>
                  <div className="flex items-center gap-2">
                    {project.progress && (
                      <div className="w-12">
                        <Progress value={project.progress} className="h-1" />
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Modified {new Date(workspace.lastModified).toLocaleDateString()}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ActivityItem: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="w-4 h-4 text-blue-600" />;
      case 'download': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'share': return <Users className="w-4 h-4 text-purple-600" />;
      case 'comment': return <FileText className="w-4 h-4 text-orange-600" />;
      case 'like': return <Star className="w-4 h-4 text-pink-600" />;
      case 'follow': return <Users className="w-4 h-4 text-indigo-600" />;
      case 'join': return <Award className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gold-50/50 transition-colors"
    >
      <div className="flex-shrink-0 mt-1">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
      </div>
    </motion.div>
  );
};

const QuickActionCard: React.FC<{ action: QuickAction }> = ({ action }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={action.action}
      className="group"
    >
      <Card className="academic-card hover:shadow-gold cursor-pointer h-full">
        <CardContent className="p-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="academic-bg-gold p-3 rounded-full text-gold-600 group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 group-hover:text-gold-700 transition-colors mb-1">
            {action.title}
          </h3>
          <p className="text-xs text-gray-600">{action.description}</p>
          {action.badge && (
            <Badge className="mt-2 academic-badge-primary text-xs">
              {action.badge}
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Component
export const AdvancedWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size'>('recent');
  const [filterType, setFilterType] = useState<string>('all');

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = mockDocuments.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.modified).getTime() - new Date(a.modified).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return parseFloat(b.size) - parseFloat(a.size);
        default:
          return 0;
      }
    });
  }, [searchQuery, filterType, sortBy]);

  const stats = useMemo(() => ({
    totalDocuments: mockDocuments.length,
    publishedDocuments: mockDocuments.filter(d => d.status === 'published').length,
    totalWorkspaces: mockWorkspaces.length,
    totalViews: mockDocuments.reduce((sum, doc) => sum + doc.views, 0),
    totalDownloads: mockDocuments.reduce((sum, doc) => sum + doc.downloads, 0),
    activeProjects: mockWorkspaces.reduce((sum, ws) => sum + ws.projects.filter(p => p.status === 'active').length, 0)
  }), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Workspace</h1>
          <p className="text-gray-600 mt-1">Manage your research workspaces and documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="academic-button-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Workspace
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="academic-stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gold-600">{stats.totalDocuments}</div>
            <div className="text-sm font-medium text-gold-700">Total Documents</div>
          </CardContent>
        </Card>
        <Card className="academic-stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gold-600">{stats.publishedDocuments}</div>
            <div className="text-sm font-medium text-gold-700">Published</div>
          </CardContent>
        </Card>
        <Card className="academic-stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gold-600">{stats.totalWorkspaces}</div>
            <div className="text-sm font-medium text-gold-700">Workspaces</div>
          </CardContent>
        </Card>
        <Card className="academic-stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gold-600">{stats.totalViews}</div>
            <div className="text-sm font-medium text-gold-700">Total Views</div>
          </CardContent>
        </Card>
        <Card className="academic-stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gold-600">{stats.totalDownloads}</div>
            <div className="text-sm font-medium text-gold-700">Downloads</div>
          </CardContent>
        </Card>
        <Card className="academic-stats-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gold-600">{stats.activeProjects}</div>
            <div className="text-sm font-medium text-gold-700">Active Projects</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('paper')}>Papers</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('report')}>Reports</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('notes')}>Notes</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortAsc className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('recent')}>Most Recent</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')}>Size</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Workspaces</h2>
              <div className="space-y-4">
                {mockWorkspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <Card className="academic-card">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {mockActivities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockWorkspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="academic-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedWorkspace;
