import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Brain, 
  FileText, 
  Search, 
  TrendingUp, 
  Award, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Zap,
  ChevronDown,
  Paperclip,
  Mic,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types
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
  data: any;
  actions: Array<{ label: string; action: string; icon?: React.ReactNode }>;
  timestamp: string;
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'analysis' | 'writing' | 'search' | 'collaboration' | 'insights';
  beta?: boolean;
  pro?: boolean;
}

// Mock data
const mockInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Research Trend Detected',
    description: 'Your research area shows a 23% increase in publications over the last 6 months, indicating growing interest in the field.',
    type: 'trend',
    confidence: 0.87,
    data: { trend: 'up', percentage: 23, timeframe: '6 months' },
    actions: [
      { label: 'View Detailed Analysis', action: 'view_analysis', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Create Report', action: 'create_report', icon: <FileText className="w-4 h-4" /> }
    ],
    timestamp: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Collaboration Opportunity',
    description: 'Based on your research interests, we found 3 researchers with complementary expertise who could be valuable collaborators.',
    type: 'opportunity',
    confidence: 0.92,
    data: { collaborators: 3, expertise: ['machine learning', 'climate science', 'data analysis'] },
    actions: [
      { label: 'View Matches', action: 'view_matches', icon: <Users className="w-4 h-4" /> },
      { label: 'Send Invitation', action: 'send_invite', icon: <Send className="w-4 h-4" /> }
    ],
    timestamp: '2024-03-15T09:15:00Z'
  },
  {
    id: '3',
    title: 'Citation Impact Prediction',
    description: 'Your latest paper has a predicted citation impact of 45-60 citations within the first year based on similar publications.',
    type: 'analysis',
    confidence: 0.78,
    data: { predictedCitations: { min: 45, max: 60 }, timeframe: '1 year' },
    actions: [
      { label: 'View Methodology', action: 'view_methodology', icon: <Info className="w-4 h-4" /> },
      { label: 'Optimize Abstract', action: 'optimize_abstract', icon: <FileText className="w-4 h-4" /> }
    ],
    timestamp: '2024-03-15T08:45:00Z'
  }
];

const mockCapabilities: AICapability[] = [
  {
    id: 'research_analysis',
    name: 'Research Analysis',
    description: 'Analyze research trends, citation patterns, and impact metrics',
    icon: <Brain className="w-5 h-5" />,
    category: 'analysis'
  },
  {
    id: 'paper_writing',
    name: 'Paper Writing Assistant',
    description: 'Get help with academic writing, abstracts, and conclusions',
    icon: <FileText className="w-5 h-5" />,
    category: 'writing'
  },
  {
    id: 'smart_search',
    name: 'Smart Search',
    description: 'AI-powered search across papers, authors, and research topics',
    icon: <Search className="w-5 h-5" />,
    category: 'search'
  },
  {
    id: 'collaboration_finder',
    name: 'Collaboration Finder',
    description: 'Find potential research collaborators based on expertise and interests',
    icon: <Users className="w-5 h-5" />,
    category: 'collaboration'
  },
  {
    id: 'insights_generator',
    name: 'Insights Generator',
    description: 'Generate AI-powered research insights and recommendations',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'insights'
  },
  {
    id: 'data_analysis',
    name: 'Data Analysis',
    description: 'Analyze research data and generate visualizations',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'analysis',
    beta: true
  }
];

const mockSuggestions = [
  'Analyze my recent publications',
  'Find collaborators in machine learning',
  'Help me write an abstract',
  'What are the trending topics in my field?',
  'Predict citation impact for my paper',
  'Suggest relevant papers to read',
  'Help me improve my methodology',
  'Find gaps in the literature',
  'Generate research questions',
  'Analyze my research metrics'
];

// Components
const MessageBubble: React.FC<{ message: AIMessage; isOwn?: boolean }> = ({ message, isOwn }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 max-w-[80%]",
        isOwn ? "flex-row-reverse ml-auto" : "flex-row"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isOwn 
          ? "bg-gold-500 text-white" 
          : "bg-accent text-accent-foreground"
      )}>
        {isOwn ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={cn(
        "flex flex-col gap-2",
        isOwn ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-lg p-3 max-w-full",
          isOwn 
            ? "bg-gold-500 text-white" 
            : "bg-card border border-border"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {message.metadata?.confidence && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Confidence: {Math.round(message.metadata.confidence * 100)}%
              </Badge>
              {message.metadata.type && (
                <Badge variant="outline" className="text-xs">
                  {message.metadata.type}
                </Badge>
              )}
            </div>
          )}
          
          {message.metadata?.sources && message.metadata.sources.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs opacity-70">Sources:</p>
              {message.metadata.sources.map((source, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{source.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(source.confidence * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          {message.metadata?.actions && message.metadata.actions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.metadata.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => toast.info(`Action: ${action.action}`)}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

const InsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend': return 'bg-blue-100 text-blue-800';
      case 'recommendation': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'opportunity': return 'bg-purple-100 text-purple-800';
      case 'analysis': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Award className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'opportunity': return <Users className="w-4 h-4" />;
      case 'analysis': return <Brain className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="academic-card hover:shadow-gold"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gold-100 text-gold-600">
              {getTypeIcon(insight.type)}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">{insight.title}</h3>
              <Badge className={getTypeColor(insight.type)}>
                {insight.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500">
              {Math.round(insight.confidence * 100)}%
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
        
        <div className="flex flex-wrap gap-2">
          {insight.actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => toast.info(`Action: ${action.action}`)}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-gray-500">
          <span>AI Insight</span>
          <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </motion.div>
  );
};

const CapabilityCard: React.FC<{ capability: AICapability; onSelect: () => void }> = ({ capability, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="group cursor-pointer"
    >
      <Card className="academic-card hover:shadow-gold h-full">
        <CardContent className="p-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="academic-bg-gold p-3 rounded-full text-gold-600 group-hover:scale-110 transition-transform">
              {capability.icon}
            </div>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 group-hover:text-gold-700 transition-colors mb-2">
            {capability.name}
          </h3>
          <p className="text-xs text-gray-600 mb-3">{capability.description}</p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              {capability.category}
            </Badge>
            {capability.beta && (
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            )}
            {capability.pro && (
              <Badge className="academic-badge-primary text-xs">
                Pro
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Component
export const AIResearchAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Research Assistant. I can help you with research analysis, paper writing, finding collaborators, and generating insights. How can I assist you today?',
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'text',
        confidence: 0.95
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = useCallback((text: string) => {
    setIsTyping(true);
    const words = text.split(' ');
    let currentMessage = '';
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentMessage += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: currentMessage
            };
          }
          return newMessages;
        });
        wordIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  const generateResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    
    // Simulate AI response generation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('analyze') || lowerMessage.includes('trend')) {
      response = "I've analyzed your recent publications and found several interesting trends. Your research in machine learning applications for climate science shows a strong upward trajectory with 23% growth in publications over the last 6 months. The citation patterns suggest your work is gaining significant traction in the academic community. Would you like me to provide a detailed analysis report?";
    } else if (lowerMessage.includes('collaborat') || lowerMessage.includes('collaborator')) {
      response = "Based on your research profile, I've identified 3 potential collaborators who would be excellent matches: Dr. Sarah Chen (expertise in climate modeling), Prof. Michael Brown (quantum computing applications), and Dr. Emily Davis (data analysis). Their complementary expertise could significantly enhance your research outcomes. Would you like me to help you reach out to them?";
    } else if (lowerMessage.includes('write') || lowerMessage.includes('abstract')) {
      response = "I'd be happy to help you with academic writing! For abstracts, I recommend focusing on: 1) Clear problem statement, 2) Brief methodology overview, 3) Key findings, 4) Implications, and 5) Keywords. Your current work on climate prediction models would benefit from emphasizing the novelty of your approach and the practical applications. Would you like me to help you draft or refine an abstract?";
    } else if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      response = "I can help you search through academic databases and find relevant papers. Based on your research interests, I've found several highly relevant papers on deep learning for climate prediction, including recent work from Nature Climate and Journal of Climate Science. Would you like me to provide a curated list with impact factors and citation counts?";
    } else if (lowerMessage.includes('insight') || lowerMessage.includes('recommendation')) {
      response = "I've generated several insights from your research data: 1) Your citation impact is predicted to be 45-60 citations in the first year, 2) There's a growing interest in your specific methodology, 3) Your collaboration network could be expanded by 30% with targeted outreach, and 4) Your research aligns with 3 current funding opportunities. Would you like me to elaborate on any of these insights?";
    } else {
      response = "I understand you're interested in " + userMessage + ". Based on your research profile and current trends in your field, I can provide personalized assistance. Whether you need help with literature review, methodology optimization, or collaboration opportunities, I'm here to help. Could you be more specific about what aspect you'd like to explore?";
    }
    
    const assistantMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'text',
        confidence: 0.85 + Math.random() * 0.1,
        sources: [
          { title: 'Academic Database Analysis', url: '#', confidence: 0.92 },
          { title: 'Citation Pattern Analysis', url: '#', confidence: 0.87 },
          { title: 'Research Trend Detection', url: '#', confidence: 0.83 }
        ],
        actions: [
          { label: 'Generate Report', action: 'generate_report', icon: <FileText className="w-4 h-4" /> },
          { label: 'Find Related Papers', action: 'find_papers', icon: <Search className="w-4 h-4" /> },
          { label: 'Save Insight', action: 'save_insight', icon: <Award className="w-4 h-4" /> }
        ]
      }
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await generateResponse(input);
  }, [input, isLoading]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [input, handleSendMessage]);

  const handleCapabilitySelect = useCallback((capability: AICapability) => {
    setSelectedCapability(capability.id);
    const capabilityMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `I'd like to use ${capability.name}`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, capabilityMessage]);
    setShowCapabilities(false);
    
    // Simulate capability-specific response
    setTimeout(() => {
      const response = `I'll help you with ${capability.name.toLowerCase()}. ${capability.description} What specific aspect would you like to explore?`;
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'text',
          confidence: 0.90
        }
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);
  }, []);

  const handleRecordingToggle = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      toast.info('Recording stopped');
    } else {
      setIsRecording(true);
      toast.info('Recording started... (simulated)');
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setInput('Voice input: Find recent papers on climate science');
        toast.info('Voice input captured');
      }, 3000);
    }
  }, [isRecording]);

  const handleFileUpload = useCallback(() => {
    toast.info('File upload feature coming soon!');
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Research Assistant</h2>
              <p className="text-xs text-muted-foreground">Powered by advanced AI</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Beta
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Insights
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCapabilities(true)}>
                <Brain className="w-4 h-4 mr-2" />
                Capabilities
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="w-4 h-4 mr-2" />
                History
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card p-4 overflow-y-auto">
          <h3 className="font-semibold text-foreground mb-4">AI Insights</h3>
          <div className="space-y-3">
            {mockInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} isOwn={message.role === 'user'} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-2 items-start">
                    <div className="rounded-lg p-3 bg-card border border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isTyping && (
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-2 items-start">
                    <div className="rounded-lg p-3 bg-card border border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your research..."
                  className="pr-12"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={handleFileUpload}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0",
                            isRecording ? "bg-red-500 text-white" : ""
                          )}
                          onClick={handleRecordingToggle}
                        >
                          <Mic className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isRecording ? 'Stop recording' : 'Voice input'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="academic-button-primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Modal */}
      <AnimatePresence>
        {showCapabilities && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCapabilities(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">AI Capabilities</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCapabilities(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockCapabilities.map((capability) => (
                  <CapabilityCard
                    key={capability.id}
                    capability={capability}
                    onSelect={() => handleCapabilitySelect(capability)}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIResearchAssistant;
