import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { env } from '../core/config/env.js';
import { connectDatabase, disconnectDatabase } from '../core/database/databaseConnection.js';
import { logger } from '../core/logger/logger.js';
import { createCloudinaryStorage } from '../modules/media/cloudinaryStorage.js';
import { localMediaPath } from '../modules/media/localMediaStorage.js';
import { MediaModel } from '../modules/media/mediaModel.js';

/**
 * Migre vers Cloudinary les médias téléversés en développement dans le dossier local.
 * Le document média garde son identifiant : produits, catégories et pages restent liés.
 * Sans `--apply`, le script liste uniquement les médias concernés (aucune écriture).
 */
async function migrateLocalMedia(apply: boolean): Promise<void> {
  const directory = env.MEDIA_LOCAL_DIR || '.shop-media';
  const storage = createCloudinaryStorage();
  await connectDatabase();
  try {
    const medias = await MediaModel.find({ url: { $regex: `${localMediaPath}/` } });
    logger.info({ count: medias.length, apply }, 'Médias locaux trouvés');
    for (const media of medias) {
      const file = await readFile(join(directory, media.publicId));
      if (!apply) {
        logger.info({ id: media.id, publicId: media.publicId, bytes: file.length }, 'À migrer');
        continue;
      }
      const stored = await storage.upload(file, {
        mimeType: media.mimeType,
        filename: media.originalFilename || media.publicId,
      });
      await MediaModel.updateOne(
        { _id: media._id },
        { $set: { publicId: stored.publicId, url: stored.url } },
      );
      logger.info({ id: media.id, url: stored.url }, 'Média migré');
    }
  } finally {
    await disconnectDatabase();
  }
}

try {
  await migrateLocalMedia(process.argv.includes('--apply'));
} catch (error) {
  logger.error({ reason: error instanceof Error ? error.message : undefined }, 'Migration échouée');
  process.exitCode = 1;
}
