import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { ResponsiveImage } from '../../../core/components/ResponsiveImage';
import { formatFcfa } from '../../../core/utils/formatPrice';
import { availabilityLabels, type ProductListItem } from '../schemas/productSchema';

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductListItem;
  priority?: boolean;
}) {
  return (
    <Link to={`/catalogue/${product.slug}`} className="shop-card group">
      <div className="shop-card-media">
        {product.image && (
          <ResponsiveImage
            image={product.image}
            sizes="(min-width: 1200px) 22vw, (min-width: 768px) 33vw, 50vw"
            className="h-full w-full"
            priority={priority}
          />
        )}
        {product.availability !== 'available' ? (
          <span className="shop-card-badge shop-card-badge--muted">
            {availabilityLabels[product.availability]}
          </span>
        ) : (
          product.featured && <span className="shop-card-badge">Nouveau</span>
        )}
        <span className="shop-card-cta" aria-hidden="true">
          Voir l’article <ArrowRight size={14} />
        </span>
      </div>
      <div className="shop-card-copy">
        {product.category && <p className="shop-kicker">{product.category.name}</p>}
        <h3>{product.name}</h3>
        <p className="shop-price">
          {product.priceFrom === null ? 'Prix sur demande' : formatFcfa(product.priceFrom)}
        </p>
      </div>
    </Link>
  );
}

/** Grille de squelettes réservant la place des cartes pendant le chargement. */
export function ProductGridSkeleton({
  count = 4,
  label = 'Chargement des articles…',
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <ul className="shop-products" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <div className="shop-skeleton aspect-[4/5]" />
            <div className="shop-skeleton mt-4 h-2.5 w-1/3" />
            <div className="shop-skeleton mt-2.5 h-3 w-3/4" />
            <div className="shop-skeleton mt-2.5 h-3 w-1/4" />
          </li>
        ))}
      </ul>
    </div>
  );
}
