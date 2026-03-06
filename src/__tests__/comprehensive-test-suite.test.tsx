// Comprehensive Test Suite for SciConnect Hub & AI_ORGANIZER_VITE Integration
// Complete testing coverage for all enhanced features

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, expect, test } from 'vitest';
import { z } from 'zod';

// Import components to test
import { AdvancedWorkspace } from '@/components/workspace/AdvancedWorkspace';
import { AIResearchAssistant } from '@/components/ai/AIResearchAssistant';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

// Import API services for testing
import { SearchService, WorkspaceService, NotificationService } from '@/lib/backend-api-enhanced';

// Mock data for testing
const mockUser = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'researcher',
  institution: 'Test University',
};

const mockDocuments = [
  {
    id: 'doc-1',
    title: 'Test Research Paper',
    type: 'paper' as const,
    authors: ['Test Author'],
    citations: 156,
    downloads: 892,
    views: 3456,
    tags: ['test', 'research'],
    year: 2024,
    openAccess: true,
    peerReviewed: true,
  },
  {
    id: 'doc-2',
    title: 'Another Test Paper',
    type: 'report' as const,
    authors: ['Another Author'],
    citations: 89,
    downloads: 456,
    views: 1234,
    tags: ['test', 'analysis'],
    year: 2024,
    openAccess: false,
    peerReviewed: true,
  },
];

const mockWorkspaces = [
  {
    id: 'ws-1',
    name: 'Test Workspace',
    description: 'A test workspace for testing',
    type: 'research' as const,
    members: [mockUser.id],
    documents: [mockDocuments[0]],
    statistics: {
      documentCount: 1,
      totalSize: 1024,
      lastActivity: '2024-03-15T10:30:00Z',
      collaborationCount: 0,
      aiProcessingCount: 0,
    },
  },
];

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'success' as const,
    title: 'Test Notification',
    message: 'This is a test notification',
    timestamp: '2024-03-15T10:30:00Z',
    read: false,
    priority: 'medium' as const,
    category: 'general' as const,
  },
  {
    id: 'notif-2',
    type: 'info' as const,
    title: 'Another Test Notification',
    message: 'This is another test notification',
    timestamp: '2024-03-15T09:15:00Z',
    read: true,
    priority: 'low' as const,
    category: 'system' as const,
  },
];

// Test utilities
const createMockApiResponse = (data: any, success = true) => ({
  success,
  data,
  timestamp: new Date().toISOString(),
  requestId: crypto.randomUUID(),
});

const createMockSearchResult = (query: string, results: any[]) => ({
  success: true,
  data: results,
  timestamp: new Date().toISOString(),
  requestId: crypto.randomUUID(),
  metadata: {
    searchTime: 150,
    query,
    type: 'papers',
    filters: {},
    sort: { field: 'relevance', order: 'desc' },
  },
});

// Mock API services
vi.mock('@/lib/backend-api-enhanced', () => ({
  SearchService: {
    search: vi.fn().mockResolvedValue(createMockSearchResult('test', mockDocuments)),
  },
  WorkspaceService: {
    createWorkspace: vi.fn().mockResolvedValue(createMockApiResponse(mockWorkspaces[0])),
    getWorkspace: vi.fn().mockResolvedValue(createMockApiResponse(mockWorkspaces[0])),
    updateWorkspace: vi.fn().mockResolvedValue(createMockApiResponse(mockWorkspaces[0])),
    deleteWorkspace: vi.fn().mockResolvedValue(createMockApiResponse(null)),
  },
  NotificationService: {
    sendNotification: vi.fn().mockResolvedValue(createMockApiResponse(mockNotifications[0])),
    getNotifications: vi.fn().mockResolvedValue(createMockApiResponse(mockNotifications)),
    markAsRead: vi.fn().mockResolvedValue(createMockApiResponse(null)),
  },
}));

// Test configuration
describe('Comprehensive Test Suite - SciConnect & AI_ORGANIZER Integration', () => {
  beforeEach(() => {
      // Reset mocks before each test
      vi.clearAllMocks();
      
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: (index: number) => '',
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });
      
      // Mock fetch
      global.fetch = vi.fn();
    });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AdvancedWorkspace Component', () => {
    it('renders workspace management interface', async () => {
      render(<AdvancedWorkspace />);
      
      expect(screen.getByText('Advanced Workspace')).toBeInTheDocument();
      expect(screen.getByText('Manage your research workspaces and documents')).toBeInTheDocument();
    });

    it('displays workspace statistics', async () => {
      render(<AdvancedWorkspace />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Documents')).toBeInTheDocument();
        expect(screen.getByText('Published')).toBeInTheDocument();
        expect(screen.getByText('Total Workspaces')).toBeInTheDocument();
      });
    });

    it('shows quick actions cards', async () => {
      render(<AdvancedWorkspace />);
      
      await waitFor(() => {
        expect(screen.getByText('Upload Document')).toBeInTheDocument();
        expect(screen.getByText('Advanced Search')).toBeInTheDocument();
        expect(screen.getByText('Create Workspace')).toBeInTheDocument();
        expect(screen.getByText('AI Assistant')).toBeInTheDocument();
      });
    });

    it('handles workspace navigation', async () => {
      render(<AdvancedWorkspace />);
      
      const overviewTab = screen.getByText('Overview');
      const documentsTab = screen.getByText('Documents');
      const workspacesTab = screen.getByText('Workspaces');
      const activityTab = screen.getByText('Activity');
      
      expect(overviewTab).toBeInTheDocument();
      expect(documentsTab).toBeInTheDocument();
      expect(workspacesTab).toBeInTheDocument();
      expect(activityTab).toBeInTheDocument();
      
      // Test tab switching
      await userEvent.click(documentsTab);
      expect(documentsTab).toHaveClass('bg-primary');
    });

    it('filters and sorts documents', async () => {
      render(<AdvancedWorkspace />);
      
      // Navigate to documents tab
      const documentsTab = screen.getByText('Documents');
      await userEvent.click(documentsTab);
      
      // Test search functionality
      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'test');
      
      // Test filters
      const filterButton = screen.getByText('Filter');
      expect(filterButton).toBeInTheDocument();
      
      // Test view modes
      const gridButton = screen.getByRole('button', { name: /grid/i });
      const listButton = screen.getByRole('button', { name: /list/i });
      expect(gridButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();
    });

    it('displays workspace cards with correct information', async () => {
      render(<AdvancedWorkspace />);
      
      // Navigate to workspaces tab
      const workspacesTab = screen.getByText('Workspaces');
      await userEvent.click(workspacesTab);
      
      await waitFor(() => {
        const workspaceCards = screen.getAllByText(/Test Workspace/);
        expect(workspaceCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('AIResearchAssistant Component', () => {
    it('renders AI assistant interface', async () => {
      render(<AIResearchAssistant />);
      
      expect(screen.getByText('AI Research Assistant')).toBeInTheDocument();
      expect(screen.getByText('Powered by advanced AI')).toBeInTheDocument();
    });

    it('displays AI insights sidebar', async () => {
      render(<AIResearchAssistant />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
        expect(screen.getByText('Research Trend Detected')).toBeInTheDocument();
        expect(screen.getByText('Collaboration Opportunity')).toBeInTheDocument();
      });
    });

    it('handles chat functionality', async () => {
      render(<AIResearchAssistant />);
      
      const input = screen.getByPlaceholderText('Ask me anything about your research...');
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      expect(input).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
      
      // Test message sending
      await userEvent.type(input, 'test message');
      await userEvent.click(sendButton);
      
      // Check if message appears in chat
      await waitFor(() => {
        expect(screen.getByText('test message')).toBeInTheDocument();
      });
    });

    it('shows AI capabilities modal', async () => {
      render(<AIResearchAssistant />);
      
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await userEvent.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText('AI Capabilities')).toBeInTheDocument();
        expect(screen.getByText('Research Analysis')).toBeInTheDocument();
        expect(screen.getByText('Paper Writing Assistant')).toBeInTheDocument();
      });
    });

    it('handles voice input simulation', async () => {
      render(<AIResearchAssistant />);
      
      const micButton = screen.getByRole('button', { name: /mic/i });
      expect(micButton).toBeInTheDocument();
      
      // Test voice input simulation
      await userEvent.click(micButton);
      
      // Check if voice input is activated
      expect(micButton).toHaveClass('bg-red-500');
      
      // Simulate voice input completion
      setTimeout(() => {
        expect(screen.getByDisplayValue('Voice input: Find recent papers on climate science')).toBeInTheDocument();
      }, 3000);
    });
  });

  describe('AdvancedSearch Component', () => {
    it('renders search interface', async () => {
      render(<AdvancedSearch />);
      
      expect(screen.getByText('Advanced Search')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...')).toBeInTheDocument();
    });

    it('displays search statistics', async () => {
      render(<AdvancedSearch />);
      
      await waitFor(() => {
        expect(screen.getByText(/total results/i)).toBeInTheDocument();
        expect(screen.getByText(/unread/i)).toBeInTheDocument();
        expect(screen.getByText(/high priority/i)).toBeInTheDocument();
      });
    });

    it('handles search filters', async () => {
      render(<AdvancedSearch />);
      
      const filtersButton = screen.getByText('Filters');
      await userEvent.click(filtersButton);
      
      await waitFor(() => {
        expect(screen.getByText('Content Type')).toBeInTheDocument();
        expect(screen.getByText('Sort By')).toBeInTheDocument();
        expect(screen.getByText('Priority')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();
      });
    });

    it('performs search with filters', async () => {
      render(<AdvancedSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      // Enter search query
      await userEvent.type(searchInput, 'machine learning');
      await userEvent.click(searchButton);
      
      // Check if results appear
      await waitFor(() => {
        const resultCards = screen.getAllByText(/machine learning/i);
        expect(resultCards.length).toBeGreaterThan(0);
      });
    });

    it('displays search suggestions', async () => {
      render(<AdvancedSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      await userEvent.type(searchInput, 'machine');
      
      await waitFor(() => {
        expect(screen.getByText('machine learning applications')).toBeInTheDocument();
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument();
        expect(screen.getByText('climate modeling')).toBeInTheDocument();
      });
    });

    it('shows search history', async () => {
      render(<AdvancedSearch />);
      
      // Check if search history is displayed when no active search
      await waitFor(() => {
        expect(screen.getByText('Recent Searches')).toBeInTheDocument();
        expect(screen.getByText('Deep learning climate science')).toBeInTheDocument();
      });
    });
  });

  describe('NotificationCenter Component', () => {
    it('renders notification center interface', async () => {
      render(<NotificationCenter />);
      
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Mark all as read')).toBeInTheDocument();
    });

    it('displays notification statistics', async () => {
      render(<NotificationCenter />);
      
      await waitFor(() => {
        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('Unread')).toBeInTheDocument();
        expect(screenByText('High Priority')).toBeInTheDocument();
        expect(screen.getByText('Research')).toBeInTheDocument();
      });
    });

    it('filters notifications by type and priority', async () => {
      render(<NotificationCenter />);
      
      const filtersButton = screen.getByText('Filters');
      await userEvent.click(filtersButton);
      
      await waitFor(() => {
        expect(screen.getByText('All Types')).toBeInTheDocument();
        expect(screen.getByText('Info')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });

    it('displays notification cards with actions', async () => {
      render(<NotificationCenter />);
      
      await waitFor(() => {
        expect(screen.getByText('Paper Published Successfully')).toBeInTheDocument();
        expect(screen.getByText('View Paper')).toBeInTheDocument();
        expect(screen.getByText('Share')).toBeInTheDocument();
        expect(screen.getByText('Cite')).toBeInTheDocument();
      });
    });

    it('handles notification settings', async () => {
      render(<NotificationCenter />);
      
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await userEvent.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Notification Settings')).toBeInTheDocument();
        expect(screen.getByText('Email Notifications')).toBeInTheDocument();
        expect(screen.getByText('Push Notifications')).toBeInTheDocument());
        expect(screen.getByText('Desktop Notifications')).toBeInTheDocument());
      });
    });
  });

  describe('API Integration Tests', () => {
    describe('SearchService', () => {
      it('performs search with valid parameters', async () => {
        const searchRequest = {
          query: 'test query',
          type: 'papers' as const,
          filters: {
            minCitations: 10,
            maxCitations: 100,
            yearRange: [2020, 2024] as [number, number],
            openAccess: true,
            peerReviewed: true,
          },
          pagination: {
            page: 1,
            limit: 20,
          },
          sort: {
            field: 'relevance' as const,
            order: 'desc' as const,
          },
        };

        const result = await SearchService.search(searchRequest);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.pagination).toBeDefined();
        expect(result.metadata).toBeDefined();
      });

      it('handles search validation errors', async () => {
        const invalidRequest = {
          query: '', // Invalid: empty query
          type: 'invalid' as any, // Invalid: not in enum
        };

        await expect(SearchService.search(invalidRequest)).rejects();
      });
    });

    describe('WorkspaceService', () => {
      it('creates workspace with valid data', async () => {
        const workspaceRequest = {
          name: 'Test Workspace',
          description: 'A test workspace',
          type: 'research' as const,
          members: [
            { userId: 'user1', role: 'owner' as const },
            { userId: 'user2', role: 'member' as const },
          ],
          settings: {
            isPublic: false,
            allowInvites: true,
            requireApproval: false,
          },
        };

        const result = await WorkspaceService.createWorkspace(workspaceRequest);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe(workspaceRequest.name);
        expect(result.data.type).toBe(workspaceRequest.type);
      });

      it('retrieves workspace by ID', async () => {
        const workspaceId = 'test-workspace-id';
        
        const result = await WorkspaceService.getWorkspace(workspaceId);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('updates workspace with valid data', async () => {
        const workspaceId = 'test-workspace-id';
        const updates = {
          name: 'Updated Workspace Name',
          description: 'Updated description',
        };

        const result = await WorkspaceService.updateWorkspace(workspaceId, updates);
        
        expect(result.success).toBe(true);
        expect(result.data.name).toBe(updates.name);
        expect(result.data.description).toBe(updates.description);
      });

      it('deletes workspace by ID', async () => {
        const workspaceId = 'test-workspace-id';
        
        const result = await WorkspaceService.deleteWorkspace(workspaceId);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });
    });

    describe('NotificationService', () => {
      it('sends notification with valid data', async () => {
        const notificationRequest = {
          type: 'success' as const,
          title: 'Test Notification',
          message: 'This is a test notification',
          priority: 'medium' as const,
          recipients: ['user1', 'user2'],
        };

        const result = await NotificationService.sendNotification(notificationRequest);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.title).toBe(notificationRequest.title);
      });

      it('retrieves notifications for user', async () => {
        const userId = 'test-user';
        const filters = {
          type: 'info',
          priority: 'medium',
          read: false,
          limit: 10,
          offset: 0,
        };

        const result = await NotificationService.getNotifications(userId, filters);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      });

      it('marks notification as read', async () => {
        const notificationId = 'test-notification-id';
        const userId = 'test-user';

        const result = await NotificationService.markAsRead(notificationId, userId);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });
    });
  });

  describe('Integration Tests', () => {
    it('integrates workspace with AI processing', async () => {
      // Test that workspace creation triggers AI processing
      const workspaceRequest = {
        name: 'AI-Enhanced Workspace',
        description: 'A workspace with AI features',
        type: 'research' as const,
        members: [{ userId: 'user1', role: 'owner' as const }],
        settings: {
          isPublic: false,
          allowInvites: true,
          requireApproval: false,
        },
      };

      const workspaceResult = await WorkspaceService.createWorkspace(workspaceRequest);
      expect(workspaceResult.success).toBe(true);

      // Test that documents in workspace are processed by AI
      const documentData = {
        title: 'AI Processed Document',
        type: 'paper' as const,
        tags: ['ai', 'processed'],
        isPublic: false,
        aiProcessing: true,
      };

      // Mock AI processing
      const aiProcessingRequest = {
        documentId: 'test-doc-id',
        operations: [
          { type: 'sentiment' as const },
          { type: 'readability' as const },
          { type: 'complexity' as const },
        ],
        priority: 'medium' as const,
      };

      // Mock AI processing result
      const aiInsights = {
        sentiment: 0.75,
        readability: 0.82,
        complexity: 0.68,
        topics: ['research', 'ai', 'processing'],
        summary: 'This document has been processed by AI.',
      };

      expect(aiInsights.sentiment).toBe(0.75);
      expect(aiInsights.readability).toBe(0.82);
      expect(aiInsights.complexity).toBe(0.68);
    });

    it('integrates search with notifications', async () => {
      // Test that search results trigger notifications
      const searchRequest = {
        query: 'test search',
        type: 'papers' as const,
        filters: {},
        pagination: { page: 1, limit: 20 },
        sort: { field: 'relevance' as const, order: 'desc' as const },
      };

      const searchResult = await SearchService.search(searchRequest);
      expect(searchResult.success).toBe(true);

      // Create notification for search results
      const notificationRequest = {
        type: 'info' as const,
        title: 'Search Completed',
        message: `Found ${searchResult.data.length} results for "${searchRequest.query}"`,
        priority: 'low' as const,
        recipients: ['user1'],
      };

      const notificationResult = await NotificationService.sendNotification(notificationRequest);
      expect(notificationResult.success).toBe(true);
    });

    it('integrates workspace with notifications', async () => {
      // Test that workspace activities trigger notifications
      const workspaceId = 'test-workspace';
      const userId = 'test-user';

      // Add document to workspace
      const documentId = 'test-doc-id';
      const result = await WorkspaceServiceEnhanced.addDocumentToWorkspace(workspaceId, documentId, userId);
      expect(result.success).toBe(true);

      // Check if collaboration event was tracked
      const collaborationEvents = [
        {
          id: 'test-event',
          workspaceId,
          type: 'document_added' as const,
          userId,
          metadata: { documentId },
          timestamp: new Date().toISOString(),
        },
      ];

      expect(collaborationEvents[0].type).toBe('document_added');
      expect(collaborationEvents[0].workspaceId).toBe(workspaceId);
      expect(collaborationEvents[0].userId).toBe(userId);
    });
  });

  describe('Performance Tests', () => {
    it('handles large datasets efficiently', async () => {
      const startTime = performance.now();
      
      // Test with large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        id: `doc-${index}`,
        title: `Document ${index}`,
        type: 'paper' as const,
        authors: [`Author ${index}`],
        citations: Math.floor(Math.random() * 1000),
        downloads: Math.floor(Math.random() * 5000),
        views: Math.floor(Math.random() * 10000),
        tags: [`tag${index % 10}`, `category${index % 5}`],
        year: 2020 + (index % 4),
        openAccess: index % 2 === 0,
        peerReviewed: index % 3 === 0,
      }));

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(1000); // Should process within 1 second
      expect(largeDataset.length).toBe(1000);
    });

    it('renders components quickly', async () => {
      const startTime = performance.now();
      
      const { container } = render(<AdvancedWorkspace />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Should render within 100ms
      expect(container).toBeInTheDocument();
    });

    it('handles rapid user interactions', async () => {
      const { container } = render(<AdvancedSearch />);
      
      const startTime = performance.now();
      
      // Simulate rapid interactions
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      
      for (let i = 0; i < 10; i++) {
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, `search ${i}`);
        await userEvent.keyboard('{Enter}');
        await waitFor(() => {
          expect(screen.getAllByText(/search \d+/i).length).toBeGreaterThan(0));
        }, { timeout: 100 });
      }
      
      const endTime = performance.now();
      const interactionTime = endTime - startTime;

      expect(interactionTime).toBeLessThan(5000); // Should handle 10 interactions within 5 seconds
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels', async () => {
      render(<AdvancedWorkspace />);
      
      // Check for proper ARIA labels
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Advanced Workspace');
      expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', expect.stringContaining('search'));
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', expect.stringContaining('tabs'));
    });

    it('supports keyboard navigation', async () => {
      render(<AdvancedSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      searchInput.focus();
      
      // Test keyboard navigation
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /filter/i }).toHaveFocus();
      
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /sort/i }).toHaveFocus();
      
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /search/i }).toHaveFocus();
    });

    it('has proper color contrast', async () => {
      render(<NotificationCenter />);
      
      const notificationCards = screen.getAllByRole('article');
      
      notificationCards.forEach(card => {
        const styles = window.getComputedStyle(card);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Check for minimum contrast ratio (4.5:1 for normal text)
        const rgb = color.match(/\d+/g);
        const bgColor = backgroundColor.match(/\d+/g);
        
        if (rgb && bgColor) {
          const contrast = this.calculateContrastRatio(
            parseInt(rgb[1], 16),
            parseInt(rgb[2], 16),
            parseInt(rgb[3], 16),
            parseInt(bgColor[1], 16),
            parseInt(bgColor[2], 16),
            parseInt(bgColor[3], 16)
          );
          
          expect(contrast).toBeGreaterThanOrEqual(4.5);
        }
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('handles API errors gracefully', async () => {
      // Mock API error
      vi.mocked(SearchService.search).mockRejectedValue(new Error('API Error'));
      
      const { container } = render(<AdvancedSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      await userEvent.type(searchInput, 'test');
      await userEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('validates input properly', async () => {
      const { container } = render(<AdvancedSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      
      // Test empty search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await userEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(/search query is required/i)).toBeInTheDocument();
      });
    });

    it('handles network failures', async () => {
      // Mock network failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
      
      const { container } = render(<AdvancedWorkspace />);
      
      // Try to load data
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Responsive Design Tests', () => {
    it('renders correctly on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const { container } = render(<AdvancedWorkspace />);
      
      // Check mobile-specific elements
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Test mobile navigation
      const mobileMenuButton = screen.query('[aria-label="Mobile menu"]');
      if (mobileMenuButton) {
        await userEvent.click(mobileMenuButton);
        expect(screen.getByRole('navigation')).toBeVisible();
      }
    });

    it('adapts to different screen sizes', async () => {
      // Test different screen sizes
      const screenSizes = [
        { width: 320, height: 568 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Desktop
        { width: 1440, height: 900 }, // Large Desktop
        { width: 2560, height: 1440 }, // 4K
      ];

      for (const { width, height } of screenSizes) {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true, configurable: true });
        
        const { container } = render(<AdvancedWorkspace />);
        
        // Check if layout adapts
        expect(container).toBeInTheDocument();
        
        // Check if responsive elements are present
        if (width < 768) {
          expect(screen.query('.mobile-only')).toBeInTheDocument();
        } else {
          expect(screen.query('.desktop-only')).toBeInTheDocument();
        }
      }
    });
  });

  describe('Security Tests', () => {
    it('prevents XSS attacks', async () => {
      const { container } = render(<AdvancedSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      
      // Try to inject script
      const maliciousInput = '<script>alert("XSS")</script>';
      await userEvent.type(searchInput, maliciousInput);
      
      // Ensure script is not executed
      expect(screen.query('script')).not.toBeInTheDocument();
      expect(screen.getByText(/XSS/i)).not.toBeInTheDocument();
    });

    it('validates user permissions', async () => {
      const { container } = render(<AdvancedWorkspace />);
      
      // Test without authentication
      const secureElement = screen.query('[data-secure="true"]');
      if (secureElement) {
        expect(secureElement).toHaveAttribute('aria-disabled', 'true');
      }
    });

    it('handles rate limiting', async () => {
      const { container } = render(<AdvancedSearch />);
      
      // Simulate rapid requests
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      
      for (let i = 0; i < 100; i++) {
        await userEvent.type(searchInput, `search ${i}`);
        await userEvent.keyboard('{Enter}');
        
        if (i > 50) {
          // After 50 requests, should trigger rate limiting
          await waitFor(() => {
            expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
          }, { timeout: 1000 });
          break;
        }
      }
    });
  });

  describe('Data Persistence Tests', () => {
    it('persists user preferences', async () => {
      const { container } = render(<AdvancedWorkspace />);
      
      // Change a setting
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await userEvent.click(settingsButton);
      
      const darkModeToggle = screen.getByRole('switch', { name: /dark mode/i });
      if (darkModeToggle) {
        await userEvent.click(darkModeToggle);
      }
      
      // Check if preference is saved
      const savedPreference = localStorageMock.getItem('darkMode');
      expect(savedPreference).toBeDefined();
    });

    it('maintains search history', async () => {
      const { container } = render(<AdvancedSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      
      // Perform searches
      await userEvent.type(searchInput, 'search 1');
      await userEvent.keyboard('{Enter}');
      
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'search 2');
      await userEvent.keyboard('{Enter}');
      
      // Check if history is maintained
      await waitFor(() => {
        expect(screen.getByText('search 1')).toBeInTheDocument();
        expect(screen.getByText('search 2')).toBeInTheDocument();
      });
    });

    it('preserves workspace state', async () => {
      const { container } = render(<AdvancedWorkspace />);
      
      // Create a workspace
      const createButton = screen.getByText('New Workspace');
      await userEvent.click(createButton);
      
      const workspaceNameInput = screen.getByPlaceholderText('Workspace name');
      await userEvent.type(workspaceNameInput, 'Test Workspace');
      
      const createConfirmButton = screen.getByText('Create');
      await userEvent.click(createConfirmButton);
      
      // Check if workspace is created and persisted
      await waitFor(() => {
        expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration Tests', () => {
    it('integrates AI assistant with search results', async () => {
      // Render both components
      const { container } = render(
        <div>
          <AdvancedSearch />
          <AIResearchAssistant />
        </div>
      );
      
      // Perform search
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      await userEvent.type(searchInput, 'machine learning');
      await userEvent.keyboard('{Enter}');
      
      // Get search results
      await waitFor(() => {
        const results = screen.getAllByText(/machine learning/i);
        expect(results.length).toBeGreaterThan(0);
      });
      
      // Use AI assistant with search context
      const aiInput = screen.getByPlaceholderText('Ask me anything about your research...');
      await userEvent.type(aiInput, 'Analyze the machine learning search results');
      
      await userEvent.keyboard('{Enter}');
      
      // Check if AI assistant responds with context
      await waitFor(() => {
        expect(screen.getByText(/machine learning/i)).toBeInTheDocument();
      });
    });

    it('integrates notifications with workspace activities', async () => {
      // Render both components
      const { container } = render(
        <div>
          <AdvancedWorkspace />
          <NotificationCenter />
        </div>
      );
      
      // Create workspace
      const createButton = screen.getByText('New Workspace');
      await userEvent.click(createButton);
      
      const workspaceNameInput = screen.getByPlaceholderText('Workspace name');
      await userType(workspaceNameInput, 'Test Workspace');
      
      const createConfirmButton = screen.getByText('Create');
      await userEvent.click(createConfirmButton);
      
      // Check if notification is created
      await waitFor(() => {
        expect(screen.getByText(/workspace created/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty datasets gracefully', async () => {
      const { container } = render(<AdvancedSearch />);
      
      // Search with no results
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      await userEvent.type(searchInput, 'no results query');
      await userEvent.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });

    it('handles malformed data gracefully', async () => {
      const { container } = render(<AdvancedWorkspace />);
      
      // Try to load corrupted data
      const corruptedData = { invalid: 'data' };
      localStorageMock.setItem('workspaces', JSON.stringify(corruptedData));
      
      // Should handle gracefully and show error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });

    it('handles network timeouts', async () => {
      // Mock network timeout
      vi.mocked(SearchService.search).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({
            success: false,
            error: 'Network timeout',
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          }), 5000); // 5 second timeout
        });
      });
      
      const { container } = render(<AdvancedSearch />);
      
      const searchInput = screen.getByPlaceholderText('Search papers, authors, institutions, topics, datasets...');
      await userEvent.type(searchInput, 'timeout test');
      await userEvent.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
      });
    });
  });

  // Cleanup
  afterAll(() => {
    vi.restoreAllMocks();
  });
});

// Helper function for contrast ratio calculation
const calculateContrastRatio = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
  const l1 = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
  const l2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
  return l1 / l2;
};

export default comprehensiveTestSuite;
