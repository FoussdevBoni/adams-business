import { Link, Outlet } from 'react-router';
import { MAIN_CONTENT_ID } from '../core/components/SkipLink';
import { useNoIndex } from '../core/hooks/useDocumentMeta';

/** Écrans d'authentification : visuel de marque sur grand écran, formulaire centré. */
export function AuthLayout() {
  useNoIndex('Espace administrateur');
  return (
    <div className="min-h-dvh bg-ivory [color-scheme:light] lg:grid lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-forest lg:block" aria-hidden="true">
        <img
          src="/images/adams-campagne.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-12 text-ivory">
          <p className="shop-eyebrow !text-sprout">Administration</p>
          <p className="shop-display mt-3 text-5xl">Adam’s Business</p>
        </div>
      </aside>
      <div className="flex min-h-dvh items-center justify-center px-4 py-12">
        <main id={MAIN_CONTENT_ID} className="w-full max-w-md">
          <Link to="/" className="shop-wordmark mx-auto mb-10 lg:hidden">
            <strong>ADAM’S</strong>
            <span>BUSINESS</span>
          </Link>
          <div className="rounded-lg border border-line bg-paper p-6 shadow-[0_20px_50px_-30px_rgb(24_24_22/0.35)] sm:p-9">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
