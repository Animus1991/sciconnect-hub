import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, Brain, FileText, Search, TrendingUp, Award, Users, 
  Clock, CheckCircle, AlertCircle, Info, ChevronDown, Paperclip, Mic, Settings, HelpCircle, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    type?: 'text' | 'code' | 'table' | 'chart' | 'file';
    confidence?: number;
    sources?: Array<{ title: string; url: string; confidence: number }>;
    actions?: Array<{ label: string; action: string; icon?: React.ReactNode }>;
  };
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'recommendation' | 'warning' | 'opportunity' | 'analysis';
  confidence: number;
  actions: Array<{ label: string; action: string; icon?: React.ReactNode }>;
  timestamp: string;
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  beta?: boolean;
  pro?: boolean;
}

const mockInsights: AIInsight[] = [
  {
    id: '1', title: 'Research Trend Detected',
    description: 'Your research area shows a 23% increase in publications over the last 6 months.',
    type: 'trend', confidence: 0.87,
    actions: [
      { label: 'View Analysis', action: 'view_analysis', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Create Report', action: 'create_report', icon: <FileText className="w-4 h-4" /> }
    ],
    timestamp: '2024-03-15T10:30:00Z'
  },
  {
    id: '2', title: 'Collaboration Opportunity',
    description: 'Found 3 researchers with complementary expertise who could be valuable collaborators.',
    type: 'opportunity', confidence: 0.92,
    actions: [
      { label: 'View Matches', action: 'view_matches', icon: <Users className="w-4 h-4" /> },
      { label: 'Send Invitation', action: 'send_invite', icon: <Send className="w-4 h-4" /> }
    ],
    timestamp: '2024-03-15T09:15:00Z'
  },
  {
    id: '3', title: 'Citation Impact Prediction',
    description: 'Your latest paper has a predicted impact of 45-60 citations within the first year.',
    type: 'analysis', confidence: 0.78,
    actions: [
      { label: 'View Methodology', action: 'view_methodology', icon: <Info className="w-4 h-4" /> },
      { label: 'Optimize Abstract', action: 'optimize_abstract', icon: <FileText className="w-4 h-4" /> }
    ],
    timestamp: '2024-03-15T08:45:00Z'
  }
];

const mockCapabilities: AICapability[] = [
  { id: 'research_analysis', name: 'Research Analysis', description: 'Analyze research trends, citation patterns, and impact metrics', icon: <Brain className="w-5 h-5" />, category: 'analysis' },
  { id: 'paper_writing', name: 'Paper Writing Assistant', description: 'Get help with academic writing, abstracts, and conclusions', icon: <FileText className="w-5 h-5" />, category: 'writing' },
  { id: 'smart_search', name: 'Smart Search', description: 'AI-powered search across papers, authors, and topics', icon: <Search className="w-5 h-5" />, category: 'search' },
  { id: 'collaboration_finder', name: 'Collaboration Finder', description: 'Find potential collaborators based on expertise', icon: <Users className="w-5 h-5" />, category: 'collaboration' },
  { id: 'insights_generator', name: 'Insights Generator', description: 'Generate AI-powered research insights', icon: <Sparkles className="w-5 h-5" />, category: 'insights' },
  { id: 'data_analysis', name: 'Data Analysis', description: 'Analyze research data and generate visualizations', icon: <TrendingUp className="w-5 h-5" />, category: 'analysis', beta: true },
];

const MessageBubble: React.FC<{ message: AIMessage; isOwn?: boolean }> = ({ message, isOwn }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("flex gap-3 max-w-[80%]", isOwn ? "flex-row-reverse ml-auto" : "flex-row")}
  >
    <div className={cn(
      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
      isOwn ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
    )}>
      {isOwn ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
    </div>
    <div className={cn("flex flex-col gap-2", isOwn ? "items-end" : "items-start")}>
      <div className={cn(
        "rounded-lg p-3 max-w-full",
        isOwn ? "bg-accent text-accent-foreground" : "bg-card border border-border text-card-foreground"
      )}>
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {message.metadata?.confidence && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-[11px]">Confidence: {Math.round(message.metadata.confidence * 100)}%</Badge>
            {message.metadata.type && <Badge variant="outline" className="text-[11px]">{message.metadata.type}</Badge>}
          </div>
        )}
        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[11px] opacity-70">Sources:</p>
            {message.metadata.sources.map((source, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald" />
                <span>{source.title}</span>
                <Badge variant="outline" className="text-[11px]">{Math.round(source.confidence * 100)}%</Badge>
              </div>
            ))}
          </div>
        )}
        {message.metadata?.actions && message.metadata.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.metadata.actions.map((action, i) => (
              <Button key={i} variant="outline" size="sm" className="text-[11px] h-7" onClick={() => toast.info(`Action: ${action.action}`)}>
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="text-[11px] text-muted-foreground">{new Date(message.timestamp).toLocaleTimeString()}</div>
    </div>
  </motion.div>
);

const InsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
  const typeStyles: Record<string, string> = {
    trend: 'bg-primary/10 text-primary',
    recommendation: 'bg-emerald-muted text-emerald',
    warning: 'bg-gold-muted text-gold-foreground',
    opportunity: 'bg-accent/10 text-accent',
    analysis: 'bg-scholarly-light text-scholarly',
  };
  const typeIcons: Record<string, React.ReactNode> = {
    trend: <TrendingUp className="w-4 h-4" />,
    recommendation: <Award className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
    opportunity: <Users className="w-4 h-4" />,
    analysis: <Brain className="w-4 h-4" />,
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="border border-border hover:shadow-gold transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gold-muted text-gold">{typeIcons[insight.type] || <Info className="w-4 h-4" />}</div>
              <div>
                <h3 className="font-semibold text-[14px] text-foreground">{insight.title}</h3>
                <Badge className={typeStyles[insight.type] || 'bg-secondary text-secondary-foreground'}>{insight.type}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald"></div>
              <span className="text-[11px] text-muted-foreground">{Math.round(insight.confidence * 100)}%</span>
            </div>
          </div>
          <p className="text-[13px] text-muted-foreground mb-4">{insight.description}</p>
          <div className="flex flex-wrap gap-2">
            {insight.actions.map((action, i) => (
              <Button key={i} variant="outline" size="sm" className="text-[12px]" onClick={() => toast.info(`Action: ${action.action}`)}>
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <span>AI Insight</span>
            <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CapabilityCard: React.FC<{ capability: AICapability; onSelect: () => void }> = ({ capability, onSelect }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSelect} className="group cursor-pointer">
    <Card className="border border-border hover:shadow-gold h-full transition-shadow">
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-3">
          <div className="bg-gold-muted p-3 rounded-full text-gold group-hover:scale-110 transition-transform">{capability.icon}</div>
        </div>
        <h3 className="font-semibold text-[14px] text-foreground group-hover:text-gold transition-colors mb-2">{capability.name}</h3>
        <p className="text-[12px] text-muted-foreground mb-3">{capability.description}</p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="text-[11px]">{capability.category}</Badge>
          {capability.beta && <Badge variant="secondary" className="text-[11px]">Beta</Badge>}
          {capability.pro && <Badge className="bg-primary text-primary-foreground text-[11px]">Pro</Badge>}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const AIResearchAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([{
    id: '1', role: 'assistant',
    content: 'Hello! I\'m your AI Research Assistant. I can help you with research analysis, paper writing, finding collaborators, and generating insights. How can I assist you today?',
    timestamp: new Date().toISOString(), metadata: { type: 'text', confidence: 0.95 }
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const generateResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    const lm = userMessage.toLowerCase();
    let response = '';
    if (lm.includes('analyze') || lm.includes('trend')) {
      response = "I've analyzed your recent publications and found several interesting trends. Your research in machine learning shows a 23% growth. Would you like a detailed report?";
    } else if (lm.includes('collaborat')) {
      response = "I've identified 3 potential collaborators: Dr. Sarah Chen (climate modeling), Prof. Michael Brown (quantum computing), and Dr. Emily Davis (data analysis). Want me to reach out?";
    } else if (lm.includes('write') || lm.includes('abstract')) {
      response = "For abstracts, focus on: 1) Clear problem statement, 2) Methodology overview, 3) Key findings, 4) Implications. Would you like me to draft one?";
    } else {
      response = `I understand you're interested in "${userMessage}". Based on your profile and current trends, I can provide personalized assistance. Could you be more specific?`;
    }
    const assistantMessage: AIMessage = {
      id: Date.now().toString(), role: 'assistant', content: response, timestamp: new Date().toISOString(),
      metadata: {
        type: 'text', confidence: 0.85 + Math.random() * 0.1,
        sources: [
          { title: 'Academic Database Analysis', url: '#', confidence: 0.92 },
          { title: 'Citation Pattern Analysis', url: '#', confidence: 0.87 },
        ],
        actions: [
          { label: 'Generate Report', action: 'generate_report', icon: <FileText className="w-4 h-4" /> },
          { label: 'Find Papers', action: 'find_papers', icon: <Search className="w-4 h-4" /> },
        ]
      }
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: AIMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    await generateResponse(input);
  }, [input, isLoading, generateResponse]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  }, [handleSendMessage]);

  const handleCapabilitySelect = useCallback((capability: AICapability) => {
    const capMsg: AIMessage = { id: Date.now().toString(), role: 'user', content: `I'd like to use ${capability.name}`, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, capMsg]);
    setShowCapabilities(false);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: `I'll help you with ${capability.name.toLowerCase()}. ${capability.description} What specific aspect would you like to explore?`,
        timestamp: new Date().toISOString(), metadata: { type: 'text', confidence: 0.90 }
      }]);
    }, 500);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-gold text-accent-foreground flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI Research Assistant</h2>
            <p className="text-xs text-muted-foreground">Powered by advanced AI</p>
          </div>
          <Badge variant="outline" className="text-xs">Beta</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />Insights
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Settings className="w-4 h-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCapabilities(true)}><Brain className="w-4 h-4 mr-2" />Capabilities</DropdownMenuItem>
              <DropdownMenuItem><Clock className="w-4 h-4 mr-2" />History</DropdownMenuItem>
              <DropdownMenuItem><HelpCircle className="w-4 h-4 mr-2" />Help</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card p-4 overflow-y-auto hidden lg:block">
          <h3 className="font-semibold text-foreground mb-4">AI Insights</h3>
          <div className="space-y-3">{mockInsights.map(i => <InsightCard key={i.id} insight={i} />)}</div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(m => <MessageBubble key={m.id} message={m} isOwn={m.role === 'user'} />)}
              {isLoading && (
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                  <div className="rounded-lg p-3 bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your research..." className="pr-12" disabled={isLoading} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toast.info('File upload coming soon!')}><Paperclip className="w-4 h-4" /></Button>
                    </TooltipTrigger><TooltipContent><p>Upload file</p></TooltipContent></Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", isRecording && "bg-destructive text-destructive-foreground")}
                        onClick={() => {
                          if (isRecording) { setIsRecording(false); toast.info('Recording stopped'); }
                          else { setIsRecording(true); toast.info('Recording started...'); setTimeout(() => { setIsRecording(false); setInput('Voice input: Find recent papers on climate science'); toast.info('Voice input captured'); }, 3000); }
                        }}><Mic className="w-4 h-4" /></Button>
                    </TooltipTrigger><TooltipContent><p>{isRecording ? 'Stop recording' : 'Voice input'}</p></TooltipContent></Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Modal */}
      <AnimatePresence>
        {showCapabilities && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 flex items-center justify-center z-50" onClick={() => setShowCapabilities(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-background border border-border rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">AI Capabilities</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCapabilities(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockCapabilities.map(c => <CapabilityCard key={c.id} capability={c} onSelect={() => handleCapabilitySelect(c)} />)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIResearchAssistant;
