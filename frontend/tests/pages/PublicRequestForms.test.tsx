import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { fetchPublicProduct } from '../../src/modules/products/services/productService';
import type { PublicProduct } from '../../src/modules/products/schemas/productSchema';
import { quotationCart } from '../../src/modules/quotations/cart/quotationCartStore';
import { QuotationRequest } from '../../src/modules/quotations/components/QuotationRequest';

vi.mock('../../src/modules/products/services/productService', () => ({
  fetchPublicProduct: vi.fn(),
}));

const poloId = '000000000000000000000001';
const chinoId = '000000000000000000000002';

function product(
  id: string,
  name: string,
  price: number,
  size: string,
  color: string,
): PublicProduct {
  return {
    id,
    name,
    slug: id,
    priceFrom: price,
    shortDescription: '',
    category: null,
    image: null,
    availability: 'available',
    featured: false,
    description: '',
    characteristics: [],
    images: [],
    seo: { title: '', description: '' },
    publishedAt: '2026-11-22T00:00:00Z',
    variants: [
      {
        id,
        label: `${color} · ${size}`,
        sku: null,
        unit: size,
        packaging: color,
        indicativePrice: price,
        priceOnRequest: false,
        availability: 'available',
      },
    ],
  };
}

function renderCart() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <QuotationRequest />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  quotationCart.clear();
  vi.resetAllMocks();
});

it('recalcule le total et ouvre un récapitulatif WhatsApp multi-articles avec tailles et couleurs', async () => {
  const polo = product(poloId, 'Polo en coton piqué', 6500, 'M', 'Noir');
  const chino = product(chinoId, 'Chino coupe droite', 8000, '40', 'Beige');
  vi.mocked(fetchPublicProduct).mockImplementation(async (id) => (id === poloId ? polo : chino));
  quotationCart.add(poloId, poloId, 1);
  quotationCart.add(chinoId, chinoId, 1);
  renderCart();

  const link = await screen.findByRole('link', { name: 'Commander sur WhatsApp' });
  fireEvent.change(screen.getByRole('spinbutton', { name: /Quantité · Polo/ }), {
    target: { value: '2' },
  });
  const url = new URL(link.getAttribute('href')!);
  expect(url.origin + url.pathname).toBe('https://wa.me/2290194717113');
  const message = url.searchParams.get('text')!;
  expect(message).toContain('Polo en coton piqué · Taille M · Couleur Noir · Quantité 2');
  expect(message).toContain('Chino coupe droite · Taille 40 · Couleur Beige · Quantité 1');
  expect(message).toMatch(/Total : 21\s000 FCFA/);
});

it('empêche la commande d’une variante indisponible et permet de la retirer', async () => {
  const polo = product(poloId, 'Polo en coton piqué', 6500, 'M', 'Noir');
  polo.variants[0]!.availability = 'unavailable';
  vi.mocked(fetchPublicProduct).mockResolvedValue(polo);
  quotationCart.add(poloId, poloId, 1);
  renderCart();

  expect(await screen.findByText(/Indisponible\. Retirez cet article/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Commander sur WhatsApp' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: /Retirer Polo/ }));
  expect(screen.getByText('Votre panier est vide')).toBeInTheDocument();
});
