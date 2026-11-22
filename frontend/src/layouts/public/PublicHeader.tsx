import { ArrowUpRight, Menu, MessageCircle, ShoppingBag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { whatsappGroup, whatsappLink } from '../../core/content/shop';
import { publicNavItems, quotationRequestPath } from '../../core/navigation/publicNavigation';
import { useQuotationCart } from '../../modules/quotations/cart/useQuotationCart';

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" className="shop-wordmark" aria-label="Adam’s Business, accueil" onClick={onClick}>
      <strong>ADAM’S</strong>
      <span>BUSINESS</span>
    </Link>
  );
}

function isActive(path: string, pathname: string, search: string) {
  const [base, query = ''] = path.split('?');
  return base === pathname && query === search.replace(/^\?/, '');
}

export function PublicHeader() {
  const { items } = useQuotationCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);
  const previousCount = useRef(count);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Ligne de séparation dès que la page défile.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Pulsation du compteur lorsqu'un article est ajouté.
  useEffect(() => {
    if (count > previousCount.current) {
      setBump(true);
      const timer = window.setTimeout(() => setBump(false), 600);
      previousCount.current = count;
      return () => window.clearTimeout(timer);
    }
    previousCount.current = count;
  }, [count]);

  // Fermeture du tiroir à chaque navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const menuButton = menuButtonRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      menuButton?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="shop-banner">Livraison gratuite à Cotonou et Abomey-Calavi</div>
      <header className="shop-header" data-scrolled={scrolled}>
        <div className="shop-shell shop-header-inner">
          <div className="flex items-center">
            <button
              ref={menuButtonRef}
              type="button"
              className="shop-icon-button -ml-2.5 lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              aria-controls="shop-drawer"
              onClick={() => setOpen(true)}
            >
              <Menu size={22} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <nav className="shop-nav" aria-label="Navigation de la boutique">
              {publicNavItems.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  aria-current={isActive(path, pathname, search) ? 'page' : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <Wordmark />
          <div className="flex items-center justify-end gap-1">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="shop-icon-button hidden sm:inline-grid"
              aria-label="Nous écrire sur WhatsApp"
            >
              <MessageCircle size={20} strokeWidth={1.6} aria-hidden="true" />
            </a>
            <Link
              to={quotationRequestPath}
              className="shop-icon-button -mr-2.5"
              aria-label={`Panier, ${String(count)} article(s)`}
            >
              <ShoppingBag size={21} strokeWidth={1.6} aria-hidden="true" />
              {count > 0 && (
                <span className="shop-bag-count" data-bump={bump} aria-hidden="true">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <div
        id="shop-drawer"
        className="shop-drawer lg:hidden"
        data-open={open}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="shop-drawer-backdrop" onClick={() => setOpen(false)} />
        <div
          className="shop-drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de la boutique"
        >
          <div className="flex h-15 items-center justify-between px-5">
            <Wordmark onClick={() => setOpen(false)} />
            <button
              ref={closeRef}
              type="button"
              className="shop-icon-button -mr-2.5"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
            >
              <X size={22} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Menu mobile" className="flex-1 overflow-y-auto px-5 pt-4">
            <ul className="shop-drawer-links">
              <li>
                <Link to="/">Accueil</Link>
              </li>
              {publicNavItems.map(({ label, path }) => (
                <li key={path}>
                  <Link to={path}>
                    {label}
                    <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-3 border-t border-line p-5 text-sm">
            <p className="shop-eyebrow">Une question sur une taille ?</p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="shop-button shop-button--whatsapp"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Écrire sur WhatsApp
            </a>
            <a
              href={whatsappGroup}
              target="_blank"
              rel="noreferrer"
              className="text-center underline underline-offset-4"
            >
              Rejoindre le groupe des nouveautés
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
