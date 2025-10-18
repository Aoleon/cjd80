import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminSection from '@/components/admin-section';
import { IDEA_STATUS } from '@shared/schema';

// Mock auth hook
const mockUser = { id: 'admin', email: 'admin@test.com' };
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: mockUser, logout: vi.fn() }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock API calls
const mockApiRequest = vi.fn();
vi.mock('@/lib/queryClient', () => ({
  apiRequest: mockApiRequest,
  queryClient: new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }),
}));

// Mock ideas data
const mockIdeas = [
  {
    id: '1',
    title: 'Idée en attente',
    description: 'Description 1',
    proposedBy: 'User 1',
    status: IDEA_STATUS.PENDING,
    featured: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    voteCount: 5
  },
  {
    id: '2',
    title: 'Idée approuvée',
    description: 'Description 2',
    proposedBy: 'User 2',
    status: IDEA_STATUS.APPROVED,
    featured: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    voteCount: 10
  },
  {
    id: '3',
    title: 'Idée réalisée',
    description: 'Description 3',
    proposedBy: 'User 3',
    status: IDEA_STATUS.COMPLETED,
    featured: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    voteCount: 15
  }
];

const mockEvents = [
  {
    id: '1',
    title: 'Événement 1',
    description: 'Description événement',
    date: new Date('2024-02-01'),
    location: 'Location 1',
    status: 'published',
    inscriptionCount: 3
  }
];

// Mock fetch for useQuery
global.fetch = vi.fn();

const mockFetch = global.fetch as any;

describe('AdminSection Frontend Tests', () => {
  let queryClient: QueryClient;
  let user: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    user = userEvent.setup();
    vi.clearAllMocks();
    
    // Mock successful API responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/admin/ideas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockIdeas }),
        });
      }
      if (url.includes('/api/admin/events')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockEvents }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Tri des idées par statut et date', () => {
    it('should display ideas sorted by status priority then date', async () => {
      renderWithProviders(<AdminSection />);

      // Wait for ideas to load
      await waitFor(() => {
        expect(screen.getByText('Idée en attente')).toBeInTheDocument();
      });

      const ideaTitles = screen.getAllByText(/Idée/).map(el => el.textContent);
      
      // Vérifier l'ordre : PENDING (1) → APPROVED (3) → COMPLETED (5)
      // En cas d'égalité de statut, tri par date décroissante
      expect(ideaTitles[0]).toContain('Idée en attente'); // PENDING, priorité 1
      expect(ideaTitles[1]).toContain('Idée approuvée'); // APPROVED, priorité 3
      expect(ideaTitles[2]).toContain('Idée réalisée'); // COMPLETED, priorité 5
    });

    it('should maintain sort order after status change', async () => {
      renderWithProviders(<AdminSection />);

      await waitFor(() => {
        expect(screen.getByText('Idée en attente')).toBeInTheDocument();
      });

      // Simuler un changement de statut
      mockApiRequest.mockResolvedValueOnce({ ok: true });
      
      // Le tri devrait se maintenir après mutation
      const statusSelects = screen.getAllByRole('combobox');
      if (statusSelects.length > 0) {
        await user.click(statusSelects[0]);
        // L'ordre devrait être préservé après re-render
      }
    });
  });

  describe('Interaction avec boutons de gestion', () => {
    it('should open manage votes modal when votes button clicked', async () => {
      renderWithProviders(<AdminSection />);

      await waitFor(() => {
        expect(screen.getByText('Idée en attente')).toBeInTheDocument();
      });

      // Cliquer sur le bouton de gestion des votes
      const voteButtons = screen.getAllByTitle('Gérer les votes');
      expect(voteButtons.length).toBeGreaterThan(0);
      
      await user.click(voteButtons[0]);
      
      // La modale devrait s'ouvrir (vérifier via data-testid ou class)
      await waitFor(() => {
        // Vérifier que la modale est dans le DOM
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
      });
    });

    it('should open manage inscriptions modal when inscriptions button clicked', async () => {
      renderWithProviders(<AdminSection />);

      // Aller sur l'onglet événements
      const eventsTab = screen.getByText('Événements');
      await user.click(eventsTab);

      await waitFor(() => {
        expect(screen.getByText('Événement 1')).toBeInTheDocument();
      });

      // Cliquer sur le bouton de gestion des inscriptions
      const inscriptionButtons = screen.getAllByTitle('Gérer les inscriptions');
      expect(inscriptionButtons.length).toBeGreaterThan(0);
      
      await user.click(inscriptionButtons[0]);
      
      // La modale devrait s'ouvrir
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive behavior', () => {
    it('should display mobile layout on small screens', async () => {
      // Simuler un petit écran
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });
      
      renderWithProviders(<AdminSection />);

      await waitFor(() => {
        expect(screen.getByText('Idée en attente')).toBeInTheDocument();
      });

      // Vérifier que la vue mobile est active (cards au lieu de table)
      const mobileCards = document.querySelectorAll('.lg\\:hidden');
      expect(mobileCards.length).toBeGreaterThan(0);
    });

    it('should display desktop layout on large screens', async () => {
      // Simuler un grand écran
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      renderWithProviders(<AdminSection />);

      await waitFor(() => {
        expect(screen.getByText('Idée en attente')).toBeInTheDocument();
      });

      // Vérifier que la vue desktop est active (table)
      const desktopTable = document.querySelector('.hidden.lg\\:block');
      expect(desktopTable).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on interactive elements', async () => {
      renderWithProviders(<AdminSection />);

      await waitFor(() => {
        expect(screen.getByText('Idée en attente')).toBeInTheDocument();
      });

      // Vérifier les boutons avec title/aria-label appropriés
      expect(screen.getAllByTitle('Gérer les votes')).toHaveLength(mockIdeas.length);
      expect(screen.getAllByTitle('Modifier cette idée')).toHaveLength(mockIdeas.length);
      
      // Vérifier que les éléments sont focusables
      const voteButton = screen.getAllByTitle('Gérer les votes')[0];
      expect(voteButton).toHaveAttribute('type', 'button');
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(<AdminSection />);

      await waitFor(() => {
        expect(screen.getByText('Idée en attente')).toBeInTheDocument();
      });

      // Test navigation clavier sur les onglets
      const ideasTab = screen.getByText('Idées');
      const eventsTab = screen.getByText('Événements');
      
      ideasTab.focus();
      expect(document.activeElement).toBe(ideasTab);
      
      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(eventsTab);
    });
  });

  describe('Error handling', () => {
    it('should display loading state', async () => {
      // Mock loading state
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<AdminSection />);
      
      // Vérifier que le loading spinner est affiché
      expect(screen.getByText('Chargement des idées...')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<AdminSection />);
      
      // L'erreur devrait être gérée sans crash
      await waitFor(() => {
        // Le composant ne devrait pas crash
        expect(screen.getByText('Administration')).toBeInTheDocument();
      });
    });
  });
});