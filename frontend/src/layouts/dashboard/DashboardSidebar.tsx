import { ArrowUpRight, ChevronsUpDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import type { AdminRole } from '../../core/auth/roles';
import {
  DASHBOARD_ROOT,
  type DashboardNavGroup,
  dashboardNavGroupLabels,
  findActiveNavItem,
  getVisibleNavItems,
} from '../../core/navigation/dashboardNavigation';
import { cn } from '../../core/utils/cn';
import { initialsOf } from '../../core/utils/initials';
import { UnreadBadge } from '../../modules/notifications/components/UnreadBadge';
import { LogoutButton } from './LogoutButton';

interface DashboardSidebarProps {
  role: AdminRole;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  userName: string;
  roleLabel: string;
}

const groups = Object.keys(dashboardNavGroupLabels) as DashboardNavGroup[];

function UserMenu({
  userName,
  roleLabel,
  collapsed,
  labelClassName,
  onToggleCollapsed,
}: {
  userName: string;
  roleLabel: string;
  collapsed: boolean;
  labelClassName: string;
  onToggleCollapsed: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef}>
      {open && (
        <div
          id={menuId}
          className="studio-popover absolute bottom-[calc(100%-0.25rem)] left-3 z-50 w-60 rounded-2xl bg-[#1f1e1b] p-1.5 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.7)] ring-1 ring-white/10"
        >
          <div className="px-3 pt-2 pb-2.5">
            <p className="truncate text-sm font-semibold text-ivory">{userName}</p>
            <p className="text-xs text-ivory/45">{roleLabel}</p>
          </div>
          <div className="my-1 h-px bg-white/[0.07]" />
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="studio-nav-link"
            onClick={() => setOpen(false)}
          >
            <ArrowUpRight aria-hidden="true" className="size-[1.1rem] shrink-0" />
            Voir la boutique
          </a>
          <button
            type="button"
            onClick={() => {
              onToggleCollapsed();
              setOpen(false);
            }}
            className="studio-nav-link hidden w-full lg:flex"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-[1.1rem]" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-[1.1rem]" />
            )}
            {collapsed ? 'Déplier le menu' : 'Replier le menu'}
          </button>
          <div className="my-1 h-px bg-white/[0.07]" />
          <LogoutButton className="studio-nav-link w-full hover:!text-red-300" tone="studio" />
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Compte de ${userName}`}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-white/[0.06]',
          open && 'bg-white/[0.06]',
          collapsed ? 'justify-center' : 'justify-center lg:justify-start',
        )}
      >
        <span className="studio-avatar" aria-hidden="true">
          {initialsOf(userName)}
        </span>
        <span className={cn('min-w-0 flex-1', collapsed ? 'sr-only' : 'hidden lg:block')}>
          <span className="block truncate text-sm font-semibold text-ivory">{userName}</span>
          <span className="block text-xs text-ivory/45">{roleLabel}</span>
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 text-ivory/40', labelClassName)}
        />
      </button>
    </div>
  );
}

/** Sidebar « studio » : compacte sur tablette, complète et repliable sur desktop. */
export function DashboardSidebar({
  role,
  collapsed,
  onToggleCollapsed,
  userName,
  roleLabel,
}: DashboardSidebarProps) {
  const { pathname } = useLocation();
  const activeItem = findActiveNavItem(pathname);
  const labelClassName = collapsed ? 'sr-only' : 'sr-only lg:not-sr-only';
  const visibleItems = getVisibleNavItems(role);

  return (
    <aside
      className={cn(
        'studio-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col md:flex md:w-[5.25rem]',
        !collapsed && 'lg:w-[17rem]',
      )}
    >
      <div className="flex h-20 items-center justify-center px-5 lg:justify-start">
        <Link to={DASHBOARD_ROOT} className="flex items-center gap-3" aria-label="Accueil">
          <span className="studio-monogram" aria-hidden="true">
            A
          </span>
          <span className={cn('leading-none', collapsed ? 'sr-only' : 'hidden lg:block')}>
            <span className="block font-display text-[0.95rem] font-extrabold tracking-[0.16em] text-ivory">
              ADAM’S
            </span>
            <span className="mt-1 block text-[0.6rem] font-semibold tracking-[0.42em] text-sprout">
              STUDIO
            </span>
          </span>
        </Link>
      </div>

      <nav
        aria-label="Navigation du dashboard"
        className="studio-scroll min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-4"
      >
        {groups.map((group) => {
          const items = visibleItems.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-5">
              <p
                className={cn(
                  'mb-2 px-3 text-[0.65rem] font-semibold tracking-[0.18em] text-ivory/35 uppercase',
                  labelClassName,
                )}
              >
                {dashboardNavGroupLabels[group]}
              </p>
              <ul className="space-y-1">
                {items.map((item) => {
                  const isActive = activeItem?.id === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        title={item.label}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'studio-nav-link justify-center',
                          !collapsed && 'lg:justify-start',
                        )}
                      >
                        <span className="relative shrink-0">
                          <item.icon
                            aria-hidden="true"
                            className="size-[1.15rem]"
                            strokeWidth={1.7}
                          />
                          {item.id === 'notifications' && (
                            <UnreadBadge className="absolute -top-2 -right-3" />
                          )}
                        </span>
                        <span className={labelClassName}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="relative border-t border-white/[0.06] p-3">
        <UserMenu
          userName={userName}
          roleLabel={roleLabel}
          collapsed={collapsed}
          labelClassName={labelClassName}
          onToggleCollapsed={onToggleCollapsed}
        />
      </div>
    </aside>
  );
}
