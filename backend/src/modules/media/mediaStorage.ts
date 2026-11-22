import { env } from '../../core/config/env.js';
import { createLocalMediaStorage } from './localMediaStorage.js';
import { createCloudinaryStorage } from './cloudinaryStorage.js';

export interface StoredMedia {
  publicId: string;
  url: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
}

/** Stockage distant des fichiers ; seule implémentation de production : Cloudinary. */
export interface MediaStorage {
  upload(file: Buffer, info: { mimeType: string; filename: string }): Promise<StoredMedia>;
  destroy(publicId: string): Promise<void>;
}

let storage: MediaStorage | undefined;

export function getMediaStorage(): MediaStorage {
  storage ??=
    env.NODE_ENV === 'development' && env.MEDIA_LOCAL_DIR
      ? createLocalMediaStorage(env.MEDIA_LOCAL_DIR, env.APP_PUBLIC_URL)
      : createCloudinaryStorage();
  return storage;
}

/** Réservé aux tests : remplace l'intégration Cloudinary par un double. */
export function setMediaStorage(replacement: MediaStorage | undefined): void {
  storage = replacement;
}
