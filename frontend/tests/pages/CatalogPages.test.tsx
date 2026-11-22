import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../src/core/api/apiError';
import { fetchPublicCategories } from '../../src/modules/categories/services/categoryService';
import { fetchPublishedPage } from '../../src/modules/pages/services/pageService';
import type {
  ProductListItem,
  PublicProduct,
} from '../../src/modules/products/schemas/productSchema';
import {
  fetchPublicProduct,
  fetchPublicProducts,
} from '../../src/modules/products/services/productService';
import { CatalogPage } from '../../src/pages/public/CatalogPage';
import { ProductPage } from '../../src/pages/public/ProductPage';

vi.mock('../../src/modules/products/services/productService', () => ({
  fetchPublicProducts: vi.fn(),
  fetchPublicProduct: vi.fn(),
}));
vi.mock('../../src/modules/categories/services/categoryService', () => ({
  fetchPublicCategories: vi.fn(),
}));
vi.mock('../../src/modules/pages/services/pageService', () => ({
  fetchPublishedPage: vi.fn(),
}));

const notFound = new ApiError({ status: 404, code: 'NOT_FOUND', message: 'Introuvable' });
const meta = { page: 1, limit: 12, total: 1, totalPages: 1 };

const item: ProductListItem = {
  id: 'p1',
  slug: 'polo-pique-noir',
  name: 'Polo en coton piqué',
  shortDescription: 'Maille en coton piqué',
  category: { id: 'c1', name: 'Polos', slug: 'polos' },
  image: null,
  priceFrom: 6500,
  availability: 'available',
  featured: false,
};

const product: PublicProduct = {
  ...item,
  description: 'Description complète.',
  characteristics: [{ label: 'Matière', value: 'Coton piqué' }],
  images: [],
  variants: [
    {
      id: 'v1',
      label: 'Noir · M',
      sku: null,
      unit: 'M',
      packaging: 'Noir',
      indicativePrice: 6500,
      priceOnRequest: false,
      availability: 'available',
    },
    {
      id: 'v2',
      label: 'Noir · XL',
      sku: null,
      unit: 'XL',
      packaging: 'Noir',
      indicativePrice: null,
      priceOnRequest: true,
      availability: 'onRequest',
    },
  ],
  seo: { title: '', description: '' },
  publishedAt: '2026-11-01T00:00:00.000Z',
};

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/catalogue', element: <CatalogPage /> },
      { path: '/catalogue/:slug', element: <ProductPage /> },
    ],
    { initialEntries: [path] },
  );
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('catalogue public', () => {
  beforeEach(() => {
    vi.mocked(fetchPublishedPage).mockRejectedValue(notFound);
    vi.mocked(fetchPublicCategories).mockResolvedValue([]);
  });

  it('affiche les produits publiés avec leur prix', async () => {
    vi.mocked(fetchPublicProducts).mockResolvedValue({ items: [item], meta });
    renderAt('/catalogue');

    expect(await screen.findByText('Polo en coton piqué')).toBeInTheDocument();
    expect(screen.getByText(/6\s500 FCFA/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Polo en coton piqué/ })).toHaveAttribute(
      'href',
      '/catalogue/polo-pique-noir',
    );
  });

  it('transmet les filtres de l’URL et signale l’absence de résultat', async () => {
    vi.mocked(fetchPublicProducts).mockResolvedValue({ items: [], meta: { ...meta, total: 0 } });
    renderAt('/catalogue?recherche=mil&categorie=polos');

    expect(
      await screen.findByText('Aucun produit ne correspond à votre recherche'),
    ).toBeInTheDocument();
    expect(vi.mocked(fetchPublicProducts).mock.calls[0]?.[0]).toMatchObject({
      search: 'mil',
      category: 'polos',
      page: 1,
    });
  });

  it('affiche une erreur récupérable', async () => {
    vi.mocked(fetchPublicProducts).mockRejectedValue(
      new ApiError({ status: 503, code: 'SERVICE_UNAVAILABLE', message: 'Service indisponible.' }),
    );
    renderAt('/catalogue');
    expect(await screen.findByText('Service indisponible.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });
});

describe('fiche produit', () => {
  it('permet de sélectionner une taille et n’affiche que les variantes disponibles à la commande', async () => {
    vi.mocked(fetchPublicProduct).mockResolvedValue(product);
    renderAt('/catalogue/polo-pique-noir');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Polo en coton piqué' }),
    ).toBeInTheDocument();
    const colors = screen.getByRole('radiogroup', { name: 'Couleur' });
    expect(within(colors).getByRole('radio', { name: /Noir/ })).toBeChecked();
    const sizes = screen.getByRole('radiogroup', { name: 'Taille' });
    // Taille sur demande : affichée mais non commandable en ligne.
    expect(within(sizes).getByRole('radio', { name: /XL/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /Ajouter au panier/ }));
    expect(screen.getByText('Sélectionnez une taille pour continuer.')).toBeInTheDocument();
    await userEvent.click(within(sizes).getByRole('radio', { name: 'M' }));
    await userEvent.click(screen.getByRole('button', { name: /Ajouter au panier/ }));
    expect(screen.getByRole('link', { name: 'Voir le panier' })).toHaveAttribute('href', '/panier');
    expect(screen.getByText('Coton piqué')).toBeInTheDocument();
  });

  it('redirige une ancienne adresse vers l’URL canonique', async () => {
    vi.mocked(fetchPublicProduct).mockResolvedValue(product);
    const router = renderAt('/catalogue/ancien-slug');
    await screen.findByRole('heading', { level: 1, name: 'Polo en coton piqué' });
    expect(router.state.location.pathname).toBe('/catalogue/polo-pique-noir');
  });

  it('affiche un état « introuvable » pour un produit non publié', async () => {
    vi.mocked(fetchPublicProduct).mockRejectedValue(notFound);
    renderAt('/catalogue/brouillon');
    expect(await screen.findByText('Produit introuvable')).toBeInTheDocument();
  });
});
