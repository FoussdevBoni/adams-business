import { describe, expect, it } from 'vitest';
import {
  emptyProductForm,
  emptyVariant,
  productFormSchema,
} from '../../src/modules/products/schemas/productSchema';
import { completeProductValues } from '../../src/modules/products/utils/productFormDefaults';

describe('valeurs produit complétées automatiquement', () => {
  it('déduit libellés, prix sur demande et descriptions de photos', () => {
    const values = {
      ...emptyProductForm(),
      name: 'Polo piqué',
      images: [
        { mediaId: 'a', alt: '' },
        { mediaId: 'b', alt: 'Dos du polo' },
        { mediaId: 'c', alt: '' },
      ],
      variants: [
        { ...emptyVariant(), label: '', packaging: 'Noir', unit: 'M', indicativePrice: '6500' },
        { ...emptyVariant(), label: '', packaging: 'Noir', unit: 'L', indicativePrice: '' },
        {
          ...emptyVariant(),
          label: '',
          packaging: 'Blanc',
          unit: 'S',
          indicativePrice: '6500',
          availability: 'onRequest' as const,
        },
      ],
    };
    const completed = completeProductValues(values);

    expect(completed.images.map((image) => image.alt)).toEqual([
      'Polo piqué',
      'Dos du polo',
      'Polo piqué – photo 3',
    ]);
    expect(completed.variants.map((variant) => variant.label)).toEqual([
      'Noir · M',
      'Noir · L',
      'Blanc · S',
    ]);
    expect(completed.variants.map((variant) => variant.priceOnRequest)).toEqual([
      false,
      true,
      true,
    ]);
    expect(completed.variants[2]?.indicativePrice).toBe('');
    expect(productFormSchema.safeParse(completed).success).toBe(true);
  });

  it('signale deux variantes identiques en termes compréhensibles', () => {
    const variant = { ...emptyVariant(), packaging: 'Noir', unit: 'M', indicativePrice: '6500' };
    const result = productFormSchema.safeParse(
      completeProductValues({ ...emptyProductForm(), name: 'Polo', variants: [variant, variant] }),
    );
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain(
      'Deux variantes ont la même couleur et la même taille.',
    );
  });
});
