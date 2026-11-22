import { ArrowDown, ArrowUp, ChevronDown, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { buttonClassName } from '../../../core/components/buttonStyles';
import { FormField, inputClassName } from '../../../core/components/FormField';
import { describedBy } from '../../../core/components/formFieldUtils';
import { cn } from '../../../core/utils/cn';
import { formatFcfa } from '../../../core/utils/formatPrice';
import {
  availabilityLabels,
  emptyVariant,
  type ProductFormValues,
  variantAvailabilities,
  type VariantFormValues,
} from '../schemas/productSchema';
import { compareSizes, swatchFor } from '../utils/variantOptions';

type Form = UseFormReturn<ProductFormValues>;
const MAX_VARIANTS = 50;

const splitList = (value: string) => [
  ...new Set(
    value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];

/** Libellé automatique d'une variante : « Couleur · Taille ». */
const variantLabel = (color: string, size: string) =>
  [color.trim(), size.trim()].filter(Boolean).join(' · ');

/** Variante par défaut d'un nouveau produit, remplaçable par la génération. */
const isPlaceholder = (variant: VariantFormValues) =>
  !variant.id && !variant.packaging && (variant.unit === 'unité' || variant.unit === '');

const availabilityTone: Record<VariantFormValues['availability'], string> = {
  available: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  onRequest: 'bg-amber-50 text-amber-800 ring-amber-200',
  unavailable: 'bg-stone-100 text-stone-600 ring-stone-200',
};

function Generator({ form, onDone }: { form: Form; onDone: (count: number) => void }) {
  const id = useId();
  const [colors, setColors] = useState('');
  const [sizes, setSizes] = useState('');
  const [price, setPrice] = useState('');
  const colorList = splitList(colors);
  const sizeList = splitList(sizes).sort(compareSizes);
  const validPrice = /^\d{0,10}$/.test(price.trim());
  const combinations = colorList.length * sizeList.length;

  const generate = () => {
    const current = form.getValues('variants');
    const kept = current.length === 1 && current[0] && isPlaceholder(current[0]) ? [] : current;
    const labels = new Set(kept.map((variant) => variant.label.toLowerCase()));
    const created: VariantFormValues[] = [];
    for (const color of colorList) {
      for (const size of sizeList) {
        const label = variantLabel(color, size);
        if (labels.has(label.toLowerCase())) continue;
        if (kept.length + created.length >= MAX_VARIANTS) break;
        labels.add(label.toLowerCase());
        created.push({
          ...emptyVariant(),
          label,
          packaging: color,
          unit: size,
          indicativePrice: price.trim(),
          priceOnRequest: price.trim() === '',
        });
      }
    }
    form.setValue('variants', [...kept, ...created], { shouldDirty: true, shouldValidate: true });
    setColors('');
    setSizes('');
    onDone(created.length);
  };

  return (
    <div className="grid gap-4 rounded-lg border border-dashed border-line bg-ivory/70 p-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_10rem]">
        <FormField
          id={`${id}-colors`}
          label="Couleurs"
          hint="Séparées par des virgules : Noir, Blanc, Bleu marine"
        >
          <input
            id={`${id}-colors`}
            className={inputClassName}
            value={colors}
            onChange={(event) => setColors(event.target.value)}
            aria-describedby={`${id}-colors-hint`}
          />
        </FormField>
        <FormField id={`${id}-sizes`} label="Tailles" hint="Ex. S, M, L, XL ou 38, 40, 42">
          <input
            id={`${id}-sizes`}
            className={inputClassName}
            value={sizes}
            onChange={(event) => setSizes(event.target.value)}
            aria-describedby={`${id}-sizes-hint`}
          />
        </FormField>
        <FormField
          id={`${id}-price`}
          label="Prix commun (FCFA)"
          error={validPrice ? undefined : 'Montant entier.'}
          hint="Vide : sur demande"
        >
          <input
            id={`${id}-price`}
            inputMode="numeric"
            className={inputClassName}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            aria-describedby={describedBy(`${id}-price`, validPrice ? undefined : 'x', 'hint')}
          />
        </FormField>
      </div>
      {(colorList.length > 0 || sizeList.length > 0) && (
        <div className="flex flex-wrap gap-1.5" aria-label="Aperçu">
          {colorList.flatMap((color) =>
            sizeList.map((size) => (
              <span
                key={`${color}-${size}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-xs ring-1 ring-line"
              >
                {swatchFor(color) && (
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full ring-1 ring-black/15"
                    style={{ background: swatchFor(color) ?? undefined }}
                  />
                )}
                {variantLabel(color, size)}
              </span>
            )),
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-charcoal/70">
          {combinations > 0
            ? `${String(combinations)} combinaison${combinations > 1 ? 's' : ''} ; les variantes existantes sont conservées.`
            : 'Renseignez au moins une couleur et une taille.'}
        </p>
        <button
          type="button"
          disabled={combinations === 0 || !validPrice}
          onClick={generate}
          className={buttonClassName('primary')}
        >
          <Sparkles aria-hidden="true" className="size-4" />
          Générer les variantes
        </button>
      </div>
    </div>
  );
}

function VariantRow({
  form,
  index,
  fieldId,
  total,
  onMove,
  onRemove,
}: {
  form: Form;
  index: number;
  fieldId: string;
  total: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const variant = useWatch({ control: form.control, name: `variants.${index}` });
  const fieldErrors = form.formState.errors.variants?.[index];
  const prefix = `variant-${fieldId}`;
  const [open, setOpen] = useState(false);
  const hasAdvancedError = Boolean(fieldErrors?.label || fieldErrors?.sku);
  const swatch = variant.packaging ? swatchFor(variant.packaging) : null;
  const price = Number(variant.indicativePrice);

  // Le libellé suit la couleur et la taille tant qu'il n'a pas été personnalisé.
  const syncLabel = (previous: { color: string; size: string }) => {
    const current = form.getValues(`variants.${index}`);
    const auto = variantLabel(previous.color, previous.size);
    if (current.label.trim() === '' || current.label === auto) {
      const next = variantLabel(current.packaging, current.unit);
      if (next) form.setValue(`variants.${index}.label`, next, { shouldDirty: true });
    }
  };
  const colorField = form.register(`variants.${index}.packaging`);
  const sizeField = form.register(`variants.${index}.unit`);

  return (
    <li
      className={cn(
        'rounded-lg border bg-paper transition-colors',
        variant.isActive ? 'border-line' : 'border-dashed border-line bg-ivory/60',
        fieldErrors && 'border-red-300',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line/70 px-4 py-2.5">
        <span
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 rounded-full ring-1 ring-black/15',
            !swatch && 'bg-[repeating-linear-gradient(45deg,#e6dfd3_0_3px,#fbfaf7_3px_6px)]',
          )}
          style={swatch ? { background: swatch } : undefined}
        />
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {variant.label || `Variante ${String(index + 1)}`}
        </p>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium ring-1',
            availabilityTone[variant.availability],
          )}
        >
          {availabilityLabels[variant.availability]}
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {variant.priceOnRequest || variant.indicativePrice === '' || Number.isNaN(price)
            ? 'Sur demande'
            : formatFcfa(price)}
        </span>
        <div className="-mr-2 flex">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
            aria-label={`Monter la variante ${variant.label}`}
            className={buttonClassName('ghost', 'min-h-9 px-2')}
          >
            <ArrowUp aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(index + 1)}
            aria-label={`Descendre la variante ${variant.label}`}
            className={buttonClassName('ghost', 'min-h-9 px-2')}
          >
            <ArrowDown aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            disabled={total === 1}
            onClick={onRemove}
            aria-label={`Supprimer la variante ${variant.label}`}
            className={buttonClassName('ghost', 'min-h-9 px-2 text-red-700 hover:bg-red-50')}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-[1.3fr_1fr_1fr_1.2fr_auto] md:items-start">
        <FormField
          id={`${prefix}-packaging`}
          label="Couleur"
          error={fieldErrors?.packaging?.message}
        >
          <input
            id={`${prefix}-packaging`}
            className={inputClassName}
            placeholder="Noir"
            {...colorField}
            onFocus={(event) => {
              event.currentTarget.dataset.previous = event.currentTarget.value;
            }}
            onBlur={(event) => {
              void colorField.onBlur(event);
              syncLabel({
                color: event.currentTarget.dataset.previous ?? '',
                size: form.getValues(`variants.${index}.unit`),
              });
            }}
          />
        </FormField>
        <FormField id={`${prefix}-unit`} label="Taille" error={fieldErrors?.unit?.message}>
          <input
            id={`${prefix}-unit`}
            className={inputClassName}
            placeholder="M"
            {...sizeField}
            onFocus={(event) => {
              event.currentTarget.dataset.previous = event.currentTarget.value;
            }}
            onBlur={(event) => {
              void sizeField.onBlur(event);
              syncLabel({
                color: form.getValues(`variants.${index}.packaging`),
                size: event.currentTarget.dataset.previous ?? '',
              });
            }}
          />
        </FormField>
        <FormField
          id={`${prefix}-price`}
          label="Prix (FCFA)"
          error={fieldErrors?.indicativePrice?.message}
        >
          <input
            id={`${prefix}-price`}
            inputMode="numeric"
            readOnly={variant.priceOnRequest}
            placeholder={variant.priceOnRequest ? 'Sur demande' : '6500'}
            className={cn(inputClassName, 'tabular-nums read-only:bg-ivory')}
            aria-invalid={fieldErrors?.indicativePrice ? true : undefined}
            aria-describedby={describedBy(`${prefix}-price`, fieldErrors?.indicativePrice?.message)}
            {...form.register(`variants.${index}.indicativePrice`)}
          />
        </FormField>
        <FormField id={`${prefix}-availability`} label="Disponibilité">
          <select
            id={`${prefix}-availability`}
            className={inputClassName}
            {...form.register(`variants.${index}.availability`)}
          >
            {variantAvailabilities.map((availability) => (
              <option key={availability} value={availability}>
                {availabilityLabels[availability]}
              </option>
            ))}
          </select>
        </FormField>
        <label className="col-span-2 flex min-h-11 cursor-pointer items-center gap-2.5 text-sm md:col-span-1 md:mt-6.5">
          <input
            type="checkbox"
            className="peer sr-only"
            {...form.register(`variants.${index}.isActive`)}
          />
          <span
            aria-hidden="true"
            className="relative h-6 w-10 shrink-0 rounded-full bg-stone-300 transition-colors peer-checked:bg-forest peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forest after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
          />
          Active
        </label>
      </div>

      <div className="border-t border-line/70">
        <button
          type="button"
          aria-expanded={open || hasAdvancedError}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold tracking-wide text-charcoal/60 uppercase hover:text-forest"
        >
          Plus d’options
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 transition-transform',
              (open || hasAdvancedError) && 'rotate-180',
            )}
          />
        </button>
        {(open || hasAdvancedError) && (
          <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
            <FormField
              id={`${prefix}-label`}
              label="Libellé"
              error={fieldErrors?.label?.message}
              hint="Généré depuis la couleur et la taille ; modifiable."
            >
              <input
                id={`${prefix}-label`}
                className={inputClassName}
                aria-describedby={describedBy(
                  `${prefix}-label`,
                  fieldErrors?.label?.message,
                  'hint',
                )}
                {...form.register(`variants.${index}.label`)}
              />
            </FormField>
            <FormField
              id={`${prefix}-sku`}
              label="Référence (facultatif)"
              error={fieldErrors?.sku?.message}
            >
              <input
                id={`${prefix}-sku`}
                className={inputClassName}
                {...form.register(`variants.${index}.sku`)}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                className="size-5 accent-forest"
                {...form.register(`variants.${index}.priceOnRequest`, {
                  onChange: (event: { target: { checked: boolean } }) => {
                    if (event.target.checked)
                      form.setValue(`variants.${index}.indicativePrice`, '', { shouldDirty: true });
                  },
                })}
              />
              Prix sur demande (pas de prix ferme, non commandable en ligne)
            </label>
          </div>
        )}
      </div>
    </li>
  );
}

export function VariantsEditor({ form }: { form: Form }) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'variants',
  });
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [bulkPrice, setBulkPrice] = useState('');
  const variants = useWatch({ control: form.control, name: 'variants' });
  const errors = form.formState.errors.variants;
  const colors = new Set(variants.map((variant) => variant.packaging.trim()).filter(Boolean));
  const activeCount = variants.filter((variant) => variant.isActive).length;
  const bulkValid = /^\d{1,10}$/.test(bulkPrice.trim());

  return (
    <section
      aria-labelledby="variants-title"
      className="space-y-4 rounded-xl border border-line bg-paper p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="variants-title" className="text-lg font-bold">
            Variantes
          </h2>
          <p className="mt-0.5 text-sm text-charcoal/65">
            {fields.length} variante{fields.length > 1 ? 's' : ''} · {activeCount} active
            {activeCount > 1 ? 's' : ''} · {colors.size} couleur{colors.size > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-expanded={generatorOpen}
            onClick={() => setGeneratorOpen((value) => !value)}
            className={buttonClassName(generatorOpen ? 'accent' : 'secondary')}
          >
            <Sparkles aria-hidden="true" className="size-4" />
            Générer
          </button>
          <button
            type="button"
            disabled={fields.length >= MAX_VARIANTS}
            onClick={() => {
              const last = form.getValues('variants').at(-1);
              append({
                ...emptyVariant(),
                unit: '',
                packaging: last?.packaging ?? '',
                indicativePrice: last?.priceOnRequest ? '' : (last?.indicativePrice ?? ''),
                label: '',
              });
            }}
            className={buttonClassName('secondary')}
          >
            <Plus aria-hidden="true" className="size-4" />
            Ajouter une variante
          </button>
        </div>
      </div>

      {generatorOpen && (
        <Generator
          form={form}
          onDone={(count) => {
            setGeneratorOpen(false);
            setFeedback(
              count === 0
                ? 'Aucune nouvelle variante : ces combinaisons existent déjà.'
                : `${String(count)} variante${count > 1 ? 's' : ''} ajoutée${count > 1 ? 's' : ''}.`,
            );
          }}
        />
      )}
      <p role="status" className={cn('text-sm text-forest', !feedback && 'sr-only')}>
        {feedback}
      </p>

      {errors?.root?.message && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {errors.root.message}
        </p>
      )}
      {errors?.message && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {errors.message}
        </p>
      )}

      {fields.length > 1 && (
        <div className="flex flex-wrap items-end gap-2 rounded-lg bg-ivory/70 px-3 py-2.5">
          <label
            htmlFor="variants-bulk-price"
            className="w-full text-xs font-semibold text-charcoal/60 sm:w-auto sm:self-center"
          >
            Même prix pour toutes
          </label>
          <input
            id="variants-bulk-price"
            inputMode="numeric"
            placeholder="FCFA"
            value={bulkPrice}
            onChange={(event) => setBulkPrice(event.target.value)}
            className={cn(inputClassName, 'min-h-9 w-32 tabular-nums')}
          />
          <button
            type="button"
            disabled={!bulkValid}
            onClick={() => {
              form.getValues('variants').forEach((_, index) => {
                form.setValue(`variants.${index}.indicativePrice`, bulkPrice.trim(), {
                  shouldDirty: true,
                });
                form.setValue(`variants.${index}.priceOnRequest`, false, { shouldDirty: true });
              });
              setFeedback(
                `Prix de ${formatFcfa(Number(bulkPrice))} appliqué à toutes les variantes.`,
              );
              setBulkPrice('');
            }}
            className={buttonClassName('secondary', 'min-h-9')}
          >
            Appliquer
          </button>
        </div>
      )}

      <ol className="space-y-3">
        {fields.map((field, index) => (
          <VariantRow
            key={field.id}
            form={form}
            index={index}
            fieldId={field.id}
            total={fields.length}
            onMove={(to) => move(index, to)}
            onRemove={() => remove(index)}
          />
        ))}
      </ol>
    </section>
  );
}
