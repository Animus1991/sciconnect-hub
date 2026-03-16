import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Upload, Search, Settings, Users, BarChart3, Brain, FolderOpen, Clock, TrendingUp, 
  Award, Star, ChevronRight, Plus, Grid3x3, List, Filter, SortAsc, MoreVertical
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Document {
  id: string; title: string; type: string; size: string; modified: string;
  author: string; tags: string[]; status: string; downloads: number; views: number; progress?: number;
}
interface Workspace {
  id: string; name: string; description: string; type: string;
  members: Array<{ name: string; avatar?: string; role?: string }>;
  projects: Array<{ name: string; status: string; progress?: number }>;
  stats: Record<string, number>; lastModified: string;
}
interface ActivityItem { id: string; type: string; description: string; timestamp: string; }

const mockWorkspaces: Workspace[] = [
  {
    id: '1', name: 'Machine Learning Research', description: 'Advanced ML algorithms and neural networks research', type: 'research',
    members: [{ name: 'Dr. Sarah Chen', avatar: 'SC', role: 'PI' }, { name: 'Prof. Michael Brown', avatar: 'MB', role: 'Co-I' }, { name: 'Dr. Emily Davis', avatar: 'ED', role: 'Postdoc' }],
    projects: [{ name: 'Deep Learning for Climate Prediction', status: 'active', progress: 75 }, { name: 'Quantum Computing Applications', status: 'planning', progress: 25 }, { name: 'Natural Language Processing', status: 'completed', progress: 100 }],
    stats: { documents: 24, projects: 3, citations: 156, downloads: 892 }, lastModified: '2024-03-15T10:30:00Z'
  },
  {
    id: '2', name: 'Climate Science Collaboration', description: 'Multi-institutional climate research initiative', type: 'collaboration',
    members: [{ name: 'Dr. James Wilson', avatar: 'JW' }, { name: 'Dr. Maria Garcia', avatar: 'MG' }, { name: 'Prof. Robert Taylor', avatar: 'RT' }],
    projects: [{ name: 'Arctic Ice Melt Analysis', status: 'active', progress: 60 }, { name: 'Carbon Cycle Modeling', status: 'active', progress: 45 }],
    stats: { documents: 18, projects: 2, members: 12, datasets: 45 }, lastModified: '2024-03-15T09:15:00Z'
  }
];

const mockDocuments: Document[] = [
  { id: '1', title: 'Deep Learning for Climate Prediction: A Comprehensive Study', type: 'paper', size: '2.4 MB', modified: '2024-03-14T15:30:00Z', author: 'Dr. Sarah Chen', tags: ['machine learning', 'climate'], status: 'published', downloads: 234, views: 1567, progress: 100 },
  { id: '2', title: 'Quantum Computing Applications in Scientific Research', type: 'paper', size: '1.8 MB', modified: '2024-03-13T11:45:00Z', author: 'Prof. Michael Brown', tags: ['quantum', 'computing'], status: 'review', downloads: 89, views: 645, progress: 85 },
  { id: '3', title: 'Climate Data Analysis Report Q1 2024', type: 'report', size: '3.1 MB', modified: '2024-03-12T14:20:00Z', author: 'Dr. Emily Davis', tags: ['climate', 'data'], status: 'draft', downloads: 45, views: 234, progress: 60 },
];

const mockActivities: ActivityItem[] = [
  { id: '1', type: 'upload', description: 'Dr. Sarah Chen uploaded "Deep Learning for Climate Prediction"', timestamp: '2 hours ago' },
  { id: '2', type: 'comment', description: 'New comment on "Quantum Computing Applications"', timestamp: '5 hours ago' },
  { id: '3', type: 'share', description: 'Research findings shared with 12 collaborators', timestamp: '1 day ago' },
  { id: '4', type: 'like', description: 'Your paper received 15 new likes', timestamp: '2 days ago' },
  { id: '5', type: 'follow', description: 'Dr. James Wilson started following you', timestamp: '3 days ago' },
];

const statusStyles: Record<string, string> = {
  published: 'bg-emerald-muted text-emerald', review: 'bg-gold-muted text-gold-foreground',
  draft: 'bg-secondary text-secondary-foreground', archived: 'bg-destructive/10 text-destructive',
};
const typeStyles: Record<string, string> = {
  research: 'bg-scholarly-light text-scholarly', collaboration: 'bg-emerald-muted text-emerald',
  personal: 'bg-accent/10 text-accent', team: 'bg-gold-muted text-gold-foreground',
};
const activityIcons: Record<string, React.ReactNode> = {
  upload: <Upload className="w-4 h-4 text-primary" />, comment: <FileText className="w-4 h-4 text-gold" />,
  share: <Users className="w-4 h-4 text-accent" />, like: <Star className="w-4 h-4 text-gold" />,
  follow: <Users className="w-4 h-4 text-scholarly" />, join: <Award className="w-4 h-4 text-emerald" />,
};

const DocumentCard: React.FC<{ document: Document }> = ({ document }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="group">
    <Card className="border border-border hover:shadow-gold cursor-pointer transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gold-muted p-2 rounded-lg text-gold"><FileText className="w-4 h-4" /></div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground group-hover:text-gold transition-colors line-clamp-2">{document.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{document.author}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Badge className={statusStyles[document.status] || 'bg-secondary text-secondary-foreground'}>{document.status}</Badge>
          <span className="text-xs text-muted-foreground">{document.size}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">{document.tags.map((tag, i) => <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>)}</div>
        {document.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Progress</span><span>{document.progress}%</span></div>
            <Progress value={document.progress} className="h-2" />
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{document.views}</span>
            <span className="flex items-center gap-1"><Upload className="w-3 h-3" />{document.downloads}</span>
          </div>
          <span>{new Date(document.modified).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const WorkspaceCard: React.FC<{ workspace: Workspace }> = ({ workspace }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="group">
    <Card className="border border-border hover:shadow-gold cursor-pointer transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors">{workspace.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{workspace.description}</p>
          </div>
          <Badge className={typeStyles[workspace.type] || 'bg-secondary text-secondary-foreground'}>{workspace.type}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center"><div className="text-lg font-bold text-gold">{workspace.stats.documents}</div><div className="text-xs text-muted-foreground">Documents</div></div>
          <div className="text-center"><div className="text-lg font-bold text-gold">{workspace.stats.projects}</div><div className="text-xs text-muted-foreground">Projects</div></div>
        </div>
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-2">Members</div>
          <div className="flex -space-x-2">
            {workspace.members.slice(0, 3).map((m, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gold-muted border-2 border-background flex items-center justify-center text-xs font-medium text-gold" title={m.name}>{m.avatar}</div>
            ))}
            {workspace.members.length > 3 && <div className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">+{workspace.members.length - 3}</div>}
          </div>
        </div>
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-2">Active Projects</div>
          <div className="space-y-1">
            {workspace.projects.slice(0, 2).map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-foreground truncate">{p.name}</span>
                <div className="flex items-center gap-2">
                  {p.progress && <div className="w-12"><Progress value={p.progress} className="h-1" /></div>}
                  <Badge variant="outline" className="text-xs">{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Modified {new Date(workspace.lastModified).toLocaleDateString()}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ActivityRow: React.FC<{ activity: ActivityItem }> = ({ activity }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
    <div className="flex-shrink-0 mt-1">{activityIcons[activity.type] || <Clock className="w-4 h-4 text-muted-foreground" />}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground">{activity.description}</p>
      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
    </div>
  </motion.div>
);

const QuickActionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; badge?: string; onClick: () => void }> = ({ title, description, icon, badge, onClick }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="group">
    <Card className="border border-border hover:shadow-gold cursor-pointer h-full transition-shadow">
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-3">
          <div className="bg-gold-muted p-3 rounded-full text-gold group-hover:scale-110 transition-transform">{icon}</div>
        </div>
        <h3 className="font-semibold text-sm text-foreground group-hover:text-gold transition-colors mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
        {badge && <Badge className="mt-2 bg-accent text-accent-foreground text-xs">{badge}</Badge>}
      </CardContent>
    </Card>
  </motion.div>
);

export const AdvancedWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size'>('recent');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDocuments = useMemo(() => {
    let filtered = mockDocuments.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (filterType !== 'all') filtered = filtered.filter(doc => doc.type === filterType);
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent': return new Date(b.modified).getTime() - new Date(a.modified).getTime();
        case 'name': return a.title.localeCompare(b.title);
        case 'size': return parseFloat(b.size) - parseFloat(a.size);
        default: return 0;
      }
    });
  }, [searchQuery, filterType, sortBy]);

  const stats = useMemo(() => ({
    totalDocuments: mockDocuments.length, publishedDocuments: mockDocuments.filter(d => d.status === 'published').length,
    totalWorkspaces: mockWorkspaces.length, totalViews: mockDocuments.reduce((s, d) => s + d.views, 0),
    totalDownloads: mockDocuments.reduce((s, d) => s + d.downloads, 0),
    activeProjects: mockWorkspaces.reduce((s, ws) => s + ws.projects.filter(p => p.status === 'active').length, 0)
  }), []);

  const quickActions = [
    { title: 'Upload Document', description: 'Add new research paper', icon: <Upload className="w-5 h-5" />, onClick: () => toast.info('Upload coming soon!'), badge: 'New' },
    { title: 'Advanced Search', description: 'Find papers and researchers', icon: <Search className="w-5 h-5" />, onClick: () => toast.info('Search coming soon!') },
    { title: 'Create Workspace', description: 'Start a new collaboration', icon: <FolderOpen className="w-5 h-5" />, onClick: () => toast.info('Coming soon!') },
    { title: 'AI Assistant', description: 'Get AI-powered help', icon: <Brain className="w-5 h-5" />, onClick: () => toast.info('Coming soon!'), badge: 'Beta' },
    { title: 'View Analytics', description: 'Impact and metrics', icon: <BarChart3 className="w-5 h-5" />, onClick: () => toast.info('Coming soon!') },
    { title: 'Find Collaborators', description: 'Connect with researchers', icon: <Users className="w-5 h-5" />, onClick: () => toast.info('Coming soon!') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">Advanced Workspace</h1>
          <p className="text-muted-foreground mt-1 font-display">Manage your research workspaces and documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Settings className="w-4 h-4 mr-2" />Settings</Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" />New Workspace</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Documents', value: stats.totalDocuments }, { label: 'Published', value: stats.publishedDocuments },
          { label: 'Workspaces', value: stats.totalWorkspaces }, { label: 'Total Views', value: stats.totalViews },
          { label: 'Downloads', value: stats.totalDownloads }, { label: 'Active Projects', value: stats.activeProjects },
        ].map(s => (
          <Card key={s.label} className="border border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gold font-display">{s.value}</div>
              <div className="text-sm font-medium text-foreground font-display">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map(a => <QuickActionCard key={a.title} {...a} />)}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filter</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('paper')}>Papers</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('report')}>Reports</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><SortAsc className="w-4 h-4 mr-2" />Sort</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('recent')}>Most Recent</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')}>Size</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center border border-border rounded-lg">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-r-none"><Grid3x3 className="w-4 h-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-l-none"><List className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 font-serif">Recent Workspaces</h2>
              <div className="space-y-4">{mockWorkspaces.map(ws => <WorkspaceCard key={ws.id} workspace={ws} />)}</div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 font-serif">Recent Activity</h2>
              <Card className="border border-border">
                <CardContent className="p-4"><div className="space-y-3">{mockActivities.map(a => <ActivityRow key={a.id} activity={a} />)}</div></CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="documents"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredDocuments.map(d => <DocumentCard key={d.id} document={d} />)}</div></TabsContent>
        <TabsContent value="workspaces"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{mockWorkspaces.map(ws => <WorkspaceCard key={ws.id} workspace={ws} />)}</div></TabsContent>
        <TabsContent value="activity">
          <Card className="border border-border"><CardContent className="p-6"><div className="space-y-4">{mockActivities.map(a => <ActivityRow key={a.id} activity={a} />)}</div></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedWorkspace;
