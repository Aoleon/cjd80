/**
 * Script de test pour valider les méthodes stats
 * Usage: npx tsx scripts/test-stats.ts
 */

import 'dotenv/config';
import { IdeasService } from '../server/src/ideas/ideas.service';
import { EventsService } from '../server/src/events/events.service';
import { StorageService } from '../server/src/common/storage/storage.service';
import { logger } from '../server/lib/logger';

async function testStats() {
  logger.info('Starting stats methods test...');

  // Instancier les services
  const storageService = new StorageService();
  const ideasService = new IdeasService(storageService);
  const eventsService = new EventsService(storageService);

  try {
    // Test IdeasService.getIdeasStats()
    logger.info('Testing IdeasService.getIdeasStats()...');
    const ideasStats = await ideasService.getIdeasStats();
    logger.info('Ideas Stats:', ideasStats);

    // Validation basique
    if (typeof ideasStats.total !== 'number') {
      throw new Error('ideasStats.total should be a number');
    }
    if (typeof ideasStats.pending !== 'number') {
      throw new Error('ideasStats.pending should be a number');
    }
    if (typeof ideasStats.approved !== 'number') {
      throw new Error('ideasStats.approved should be a number');
    }
    if (typeof ideasStats.rejected !== 'number') {
      throw new Error('ideasStats.rejected should be a number');
    }
    if (typeof ideasStats.totalVotes !== 'number') {
      throw new Error('ideasStats.totalVotes should be a number');
    }
    if (!Array.isArray(ideasStats.topIdeas)) {
      throw new Error('ideasStats.topIdeas should be an array');
    }

    logger.info('✓ IdeasService.getIdeasStats() - PASSED');

    // Test EventsService.getEventsStats()
    logger.info('Testing EventsService.getEventsStats()...');
    const eventsStats = await eventsService.getEventsStats();
    logger.info('Events Stats:', eventsStats);

    // Validation basique
    if (typeof eventsStats.total !== 'number') {
      throw new Error('eventsStats.total should be a number');
    }
    if (typeof eventsStats.upcoming !== 'number') {
      throw new Error('eventsStats.upcoming should be a number');
    }
    if (typeof eventsStats.past !== 'number') {
      throw new Error('eventsStats.past should be a number');
    }
    if (typeof eventsStats.totalInscriptions !== 'number') {
      throw new Error('eventsStats.totalInscriptions should be a number');
    }
    if (typeof eventsStats.averageInscriptions !== 'number') {
      throw new Error('eventsStats.averageInscriptions should be a number');
    }

    logger.info('✓ EventsService.getEventsStats() - PASSED');

    logger.info('');
    logger.info('========================================');
    logger.info('ALL TESTS PASSED ✓');
    logger.info('========================================');
    logger.info('');
    logger.info('Summary:');
    logger.info(`- Total ideas: ${ideasStats.total}`);
    logger.info(`- Pending ideas: ${ideasStats.pending}`);
    logger.info(`- Approved ideas: ${ideasStats.approved}`);
    logger.info(`- Rejected ideas: ${ideasStats.rejected}`);
    logger.info(`- Total votes: ${ideasStats.totalVotes}`);
    logger.info(`- Top ideas count: ${ideasStats.topIdeas.length}`);
    logger.info('');
    logger.info(`- Total events: ${eventsStats.total}`);
    logger.info(`- Upcoming events: ${eventsStats.upcoming}`);
    logger.info(`- Past events: ${eventsStats.past}`);
    logger.info(`- Total inscriptions: ${eventsStats.totalInscriptions}`);
    logger.info(`- Average inscriptions: ${eventsStats.averageInscriptions}`);

    process.exit(0);
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Exécuter les tests
testStats();
