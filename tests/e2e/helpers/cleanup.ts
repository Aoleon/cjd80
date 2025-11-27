import { db } from '../../../server/db';
import { 
  ideas, 
  votes, 
  events, 
  inscriptions, 
  unsubscriptions,
  patrons,
  patronDonations,
  patronUpdates,
  members,
  memberActivities,
  memberSubscriptions,
  ideaPatronProposals
} from '../../../shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Test data patterns - Toutes les données de test doivent correspondre à au moins un de ces patterns
 * pour être automatiquement supprimées après les tests
 */
const TEST_PATTERNS = {
  // Patterns d'emails de test
  EMAIL_PATTERNS: [
    '%@test.com',           // Emails se terminant par @test.com
    '%@playwright.test',    // Emails se terminant par @playwright.test
    'test-%@%',            // Emails commençant par test-
    'playwright-%@%',      // Emails commençant par playwright-
  ],
  
  // Patterns de noms de test
  NAME_PATTERNS: [
    '[TEST]%',             // Noms commençant par [TEST]
    '%[TEST]%',            // Noms contenant [TEST]
    'Test User%',          // Noms commençant par Test User
    'Playwright%',         // Noms commençant par Playwright
  ],
  
  // Patterns de titres de test
  TITLE_PATTERNS: [
    '[TEST]%',             // Titres commençant par [TEST]
    '%[TEST]%',            // Titres contenant [TEST]
    'Test:%',              // Titres commençant par Test:
    'Playwright:%',        // Titres commençant par Playwright:
    'E2E Test%',           // Titres commençant par E2E Test
  ]
};

/**
 * Nettoie toutes les données de test de la base de données
 * Cette fonction est appelée automatiquement après chaque test Playwright
 */
export async function cleanupTestData(): Promise<void> {
  try {
    console.log('[Cleanup] 🧹 Début du nettoyage des données de test...');
    
    // 1. Nettoyer les votes (ils dépendent des idées via FK)
    const votesDeleted = await cleanupVotes();
    
    // 2. Nettoyer les inscriptions (dépendent des événements via FK)
    const inscriptionsDeleted = await cleanupInscriptions();
    
    // 3. Nettoyer les désinscriptions (dépendent des événements via FK)
    const unsubscriptionsDeleted = await cleanupUnsubscriptions();
    
    // 4. Nettoyer les propositions de mécènes pour idées (dépendent des idées via FK)
    const patronProposalsDeleted = await cleanupIdeaPatronProposals();
    
    // 5. Nettoyer les idées
    const ideasDeleted = await cleanupIdeas();
    
    // 6. Nettoyer les événements
    const eventsDeleted = await cleanupEvents();
    
    // 7. Nettoyer les activités membres (dépendent des membres via FK)
    const activitiesDeleted = await cleanupMemberActivities();
    
    // 8. Nettoyer les abonnements membres (dépendent des membres via FK)
    const subscriptionsDeleted = await cleanupMemberSubscriptions();
    
    // 9. Nettoyer les membres
    const membersDeleted = await cleanupMembers();
    
    // 10. Nettoyer les dons de mécènes (dépendent des mécènes via FK)
    const donationsDeleted = await cleanupPatronDonations();
    
    // 11. Nettoyer les actualités mécènes (dépendent des mécènes via FK)
    const updatesDeleted = await cleanupPatronUpdates();
    
    // 12. Nettoyer les mécènes
    const patronsDeleted = await cleanupPatrons();
    
    const totalDeleted = 
      votesDeleted + 
      inscriptionsDeleted + 
      unsubscriptionsDeleted +
      patronProposalsDeleted +
      ideasDeleted + 
      eventsDeleted + 
      activitiesDeleted +
      subscriptionsDeleted +
      membersDeleted + 
      donationsDeleted + 
      updatesDeleted +
      patronsDeleted;
    
    if (totalDeleted > 0) {
      console.log(`[Cleanup] ✅ Nettoyage terminé : ${totalDeleted} enregistrement(s) supprimé(s)`);
      console.log(`[Cleanup]    - Idées: ${ideasDeleted}`);
      console.log(`[Cleanup]    - Votes: ${votesDeleted}`);
      console.log(`[Cleanup]    - Événements: ${eventsDeleted}`);
      console.log(`[Cleanup]    - Inscriptions: ${inscriptionsDeleted}`);
      console.log(`[Cleanup]    - Désinscriptions: ${unsubscriptionsDeleted}`);
      console.log(`[Cleanup]    - Membres: ${membersDeleted}`);
      console.log(`[Cleanup]    - Activités membres: ${activitiesDeleted}`);
      console.log(`[Cleanup]    - Abonnements membres: ${subscriptionsDeleted}`);
      console.log(`[Cleanup]    - Mécènes: ${patronsDeleted}`);
      console.log(`[Cleanup]    - Dons mécènes: ${donationsDeleted}`);
      console.log(`[Cleanup]    - Actualités mécènes: ${updatesDeleted}`);
      console.log(`[Cleanup]    - Propositions mécènes idées: ${patronProposalsDeleted}`);
    } else {
      console.log('[Cleanup] ✨ Aucune donnée de test à nettoyer');
    }
  } catch (error) {
    console.error('[Cleanup] ❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

/**
 * Nettoie les idées de test
 */
async function cleanupIdeas(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern => 
    sql`${ideas.proposedByEmail} LIKE ${pattern}`
  );
  
  const titleConditions = TEST_PATTERNS.TITLE_PATTERNS.map(pattern =>
    sql`${ideas.title} LIKE ${pattern}`
  );
  
  const nameConditions = TEST_PATTERNS.NAME_PATTERNS.map(pattern =>
    sql`${ideas.proposedBy} LIKE ${pattern}`
  );
  
  const allConditions = [...emailConditions, ...titleConditions, ...nameConditions];
  const whereClause = sql.join(allConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${ideas}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les votes de test
 */
async function cleanupVotes(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${votes.voterEmail} LIKE ${pattern}`
  );
  
  const nameConditions = TEST_PATTERNS.NAME_PATTERNS.map(pattern =>
    sql`${votes.voterName} LIKE ${pattern}`
  );
  
  const allConditions = [...emailConditions, ...nameConditions];
  const whereClause = sql.join(allConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${votes}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les événements de test
 */
async function cleanupEvents(): Promise<number> {
  const titleConditions = TEST_PATTERNS.TITLE_PATTERNS.map(pattern =>
    sql`${events.title} LIKE ${pattern}`
  );
  
  const whereClause = sql.join(titleConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${events}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les inscriptions de test
 */
async function cleanupInscriptions(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${inscriptions.email} LIKE ${pattern}`
  );
  
  const nameConditions = TEST_PATTERNS.NAME_PATTERNS.map(pattern =>
    sql`${inscriptions.name} LIKE ${pattern}`
  );
  
  const allConditions = [...emailConditions, ...nameConditions];
  const whereClause = sql.join(allConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${inscriptions}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les désinscriptions de test
 */
async function cleanupUnsubscriptions(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${unsubscriptions.email} LIKE ${pattern}`
  );
  
  const nameConditions = TEST_PATTERNS.NAME_PATTERNS.map(pattern =>
    sql`${unsubscriptions.name} LIKE ${pattern}`
  );
  
  const allConditions = [...emailConditions, ...nameConditions];
  const whereClause = sql.join(allConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${unsubscriptions}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les membres de test
 */
async function cleanupMembers(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${members.email} LIKE ${pattern}`
  );
  
  const nameConditions = TEST_PATTERNS.NAME_PATTERNS.map(pattern =>
    sql`${members.firstName} LIKE ${pattern} OR ${members.lastName} LIKE ${pattern}`
  );
  
  const allConditions = [...emailConditions, ...nameConditions];
  const whereClause = sql.join(allConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${members}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les activités membres de test
 */
async function cleanupMemberActivities(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${memberActivities.memberEmail} LIKE ${pattern}`
  );
  
  const whereClause = sql.join(emailConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${memberActivities}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les abonnements membres de test
 */
async function cleanupMemberSubscriptions(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${memberSubscriptions.memberEmail} LIKE ${pattern}`
  );
  
  const whereClause = sql.join(emailConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${memberSubscriptions}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les mécènes de test
 */
async function cleanupPatrons(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${patrons.email} LIKE ${pattern}`
  );
  
  const nameConditions = TEST_PATTERNS.NAME_PATTERNS.map(pattern =>
    sql`${patrons.firstName} LIKE ${pattern} OR ${patrons.lastName} LIKE ${pattern}`
  );
  
  const allConditions = [...emailConditions, ...nameConditions];
  const whereClause = sql.join(allConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${patrons}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les dons de mécènes de test
 */
async function cleanupPatronDonations(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${patronDonations.recordedBy} LIKE ${pattern}`
  );
  
  const whereClause = sql.join(emailConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${patronDonations}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les actualités mécènes de test
 */
async function cleanupPatronUpdates(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${patronUpdates.createdBy} LIKE ${pattern}`
  );
  
  const whereClause = sql.join(emailConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${patronUpdates}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Nettoie les propositions de mécènes pour idées de test
 */
async function cleanupIdeaPatronProposals(): Promise<number> {
  const emailConditions = TEST_PATTERNS.EMAIL_PATTERNS.map(pattern =>
    sql`${ideaPatronProposals.proposedByAdminEmail} LIKE ${pattern}`
  );
  
  const whereClause = sql.join(emailConditions, sql.raw(' OR '));
  
  const result = await db.execute(sql`
    DELETE FROM ${ideaPatronProposals}
    WHERE ${whereClause}
  `);
  
  return result.rowCount || 0;
}

/**
 * Vérifie si une donnée correspond à un pattern de test
 * Utile pour vérifier avant d'insérer des données dans les tests
 */
export function isTestData(data: {
  email?: string;
  name?: string;
  title?: string;
}): boolean {
  if (data.email) {
    const emailMatches = TEST_PATTERNS.EMAIL_PATTERNS.some(pattern => {
      const regex = new RegExp('^' + pattern.replace(/%/g, '.*') + '$');
      return regex.test(data.email!);
    });
    if (emailMatches) return true;
  }
  
  if (data.name) {
    const nameMatches = TEST_PATTERNS.NAME_PATTERNS.some(pattern => {
      const regex = new RegExp('^' + pattern.replace(/%/g, '.*') + '$');
      return regex.test(data.name!);
    });
    if (nameMatches) return true;
  }
  
  if (data.title) {
    const titleMatches = TEST_PATTERNS.TITLE_PATTERNS.some(pattern => {
      const regex = new RegExp('^' + pattern.replace(/%/g, '.*') + '$');
      return regex.test(data.title!);
    });
    if (titleMatches) return true;
  }
  
  return false;
}
