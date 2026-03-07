import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar, 
  User, 
  FileText, 
  Tag, 
  TrendingUp, 
  Award, 
  Clock, 
  Globe, 
  Building, 
  BookOpen, 
  Users, 
  BarChart3,
  Star,
  Download,
  Eye,
  Heart,
  Share2,
  Bookmark,
  MoreVertical,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types
interface SearchFilters {
  query: string;
  type: 'all' | 'papers' | 'authors' | 'topics' | 'institutions' | 'datasets';
  dateRange: 'all' | 'last_week' | 'last_month' | 'last_year' | 'custom';
  dateFrom?: string;
  dateTo?: string;
  author?: string;
  institution?: string;
  field?: string;
  tags: string[];
  minCitations: number;
  maxCitations: number;
  minYear: number;
  maxYear: number;
  year?: number;
  language: string;
  openAccess: boolean;
  peerReviewed: boolean;
  sortBy: 'relevance' | 'date' | 'citations' | 'downloads' | 'views' | 'impact';
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  type: 'paper' | 'author' | 'institution' | 'topic' | 'dataset';
  title: string;
  description?: string;
  authors?: Array<{ name: string; orcid?: string; affiliation?: string }>;
  institution?: string;
  field?: string;
  tags: string[];
  year?: number;
  citations: number;
  downloads: number;
  views: number;
  likes: number;
  bookmarks: number;
  shares: number;
  doi?: string;
  url?: string;
  abstract?: string;
  openAccess: boolean;
  peerReviewed: boolean;
  impact?: number;
  confidence?: number;
  highlights?: string[];
  related?: Array<{ id: string; title: string; type: string }>;
  lastModified: string;
}

interface SearchSuggestion {
  text: string;
  type: 'query' | 'author' | 'topic' | 'institution';
  count?: number;
  trending?: boolean;
}

interface SearchHistory {
  query: string;
  timestamp: string;
  resultCount: number;
}

// Mock data
const mockResults: SearchResult[] = [
  {
    id: '1',
    type: 'paper',
    title: 'Deep Learning Applications in Climate Science: A Comprehensive Review',
    description: 'An extensive analysis of deep learning methodologies applied to climate modeling and prediction systems.',
    authors: [
      { name: 'Dr. Sarah Chen', orcid: '0000-0002-1234-5678', affiliation: 'MIT' },
      { name: 'Prof. Michael Brown', orcid: '0000-0002-8765-4321', affiliation: 'Stanford' },
      { name: 'Dr. Emily Davis', orcid: '0000-0002-3456-7890', affiliation: 'Harvard' }
    ],
    institution: 'MIT',
    field: 'Climate Science',
    tags: ['deep learning', 'climate modeling', 'machine learning', 'environmental science'],
    year: 2024,
    citations: 156,
    downloads: 892,
    views: 3456,
    likes: 234,
    bookmarks: 89,
    shares: 45,
    doi: '10.1234/climate.2024.001',
    url: 'https://example.com/paper/1',
    abstract: 'This comprehensive review examines the application of deep learning techniques in climate science...',
    openAccess: true,
    peerReviewed: true,
    impact: 8.7,
    confidence: 0.94,
    highlights: [
      'deep learning',
      'climate modeling',
      'prediction accuracy',
      'environmental applications'
    ],
    related: [
      { id: '2', title: 'Climate Prediction Using Neural Networks', type: 'paper' },
      { id: '3', title: 'Machine Learning in Environmental Science', type: 'paper' }
    ],
    lastModified: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'author',
    title: 'Dr. Sarah Chen',
    description: 'Leading researcher in machine learning applications for climate science with 15+ years of experience.',
    institution: 'MIT',
    field: 'Climate Science',
    tags: ['machine learning', 'climate modeling', 'deep learning', 'environmental science'],
    citations: 1250,
    downloads: 5678,
    views: 12345,
    likes: 567,
    bookmarks: 234,
    shares: 123,
    url: 'https://example.com/author/1',
    openAccess: true,
    peerReviewed: true,
    impact: 9.2,
    confidence: 0.91,
    highlights: [
      'machine learning',
      'climate science',
      'deep learning',
      'environmental research'
    ],
    related: [
      { id: '4', title: 'Prof. Michael Brown', type: 'author' },
      { id: '5', title: 'Dr. Emily Davis', type: 'author' }
    ],
    lastModified: '2024-03-14T15:45:00Z'
  },
  {
    id: '3',
    type: 'institution',
    title: 'Massachusetts Institute of Technology',
    description: 'World-renowned research institution with excellence in climate science and machine learning.',
    field: 'Climate Science',
    tags: ['research', 'climate science', 'machine learning', 'technology'],
    citations: 15678,
    downloads: 23456,
    views: 45678,
    likes: 1234,
    bookmarks: 567,
    shares: 234,
    url: 'https://example.com/institution/1',
    openAccess: true,
    peerReviewed: true,
    impact: 9.8,
    confidence: 0.96,
    highlights: [
      'research excellence',
      'climate science',
      'machine learning',
      'innovation'
    ],
    related: [
      { id: '6', title: 'Stanford University', type: 'institution' },
      { id: '7', title: 'Harvard University', type: 'institution' }
    ],
    lastModified: '2024-03-13T12:20:00Z'
  }
];

const mockSuggestions: SearchSuggestion[] = [
  { text: 'deep learning climate science', type: 'query', count: 234, trending: true },
  { text: 'machine learning applications', type: 'query', count: 189 },
  { text: 'Dr. Sarah Chen', type: 'author', count: 45 },
  { text: 'climate modeling', type: 'topic', count: 156 },
  { text: 'MIT', type: 'institution', count: 89 },
  { text: 'environmental science', type: 'topic', count: 78 },
  { text: 'Prof. Michael Brown', type: 'author', count: 34 },
  { text: 'Stanford University', type: 'institution', count: 67 }
];

const mockHistory: SearchHistory[] = [
  { query: 'deep learning climate science', timestamp: '2024-03-15T10:30:00Z', resultCount: 234 },
  { query: 'machine learning applications', timestamp: '2024-03-14T15:45:00Z', resultCount: 189 },
  { query: 'climate modeling neural networks', timestamp: '2024-03-13T12:20:00Z', resultCount: 156 },
  { query: 'environmental data analysis', timestamp: '2024-03-12T09:15:00Z', resultCount: 78 }
];

const popularTags = [
  'machine learning', 'deep learning', 'climate science', 'neural networks',
  'environmental science', 'data analysis', 'prediction models', 'artificial intelligence',
  'climate modeling', 'sustainability', 'renewable energy', 'carbon footprint',
  'climate change', 'environmental impact', 'green technology', 'sustainable development'
];

// Components
const ResultCard: React.FC<{ result: SearchResult; onSelect: (result: SearchResult) => void }> = ({ result, onSelect }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paper': return <FileText className="w-4 h-4" />;
      case 'author': return <User className="w-4 h-4" />;
      case 'institution': return <Building className="w-4 h-4" />;
      case 'topic': return <Tag className="w-4 h-4" />;
      case 'dataset': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'paper': return 'bg-blue-100 text-blue-800';
      case 'author': return 'bg-green-100 text-green-800';
      case 'institution': return 'bg-purple-100 text-purple-800';
      case 'topic': return 'bg-orange-100 text-orange-800';
      case 'dataset': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="academic-card hover:shadow-gold cursor-pointer" onClick={() => onSelect(result)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="academic-bg-gold p-2 rounded-lg text-gold-600">
                {getTypeIcon(result.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-gold-700 transition-colors line-clamp-2">
                    {result.title}
                  </h3>
                  <Badge className={getTypeColor(result.type)}>
                    {result.type}
                  </Badge>
                  {result.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(result.confidence * 100)}% match
                    </Badge>
                  )}
                </div>
                {result.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">{result.description}</p>
                )}
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
                <DropdownMenuItem>Bookmark</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {result.authors && (
            <div className="mb-2">
              <p className="text-xs text-gray-600">
                {result.authors.slice(0, 3).map(author => author.name).join(', ')}
                {result.authors.length > 3 && ` +${result.authors.length - 3} more`}
              </p>
            </div>
          )}

          {result.highlights && (
            <div className="mb-3">
              <p className="text-xs text-gray-600">
                {result.highlights.map((highlight, index) => (
                  <span key={index} className="inline-block">
                    <mark className="bg-gold-100 text-gold-800 px-1 rounded">{highlight}</mark>
                    {index < result.highlights.length - 1 && ' '}
                  </span>
                ))}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {result.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {result.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{result.tags.length - 4}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {result.citations}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {result.downloads}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {result.views}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {result.openAccess && (
                <Badge variant="outline" className="text-xs">
                  Open Access
                </Badge>
              )}
              {result.peerReviewed && (
                <Badge variant="outline" className="text-xs">
                  Peer Reviewed
                </Badge>
              )}
              {result.year && (
                <span>{result.year}</span>
              )}
            </div>
          </div>

          {result.impact && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Impact Score</span>
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-gold-500" />
                  <span className="text-xs font-semibold text-gold-600">{result.impact}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SuggestionItem: React.FC<{ suggestion: SearchSuggestion; onSelect: (suggestion: SearchSuggestion) => void }> = ({ suggestion, onSelect }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'query': return <Search className="w-4 h-4" />;
      case 'author': return <User className="w-4 h-4" />;
      case 'topic': return <Tag className="w-4 h-4" />;
      case 'institution': return <Building className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gold-50 cursor-pointer transition-colors"
      onClick={() => onSelect(suggestion)}
    >
      <div className="flex-shrink-0 text-gold-600">
        {getIcon(suggestion.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{suggestion.text}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{suggestion.type}</span>
          {suggestion.count && (
            <span>• {suggestion.count} results</span>
          )}
          {suggestion.trending && (
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const HistoryItem: React.FC<{ history: SearchHistory; onSelect: (history: SearchHistory) => void; onClear: (history: SearchHistory) => void }> = ({ history, onSelect, onClear }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
    >
      <div className="flex-shrink-0 text-gray-400">
        <Clock className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{history.query}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{new Date(history.timestamp).toLocaleDateString()}</span>
          <span>• {history.resultCount} results</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onClear(history)}
      >
        <X className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

// Main Component
export const AdvancedSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    dateRange: 'all',
    tags: [],
    minCitations: 0,
    maxCitations: 1000,
    minYear: 1990,
    maxYear: 2024,
    language: 'en',
    openAccess: false,
    peerReviewed: false,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>(mockHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    searchTime: 0,
    queryTime: 0
  });

  // Filter results based on filters
  const filteredResults = useMemo(() => {
    let filtered = mockResults.filter(result => {
      if (filters.type !== 'all' && result.type !== filters.type.replace(/s$/, '')) return false;
      if (filters.minCitations > 0 && result.citations < filters.minCitations) return false;
      if (filters.maxCitations < 1000 && result.citations > filters.maxCitations) return false;
      if (filters.year && result.year && (result.year < filters.minYear || result.year > filters.maxYear)) return false;
      if (filters.openAccess && !result.openAccess) return false;
      if (filters.peerReviewed && !result.peerReviewed) return false;
      if (selectedTags.length > 0 && !selectedTags.some(tag => result.tags.includes(tag))) return false;
      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'relevance':
          return (b.confidence || 0 - (a.confidence || 0)) * order;
        case 'citations':
          return (b.citations - a.citations) * order;
        case 'downloads':
          return (b.downloads - a.downloads) * order;
        case 'views':
          return (b.views - a.views) * order;
        case 'impact':
          return ((b.impact || 0) - (a.impact || 0)) * order;
        case 'date':
          return (new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()) * order;
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, selectedTags]);

  // Update suggestions based on query
  useEffect(() => {
    if (query.length > 2) {
      const filteredSuggestions = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  // Simulate search
  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    const endTime = Date.now();
    setSearchStats({
      totalResults: filteredResults.length,
      searchTime: endTime - startTime,
      queryTime: endTime - startTime
    });
    
    setResults(filteredResults);
    setIsLoading(false);
    
    // Add to history
    const newHistory: SearchHistory = {
      query: searchQuery,
      timestamp: new Date().toISOString(),
      resultCount: filteredResults.length
    };
    setHistory(prev => [newHistory, ...prev.slice(0, 9)]);
  }, [filteredResults]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    
    setFilters(prev => ({ ...prev, query }));
    performSearch(query);
    setShowSuggestions(false);
  }, [query, performSearch]);

  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    performSearch(suggestion.text);
  }, [performSearch]);

  const handleHistorySelect = useCallback((historyItem: SearchHistory) => {
    setQuery(historyItem.query);
    performSearch(historyItem.query);
  }, [performSearch]);

  const handleHistoryClear = useCallback((historyItem: SearchHistory) => {
    setHistory(prev => prev.filter(item => item !== historyItem));
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleResultSelect = useCallback((result: SearchResult) => {
    toast.info(`Selected: ${result.title}`);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      query: '',
      type: 'all',
      dateRange: 'all',
      tags: [],
      minCitations: 0,
      maxCitations: 1000,
      minYear: 1990,
      maxYear: 2024,
      language: 'en',
      openAccess: false,
      peerReviewed: false,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setSelectedTags([]);
    setQuery('');
    setResults([]);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Advanced Search</h2>
                <p className="text-xs text-muted-foreground">
                  {searchStats.totalResults > 0 && (
                    <span>{searchStats.totalResults} results ({searchStats.searchTime}ms)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {Object.values(filters).filter(v => 
                v !== '' && v !== 'all' && v !== 'en' && v !== false && v !== 0 && v !== 1990
              ).length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {Object.values(filters).filter(v => 
                    v !== '' && v !== 'all' && v !== 'en' && v !== false && v !== 0 && v !== 1990
                  ).length}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search papers, authors, institutions, topics..."
                className="pl-10 pr-4"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={!query.trim() || isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50"
              >
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions</div>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <SuggestionItem
                        key={index}
                        suggestion={suggestion}
                        onSelect={handleSuggestionSelect}
                      />
                    ))}
                  </div>
                </div>
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
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-80 border-r border-border bg-card p-4 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Type Filter */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Content Type</h3>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="papers">Papers</SelectItem>
                      <SelectItem value="authors">Authors</SelectItem>
                      <SelectItem value="institutions">Institutions</SelectItem>
                      <SelectItem value="topics">Topics</SelectItem>
                      <SelectItem value="datasets">Datasets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Sort By</h3>
                  <div className="space-y-2">
                    <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="citations">Citations</SelectItem>
                        <SelectItem value="downloads">Downloads</SelectItem>
                        <SelectItem value="views">Views</SelectItem>
                        <SelectItem value="impact">Impact Score</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Citation Range */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Citation Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Min: {filters.minCitations}</span>
                      <span>Max: {filters.maxCitations}</span>
                    </div>
                    <Slider
                      value={[filters.minCitations, filters.maxCitations]}
                      onValueChange={([min, max]) => {
                        handleFilterChange('minCitations', min);
                        handleFilterChange('maxCitations', max);
                      }}
                      min={0}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Year Range */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Publication Year</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>From: {filters.minYear}</span>
                      <span>To: {filters.maxYear}</span>
                    </div>
                    <Slider
                      value={[filters.minYear, filters.maxYear]}
                      onValueChange={([min, max]) => {
                        handleFilterChange('minYear', min);
                        handleFilterChange('maxYear', max);
                      }}
                      min={1990}
                      max={2024}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Access Filters */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Access</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="open-access"
                        checked={filters.openAccess}
                        onCheckedChange={(checked) => handleFilterChange('openAccess', checked)}
                      />
                      <label htmlFor="open-access" className="text-sm">
                        Open Access Only
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="peer-reviewed"
                        checked={filters.peerReviewed}
                        onCheckedChange={(checked) => handleFilterChange('peerReviewed', checked)}
                      />
                      <label htmlFor="peer-reviewed" className="text-sm">
                        Peer Reviewed Only
                      </label>
                    </div>
                  </div>
                </div>

                {/* Popular Tags */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.slice(0, 12).map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Results Header */}
          <div className="p-4 border-b border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="papers">Papers</TabsTrigger>
                <TabsTrigger value="authors">Authors</TabsTrigger>
                <TabsTrigger value="institutions">Institutions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results Content */}
          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Searching...</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results
                  .filter(result => {
                    if (activeTab === 'all') return true;
                    const typeMap: Record<string, string> = {
                      'papers': 'paper',
                      'authors': 'author',
                      'institutions': 'institution',
                      'topics': 'topic',
                      'datasets': 'dataset'
                    };
                    return result.type === typeMap[activeTab];
                  })
                  .map((result) => (
                    <ResultCard
                      key={result.id}
                      result={result}
                      onSelect={handleResultSelect}
                    />
                  ))}
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-sm text-gray-600">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search History */}
                {history.length > 0 && (
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Recent Searches</h3>
                    <div className="space-y-2">
                      {history.map((item, index) => (
                        <HistoryItem
                          key={index}
                          history={item}
                          onSelect={handleHistorySelect}
                          onClear={handleHistoryClear}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Search Suggestions */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Quick Searches</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Machine learning climate science',
                      'Deep learning applications',
                      'Climate modeling neural networks',
                      'Environmental data analysis',
                      'Sustainable development',
                      'Renewable energy research'
                    ].map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs justify-start"
                        onClick={() => {
                          setQuery(suggestion);
                          performSearch(suggestion);
                        }}
                      >
                        <Search className="w-3 h-3 mr-2" />
                        {suggestion}
                      </Button>
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
