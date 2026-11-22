import type { ReactNode } from 'react';

interface PublicPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PublicPageHeader({ eyebrow, title, description, children }: PublicPageHeaderProps) {
  return (
    <section className="shop-shell pt-10 pb-6 sm:pt-14 sm:pb-8">
      {eyebrow && <p className="shop-eyebrow shop-fade-in">{eyebrow}</p>}
      <h1 className="shop-display mt-3 max-w-4xl text-[clamp(2.4rem,7vw,5rem)]">
        <span className="shop-hero-line">
          <span>{title}</span>
        </span>
      </h1>
      {description && <p className="shop-fade-in mt-4 max-w-xl text-charcoal/70">{description}</p>}
      {children}
    </section>
  );
}
