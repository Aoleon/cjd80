import OpenAI from "openai";
import { logger } from "../lib/logger";

// Schéma de la base de données pour le contexte
const DATABASE_SCHEMA = `
Tables disponibles dans la base de données CJD Amiens:

1. members - Membres de la communauté
   - id (uuid)
   - email (text, unique)
   - first_name (text)
   - last_name (text)
   - company (text, nullable)
   - phone (text, nullable)
   - role (text, nullable)
   - cjd_role (text, nullable)
   - status (text: 'active' | 'proposed')
   - engagement_score (integer)
   - first_seen_at (timestamp)
   - last_activity_at (timestamp)
   - activity_count (integer)
   - created_at (timestamp)
   - updated_at (timestamp)

2. member_activities - Activités des membres
   - id (uuid)
   - member_email (text, FK -> members.email)
   - activity_type (text: 'idea_proposed' | 'vote_cast' | 'event_registered' | 'event_unregistered' | 'patron_suggested')
   - entity_type (text: 'idea' | 'vote' | 'event' | 'patron')
   - entity_id (varchar, nullable)
   - entity_title (text, nullable)
   - score_impact (integer)
   - occurred_at (timestamp)

3. member_subscriptions - Souscriptions des membres
   - id (serial)
   - member_email (varchar, FK -> members.email)
   - amount_in_cents (integer)
   - start_date (date)
   - end_date (date)
   - created_at (timestamp)

4. member_tags - Tags personnalisables
   - id (uuid)
   - name (text, unique)
   - color (text)
   - description (text, nullable)
   - created_at (timestamp)

5. member_tag_assignments - Assignation de tags aux membres
   - id (uuid)
   - member_email (text, FK -> members.email)
   - tag_id (varchar, FK -> member_tags.id)
   - assigned_by (text, nullable)
   - assigned_at (timestamp)

6. member_tasks - Tâches de suivi
   - id (uuid)
   - member_email (text, FK -> members.email)
   - title (text)
   - description (text, nullable)
   - task_type (text: 'call' | 'email' | 'meeting' | 'custom')
   - status (text: 'todo' | 'in_progress' | 'completed' | 'cancelled')
   - due_date (timestamp, nullable)
   - completed_at (timestamp, nullable)
   - completed_by (text, nullable)
   - assigned_to (text, nullable)
   - created_by (text)
   - created_at (timestamp)
   - updated_at (timestamp)

7. member_relations - Relations entre membres
   - id (uuid)
   - member_email (text, FK -> members.email)
   - related_member_email (text, FK -> members.email)
   - relation_type (text: 'sponsor' | 'team' | 'custom')
   - description (text, nullable)
   - created_by (text, nullable)
   - created_at (timestamp)

8. ideas - Idées proposées
   - id (uuid)
   - title (text)
   - description (text)
   - status (text: 'pending' | 'approved' | 'rejected' | 'under_review' | 'postponed' | 'completed')
   - proposed_by (text)
   - created_at (timestamp)
   - updated_at (timestamp)

9. votes - Votes sur les idées
   - id (uuid)
   - idea_id (uuid, FK -> ideas.id)
   - voter_email (text)
   - created_at (timestamp)

10. events - Événements
    - id (uuid)
    - title (text)
    - description (text)
    - date (timestamp)
    - status (text: 'draft' | 'published' | 'cancelled' | 'postponed' | 'completed')
    - created_at (timestamp)
    - updated_at (timestamp)

11. inscriptions - Inscriptions aux événements
    - id (uuid)
    - event_id (uuid, FK -> events.id)
    - email (text)
    - created_at (timestamp)

12. patrons - Mécènes
    - id (uuid)
    - first_name (text)
    - last_name (text)
    - email (text, unique)
    - company (text, nullable)
    - phone (text, nullable)
    - status (text: 'active' | 'inactive')
    - created_at (timestamp)
    - updated_at (timestamp)
`;

interface ChatbotQuery {
  question: string;
  context?: string;
}

interface ChatbotResponse {
  answer: string;
  sql?: string;
  data?: any[];
  error?: string;
}

export class ChatbotService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      logger.warn('OpenAI API key not found, chatbot service will be disabled');
    }
  }

  /**
   * Génère une requête SQL à partir d'une question en langage naturel
   */
  private async generateSQL(question: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const systemPrompt = `Tu es un assistant SQL expert pour une base de données PostgreSQL.
Tu dois générer des requêtes SQL sûres et efficaces à partir de questions en français.

Règles importantes:
1. Utilise UNIQUEMENT les tables et colonnes listées dans le schéma
2. Ne génère JAMAIS de requêtes DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE
3. Utilise UNIQUEMENT SELECT pour interroger les données
4. Utilise des paramètres préparés pour éviter les injections SQL
5. Retourne UNIQUEMENT la requête SQL, sans explication
6. Utilise des noms de colonnes en snake_case comme dans le schéma
7. Pour les dates, utilise le format ISO (YYYY-MM-DD) ou des fonctions PostgreSQL

Schéma de la base de données:
${DATABASE_SCHEMA}

Exemples de requêtes valides:
- "Combien de membres actifs avons-nous?" → SELECT COUNT(*) FROM members WHERE status = 'active';
- "Quels sont les membres avec le score d'engagement le plus élevé?" → SELECT first_name, last_name, email, engagement_score FROM members ORDER BY engagement_score DESC LIMIT 10;
- "Combien d'idées ont été proposées ce mois?" → SELECT COUNT(*) FROM ideas WHERE created_at >= date_trunc('month', CURRENT_DATE);

Réponds UNIQUEMENT avec la requête SQL, rien d'autre.`;

    const userPrompt = `Question: ${question}\n\nGénère la requête SQL correspondante:`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // Modèle plus économique pour les requêtes SQL
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1, // Faible température pour des requêtes SQL précises
        max_tokens: 500,
      });

      const sqlQuery = response.choices[0]?.message?.content?.trim() || '';
      
      // Nettoyer la requête (enlever les backticks markdown si présents)
      const cleanedSQL = sqlQuery.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Validation de sécurité basique
      this.validateSQL(cleanedSQL);
      
      return cleanedSQL;
    } catch (error) {
      logger.error('Error generating SQL', { error, question });
      throw new Error('Erreur lors de la génération de la requête SQL');
    }
  }

  /**
   * Valide que la requête SQL est sûre (SELECT uniquement)
   */
  private validateSQL(query: string): void {
    const upperQuery = query.toUpperCase().trim();
    
    // Vérifier qu'il n'y a pas de commandes dangereuses
    const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE', 'GRANT', 'REVOKE'];
    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        throw new Error(`Requête SQL non autorisée: ${keyword} détecté`);
      }
    }
    
    // Vérifier que c'est une requête SELECT
    if (!upperQuery.startsWith('SELECT')) {
      throw new Error('Seules les requêtes SELECT sont autorisées');
    }
  }

  /**
   * Exécute une requête SQL de manière sécurisée
   */
  private async executeSQL(sqlQuery: string): Promise<any[]> {
    try {
      // Utiliser pool.query() directement pour exécuter la requête brute
      // Note: La validation de sécurité a déjà été faite dans validateSQL()
      const { pool } = await import("../db");
      // Type-safe query pour Neon et PostgreSQL standard
      const dbProvider = process.env.DATABASE_URL?.includes('neon.tech') ? 'neon' : 'standard';
      let result: { rows: any[] };
      if (dbProvider === 'neon') {
        result = await (pool as any).query(sqlQuery);
      } else {
        result = await (pool as import('pg').Pool).query(sqlQuery);
      }
      return result.rows || [];
    } catch (error) {
      logger.error('Error executing SQL', { error, sqlQuery });
      throw new Error(`Erreur lors de l'exécution de la requête: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Génère une réponse naturelle à partir des résultats SQL
   */
  private async generateAnswer(question: string, sqlQuery: string, data: any[]): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const systemPrompt = `Tu es un assistant qui explique les résultats de requêtes SQL de manière naturelle en français.
Tu dois répondre de façon claire et concise, en utilisant les données fournies.`;

    const userPrompt = `Question: ${question}
Requête SQL exécutée: ${sqlQuery}
Résultats: ${JSON.stringify(data, null, 2)}

Génère une réponse naturelle en français qui répond à la question en utilisant les résultats.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content?.trim() || 'Aucune réponse générée';
    } catch (error) {
      logger.error('Error generating answer', { error });
      // Fallback: retourner une réponse simple basée sur les données
      if (data.length === 0) {
        return 'Aucun résultat trouvé pour cette requête.';
      }
      return `Résultat: ${data.length} ligne(s) trouvée(s).`;
    }
  }

  /**
   * Traite une question et retourne une réponse avec les données
   */
  async query(query: ChatbotQuery): Promise<ChatbotResponse> {
    if (!this.openai) {
      return {
        answer: 'Le service chatbot n\'est pas disponible. Veuillez configurer OPENAI_API_KEY.',
        error: 'OpenAI client not initialized'
      };
    }

    try {
      // Étape 1: Générer la requête SQL
      const sqlQuery = await this.generateSQL(query.question);
      
      // Étape 2: Exécuter la requête
      const data = await this.executeSQL(sqlQuery);
      
      // Étape 3: Générer une réponse naturelle
      const answer = await this.generateAnswer(query.question, sqlQuery, data);
      
      return {
        answer,
        sql: sqlQuery,
        data: data.length > 0 ? data : undefined,
      };
    } catch (error) {
      logger.error('Chatbot query error', { error, question: query.question });
      return {
        answer: error instanceof Error ? error.message : 'Une erreur est survenue lors du traitement de votre question.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance
let chatbotServiceInstance: ChatbotService | null = null;

export function getChatbotService(): ChatbotService {
  if (!chatbotServiceInstance) {
    chatbotServiceInstance = new ChatbotService();
  }
  return chatbotServiceInstance;
}

