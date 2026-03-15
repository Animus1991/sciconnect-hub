import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, Calendar, User, FileText, Tag, TrendingUp, Award, Clock, Globe,
  Building, BookOpen, Users, BarChart3, Star, Download, Eye, Heart, Share2, Bookmark,
  MoreVertical, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SearchFilters {
  query: string;
  type: 'all' | 'papers' | 'authors' | 'topics' | 'institutions' | 'datasets';
  dateRange: string; tags: string[]; minCitations: number; maxCitations: number;
  minYear: number; maxYear: number; language: string; openAccess: boolean;
  peerReviewed: boolean; sortBy: string; sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string; type: 'paper' | 'author' | 'institution' | 'topic' | 'dataset';
  title: string; description?: string;
  authors?: Array<{ name: string; orcid?: string; affiliation?: string }>;
  institution?: string; field?: string; tags: string[]; year?: number;
  citations: number; downloads: number; views: number; likes: number;
  doi?: string; openAccess: boolean; peerReviewed: boolean;
  impact?: number; confidence?: number; highlights?: string[];
  lastModified: string;
}

interface SearchSuggestion { text: string; type: string; count?: number; trending?: boolean; }
interface SearchHistory { query: string; timestamp: string; resultCount: number; }

const mockResults: SearchResult[] = [
  {
    id: '1', type: 'paper', title: 'Deep Learning Applications in Climate Science: A Comprehensive Review',
    description: 'An extensive analysis of deep learning methodologies applied to climate modeling.',
    authors: [{ name: 'Dr. Sarah Chen', affiliation: 'MIT' }, { name: 'Prof. Michael Brown', affiliation: 'Stanford' }],
    institution: 'MIT', field: 'Climate Science', tags: ['deep learning', 'climate modeling', 'machine learning'],
    year: 2024, citations: 156, downloads: 892, views: 3456, likes: 234, doi: '10.1234/climate.2024.001',
    openAccess: true, peerReviewed: true, impact: 8.7, confidence: 0.94,
    highlights: ['deep learning', 'climate modeling', 'prediction accuracy'], lastModified: '2024-03-15T10:30:00Z'
  },
  {
    id: '2', type: 'author', title: 'Dr. Sarah Chen',
    description: 'Leading researcher in ML for climate science with 15+ years experience.',
    institution: 'MIT', field: 'Climate Science', tags: ['machine learning', 'climate modeling'],
    citations: 1250, downloads: 5678, views: 12345, likes: 567,
    openAccess: true, peerReviewed: true, impact: 9.2, confidence: 0.91,
    highlights: ['machine learning', 'climate science'], lastModified: '2024-03-14T15:45:00Z'
  },
  {
    id: '3', type: 'institution', title: 'Massachusetts Institute of Technology',
    description: 'World-renowned institution with excellence in climate science and ML.',
    field: 'Climate Science', tags: ['research', 'climate science', 'machine learning'],
    citations: 15678, downloads: 23456, views: 45678, likes: 1234,
    openAccess: true, peerReviewed: true, impact: 9.8, confidence: 0.96,
    highlights: ['research excellence', 'climate science'], lastModified: '2024-03-13T12:20:00Z'
  }
];

const mockSuggestions: SearchSuggestion[] = [
  { text: 'deep learning climate science', type: 'query', count: 234, trending: true },
  { text: 'machine learning applications', type: 'query', count: 189 },
  { text: 'Dr. Sarah Chen', type: 'author', count: 45 },
  { text: 'climate modeling', type: 'topic', count: 156 },
  { text: 'MIT', type: 'institution', count: 89 },
];

const mockHistory: SearchHistory[] = [
  { query: 'deep learning climate science', timestamp: '2024-03-15T10:30:00Z', resultCount: 234 },
  { query: 'machine learning applications', timestamp: '2024-03-14T15:45:00Z', resultCount: 189 },
  { query: 'climate modeling neural networks', timestamp: '2024-03-13T12:20:00Z', resultCount: 156 },
];

const popularTags = [
  'machine learning', 'deep learning', 'climate science', 'neural networks',
  'environmental science', 'data analysis', 'prediction models', 'artificial intelligence',
  'climate modeling', 'sustainability', 'renewable energy', 'carbon footprint',
];

const typeIcons: Record<string, React.ReactNode> = {
  paper: <FileText className="w-4 h-4" />, author: <User className="w-4 h-4" />,
  institution: <Building className="w-4 h-4" />, topic: <Tag className="w-4 h-4" />,
  dataset: <BarChart3 className="w-4 h-4" />,
};
const typeColors: Record<string, string> = {
  paper: 'bg-scholarly-light text-scholarly', author: 'bg-emerald-muted text-emerald',
  institution: 'bg-accent/10 text-accent', topic: 'bg-gold-muted text-gold-foreground',
  dataset: 'bg-primary/10 text-primary',
};
const suggestionIcons: Record<string, React.ReactNode> = {
  query: <Search className="w-4 h-4" />, author: <User className="w-4 h-4" />,
  topic: <Tag className="w-4 h-4" />, institution: <Building className="w-4 h-4" />,
};

const ResultCard: React.FC<{ result: SearchResult; onSelect: (r: SearchResult) => void }> = ({ result, onSelect }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group">
    <Card className="border border-border hover:shadow-gold cursor-pointer transition-shadow" onClick={() => onSelect(result)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gold-muted p-2 rounded-lg text-gold">{typeIcons[result.type] || <FileText className="w-4 h-4" />}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-gold transition-colors line-clamp-2">{result.title}</h3>
                <Badge className={typeColors[result.type] || 'bg-secondary text-secondary-foreground'}>{result.type}</Badge>
                {result.confidence && <Badge variant="outline" className="text-xs">{Math.round(result.confidence * 100)}% match</Badge>}
              </div>
              {result.description && <p className="text-xs text-muted-foreground line-clamp-2">{result.description}</p>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem><DropdownMenuItem>Bookmark</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {result.authors && (
          <p className="text-xs text-muted-foreground mb-2">
            {result.authors.slice(0, 3).map(a => a.name).join(', ')}{result.authors.length > 3 && ` +${result.authors.length - 3} more`}
          </p>
        )}
        {result.highlights && (
          <div className="mb-3">
            {result.highlights.map((h, i) => (
              <span key={i} className="inline-block"><mark className="bg-gold-muted text-gold-foreground px-1 rounded text-xs">{h}</mark>{i < result.highlights!.length - 1 && ' '}</span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mb-3">{result.tags.slice(0, 4).map((t, i) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}</div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{result.citations}</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{result.downloads}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{result.views}</span>
          </div>
          <div className="flex items-center gap-2">
            {result.openAccess && <Badge variant="outline" className="text-xs">Open Access</Badge>}
            {result.year && <span>{result.year}</span>}
          </div>
        </div>
        {result.impact && (
          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Impact Score</span>
            <div className="flex items-center gap-1"><Award className="w-3 h-3 text-gold" /><span className="text-xs font-semibold text-gold">{result.impact}</span></div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export const AdvancedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '', type: 'all', dateRange: 'all', tags: [], minCitations: 0, maxCitations: 1000,
    minYear: 1990, maxYear: 2024, language: 'en', openAccess: false, peerReviewed: false,
    sortBy: 'relevance', sortOrder: 'desc'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>(mockHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState({ totalResults: 0, searchTime: 0 });

  const filteredResults = useMemo(() => {
    let filtered = mockResults.filter(r => {
      if (filters.type !== 'all' && r.type !== filters.type.replace(/s$/, '')) return false;
      if (filters.minCitations > 0 && r.citations < filters.minCitations) return false;
      if (filters.openAccess && !r.openAccess) return false;
      if (filters.peerReviewed && !r.peerReviewed) return false;
      if (selectedTags.length > 0 && !selectedTags.some(t => r.tags.includes(t))) return false;
      return true;
    });
    filtered.sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'citations': return (b.citations - a.citations) * order;
        case 'downloads': return (b.downloads - a.downloads) * order;
        case 'impact': return ((b.impact || 0) - (a.impact || 0)) * order;
        default: return ((b.confidence || 0) - (a.confidence || 0)) * order;
      }
    });
    return filtered;
  }, [filters, selectedTags]);

  React.useEffect(() => {
    if (query.length > 2) {
      setSuggestions(mockSuggestions.filter(s => s.text.toLowerCase().includes(query.toLowerCase())));
      setShowSuggestions(true);
    } else setShowSuggestions(false);
  }, [query]);

  const performSearch = useCallback(async (q: string) => {
    setIsLoading(true);
    const t = Date.now();
    await new Promise(r => setTimeout(r, 800));
    setSearchStats({ totalResults: filteredResults.length, searchTime: Date.now() - t });
    setResults(filteredResults);
    setIsLoading(false);
    setHistory(prev => [{ query: q, timestamp: new Date().toISOString(), resultCount: filteredResults.length }, ...prev.slice(0, 9)]);
  }, [filteredResults]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setFilters(prev => ({ ...prev, query }));
    performSearch(query);
    setShowSuggestions(false);
  }, [query, performSearch]);

  const clearAllFilters = useCallback(() => {
    setFilters({ query: '', type: 'all', dateRange: 'all', tags: [], minCitations: 0, maxCitations: 1000, minYear: 1990, maxYear: 2024, language: 'en', openAccess: false, peerReviewed: false, sortBy: 'relevance', sortOrder: 'desc' });
    setSelectedTags([]); setQuery(''); setResults([]);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-gold text-accent-foreground flex items-center justify-center"><Search className="w-4 h-4" /></div>
            <div>
              <h2 className="font-semibold text-foreground">Advanced Search</h2>
              <p className="text-xs text-muted-foreground">
                {searchStats.totalResults > 0 && <span>{searchStats.totalResults} results ({searchStats.searchTime}ms)</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />Filters
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllFilters}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input value={query} onChange={e => setQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search papers, authors, institutions, topics..." className="pl-10 pr-4" />
              {query && <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => setQuery('')}><X className="w-4 h-4" /></Button>}
            </div>
            <Button onClick={handleSearch} disabled={!query.trim() || isLoading}><Search className="w-4 h-4 mr-2" />Search</Button>
          </div>

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions</div>
                {suggestions.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => { setQuery(s.text); setShowSuggestions(false); performSearch(s.text); }}>
                    <div className="text-gold">{suggestionIcons[s.type] || <Search className="w-4 h-4" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{s.text}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{s.type}</span>{s.count && <span>• {s.count} results</span>}
                        {s.trending && <Badge variant="outline" className="text-xs"><TrendingUp className="w-3 h-3 mr-1" />Trending</Badge>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="w-80 border-r border-border bg-card p-4 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-3">Content Type</h3>
                  <Select value={filters.type} onValueChange={v => setFilters(p => ({ ...p, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem><SelectItem value="papers">Papers</SelectItem>
                      <SelectItem value="authors">Authors</SelectItem><SelectItem value="institutions">Institutions</SelectItem>
                      <SelectItem value="topics">Topics</SelectItem><SelectItem value="datasets">Datasets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-3">Sort By</h3>
                  <Select value={filters.sortBy} onValueChange={v => setFilters(p => ({ ...p, sortBy: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem><SelectItem value="citations">Citations</SelectItem>
                      <SelectItem value="downloads">Downloads</SelectItem><SelectItem value="impact">Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-3">Citation Range</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Min: {filters.minCitations}</span><span>Max: {filters.maxCitations}</span></div>
                  <Slider value={[filters.minCitations, filters.maxCitations]}
                    onValueChange={([min, max]) => setFilters(p => ({ ...p, minCitations: min, maxCitations: max }))}
                    min={0} max={1000} step={10} className="w-full" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-3">Access</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="oa" checked={filters.openAccess} onCheckedChange={c => setFilters(p => ({ ...p, openAccess: !!c }))} />
                      <label htmlFor="oa" className="text-sm text-foreground">Open Access Only</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="pr" checked={filters.peerReviewed} onCheckedChange={c => setFilters(p => ({ ...p, peerReviewed: !!c }))} />
                      <label htmlFor="pr" className="text-sm text-foreground">Peer Reviewed Only</label>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-3">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer text-xs"
                        onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Results</TabsTrigger><TabsTrigger value="papers">Papers</TabsTrigger>
                <TabsTrigger value="authors">Authors</TabsTrigger><TabsTrigger value="institutions">Institutions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Searching...</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.filter(r => activeTab === 'all' || r.type === activeTab.replace(/s$/, '')).map(r => (
                  <ResultCard key={r.id} result={r} onSelect={r => toast.info(`Selected: ${r.title}`)} />
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {history.length > 0 && (
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Recent Searches</h3>
                    <div className="space-y-2">
                      {history.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 group">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setQuery(item.query); performSearch(item.query); }}>
                            <p className="text-sm text-foreground truncate">{item.query}</p>
                            <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()} • {item.resultCount} results</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => setHistory(prev => prev.filter((_, idx) => idx !== i))}><X className="w-4 h-4" /></Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Quick Searches</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['Machine learning climate science', 'Deep learning applications', 'Climate modeling neural networks', 'Environmental data analysis', 'Sustainable development', 'Renewable energy research'].map((s, i) => (
                      <Button key={i} variant="outline" size="sm" className="text-xs justify-start"
                        onClick={() => { setQuery(s); performSearch(s); }}><Search className="w-3 h-3 mr-2" />{s}</Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
