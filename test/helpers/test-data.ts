import { nanoid } from 'nanoid';

/**
 * Helpers pour générer des données de test reconnaissables
 * Toutes les données générées ici correspondent aux patterns de nettoyage automatique
 */

/**
 * Génère un email de test unique
 * Format: test-{id}@test.com ou playwright-{id}@playwright.test
 * 
 * @param prefix - Préfixe pour l'email (par défaut: 'test')
 * @param domain - Domaine de l'email (par défaut: 'test.com')
 */
export function generateTestEmail(prefix: string = 'test', domain: string = 'test.com'): string {
  const id = nanoid(8);
  return `${prefix}-${id}@${domain}`;
}

/**
 * Génère un nom de test unique
 * Format: [TEST] Name {id}
 * 
 * @param baseName - Nom de base (par défaut: 'User')
 */
export function generateTestName(baseName: string = 'User'): string {
  const id = nanoid(6);
  return `[TEST] ${baseName} ${id}`;
}

/**
 * Génère un titre de test unique
 * Format: [TEST] Title {id}
 * 
 * @param baseTitle - Titre de base (par défaut: 'Item')
 */
export function generateTestTitle(baseTitle: string = 'Item'): string {
  const id = nanoid(6);
  return `[TEST] ${baseTitle} ${id}`;
}

/**
 * Génère un nom de société de test
 * Format: Test Company {id}
 */
export function generateTestCompany(): string {
  const id = nanoid(6);
  return `Test Company ${id}`;
}

/**
 * Génère un numéro de téléphone de test
 * Format: +33 6 12 34 56 78 (format français fictif)
 */
export function generateTestPhone(): string {
  const random1 = Math.floor(Math.random() * 90) + 10;
  const random2 = Math.floor(Math.random() * 90) + 10;
  const random3 = Math.floor(Math.random() * 90) + 10;
  const random4 = Math.floor(Math.random() * 90) + 10;
  return `+33 6 ${random1} ${random2} ${random3} ${random4}`;
}

/**
 * Génère des données complètes pour une idée de test
 */
export interface TestIdeaData {
  title: string;
  description: string;
  proposedBy: string;
  proposedByEmail: string;
}

export function generateTestIdea(options?: {
  title?: string;
  description?: string;
  proposerName?: string;
}): TestIdeaData {
  return {
    title: options?.title || generateTestTitle('Idée'),
    description: options?.description || `Description de test générée automatiquement ${nanoid(6)}`,
    proposedBy: options?.proposerName || generateTestName('Proposeur'),
    proposedByEmail: generateTestEmail('proposeur'),
  };
}

/**
 * Génère des données complètes pour un événement de test
 */
export interface TestEventData {
  title: string;
  description: string;
  date: Date;
  location: string;
}

export function generateTestEvent(options?: {
  title?: string;
  description?: string;
  daysFromNow?: number;
  location?: string;
}): TestEventData {
  const daysFromNow = options?.daysFromNow || 30;
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + daysFromNow);

  return {
    title: options?.title || generateTestTitle('Événement'),
    description: options?.description || `Description d'événement de test ${nanoid(6)}`,
    date: eventDate,
    location: options?.location || `Lieu de test ${nanoid(4)}`,
  };
}

/**
 * Génère des données complètes pour un vote de test
 */
export interface TestVoteData {
  voterName: string;
  voterEmail: string;
}

export function generateTestVote(options?: {
  voterName?: string;
}): TestVoteData {
  return {
    voterName: options?.voterName || generateTestName('Votant'),
    voterEmail: generateTestEmail('votant'),
  };
}

/**
 * Génère des données complètes pour une inscription de test
 */
export interface TestInscriptionData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  comments?: string;
}

export function generateTestInscription(options?: {
  name?: string;
  company?: string;
  includePhone?: boolean;
  comments?: string;
}): TestInscriptionData {
  const data: TestInscriptionData = {
    name: options?.name || generateTestName('Participant'),
    email: generateTestEmail('participant'),
  };

  if (options?.company !== undefined) {
    data.company = options.company;
  } else {
    data.company = generateTestCompany();
  }

  if (options?.includePhone) {
    data.phone = generateTestPhone();
  }

  if (options?.comments) {
    data.comments = options.comments;
  }

  return data;
}

/**
 * Génère des données complètes pour un mécène de test
 */
export interface TestPatronData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  role?: string;
  notes?: string;
}

export function generateTestPatron(options?: {
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  includePhone?: boolean;
  notes?: string;
}): TestPatronData {
  const data: TestPatronData = {
    firstName: options?.firstName || `[TEST] Prénom ${nanoid(4)}`,
    lastName: options?.lastName || `Nom ${nanoid(4)}`,
    email: generateTestEmail('patron'),
  };

  if (options?.company !== undefined) {
    data.company = options.company;
  } else {
    data.company = generateTestCompany();
  }

  if (options?.role) {
    data.role = options.role;
  }

  if (options?.includePhone) {
    data.phone = generateTestPhone();
  }

  if (options?.notes) {
    data.notes = options.notes;
  }

  return data;
}

/**
 * Génère des données complètes pour un membre de test
 */
export interface TestMemberData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
}

export function generateTestMember(options?: {
  firstName?: string;
  lastName?: string;
  company?: string;
  includePhone?: boolean;
}): TestMemberData {
  const data: TestMemberData = {
    firstName: options?.firstName || `[TEST] Membre ${nanoid(4)}`,
    lastName: options?.lastName || `Test ${nanoid(4)}`,
    email: generateTestEmail('membre'),
  };

  if (options?.company !== undefined) {
    data.company = options.company;
  } else {
    data.company = generateTestCompany();
  }

  if (options?.includePhone) {
    data.phone = generateTestPhone();
  }

  return data;
}

/**
 * Génère un tableau de données de test
 * Utile pour créer rapidement plusieurs entités de test
 */
export function generateTestArray<T>(
  generator: () => T,
  count: number
): T[] {
  return Array.from({ length: count }, () => generator());
}

/**
 * Exemple d'utilisation:
 * 
 * ```typescript
 * // Générer un email de test
 * const email = generateTestEmail(); // test-abc123@test.com
 * 
 * // Générer un titre de test
 * const title = generateTestTitle('Mon idée'); // [TEST] Mon idée xyz789
 * 
 * // Générer une idée complète
 * const idea = generateTestIdea({
 *   title: 'Améliorer le site',
 *   proposerName: 'Jean Dupont'
 * });
 * 
 * // Générer 5 votes de test
 * const votes = generateTestArray(generateTestVote, 5);
 * ```
 */
