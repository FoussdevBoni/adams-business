import { ImageOff, LayoutGrid, List, Package, Plus, Search, Sparkles } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { getErrorMessage } from '../../../core/api/apiError';
import { EmptyState } from '../../../core/components/EmptyState';
import { ErrorState } from '../../../core/components/ErrorState';
import { Pagination } from '../../../core/components/Pagination';
import { cloudinaryUrl } from '../../../core/utils/cloudinaryImage';
import { cn } from '../../../core/utils/cn';
import { formatDateTime } from '../../../core/utils/formatDate';
import { formatFcfa } from '../../../core/utils/formatPrice';
import { useAdminCategories } from '../../../modules/categories/hooks/useCategories';
import { useDashboardOverview } from '../../../modules/dashboard/hooks/useDashboardStats';
import { StatusBadge } from '../../../modules/products/components/ProductStatusBadge';
import { useAdminProducts } from '../../../modules/products/hooks/useProducts';
import {
  type AdminProductListItem,
  availabilityLabels,
  type ProductStatus,
  productStatuses,
  productStatusLabels,
} from '../../../modules/products/schemas/productSchema';
import type { AdminProductFilters } from '../../../modules/products/services/productService';

const VIEW_KEY = 'adams-studio.products-view';

function readFilters(params: URLSearchParams): AdminProductFilters {
  const page = Number(params.get('page') ?? '1');
  const status = params.get('statut') ?? '';
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get('recherche') ?? '',
    category: params.get('categorie') ?? '',
    status: (productStatuses as readonly string[]).includes(status)
      ? (status as ProductStatus)
      : '',
  };
}

const price = (product: AdminProductListItem) =>
  product.priceFrom !== null ? formatFcfa(product.priceFrom) : 'Sur demande';

const availabilityDot: Record<AdminProductListItem['availability'], string> = {
  available: 'bg-emerald-500',
  onRequest: 'bg-amber-500',
  unavailable: 'bg-stone-400',
};

function Thumbnail({ product, className }: { product: AdminProductListItem; className?: string }) {
  return product.image ? (
    <img
      src={cloudinaryUrl(product.image.url, 160)}
      alt=""
      className={cn('shrink-0 object-cover', className)}
    />
  ) : (
    <span
      className={cn('grid shrink-0 place-items-center bg-[#ebe5da] text-charcoal/35', className)}
    >
      <Package aria-hidden="true" className="size-5" />
    </span>
  );
}

function ProductCardAdmin({ product }: { product: AdminProductListItem }) {
  return (
    <Link
      to={product.id}
      className="studio-card studio-card--hover group block overflow-hidden !rounded-[1.35rem]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe5da]">
        {product.image ? (
          <img
            src={cloudinaryUrl(product.image.url, 520)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span className="grid h-full place-items-center text-charcoal/30">
            <ImageOff aria-hidden="true" className="size-9" strokeWidth={1.2} />
          </span>
        )}
        <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <StatusBadge status={product.status} />
          {product.featured && (
            <span
              className="grid size-7 place-items-center rounded-full bg-[#141412]/85 text-sprout backdrop-blur"
              title="Mis en avant sur l’accueil"
            >
              <Sparkles aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Mis en avant</span>
            </span>
          )}
        </div>
        <span className="absolute inset-x-2.5 bottom-2.5 translate-y-3 rounded-full bg-white/90 py-2 text-center text-xs font-semibold opacity-0 shadow backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Modifier l’article
        </span>
      </div>
      <div className="space-y-1.5 p-3.5 sm:p-4">
        {product.category && (
          <p className="truncate text-[0.65rem] font-semibold tracking-[0.14em] text-charcoal/45 uppercase">
            {product.category.name}
          </p>
        )}
        <p className="line-clamp-2 min-h-[2.5em] text-sm leading-tight font-semibold">
          {product.name}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-sm font-bold tabular-nums">{price(product)}</span>
          <span
            className="flex items-center gap-1.5 text-[0.7rem] text-charcoal/55"
            title={availabilityLabels[product.availability]}
          >
            <span
              aria-hidden="true"
              className={cn('size-1.5 rounded-full', availabilityDot[product.availability])}
            />
            {product.variantsCount} var.
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductsListPage() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [view, setView] = useState<'grid' | 'list'>(() => {
    try {
      return window.localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });
  const categories = useAdminCategories();
  const products = useAdminProducts(filters);
  const counts = useDashboardOverview().data?.catalog.products;

  const changeView = (next: 'grid' | 'list') => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Préférence non conservée.
    }
  };

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

  const statusCount = (status: ProductStatus | '') =>
    counts ? (status ? counts[status] : counts.published + counts.draft + counts.archived) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="studio-label">Catalogue</p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            Produits
          </h1>
        </div>
        <Link to="nouveau" className="studio-btn studio-btn--dark self-start sm:self-auto">
          <Plus aria-hidden="true" className="size-4" />
          Nouveau produit
        </Link>
      </div>

      <div className="space-y-3">
        <div className="studio-segment" role="group" aria-label="Filtrer par statut">
          {(['', ...productStatuses] as const).map((status) => {
            const count = statusCount(status);
            return (
              <button
                key={status || 'all'}
                type="button"
                aria-pressed={filters.status === status}
                onClick={() => update({ statut: status })}
              >
                {status ? productStatusLabels[status] : 'Tous'}
                {count !== null && <span className="count">{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <form role="search" onSubmit={submitSearch} className="relative flex-1 sm:max-w-md">
            <label htmlFor="product-search" className="sr-only">
              Rechercher par nom ou référence
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-charcoal/40"
            />
            <input
              id="product-search"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Rechercher un article ou une référence"
              className="h-11 w-full rounded-full bg-white pr-4 pl-11 text-sm shadow-[0_1px_2px_rgb(0_0_0/0.05),inset_0_0_0_1px_rgb(0_0_0/0.08)] transition-shadow outline-none placeholder:text-charcoal/40 focus:shadow-[0_0_0_4px_rgb(24_24_22/0.08),inset_0_0_0_1px_rgb(24_24_22/0.6)]"
            />
            <button type="submit" className="sr-only">
              Rechercher
            </button>
          </form>
          <div className="flex items-center gap-2.5">
            <label htmlFor="product-category" className="sr-only">
              Catégorie
            </label>
            <select
              id="product-category"
              value={filters.category}
              onChange={(event) => update({ categorie: event.target.value })}
              className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-sm shadow-[0_1px_2px_rgb(0_0_0/0.05),inset_0_0_0_1px_rgb(0_0_0/0.08)] outline-none sm:w-52 sm:flex-none"
            >
              <option value="">Toutes les catégories</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="studio-segment shrink-0" role="group" aria-label="Affichage">
              <button
                type="button"
                aria-pressed={view === 'grid'}
                onClick={() => changeView('grid')}
                aria-label="Galerie"
                title="Galerie"
                className="!px-2.5"
              >
                <LayoutGrid aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                aria-pressed={view === 'list'}
                onClick={() => changeView('list')}
                aria-label="Liste"
                title="Liste"
                className="!px-2.5"
              >
                <List aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {products.isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} className="shop-skeleton block aspect-[4/6] rounded-[1.35rem]" />
          ))}
        </div>
      ) : products.isError ? (
        <ErrorState
          message={getErrorMessage(products.error)}
          onRetry={() => void products.refetch()}
        />
      ) : products.data.items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun produit"
          description="Créez un produit ou modifiez les filtres."
        />
      ) : (
        <>
          {view === 'grid' ? (
            <ul className="studio-stagger grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {products.data.items.map((product) => (
                <li key={product.id}>
                  <ProductCardAdmin product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="studio-card overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">Liste des produits</caption>
                <thead className="text-[0.68rem] tracking-[0.12em] text-charcoal/50 uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Produit
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold">
                      Catégorie
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold">
                      Prix dès
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold">
                      Statut
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Modifié
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {products.data.items.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-[#faf8f4]">
                      <td className="px-5 py-3">
                        <Link to={product.id} className="flex items-center gap-3.5 font-semibold">
                          <Thumbnail product={product} className="size-12 rounded-xl" />
                          <span>
                            {product.name}
                            <span className="block text-xs font-normal text-charcoal/55">
                              {product.variantsCount} variante{product.variantsCount > 1 ? 's' : ''}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-charcoal/65">
                        {product.category?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{price(product)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-5 py-3 text-charcoal/55">
                        {formatDateTime(product.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            meta={products.data.meta}
            itemLabel={['produit', 'produits']}
            onPageChange={(page) => update({ page: String(page) })}
          />
        </>
      )}
    </div>
  );
}
