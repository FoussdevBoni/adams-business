import { cn } from '../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'sprout';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-forest text-ivory shadow-[0_8px_20px_-12px_rgb(0_0_0/0.7)] hover:bg-[#2b2a26]',
  secondary: 'bg-white text-forest shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] hover:bg-[#f7f4ee]',
  accent: 'bg-sand text-charcoal hover:bg-sand/80',
  ghost: 'text-forest hover:bg-forest/5',
  sprout: 'bg-sprout text-charcoal hover:bg-sprout/85',
};

export function buttonClassName(variant: ButtonVariant = 'primary', className?: string): string {
  return cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    className,
  );
}
