import {
  connectDatabase,
  disconnectDatabase,
  getDatabaseDiagnostics,
} from '../core/database/databaseConnection.js';
import { logger } from '../core/logger/logger.js';

/** Vérifie la connexion MongoDB configurée et la prise en charge des transactions. */
async function checkDatabase(): Promise<void> {
  try {
    await connectDatabase();
    const diagnostics = await getDatabaseDiagnostics();
    logger.info(diagnostics, 'Connexion MongoDB vérifiée');
    if (!diagnostics.transactionsSupported) {
      logger.warn(
        'Le cluster Atlas doit prendre en charge les transactions.',
      );
    }
    process.exitCode = diagnostics.reachable ? 0 : 1;
  } catch (error) {
    logger.error({ reason: error instanceof Error ? error.message : undefined }, 'Connexion MongoDB Atlas impossible');
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

await checkDatabase();
