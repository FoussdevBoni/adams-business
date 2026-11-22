import { cn } from '../../../core/utils/cn';
import { type ProductStatus, productStatusLabels } from '../schemas/productSchema';

const tones: Record<ProductStatus, string> = {
  published: 'bg-emerald-50/95 text-emerald-800 ring-emerald-600/15',
  draft: 'bg-amber-50/95 text-amber-800 ring-amber-600/20',
  archived: 'bg-stone-100/95 text-stone-600 ring-stone-500/15',
};

export function StatusBadge({ status, label }: { status: ProductStatus; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ring-1 backdrop-blur before:size-1.5 before:rounded-full before:bg-current before:opacity-70',
        tones[status],
      )}
    >
      {label ?? productStatusLabels[status]}
    </span>
  );
}
