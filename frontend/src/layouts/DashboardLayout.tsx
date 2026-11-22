import { Bell, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useCurrentSession } from '../core/auth/currentSessionContext';
import { roleLabels } from '../core/auth/roles';
import { MAIN_CONTENT_ID, SkipLink } from '../core/components/SkipLink';
import { useNoIndex } from '../core/hooks/useDocumentMeta';
import { findActiveNavItem } from '../core/navigation/dashboardNavigation';
import { cn } from '../core/utils/cn';
import { initialsOf } from '../core/utils/initials';
import { UnreadBadge } from '../modules/notifications/components/UnreadBadge';
import { DashboardBottomNav } from './dashboard/DashboardBottomNav';
import { DashboardSidebar } from './dashboard/DashboardSidebar';

const COLLAPSE_KEY = 'adams-studio.sidebar-collapsed';

/** Dashboard en thème clair, rendu sous RequireAuth. */
export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const activeItem = findActiveNavItem(pathname);
  useNoIndex(`${activeItem?.label ?? 'Tableau de bord'} · Administration`);
  const { user } = useCurrentSession();

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSE_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      // Préférence non conservée : sans conséquence.
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="studio min-h-dvh bg-[#f3f0ea] text-charcoal [color-scheme:light] md:flex">
      <SkipLink />
      <DashboardSidebar
        role={user.role}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)}
        userName={user.fullName}
        roleLabel={roleLabels[user.role]}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            'sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-4 transition-[background-color,box-shadow] duration-300 md:h-20 md:px-8',
            scrolled
              ? 'bg-[#f3f0ea]/85 shadow-[0_1px_0_rgb(24_24_22/0.08)] backdrop-blur-xl'
              : 'bg-transparent',
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="studio-monogram md:hidden" aria-hidden="true">
              A
            </span>
            <p className="truncate font-display text-lg font-bold tracking-tight md:sr-only">
              {activeItem?.label ?? 'Tableau de bord'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/products/nouveau"
              className="studio-btn studio-btn--dark hidden sm:inline-flex"
            >
              <Plus aria-hidden="true" className="size-4" />
              Nouvel article
            </Link>
            <Link
              to="/dashboard/notifications"
              className="studio-icon-btn relative"
              aria-label="Notifications"
            >
              <Bell aria-hidden="true" className="size-[1.1rem]" strokeWidth={1.8} />
              <UnreadBadge className="absolute -top-1 -right-1" />
            </Link>
            <div className="hidden items-center gap-3 border-l border-black/10 pl-3 sm:flex">
              <span className="studio-avatar studio-avatar--light" aria-hidden="true">
                {initialsOf(user.fullName)}
              </span>
            </div>
          </div>
        </header>
        <main
          id={MAIN_CONTENT_ID}
          key={pathname}
          className="studio-page flex-1 px-4 pt-2 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-8 md:pb-12"
        >
          <Outlet />
        </main>
      </div>
      <DashboardBottomNav role={user.role} />
    </div>
  );
}
