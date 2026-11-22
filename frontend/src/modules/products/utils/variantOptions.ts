import type { PublicVariant } from '../schemas/productSchema';

/** Couleur d'une variante : conditionnement si renseigné, sinon libellé. */
export const variantColor = (variant: PublicVariant): string => variant.packaging ?? variant.label;

/** Une variante peut être commandée en ligne : disponible et avec un prix ferme. */
export const isPurchasable = (variant: PublicVariant): boolean =>
  variant.availability === 'available' &&
  !variant.priceOnRequest &&
  variant.indicativePrice !== null;

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL', '4XL', '5XL'];

/** Ordre naturel des tailles : lettres (XS → 5XL), puis nombres croissants, puis le reste. */
export function compareSizes(a: string, b: string): number {
  const rank = (value: string) => {
    const index = SIZE_ORDER.indexOf(value.trim().toUpperCase());
    if (index >= 0) return index;
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? 100 + number : Number.POSITIVE_INFINITY;
  };
  const difference = rank(a) - rank(b);
  return Number.isNaN(difference) || difference === 0 ? a.localeCompare(b, 'fr') : difference;
}

const SWATCHES: [RegExp, string][] = [
  [/noir/i, '#1b1b1b'],
  [/blanc|écru|ecru/i, '#f7f5f0'],
  [/marine/i, '#1f2a44'],
  [/bleu ciel|ciel/i, '#9ec3e6'],
  [/bleu/i, '#2f4f86'],
  [/beige|sable/i, '#d8c6a6'],
  [/kaki|olive/i, '#6b6a43'],
  [/vert/i, '#2f5a3e'],
  [/gris/i, '#8d8d8a'],
  [/marron|chocolat|camel/i, '#6e4a32'],
  [/bordeaux/i, '#5e1f2a'],
  [/rouge/i, '#b3282d'],
  [/jaune|moutarde/i, '#d7a92a'],
  [/rose/i, '#e5aab4'],
];

/** Pastille indicative pour un nom de couleur ; `null` si la couleur n'est pas reconnue. */
export function swatchFor(color: string): string | null {
  return SWATCHES.find(([pattern]) => pattern.test(color))?.[1] ?? null;
}
