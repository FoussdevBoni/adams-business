import { Check, Minus, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { quotationRequestPath } from '../../../core/navigation/publicNavigation';
import { cn } from '../../../core/utils/cn';
import { formatFcfa } from '../../../core/utils/formatPrice';
import type { PublicProduct, PublicVariant } from '../../products/schemas/productSchema';
import {
  compareSizes,
  isPurchasable,
  swatchFor,
  variantColor,
} from '../../products/utils/variantOptions';
import { MAX_CART_LINES, MAX_LINE_QUANTITY, quotationCart } from '../cart/quotationCartStore';

interface AddedLine {
  variant: PublicVariant;
  quantity: number;
}

function AddedSheet({
  product,
  line,
  onClose,
}: {
  product: PublicProduct;
  line: AddedLine;
  onClose: () => void;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    linkRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const image = product.images[0];
  return (
    <div className="shop-sheet" role="dialog" aria-label="Article ajouté au panier">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="shop-check">
            <Check size={14} strokeWidth={3} aria-hidden="true" />
          </span>
          Article ajouté.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shop-icon-button -mr-2"
          aria-label="Fermer"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-4 flex gap-4">
        {image && (
          <img src={image.url} alt="" className="aspect-[4/5] w-16 shrink-0 bg-sand object-cover" />
        )}
        <div className="min-w-0 text-sm">
          <p className="font-medium">{product.name}</p>
          <p className="mt-1 text-muted">
            {variantColor(line.variant)} · Taille {line.variant.unit} · Qté {line.quantity}
          </p>
          {line.variant.indicativePrice !== null && (
            <p className="shop-price mt-1">
              {formatFcfa(line.variant.indicativePrice * line.quantity)}
            </p>
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={onClose} className="shop-button shop-button--ghost !px-3">
          Continuer
        </button>
        <Link ref={linkRef} to={quotationRequestPath} className="shop-button !px-3">
          Voir le panier
        </Link>
      </div>
    </div>
  );
}

export function AddToQuotation({ product }: { product: PublicProduct }) {
  const purchasable = product.variants.filter(isPurchasable);
  const colors = [...new Set(product.variants.map(variantColor))];
  const purchasableColors = new Set(purchasable.map(variantColor));
  const [color, setColor] = useState(() =>
    purchasableColors.size === 1 ? ([...purchasableColors][0] ?? '') : '',
  );
  const [sizeId, setSizeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState<AddedLine | null>(null);
  const [error, setError] = useState<'size' | 'color' | 'full' | null>(null);
  const id = useId();
  const sizeGroupRef = useRef<HTMLDivElement>(null);
  const closeSheet = useCallback(() => setAdded(null), []);

  const sizes = product.variants
    .filter((variant) => variantColor(variant) === color)
    .sort((a, b) => compareSizes(a.unit, b.unit));
  const variant = sizes.find((option) => option.id === sizeId && isPurchasable(option));
  const unitPrice = variant?.indicativePrice ?? product.priceFrom;

  if (purchasable.length === 0)
    return (
      <p className="mt-6 border border-line bg-paper p-4 text-sm">
        Cet article est momentanément indisponible.
      </p>
    );

  return (
    <form
      className="mt-6 space-y-7"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!color) {
          setError('color');
          return;
        }
        if (!variant) {
          setError('size');
          sizeGroupRef.current?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
          return;
        }
        const items = quotationCart.getItems();
        if (
          items.length >= MAX_CART_LINES &&
          !items.some((item) => item.productId === product.id && item.variantId === variant.id)
        ) {
          setError('full');
          return;
        }
        quotationCart.add(product.id, variant.id, quantity);
        setError(null);
        setAdded({ variant, quantity });
      }}
    >
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="shop-eyebrow !text-charcoal">Couleur</span>
          <span className="text-sm text-muted">{color || 'À choisir'}</span>
        </div>
        <div role="radiogroup" aria-label="Couleur" className="mt-3 flex flex-wrap gap-2">
          {colors.map((option) => {
            const swatch = swatchFor(option);
            const disabled = !purchasableColors.has(option);
            return (
              <label key={option} className="relative">
                <input
                  type="radio"
                  name={`${id}-color`}
                  value={option}
                  checked={color === option}
                  disabled={disabled}
                  className="sr-only"
                  onChange={() => {
                    setColor(option);
                    setSizeId('');
                    setError(null);
                  }}
                />
                <span className="shop-option">
                  {swatch && (
                    <span
                      className="shop-swatch"
                      style={{ background: swatch }}
                      aria-hidden="true"
                    />
                  )}
                  {option}
                </span>
              </label>
            );
          })}
        </div>
        {error === 'color' && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            Choisissez d’abord une couleur.
          </p>
        )}
      </div>

      <div ref={sizeGroupRef}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="shop-eyebrow !text-charcoal">Taille</span>
          <span className="text-sm text-muted">
            {variant ? variant.unit : color ? 'À choisir' : 'Choisissez une couleur'}
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label="Taille"
          className={cn('mt-3 flex flex-wrap gap-2', !color && 'opacity-40')}
        >
          {(color ? sizes : []).map((option) => (
            <label key={option.id} className="relative">
              <input
                type="radio"
                name={`${id}-size`}
                value={option.id}
                checked={sizeId === option.id}
                disabled={!color || !isPurchasable(option)}
                aria-label={`${option.unit}${isPurchasable(option) ? '' : ' (indisponible)'}`}
                className="sr-only"
                onChange={() => {
                  setSizeId(option.id);
                  setError(null);
                }}
              />
              <span className="shop-option" aria-hidden="true">
                {option.unit}
              </span>
            </label>
          ))}
          {!color && (
            <span className="shop-option pointer-events-none opacity-60" aria-hidden="true">
              —
            </span>
          )}
        </div>
        {error === 'size' && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            Sélectionnez une taille pour continuer.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span id={`${id}-quantity-label`} className="shop-eyebrow !text-charcoal">
          Quantité
        </span>
        <div className="shop-stepper" role="group" aria-labelledby={`${id}-quantity-label`}>
          <button
            type="button"
            aria-label="Diminuer la quantité"
            disabled={quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <Minus size={15} aria-hidden="true" />
          </button>
          <input
            id={`${id}-quantity`}
            aria-label="Quantité"
            inputMode="numeric"
            type="number"
            min={1}
            max={MAX_LINE_QUANTITY}
            value={quantity}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value))
                setQuantity(Math.min(MAX_LINE_QUANTITY, Math.max(1, value)));
            }}
          />
          <button
            type="button"
            aria-label="Augmenter la quantité"
            disabled={quantity >= MAX_LINE_QUANTITY}
            onClick={() => setQuantity((value) => Math.min(MAX_LINE_QUANTITY, value + 1))}
          >
            <Plus size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="shop-buybar">
        {unitPrice !== null && (
          <p className="shop-price shrink-0 text-base lg:hidden" aria-hidden="true">
            {formatFcfa(unitPrice * quantity)}
          </p>
        )}
        <button type="submit" className="shop-button w-full">
          Ajouter au panier
          {variant?.indicativePrice != null && (
            <span className="hidden lg:inline">
              · {formatFcfa(variant.indicativePrice * quantity)}
            </span>
          )}
        </button>
      </div>

      <div aria-live="polite">
        {error === 'full' && (
          <p className="text-sm text-red-700">
            Votre panier a atteint le nombre maximal d’articles différents.
          </p>
        )}
        {added && <AddedSheet product={product} line={added} onClose={closeSheet} />}
      </div>
    </form>
  );
}
