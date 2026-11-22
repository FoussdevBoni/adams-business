import { ArrowLeft, MessageCircle, Package, Plus, ShieldCheck, Truck } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { ApiError, getErrorMessage } from '../../core/api/apiError';
import { EmptyState } from '../../core/components/EmptyState';
import { ErrorState } from '../../core/components/ErrorState';
import { whatsappLink } from '../../core/content/shop';
import { ResponsiveImage } from '../../core/components/ResponsiveImage';
import { useDocumentMeta } from '../../core/hooks/useDocumentMeta';
import { cn } from '../../core/utils/cn';
import { formatFcfa } from '../../core/utils/formatPrice';
import { usePublicProduct } from '../../modules/products/hooks/useProducts';
import { AddToQuotation } from '../../modules/quotations/components/AddToQuotation';
import { type PublicProduct } from '../../modules/products/schemas/productSchema';

function Gallery({ product }: { product: PublicProduct }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const images = product.images;
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-sand text-muted">
        <Package aria-hidden="true" className="size-12" strokeWidth={1.2} />
      </div>
    );
  }
  const goTo = (index: number) => {
    setActiveIndex(index);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' });
  };
  return (
    <div
      className={cn(images.length > 1 && 'lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)] lg:gap-4')}
    >
      <div className="relative -mx-4 sm:mx-0 lg:order-2">
        <div
          ref={trackRef}
          className="shop-gallery-track bg-sand"
          aria-label="Photos du produit"
          onScroll={(event) => {
            const track = event.currentTarget;
            const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
            if (index !== activeIndex) setActiveIndex(index);
          }}
        >
          {images.map((image, index) => (
            <div key={image.mediaId} className="aspect-[4/5] overflow-hidden">
              <ResponsiveImage
                image={image}
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={index === 0}
                alt={index === 0 ? image.alt : ''}
                className="h-full w-full"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden">
            {images.map((image, index) => (
              <button
                key={image.mediaId}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Afficher l’image ${String(index + 1)}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  'h-1.5 rounded-full bg-forest/30 transition-all duration-300',
                  index === activeIndex ? 'w-6 bg-forest' : 'w-1.5',
                )}
              />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <ul className="hidden flex-col gap-3 lg:order-1 lg:flex" aria-label="Autres images">
          {images.map((image, index) => (
            <li key={image.mediaId}>
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-pressed={index === activeIndex}
                aria-label={`Afficher l’image ${String(index + 1)}`}
                className={cn(
                  'block aspect-[4/5] w-full overflow-hidden bg-sand transition-opacity',
                  index === activeIndex
                    ? 'ring-1 ring-forest ring-offset-2 ring-offset-ivory'
                    : 'opacity-60 hover:opacity-100',
                )}
              >
                <ResponsiveImage image={image} sizes="72px" alt="" className="h-full w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductDetail({ product }: { product: PublicProduct }) {
  const image = product.images[0]?.url ?? null;
  const prices = product.variants
    .map((variant) => variant.indicativePrice)
    .filter((price): price is number => price !== null);
  useDocumentMeta({
    title: product.seo.title || product.name,
    description: product.seo.description || product.shortDescription,
    image,
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.shortDescription || product.description,
      ...(image ? { image } : {}),
      ...(prices.length > 0
        ? {
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'XOF',
              lowPrice: Math.min(...prices),
              highPrice: Math.max(...prices),
              offerCount: prices.length,
            },
          }
        : {}),
    },
  });
  const hasRange = prices.some((price) => price !== product.priceFrom);
  return (
    <article className="shop-shell pt-4 pb-28 lg:pt-8 lg:pb-24">
      <nav
        aria-label="Fil d’Ariane"
        className="mb-4 flex items-center gap-2 text-xs text-muted lg:mb-8"
      >
        <Link to="/catalogue" className="inline-flex items-center gap-1.5 hover:text-forest">
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Catalogue
        </Link>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <Link
              to={`/catalogue?categorie=${encodeURIComponent(product.category.slug)}`}
              className="hover:text-forest"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <Gallery product={product} />
        <div className="lg:sticky lg:top-28 lg:self-start">
          {product.category && <p className="shop-eyebrow">{product.category.name}</p>}
          <h1 className="shop-page-title mt-2">{product.name}</h1>
          {product.priceFrom !== null && (
            <p className="shop-price mt-4 text-xl">
              {hasRange && <span className="mr-1 text-sm font-normal text-muted">Dès</span>}
              {formatFcfa(product.priceFrom)}
            </p>
          )}
          {product.shortDescription && (
            <p className="mt-5 leading-relaxed text-charcoal/75">{product.shortDescription}</p>
          )}
          <AddToQuotation key={product.id} product={product} />

          <ul className="mt-8 grid gap-3 border-t border-line pt-6 text-sm">
            <li className="flex items-center gap-3">
              <Truck aria-hidden="true" className="size-4.5 shrink-0 text-leaf" strokeWidth={1.6} />
              Livraison gratuite à Cotonou et Abomey-Calavi
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="size-4.5 shrink-0 text-leaf"
                strokeWidth={1.6}
              />
              Vérification avant paiement
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle
                aria-hidden="true"
                className="size-4.5 shrink-0 text-leaf"
                strokeWidth={1.6}
              />
              <span>
                Un doute sur la taille ?{' '}
                <a
                  href={whatsappLink(
                    `Bonjour, j’ai une question sur l’article « ${product.name} ».`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  Posez-nous la question
                </a>
              </span>
            </li>
          </ul>

          {(product.description || product.characteristics.length > 0) && (
            <div className="mt-8">
              {product.description && (
                <details className="shop-accordion" open>
                  <summary>
                    Description <Plus aria-hidden="true" className="size-4" />
                  </summary>
                  <div className="pb-6">
                    <p className="leading-relaxed whitespace-pre-line text-charcoal/80">
                      {product.description}
                    </p>
                  </div>
                </details>
              )}
              {product.characteristics.length > 0 && (
                <details className="shop-accordion" open>
                  <summary>
                    Caractéristiques <Plus aria-hidden="true" className="size-4" />
                  </summary>
                  <div className="pb-6">
                    <dl className="divide-y divide-line text-sm">
                      {product.characteristics.map((item, index) => (
                        <div key={index} className="flex justify-between gap-6 py-2.5">
                          <dt className="text-muted">{item.label}</dt>
                          <dd className="text-right font-medium">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="shop-shell pt-12 pb-24 lg:pt-16" role="status" aria-live="polite">
      <span className="sr-only">Chargement du produit…</span>
      <div
        className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16"
        aria-hidden="true"
      >
        <div className="shop-skeleton -mx-4 aspect-[4/5] sm:mx-0" />
        <div className="space-y-4">
          <div className="shop-skeleton h-3 w-24" />
          <div className="shop-skeleton h-10 w-4/5" />
          <div className="shop-skeleton h-5 w-28" />
          <div className="shop-skeleton mt-8 h-12 w-full" />
          <div className="shop-skeleton h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductPage() {
  const { slug = '' } = useParams();
  const product = usePublicProduct(slug);

  if (product.isPending) return <ProductSkeleton />;
  if (product.isError) {
    const notFound = product.error instanceof ApiError && product.error.status === 404;
    return (
      <div className="shop-shell max-w-3xl py-16">
        {notFound ? (
          <EmptyState
            icon={Package}
            title="Produit introuvable"
            description="Ce produit n’existe pas ou n’est plus proposé."
            action={
              <Link to="/catalogue" className="shop-button">
                Voir le catalogue
              </Link>
            }
          />
        ) : (
          <ErrorState
            message={getErrorMessage(product.error)}
            onRetry={() => void product.refetch()}
          />
        )}
      </div>
    );
  }
  // Ancienne adresse : redirection vers l'URL canonique.
  if (product.data.slug !== slug)
    return <Navigate to={`/catalogue/${product.data.slug}`} replace />;
  return <ProductDetail product={product.data} />;
}
