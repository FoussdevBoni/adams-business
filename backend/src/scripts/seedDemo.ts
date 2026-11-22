import { defaultPageContents } from '../modules/pages/pageDefaults.js';
import { seedDefaultContent } from '../modules/pages/pageService.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { connectDatabase, disconnectDatabase } from '../core/database/databaseConnection.js';
import type { RequestMeta } from '../core/http/requestMeta.js';
import { logger } from '../core/logger/logger.js';
import { UserModel } from '../modules/auth/userModel.js';
import { CategoryModel } from '../modules/categories/categoryModel.js';
import { createCategory } from '../modules/categories/categoryService.js';
import { MediaModel } from '../modules/media/mediaModel.js';
import { uploadMedia } from '../modules/media/mediaService.js';

import { ProductModel } from '../modules/products/productModel.js';
import { createProduct, setProductPublication } from '../modules/products/productService.js';
import { type DemoAssetKey, demoAssets, demoCategories, demoProducts } from './demo/demoContent.js';

const apply = process.argv.includes('--apply');
const meta: RequestMeta = { ip: null, userAgent: 'seed:demo' };
const assetsDir = resolve(process.cwd(), 'demo-assets');
const report: string[] = [];
const note = (line: string) => report.push(`${apply ? '[fait]' : '[prévu]'} ${line}`);
const skip = (line: string) => report.push(`[conservé] ${line}`);

/** Fictif en simulation : aucune référence réelle n'est écrite. */
const PLANNED_ID = '000000000000000000000000';

async function ensureMedia(actorId: string): Promise<Map<DemoAssetKey, string>> {
  const ids = new Map<DemoAssetKey, string>();
  for (const [key, alt] of Object.entries(demoAssets) as [DemoAssetKey, string][]) {
    const filename = `adams-${key}.jpg`;
    const existing = await MediaModel.findOne({ originalFilename: filename }).select('_id').lean();
    if (existing) {
      ids.set(key, existing._id.toString());
      skip(`média ${filename}`);
      continue;
    }
    note(`média ${filename}`);
    if (!apply) {
      ids.set(key, PLANNED_ID);
      continue;
    }
    const media = await uploadMedia(
      actorId,
      {
        file: readFileSync(resolve(assetsDir, `${key}.jpg`)),
        declaredType: 'image/jpeg',
        filename,
        alt,
      },
      meta,
    );
    ids.set(key, media.id);
  }
  return ids;
}

function mediaId(media: Map<DemoAssetKey, string>, key: DemoAssetKey): string {
  const id = media.get(key);
  if (!id) throw new Error(`Média inconnu : ${key}`);
  return id;
}

async function ensureCategories(media: Map<DemoAssetKey, string>): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const category of demoCategories) {
    const existing = await CategoryModel.findOne({ slug: category.slug }).select('_id').lean();
    if (existing) {
      ids.set(category.slug, existing._id.toString());
      skip(`catégorie ${category.slug}`);
      continue;
    }
    note(`catégorie ${category.slug}`);
    if (!apply) {
      ids.set(category.slug, PLANNED_ID);
      continue;
    }
    const created = await createCategory({
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageId: mediaId(media, category.imageKey),
      isActive: true,
    });
    ids.set(category.slug, created.id);
  }
  return ids;
}

async function ensureProducts(
  actorId: string,
  media: Map<DemoAssetKey, string>,
  categories: Map<string, string>,
): Promise<void> {
  for (const product of demoProducts) {
    const existing = await ProductModel.exists({
      $or: [{ slug: product.slug }, { previousSlugs: product.slug }],
    });
    if (existing) {
      skip(`produit ${product.slug}`);
      continue;
    }
    note(`produit ${product.slug} (publié)`);
    if (!apply) continue;
    const created = await createProduct(actorId, {
      name: product.name,
      slug: product.slug,
      categoryId: categories.get(product.category) ?? null,
      shortDescription: product.shortDescription,
      description: product.description,
      characteristics: product.characteristics,
      images: [{ mediaId: mediaId(media, product.imageKey), alt: demoAssets[product.imageKey] }],
      variants: product.variants,
      featured: product.featured ?? false,
      seo: { title: '', description: '' },
    });
    await setProductPublication(created.id, true);
  }
}

/** Complète la démonstration sans rien supprimer ni remplacer. Simulation sans `--apply`. */
async function seedDemo(): Promise<void> {
  await connectDatabase();
  try {
    const actor = await UserModel.findOne({
      role: 'superAdmin',
      status: { $in: ['active', 'pending'] },
    })
      .select('_id')
      .lean();
    if (!actor) throw new Error('Créez d’abord le compte super-administrateur de la boutique.');
    const actorId = actor._id.toString();
    const media = await ensureMedia(actorId);
    const categories = await ensureCategories(media);
    await ensureProducts(actorId, media, categories);
    if (apply) await seedDefaultContent(defaultPageContents);
    for (const line of report) console.log(line);
    console.log(apply ? 'Alimentation terminée.' : 'Simulation terminée : rien n’a été écrit.');
  } catch (error) {
    for (const line of report) console.log(line);
    logger.error({ err: error }, 'Alimentation de la démonstration impossible');
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

await seedDemo();
