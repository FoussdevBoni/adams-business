import type { ProductFormValues } from '../schemas/productSchema';

/** Libellé automatique d'une variante : « Couleur · Taille ». */
export const variantLabel = (color: string, size: string) =>
  [color.trim(), size.trim()].filter(Boolean).join(' · ');

/**
 * Complète ce que l'administrateur n'a pas à saisir :
 * - libellé de variante déduit de la couleur et de la taille ;
 * - « prix sur demande » lorsque le prix est vide ou la variante est « sur demande » ;
 * - description des photos reprise du nom du produit lorsqu'elle est vide.
 */
export function completeProductValues(values: ProductFormValues): ProductFormValues {
  return {
    ...values,
    images: values.images.map((image, index) => ({
      ...image,
      alt:
        image.alt.trim() ||
        (index === 0 ? values.name.trim() : `${values.name.trim()} – photo ${String(index + 1)}`),
    })),
    variants: values.variants.map((variant) => {
      const onRequest =
        variant.availability === 'onRequest' || variant.indicativePrice.trim() === '';
      return {
        ...variant,
        label: variantLabel(variant.packaging, variant.unit) || variant.label || 'Standard',
        priceOnRequest: onRequest,
        indicativePrice: onRequest ? '' : variant.indicativePrice.trim(),
      };
    }),
  };
}
