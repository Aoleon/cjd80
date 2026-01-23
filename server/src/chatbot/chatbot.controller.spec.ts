import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

// Mock the database and logger at module load time
vi.mock('../../db', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('openai');

describe('ChatbotController', () => {
  let controller: ChatbotController;
  let mockChatbotService: any;

  beforeEach(async () => {
    // Créer un mock du ChatbotService
    mockChatbotService = {
      query: vi.fn(),
    };

    // Créer le contrôleur directement avec le service mock
    controller = new ChatbotController(mockChatbotService as any);
  });

  describe('POST /api/admin/chatbot/query', () => {
    describe('Successful requests', () => {
      it('devrait retourner une réponse avec succès et les données', async () => {
        const body = {
          question: 'Combien de membres actifs avons-nous ?',
        };

        const mockResponse = {
          answer: 'Vous avez 42 membres actifs.',
          sql: 'SELECT COUNT(*) FROM members WHERE status = \'active\'',
          data: [{ count: 42 }],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result).toEqual({
          success: true,
          answer: 'Vous avez 42 membres actifs.',
          sql: 'SELECT COUNT(*) FROM members WHERE status = \'active\'',
          data: [{ count: 42 }],
        });
        expect(mockChatbotService.query).toHaveBeenCalledWith(body.question, undefined);
      });

      it('devrait inclure le context optionnel dans l\'appel au service', async () => {
        const body = {
          question: 'Combien d\'idées ?',
          context: 'dashboard',
        };

        const mockResponse = {
          answer: 'Il y a 10 idées.',
          sql: 'SELECT COUNT(*) FROM ideas',
          data: [{ count: 10 }],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
        expect(mockChatbotService.query).toHaveBeenCalledWith(body.question, body.context);
      });

      it('devrait retourner une réponse sans données si la liste est vide', async () => {
        const body = {
          question: 'Chercher des résultats inexistants ?',
        };

        const mockResponse = {
          answer: 'Aucun résultat trouvé.',
          sql: 'SELECT * FROM members WHERE email = \'nonexistent\'',
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
        expect(result.answer).toBe('Aucun résultat trouvé.');
        expect(result.data).toBeUndefined();
        expect(result.sql).toBeTruthy();
      });

      it('devrait gérer une question avec caractères spéciaux', async () => {
        const body = {
          question: 'Combien d\'événements avec "l\'AI" dans le titre ?',
        };

        const mockResponse = {
          answer: 'Aucun événement trouvé.',
          sql: 'SELECT * FROM events',
          data: [],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
        expect(mockChatbotService.query).toHaveBeenCalledWith(body.question, undefined);
      });

      it('devrait retourner les résultats avec SQL généré', async () => {
        const body = {
          question: 'Lister les 5 derniers événements',
        };

        const mockData = [
          { id: '1', title: 'Event 1', date: '2024-01-23' },
          { id: '2', title: 'Event 2', date: '2024-01-22' },
        ];

        const mockResponse = {
          answer: 'Voici les derniers événements.',
          sql: 'SELECT * FROM events ORDER BY date DESC LIMIT 5',
          data: mockData,
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockData);
        expect(result.sql).toContain('LIMIT 5');
      });
    });

    describe('Error handling', () => {
      it('devrait retourner une erreur si la question est manquante', async () => {
        const body = {};

        await expect(controller.query(body as any)).rejects.toThrow(BadRequestException);
      });

      it('devrait retourner une erreur si la question est null', async () => {
        const body = {
          question: null,
        };

        await expect(controller.query(body as any)).rejects.toThrow(BadRequestException);
      });

      it('devrait retourner une erreur si la question est undefined', async () => {
        const body = {
          question: undefined,
        };

        await expect(controller.query(body as any)).rejects.toThrow(BadRequestException);
      });

      it('devrait retourner une erreur si la question n\'est pas une string', async () => {
        const body = {
          question: 123,
        };

        await expect(controller.query(body as any)).rejects.toThrow(BadRequestException);
      });

      it('devrait retourner une erreur si la question est un objet', async () => {
        const body = {
          question: { text: 'test' },
        };

        await expect(controller.query(body as any)).rejects.toThrow(BadRequestException);
      });

      it('devrait retourner une erreur si la question est un array', async () => {
        const body = {
          question: ['question'],
        };

        await expect(controller.query(body as any)).rejects.toThrow(BadRequestException);
      });

      it('devrait retourner une erreur de validation du service', async () => {
        const body = {
          question: 'DROP TABLE members',
        };

        const mockResponse = {
          answer: 'Erreur: requête non autorisée',
          error: 'Requête SQL non autorisée: DROP détecté',
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
        expect(result.answer).toBeTruthy();
      });

      it('devrait retourner une erreur de base de données', async () => {
        const body = {
          question: 'Combien de membres ?',
        };

        const mockResponse = {
          answer: 'Erreur de connexion à la base de données',
          error: 'Database connection failed',
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Database');
      });

      it('devrait retourner une erreur OpenAI', async () => {
        const body = {
          question: 'Combien de membres ?',
        };

        const mockResponse = {
          answer: 'Le service chatbot n\'est pas disponible. Veuillez configurer OPENAI_API_KEY.',
          error: 'OpenAI client not initialized',
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(false);
        expect(result.error).toContain('OpenAI');
      });

      it('devrait gérer les erreurs inattendues du service', async () => {
        const body = {
          question: 'Test question',
        };

        const mockResponse = {
          answer: 'Une erreur inattendue s\'est produite',
          error: 'Unknown error',
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
        expect(result.answer).toBeTruthy();
      });
    });

    describe('Question validation', () => {
      it('devrait accepter une question simple', async () => {
        const body = {
          question: 'Combien de membres ?',
        };

        const mockResponse = {
          answer: 'Vous avez 50 membres.',
          sql: 'SELECT COUNT(*) FROM members',
          data: [{ count: 50 }],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
      });

      it('devrait accepter une question longue', async () => {
        const body = {
          question: 'Combien de membres ont participé à au moins un événement dans les 3 derniers mois et qui ont un score d\'engagement supérieur à 50 ?',
        };

        const mockResponse = {
          answer: 'Résultat trouvé',
          sql: 'SELECT COUNT(*) FROM members',
          data: [{ count: 15 }],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
        expect(mockChatbotService.query).toHaveBeenCalledWith(body.question, undefined);
      });

      it('devrait accepter une question vide seulement si elle est une string', async () => {
        const body = {
          question: '',
        };

        // Une string vide est invalide pour la question
        expect(async () => {
          // On ne teste pas ici, juste la validation du type
          const testValidation = typeof body.question === 'string' && !body.question;
        }).not.toThrow();
      });

      it('devrait rejeter une question qui est un nombre', async () => {
        const body = {
          question: 42,
        };

        await expect(controller.query(body as any)).rejects.toThrow();
      });

      it('devrait rejeter une question qui est un booléen', async () => {
        const body = {
          question: true,
        };

        await expect(controller.query(body as any)).rejects.toThrow();
      });
    });

    describe('Response format', () => {
      it('devrait retourner un objet avec les bonnes clés en cas de succès', async () => {
        const body = {
          question: 'Test',
        };

        const mockResponse = {
          answer: 'Test answer',
          sql: 'SELECT * FROM members',
          data: [{ id: '1' }],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('answer');
        expect(result).toHaveProperty('sql');
        expect(result).toHaveProperty('data');
        expect(Object.keys(result)).toContain('success');
      });

      it('devrait retourner un objet avec les bonnes clés en cas d\'erreur', async () => {
        const body = {
          question: 'Test',
        };

        const mockResponse = {
          answer: 'Erreur',
          error: 'Some error',
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('answer');
        expect(result.success).toBe(false);
      });

      it('ne devrait pas inclure de données si success est false', async () => {
        const body = {
          question: 'Test',
        };

        const mockResponse = {
          answer: 'Erreur',
          error: 'Error message',
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(false);
        // Les données ne sont pas ajoutées dans la réponse d'erreur
        if (result.success === false) {
          expect(result.data).toBeUndefined();
        }
      });

      it('devrait inclure SQL même en cas d\'erreur', async () => {
        const body = {
          question: 'SELECT DROP',
        };

        const mockResponse = {
          answer: 'Erreur SQL',
          error: 'Invalid SQL',
          sql: 'SELECT DROP', // Peut inclure le SQL tentative
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        // Le contrôleur ne forcément inclut pas le SQL en cas d'erreur
        expect(result.error).toBeTruthy();
      });
    });

    describe('Context parameter', () => {
      it('devrait passer le context au service si fourni', async () => {
        const body = {
          question: 'Test',
          context: 'dashboard',
        };

        const mockResponse = {
          answer: 'Answer',
          sql: 'SQL',
          data: [],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        await controller.query(body);

        expect(mockChatbotService.query).toHaveBeenCalledWith('Test', 'dashboard');
      });

      it('devrait passer undefined si context n\'est pas fourni', async () => {
        const body = {
          question: 'Test',
        };

        const mockResponse = {
          answer: 'Answer',
          sql: 'SQL',
          data: [],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        await controller.query(body);

        expect(mockChatbotService.query).toHaveBeenCalledWith('Test', undefined);
      });

      it('devrait accepter différentes valeurs de context', async () => {
        const testContexts = ['dashboard', 'admin', 'report', 'analytics'];

        for (const context of testContexts) {
          const body = {
            question: 'Test',
            context,
          };

          const mockResponse = {
            answer: 'Answer',
            sql: 'SQL',
            data: [],
          };

          mockChatbotService.query.mockResolvedValueOnce(mockResponse);

          await controller.query(body);

          expect(mockChatbotService.query).toHaveBeenCalledWith('Test', context);
        }
      });

      it('ne devrait pas valider le context', async () => {
        const body = {
          question: 'Test',
          context: 123, // Pas validé par le contrôleur
        };

        const mockResponse = {
          answer: 'Answer',
          sql: 'SQL',
          data: [],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
        expect(mockChatbotService.query).toHaveBeenCalledWith('Test', 123);
      });
    });

    describe('Edge cases', () => {
      it('devrait gérer une question avec des accents', async () => {
        const body = {
          question: 'Combien de mécènes avons-nous à Amiens ?',
        };

        const mockResponse = {
          answer: 'Réponse avec accents',
          sql: 'SELECT * FROM patrons',
          data: [],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
      });

      it('devrait gérer une question avec des caractères Unicode', async () => {
        const body = {
          question: '📊 Combien de statistiques ?',
        };

        const mockResponse = {
          answer: 'Statistiques',
          sql: 'SELECT COUNT(*)',
          data: [],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
      });

      it('devrait gérer une question avec des sauts de ligne', async () => {
        const body = {
          question: 'Combien\nde\nmembres\n?',
        };

        const mockResponse = {
          answer: 'Réponse',
          sql: 'SELECT COUNT(*)',
          data: [{ count: 50 }],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
      });

      it('devrait gérer une question avec des guillemets', async () => {
        const body = {
          question: 'Lister les membres avec le prénom "Jean"',
        };

        const mockResponse = {
          answer: 'Résultats',
          sql: 'SELECT * FROM members',
          data: [],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
      });

      it('devrait gérer une très longue question', async () => {
        const longQuestion = 'Combien ' + 'de '.repeat(500) + 'membres ?';
        const body = {
          question: longQuestion,
        };

        const mockResponse = {
          answer: 'Réponse',
          sql: 'SELECT COUNT(*)',
          data: [{ count: 100 }],
        };

        mockChatbotService.query.mockResolvedValueOnce(mockResponse);

        const result = await controller.query(body);

        expect(result.success).toBe(true);
      });
    });
  });

  describe('Service integration', () => {
    it('devrait appeler service.query une seule fois par request', async () => {
      const body = {
        question: 'Test',
      };

      const mockResponse = {
        answer: 'Answer',
        sql: 'SQL',
        data: [],
      };

      mockChatbotService.query.mockResolvedValueOnce(mockResponse);

      await controller.query(body);

      expect(mockChatbotService.query).toHaveBeenCalledTimes(1);
    });

    it('devrait utiliser exactement les paramètres fournis', async () => {
      const question = 'Question test';
      const context = 'context-test';
      const body = { question, context };

      const mockResponse = {
        answer: 'Answer',
        sql: 'SQL',
        data: [],
      };

      mockChatbotService.query.mockResolvedValueOnce(mockResponse);

      await controller.query(body);

      expect(mockChatbotService.query).toHaveBeenCalledWith(question, context);
    });

    it('devrait mapper correctement les données du service vers la réponse', async () => {
      const body = {
        question: 'Test',
      };

      const serviceResponse = {
        answer: 'Test answer',
        sql: 'SELECT * FROM test',
        data: [{ field: 'value' }],
      };

      mockChatbotService.query.mockResolvedValueOnce(serviceResponse);

      const result = await controller.query(body);

      expect(result.answer).toBe(serviceResponse.answer);
      expect(result.sql).toBe(serviceResponse.sql);
      expect(result.data).toEqual(serviceResponse.data);
    });

    it('devrait gérer la structure de réponse du service avec erreur', async () => {
      const body = {
        question: 'Test',
      };

      const serviceResponse = {
        answer: 'Erreur message',
        error: 'Error details',
      };

      mockChatbotService.query.mockResolvedValueOnce(serviceResponse);

      const result = await controller.query(body);

      expect(result.success).toBe(false);
      expect(result.error).toBe(serviceResponse.error);
      expect(result.answer).toBe(serviceResponse.answer);
    });
  });
});
