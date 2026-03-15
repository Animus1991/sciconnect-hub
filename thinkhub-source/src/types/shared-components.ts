// Shared Component Interfaces for SciConnect Hub ↔ AI_ORGANIZER_VITE Integration
// These interfaces ensure component compatibility across both projects

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  testId?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'academic' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'number' | 'url' | 'tel';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onFocus?: (value: string) => void;
}

export interface ProgressProps extends BaseComponentProps {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'academic' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  indicatorClassName?: string;
}

export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  count?: number;
  maxCount?: number;
}

export interface DialogProps extends BaseComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  preventClose?: boolean;
}

export interface TooltipProps extends BaseComponentProps {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  disabled?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  searchable?: boolean;
  clearable?: boolean;
  onChange?: (value: string) => void;
}

export interface TableProps extends BaseComponentProps {
  columns: Array<{
    key: string;
    title: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
  }>;
  data: Record<string, any>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: any[]) => void;
  };
  onRowClick?: (record: any, index: number) => void;
}

export interface AlertProps extends BaseComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  description?: string;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
  spinner?: boolean;
  skeleton?: boolean;
}

export interface NavigationProps extends BaseComponentProps {
  items: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number | string;
    disabled?: boolean;
    children?: Array<{
      key: string;
      label: string;
      icon?: React.ReactNode;
      disabled?: boolean;
    }>;
  }>;
  activeKey?: string;
  defaultActiveKey?: string;
  mode?: 'horizontal' | 'vertical';
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  onSelect?: (key: string) => void;
}

export interface SidebarProps extends BaseComponentProps {
  width?: number;
  collapsedWidth?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  children?: React.ReactNode;
}

export interface HeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  fixed?: boolean;
  transparent?: boolean;
}

export interface FooterProps extends BaseComponentProps {
  links?: Array<{ label: string; href?: string }>;
  social?: Array<{ icon: React.ReactNode; href?: string }>;
  copyright?: string;
  fixed?: boolean;
}

export interface HeroProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'academic' | 'centered' | 'gradient';
}

export interface StatsProps extends BaseComponentProps {
  items: Array<{
    label: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    icon?: React.ReactNode;
  }>;
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'academic' | 'compact';
}

export interface AcademicProps extends BaseComponentProps {
  // Academic-specific props
  institution?: string;
  department?: string;
  field?: string;
  expertise?: string[];
  publications?: number;
  citations?: number;
  hIndex?: number;
  impact?: number;
  rank?: number;
  verified?: boolean;
  orcid?: string;
  scopusId?: string;
  googleScholarUrl?: string;
}

// Academic-specific component interfaces
export interface ResearchCardProps extends CardProps, AcademicProps {
  title: string;
  authors: Array<{ name: string; orcid?: string; affiliation?: string }>;
  abstract?: string;
  keywords?: string[];
  doi?: string;
  url?: string;
  publishedAt?: string;
  venue?: string;
  type?: 'article' | 'preprint' | 'chapter' | 'thesis' | 'report';
  status?: 'published' | 'in-press' | 'submitted' | 'draft';
  citations?: number;
  downloads?: number;
  bookmarks?: number;
  readingTime?: number;
}

export interface ProfileCardProps extends CardProps, AcademicProps {
  name: string;
  title?: string;
  bio?: string;
  avatar?: string;
  connections?: number;
  followers?: number;
  following?: number;
  status?: 'online' | 'offline' | 'busy' | 'away';
  lastActive?: string;
  reputation?: number;
  badges?: Array<{ type: string; label: string; icon?: React.ReactNode }>;
}

export interface MilestoneCardProps extends CardProps {
  title: string;
  description?: string;
  status?: 'completed' | 'in-progress' | 'planned' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
  dueDate?: string;
  completedDate?: string;
  assignees?: Array<{ name: string; avatar?: string }>;
  tags?: string[];
  dependencies?: string[];
}

export interface OpportunityCardProps extends CardProps {
  title: string;
  organization: string;
  type?: 'grant' | 'fellowship' | 'position' | 'internship' | 'award';
  field?: string;
  location?: string;
  remote?: boolean;
  deadline?: string;
  amount?: string;
  duration?: string;
  requirements?: string[];
  benefits?: string[];
  url?: string;
  status?: 'open' | 'closed' | 'upcoming';
  applicants?: number;
  positions?: number;
}

// AI-specific component interfaces
export interface AIChatProps extends BaseComponentProps {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  onMessage?: (message: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  disabled?: boolean;
}

export interface AIInsightProps extends CardProps {
  title: string;
  description: string;
  type?: 'trend' | 'recommendation' | 'warning' | 'opportunity';
  confidence?: number;
  data?: any;
  actions?: Array<{ label: string; action: () => void }>;
  timestamp?: string;
}

// Workspace-specific component interfaces
export interface WorkspaceProps extends BaseComponentProps {
  title: string;
  description?: string;
  type?: 'research' | 'collaboration' | 'personal' | 'team';
  members?: Array<{ name: string; avatar?: string; role?: string }>;
  projects?: Array<{ name: string; status: string; progress?: number }>;
  documents?: Array<{ name: string; type: string; size: string; modified: string }>;
  recentActivity?: Array<{ type: string; description: string; timestamp: string }>;
  stats?: Record<string, number>;
}

export interface DocumentProps extends BaseComponentProps {
  title: string;
  content?: string;
  type?: 'paper' | 'report' | 'notes' | 'data' | 'presentation';
  size?: string;
  modified?: string;
  author?: string;
  tags?: string[];
  status?: 'draft' | 'review' | 'published' | 'archived';
  permissions?: 'private' | 'team' | 'public';
  collaborators?: Array<{ name: string; avatar?: string }>;
  version?: string;
  downloads?: number;
  views?: number;
}

// Theme and styling interfaces
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system' | 'academic';
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: 'sm' | 'md' | 'lg';
  borderRadius?: 'sm' | 'md' | 'lg';
  animations?: boolean;
  reducedMotion?: boolean;
}

export interface AcademicThemeConfig extends ThemeConfig {
  institutionColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  academicColors?: {
    gold: string;
    blue: string;
    green: string;
    purple: string;
  };
  customFonts?: {
    heading: string;
    body: string;
    mono: string;
  };
}

// Utility interfaces
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  query?: string;
  type?: string;
  field?: string;
  dateRange?: [string, string];
  tags?: string[];
  author?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserActivity {
  id: string;
  type: 'login' | 'upload' | 'download' | 'share' | 'comment' | 'like' | 'follow' | 'join';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{ label: string; action: () => void }>;
  metadata?: Record<string, any>;
}

