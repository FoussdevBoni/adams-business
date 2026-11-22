import { Ellipsis, X } from 'lucide-react';
import { useId, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import type { AdminRole } from '../../core/auth/roles';
import {
  dashboardMobileTabs,
  findActiveNavItem,
  getMoreItems,
} from '../../core/navigation/dashboardNavigation';
import { cn } from '../../core/utils/cn';
import { UnreadBadge } from '../../modules/notifications/components/UnreadBadge';
import { LogoutButton } from './LogoutButton';

const tabClassName = (isActive: boolean) =>
  cn(
    'relative flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.65rem] font-semibold tracking-wide transition-colors duration-200',
    isActive ? 'bg-white/10 text-ivory' : 'text-ivory/50 hover:text-ivory',
  );

/** Barre mobile flottante : Accueil, Catégories, Produits, Alertes, Plus. */
export function DashboardBottomNav({ role }: { role: AdminRole }) {
  const { pathname } = useLocation();
  const activeItem = findActiveNavItem(pathname);
  const activeTab = activeItem?.mobileTab;
  const isMoreActive = activeItem !== undefined && activeTab === undefined;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const closeMore = () => dialogRef.current?.close();

  return (
    <>
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 rounded-[1.4rem] bg-[#141412]/95 p-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55)] ring-1 ring-white/10 backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-5 gap-1">
          {dashboardMobileTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <Link
                  to={tab.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={tabClassName(isActive)}
                >
                  <span className="relative">
                    <tab.icon
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={isActive ? 2.1 : 1.7}
                    />
                    {tab.id === 'alerts' && <UnreadBadge className="absolute -top-2 -right-3" />}
                  </span>
                  {tab.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 h-0.5 w-4 rounded-full bg-sprout"
                    />
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => dialogRef.current?.showModal()}
              className={cn(tabClassName(isMoreActive), 'w-full')}
            >
              <Ellipsis aria-hidden="true" className="size-5" />
              Plus
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="studio-sheet mx-0 mt-auto mb-0 max-h-[80dvh] w-full max-w-none rounded-t-[1.75rem] bg-[#faf8f4] p-0 text-charcoal backdrop:bg-black/50 backdrop:backdrop-blur-sm md:hidden"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMore();
        }}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-black/15" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h2 id={titleId} className="font-display text-lg font-bold">
            Plus de modules
          </h2>
          <button type="button" onClick={closeMore} aria-label="Fermer" className="studio-icon-btn">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <ul className="grid grid-cols-3 gap-2.5 px-5 py-3">
          {getMoreItems(role).map((item) => {
            const isActive = activeItem?.id === item.id;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={closeMore}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center gap-2.5 rounded-2xl px-2 text-center text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-[#141412] text-ivory'
                      : 'bg-white text-charcoal shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-black/5',
                  )}
                >
                  <item.icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="px-5 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <LogoutButton className="w-full justify-start rounded-2xl bg-white ring-1 ring-black/5" />
        </div>
      </dialog>
    </>
  );
}
