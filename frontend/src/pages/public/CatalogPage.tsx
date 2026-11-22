import { Package, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getErrorMessage } from '../../core/api/apiError';
import { EmptyState } from '../../core/components/EmptyState';
import { ErrorState } from '../../core/components/ErrorState';
import { Pagination } from '../../core/components/Pagination';
import { Reveal } from '../../core/components/Reveal';
import { usePublicCategories } from '../../modules/categories/hooks/useCategories';
import { ProductCard, ProductGridSkeleton } from '../../modules/products/components/ProductCard';
import { usePublicProducts } from '../../modules/products/hooks/useProducts';
import type { PublicProductFilters } from '../../modules/products/services/productService';
import { CmsPage } from './components/CmsPage';

const sortOptions: { value: PublicProductFilters['sort']; label: string }[] = [
  { value: 'newest', label: 'Nouveautés' },
  { value: 'name', label: 'Nom (A → Z)' },
  { value: '-name', label: 'Nom (Z → A)' },
];

function readFilters(params: URLSearchParams): PublicProductFilters {
  const page = Number(params.get('page') ?? '1');
  const sort = params.get('tri');
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get('recherche') ?? '',
    category: params.get('categorie') ?? '',
    sort: sort === 'name' || sort === '-name' ? sort : 'newest',
    featured: params.get('collection') === 'nouveautes',
  };
}

function ProductCatalog() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const categories = usePublicCategories();
  const products = usePublicProducts(filters);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    update({ recherche: searchDraft.trim() });
  };

  const hasFilters = Boolean(filters.search || filters.category || filters.featured);

  const total = products.data?.meta.total;

  return (
    <section aria-label="Produits" className="shop-shell pb-20">
      <div className="sticky top-[3.75rem] z-20 -mx-4 border-b border-line bg-ivory/95 py-3 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none lg:top-[4.75rem]">
        <ul className="shop-chips" aria-label="Catégories">
          <li>
            <button
              type="button"
              className="shop-chip"
              aria-pressed={!filters.category && !filters.featured}
              onClick={() => update({ categorie: '', collection: '' })}
            >
              Tout
            </button>
          </li>
          <li>
            <button
              type="button"
              className="shop-chip"
              aria-pressed={filters.featured}
              onClick={() => update({ collection: filters.featured ? '' : 'nouveautes' })}
            >
              Nouveautés
            </button>
          </li>
          {categories.data?.map((category) => {
            const active = filters.category === category.slug;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  className="shop-chip"
                  aria-pressed={active}
                  onClick={() => update({ categorie: active ? '' : category.slug })}
                >
                  {category.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-b border-line pb-5 md:mt-6 md:flex-row md:items-center">
        <form role="search" onSubmit={submitSearch} className="relative flex-1 md:max-w-sm">
          <label htmlFor="catalog-search" className="sr-only">
            Rechercher un produit
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
          />
          <input
            id="catalog-search"
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            onBlur={() => {
              if (searchDraft.trim() !== filters.search) update({ recherche: searchDraft.trim() });
            }}
            placeholder="Rechercher un polo, un chino…"
            className="shop-field pl-10"
          />
          <button type="submit" className="sr-only">
            Rechercher
          </button>
        </form>
        <div className="flex items-center justify-between gap-4 md:ml-auto">
          <p className="text-sm text-muted" aria-live="polite">
            {total !== undefined && `${String(total)} article${total > 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="catalog-sort" className="shop-eyebrow">
              Trier
            </label>
            <select
              id="catalog-sort"
              value={filters.sort}
              onChange={(event) =>
                update({ tri: event.target.value === 'newest' ? '' : event.target.value })
              }
              className="shop-field !min-h-10 w-auto pr-8"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 md:mt-10">
        {products.isPending ? (
          <ProductGridSkeleton count={8} label="Chargement du catalogue…" />
        ) : products.isError ? (
          <ErrorState
            message={getErrorMessage(products.error)}
            onRetry={() => void products.refetch()}
          />
        ) : products.data.items.length === 0 ? (
          <EmptyState
            icon={Package}
            title={
              hasFilters
                ? 'Aucun produit ne correspond à votre recherche'
                : 'Catalogue en préparation'
            }
            description={
              hasFilters
                ? 'Modifiez la recherche ou choisissez une autre catégorie.'
                : 'Nos produits seront bientôt présentés ici.'
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDraft('');
                    setParams(new URLSearchParams());
                  }}
                  className="shop-button shop-button--ghost"
                >
                  Voir tout le catalogue
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ul className="shop-products">
              {products.data.items.map((product, index) => (
                <Reveal as="li" key={product.id} delay={(index % 4) * 0.06}>
                  <ProductCard product={product} priority={index < 2} />
                </Reveal>
              ))}
            </ul>
            {products.data.meta.totalPages > 1 && (
              <div className="mt-14 border-t border-line pt-6">
                <Pagination
                  meta={products.data.meta}
                  itemLabel={['produit', 'produits']}
                  onPageChange={(page) => {
                    update({ page: String(page) });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export function CatalogPage() {
  return (
    <CmsPage
      pageKey="catalog"
      fallbackTitle="Le vestiaire Adam’s"
      heroVariant="compact"
      placement="early"
    >
      <ProductCatalog />
    </CmsPage>
  );
}
