import { useQueries } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, MessageCircle, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router';
import { whatsappLink } from '../../../core/content/shop';
import { formatFcfa } from '../../../core/utils/formatPrice';
import { productQueryKeys } from '../../products/hooks/useProducts';
import { fetchPublicProduct } from '../../products/services/productService';
import { MAX_LINE_QUANTITY, quotationCart } from '../cart/quotationCartStore';
import { useQuotationCart } from '../cart/useQuotationCart';

export function QuotationRequest() {
  const { items } = useQuotationCart();
  const ids = [...new Set(items.map((item) => item.productId))];
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: productQueryKeys.publicDetail(id),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchPublicProduct(id, signal),
      retry: false,
      staleTime: 0,
      refetchOnMount: 'always' as const,
    })),
  });
  const byId = new Map(ids.map((id, index) => [id, queries[index]]));
  const lines = items.map((item) => {
    const query = byId.get(item.productId);
    const product = query?.data;
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    const loading = query?.isFetching;
    const price =
      !query?.isError && variant?.availability === 'available' && !variant.priceOnRequest
        ? variant.indicativePrice
        : null;
    return { item, product, variant, loading, price };
  });
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 border-t border-line py-14 sm:items-center sm:py-24 sm:text-center">
        <ShoppingBag aria-hidden="true" className="size-9 text-muted" strokeWidth={1.2} />
        <div>
          <p className="font-display text-2xl font-bold tracking-tight">Votre panier est vide</p>
          <p className="mt-2 max-w-sm text-charcoal/70">
            Parcourez nos polos et pantalons, choisissez votre taille et revenez ici pour commander.
          </p>
        </div>
        <Link to="/catalogue" className="shop-button">
          Voir la boutique <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  }
  const blocked = lines.some((line) => line.loading || line.price === null);
  const total = lines.reduce((sum, { item, price }) => sum + (price ?? 0) * item.quantity, 0);
  const pieces = items.reduce((sum, item) => sum + item.quantity, 0);
  const summary = lines.map(
    ({ product, variant, item, price }) =>
      `• ${product?.name} · Taille ${variant?.unit} · Couleur ${variant?.packaging ?? variant?.label} · Quantité ${item.quantity} · ${formatFcfa((price ?? 0) * item.quantity)}`,
  );
  const message = [
    'Bonjour Adam’s Business, je souhaite commander :',
    '',
    ...summary,
    '',
    `Total : ${formatFcfa(total)}`,
    '',
    'Pouvez-vous me confirmer la disponibilité et convenir de la livraison ?',
  ].join('\n');

  const whatsappButton = blocked ? (
    <button type="button" className="shop-button shop-button--whatsapp w-full" disabled>
      <MessageCircle size={17} aria-hidden="true" />
      Commander<span className="max-[379px]:hidden"> sur WhatsApp</span>
    </button>
  ) : (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noreferrer"
      className="shop-button shop-button--whatsapp w-full"
    >
      <MessageCircle size={17} aria-hidden="true" />
      Commander<span className="max-[379px]:hidden"> sur WhatsApp</span>
    </a>
  );

  return (
    <div className="shop-cart pb-24 lg:pb-0">
      <div>
        <p className="shop-eyebrow border-b border-line pb-3">
          {pieces} article{pieces > 1 ? 's' : ''}
        </p>
        <ul>
          {lines.map(({ item, product, variant, loading, price }) => {
            const query = byId.get(item.productId);
            const name = product?.name ?? 'Article';
            return (
              <li key={`${item.productId}:${item.variantId}`} className="shop-cart-line">
                <div className="aspect-[4/5] overflow-hidden bg-sand">
                  {product?.images[0] && (
                    <img
                      src={product.images[0].url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {product ? (
                        <Link
                          className="font-medium hover:underline"
                          to={`/catalogue/${product.slug}`}
                        >
                          {product.name}
                        </Link>
                      ) : loading ? (
                        <span className="shop-skeleton block h-4 w-40" />
                      ) : (
                        <strong>Article</strong>
                      )}
                      {variant && (
                        <p className="mt-1 text-sm text-muted">
                          {variant.packaging ?? variant.label} · Taille {variant.unit}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="shop-icon-button -mt-2 -mr-2 shrink-0 text-muted hover:text-forest"
                      onClick={() => quotationCart.remove(item.productId, item.variantId)}
                      aria-label={`Retirer ${product?.name ?? 'cet article'} ${variant?.label ?? ''}`}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                    <div className="shop-stepper">
                      <button
                        type="button"
                        aria-label={`Diminuer la quantité · ${name}`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          quotationCart.setQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity - 1,
                          )
                        }
                      >
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <input
                        aria-label={`Quantité · ${name} · ${variant?.label ?? ''}`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={MAX_LINE_QUANTITY}
                        value={item.quantity}
                        onChange={(event) => {
                          const quantity = Number(event.target.value);
                          if (Number.isInteger(quantity) && quantity > 0)
                            quotationCart.setQuantity(item.productId, item.variantId, quantity);
                        }}
                      />
                      <button
                        type="button"
                        aria-label={`Augmenter la quantité · ${name}`}
                        disabled={item.quantity >= MAX_LINE_QUANTITY}
                        onClick={() =>
                          quotationCart.setQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity + 1,
                          )
                        }
                      >
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="text-right">
                      {loading ? (
                        <p className="text-sm text-muted">Vérification…</p>
                      ) : price === null ? (
                        <p className="max-w-[14rem] text-sm text-red-700">
                          Indisponible. Retirez cet article ou réessayez.
                        </p>
                      ) : (
                        <>
                          <p className="shop-price">{formatFcfa(price * item.quantity)}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted">{formatFcfa(price)} l’unité</p>
                          )}
                        </>
                      )}
                      {!loading && query?.isError && (
                        <button
                          type="button"
                          className="mt-1 text-sm underline"
                          onClick={() => void query.refetch()}
                        >
                          Réessayer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link to="/catalogue" className="shop-link mt-6">
          <ArrowLeft size={14} aria-hidden="true" /> Continuer mes achats
        </Link>
      </div>

      <aside className="shop-cart-summary" aria-labelledby="cart-summary">
        <h2 id="cart-summary" className="shop-eyebrow !text-charcoal">
          Récapitulatif
        </h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Articles ({pieces})</dt>
            <dd className="shop-price">{formatFcfa(total)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Livraison à Cotonou et Abomey-Calavi</dt>
            <dd>Gratuite</dd>
          </div>
        </dl>
        <p className="shop-cart-total border-t border-line pt-4">
          <span className="font-medium">Total articles</span>
          <strong className="shop-price text-xl">{formatFcfa(total)}</strong>
        </p>
        <div className="shop-buybar">
          <div className="shrink-0 lg:hidden">
            <p className="text-[0.65rem] tracking-widest text-muted uppercase">Total</p>
            <p className="shop-price">{formatFcfa(total)}</p>
          </div>
          {whatsappButton}
        </div>
        <ol className="grid gap-3 border-t border-line pt-4 text-sm text-charcoal/75">
          <li className="flex gap-3">
            <span className="shop-price text-leaf">01</span>
            Le récapitulatif de votre panier s’ouvre dans WhatsApp.
          </li>
          <li className="flex gap-3">
            <span className="shop-price text-leaf">02</span>
            Nous confirmons la disponibilité et la livraison.
          </li>
          <li className="flex gap-3">
            <span className="shop-price text-leaf">03</span>
            Vous vérifiez vos articles avant de régler.
          </li>
        </ol>
      </aside>
    </div>
  );
}
