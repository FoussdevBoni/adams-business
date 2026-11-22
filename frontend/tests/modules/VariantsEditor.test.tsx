import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { VariantsEditor } from '../../src/modules/products/components/VariantsEditor';
import {
  emptyProductForm,
  type ProductFormValues,
} from '../../src/modules/products/schemas/productSchema';

let latest: ProductFormValues | null = null;

function Harness() {
  const form = useForm<ProductFormValues>({ defaultValues: emptyProductForm() });
  latest = form.watch();
  return <VariantsEditor form={form} />;
}

describe('éditeur de variantes', () => {
  it('génère les combinaisons couleur × taille en remplaçant la variante par défaut', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Générer' }));
    await userEvent.type(screen.getByLabelText('Couleurs'), 'Noir, Blanc');
    await userEvent.type(screen.getByLabelText('Tailles'), 'L, M');
    await userEvent.type(screen.getByLabelText('Prix commun (FCFA)'), '6500');
    await userEvent.click(screen.getByRole('button', { name: 'Générer les variantes' }));

    expect(screen.getByText('4 variantes ajoutées.')).toBeInTheDocument();
    expect(latest?.variants.map((variant) => variant.label)).toEqual([
      'Noir · M',
      'Noir · L',
      'Blanc · M',
      'Blanc · L',
    ]);
    expect(latest?.variants[0]).toMatchObject({
      packaging: 'Noir',
      unit: 'M',
      indicativePrice: '6500',
      priceOnRequest: false,
    });

    // Une seconde génération identique n'ajoute rien.
    await userEvent.click(screen.getByRole('button', { name: 'Générer' }));
    await userEvent.type(screen.getByLabelText('Couleurs'), 'Noir');
    await userEvent.type(screen.getByLabelText('Tailles'), 'M');
    await userEvent.click(screen.getByRole('button', { name: 'Générer les variantes' }));
    expect(screen.getByText(/Aucune nouvelle variante/)).toBeInTheDocument();
    expect(latest?.variants).toHaveLength(4);
  });

  it('applique un même prix à toutes les variantes', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Générer' }));
    await userEvent.type(screen.getByLabelText('Couleurs'), 'Noir');
    await userEvent.type(screen.getByLabelText('Tailles'), 'S, M');
    await userEvent.click(screen.getByRole('button', { name: 'Générer les variantes' }));
    expect(latest?.variants.every((variant) => variant.priceOnRequest)).toBe(true);

    await userEvent.type(screen.getByLabelText('Même prix pour toutes'), '8000');
    await userEvent.click(screen.getByRole('button', { name: 'Appliquer' }));
    expect(latest?.variants.every((v) => v.indicativePrice === '8000' && !v.priceOnRequest)).toBe(
      true,
    );
    const list = screen.getByRole('list');
    expect(within(list).getAllByText(/8\s000 FCFA/)).toHaveLength(2);
  });
});
