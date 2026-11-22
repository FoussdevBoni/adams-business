import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { inspectImage } from './imageInspector.js';
import type { MediaStorage } from './mediaStorage.js';

const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export const localMediaPath = '/api/v1/uploads';

export function createLocalMediaStorage(directory: string, publicUrl: string): MediaStorage {
  return {
    async upload(file) {
      const image = inspectImage(file);
      if (!image) throw new Error('Image invalide.');
      const format = extensions[image.mimeType];
      const publicId = `${randomUUID()}.${format}`;
      await mkdir(directory, { recursive: true });
      await writeFile(join(directory, publicId), file, { flag: 'wx' });
      return {
        publicId,
        url: new URL(`${localMediaPath}/${publicId}`, publicUrl).href,
        bytes: file.length,
        width: image.width,
        height: image.height,
        format,
      };
    },
    async destroy(publicId) {
      if (!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(publicId)) return;
      try {
        await unlink(join(directory, publicId));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    },
  };
}
