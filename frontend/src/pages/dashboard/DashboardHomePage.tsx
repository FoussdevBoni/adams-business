import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Eye,
  FilePenLine,
  ImageOff,
  Images,
  LayoutTemplate,
  Mail,
  Package,
  Plus,
  Sparkles,
  Tags,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useCurrentSession } from '../../core/auth/currentSessionContext';
import { cloudinaryUrl } from '../../core/utils/cloudinaryImage';
import { cn } from '../../core/utils/cn';
import { formatFcfa } from '../../core/utils/formatPrice';
import { useAdminCategories } from '../../modules/categories/hooks/useCategories';
import { useContactMessageList } from '../../modules/contactMessages/hooks/useContactMessages';
import { useDashboardOverview } from '../../modules/dashboard/hooks/useDashboardStats';
import { useUnreadNotificationCount } from '../../modules/notifications/hooks/useNotifications';
import { StatusBadge } from '../../modules/products/components/ProductStatusBadge';
import { useAdminProducts } from '../../modules/products/hooks/useProducts';
import type { AdminProductListItem } from '../../modules/products/schemas/productSchema';

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

function timeAgo(iso: string): string {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour');
  return relative.format(Math.round(hours / 24), 'day');
}

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 5 || hour >= 18 ? 'Bonsoir' : 'Bonjour';
}

function Skeleton({ className }: { className?: string }) {
  return <span className={cn('shop-skeleton block rounded-lg', className)} />;
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  to,
  tone = 'light',
}: {
  label: string;
  value: number | undefined;
  hint: string;
  icon: typeof Package;
  to: string;
  tone?: 'light' | 'gold';
}) {
  return (
    <Link
      to={to}
      className={cn(
        'studio-card studio-card--hover group flex flex-col justify-between gap-6 p-5',
        tone === 'gold' && '!bg-[#f6efe4]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="studio-label">{label}</span>
        <span
          className={cn(
            'grid size-10 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6',
            tone === 'gold' ? 'bg-[#141412] text-sprout' : 'bg-[#f3efe8] text-charcoal',
          )}
        >
          <Icon aria-hidden="true" className="size-[1.1rem]" strokeWidth={1.8} />
        </span>
      </div>
      <div>
        {value === undefined ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <p className="studio-number text-[2.6rem]">{value}</p>
        )}
        <p className="mt-2 flex items-center gap-1 text-xs text-charcoal/55">
          {hint}
          <ArrowRight
            aria-hidden="true"
            className="size-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        </p>
      </div>
    </Link>
  );
}

function Donut({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 140 140" className="size-36 -rotate-90" aria-hidden="true">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#efeae2" strokeWidth="14" />
      {total > 0 &&
        segments.map((segment) => {
          const length = (segment.value / total) * circumference;
          const circle = (
            <circle
              key={segment.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${String(Math.max(0, length - 3))} ${String(circumference)}`}
              strokeDashoffset={-offset}
              className="studio-ring"
            />
          );
          offset += length;
          return circle;
        })}
    </svg>
  );
}

function Section({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('studio-card p-5 sm:p-6', className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProductTile({ product }: { product: AdminProductListItem }) {
  return (
    <Link to={`products/${product.id}`} className="group block w-44 shrink-0 snap-start sm:w-auto">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#ebe5da]">
        {product.image ? (
          <img
            src={cloudinaryUrl(product.image.url, 480)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center text-charcoal/30">
            <ImageOff aria-hidden="true" className="size-8" strokeWidth={1.3} />
          </span>
        )}
        <span className="absolute top-2.5 left-2.5">
          <StatusBadge status={product.status} />
        </span>
        <span className="absolute right-2.5 bottom-2.5 grid size-9 translate-y-2 place-items-center rounded-full bg-white/90 opacity-0 shadow backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <FilePenLine aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold">{product.name}</p>
      <p className="mt-0.5 flex items-center justify-between gap-2 text-xs text-charcoal/55">
        <span className="tabular-nums">
          {product.priceFrom === null ? 'Sur demande' : formatFcfa(product.priceFrom)}
        </span>
        <span>{timeAgo(product.updatedAt)}</span>
      </p>
    </Link>
  );
}

export function DashboardHomePage() {
  const { user } = useCurrentSession();
  const overview = useDashboardOverview();
  const products = useAdminProducts({ page: 1, search: '', category: '', status: '' });
  const categories = useAdminCategories();
  const messages = useContactMessageList({
    page: 1,
    status: 'new',
    assignee: '',
    search: '',
    sort: 'newest',
  });
  const unread = useUnreadNotificationCount();

  const counts = overview.data?.catalog.products;
  const items = products.data?.items ?? [];
  const loadedAll = products.data ? products.data.meta.total <= items.length : false;
  const firstName = user.fullName.split(/\s+/)[0] ?? user.fullName;
  const activeCategories = categories.data?.filter((category) => category.isActive);

  const checks = [
    {
      label: 'Sans photo',
      count: items.filter((product) => !product.image).length,
      icon: ImageOff,
    },
    {
      label: 'Prix sur demande',
      count: items.filter((product) => product.priceFrom === null).length,
      icon: AlertTriangle,
    },
    {
      label: 'Indisponibles',
      count: items.filter((product) => product.availability !== 'available').length,
      icon: Package,
    },
  ];

  const byCategory = (activeCategories ?? [])
    .map((category) => ({
      name: category.name,
      count: items.filter((product) => product.category?.id === category.id).length,
    }))
    .sort((a, b) => b.count - a.count);
  const maxCategory = Math.max(1, ...byCategory.map((entry) => entry.count));
  const featured = items.filter((product) => product.featured && product.status === 'published');

  return (
    <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
      <section className="studio-hero">
        <img src="/images/adams-campagne.jpg" alt="" className="studio-hero-img" />
        <div className="relative grid gap-8 p-6 pt-40 sm:p-10 md:max-w-[60%] md:pt-10 lg:p-12">
          <div>
            <p className="studio-label !text-sprout first-letter:uppercase">
              {dayFormatter.format(new Date())}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.035em]">
              {greeting()}, {firstName}.
            </h1>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ivory/70">
              {counts ? (
                <>
                  <strong className="font-semibold text-ivory">
                    {counts.published} article{counts.published > 1 ? 's' : ''} en ligne
                  </strong>
                  {counts.draft > 0 &&
                    ` · ${String(counts.draft)} brouillon${counts.draft > 1 ? 's' : ''} à finaliser`}
                  . Votre vitrine est prête à recevoir vos clients.
                </>
              ) : (
                'Gérez votre vitrine, vos articles et vos contenus depuis un seul endroit.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="products/nouveau" className="studio-btn studio-btn--gold">
              <Plus aria-hidden="true" className="size-4" />
              Nouvel article
            </Link>
            <a href="/" target="_blank" rel="noreferrer" className="studio-btn studio-btn--glass">
              <Eye aria-hidden="true" className="size-4" />
              Voir la boutique
            </a>
          </div>
        </div>
      </section>

      <div className="studio-stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi
          label="En ligne"
          value={counts?.published}
          hint="Articles publiés"
          icon={CheckCircle2}
          to="products?statut=published"
          tone="gold"
        />
        <Kpi
          label="Brouillons"
          value={counts?.draft}
          hint="À compléter"
          icon={FilePenLine}
          to="products?statut=draft"
        />
        <Kpi
          label="Messages"
          value={messages.data?.meta.total}
          hint="Nouveaux à traiter"
          icon={Mail}
          to="messages"
        />
        <Kpi
          label="Alertes"
          value={unread.data}
          hint="Notifications non lues"
          icon={Bell}
          to="notifications"
        />
      </div>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Section
          title="Santé du catalogue"
          action={
            !loadedAll && products.data ? (
              <span className="text-xs text-charcoal/50">
                {items.length} derniers articles analysés
              </span>
            ) : undefined
          }
        >
          <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
            <div className="relative mx-auto">
              <Donut
                segments={[
                  { label: 'Publiés', value: counts?.published ?? 0, color: '#141412' },
                  { label: 'Brouillons', value: counts?.draft ?? 0, color: '#c9a47c' },
                  { label: 'Archivés', value: counts?.archived ?? 0, color: '#d9d2c5' },
                ]}
              />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="studio-number text-3xl">
                    {counts ? counts.published + counts.draft + counts.archived : '–'}
                  </p>
                  <p className="text-[0.65rem] tracking-widest text-charcoal/50 uppercase">
                    articles
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
                {[
                  ['Publiés', '#141412', counts?.published],
                  ['Brouillons', '#c9a47c', counts?.draft],
                  ['Archivés', '#d9d2c5', counts?.archived],
                ].map(([label, color, value]) => (
                  <li key={String(label)} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full"
                      style={{ background: String(color) }}
                    />
                    {label}
                    <strong className="tabular-nums">{value ?? '–'}</strong>
                  </li>
                ))}
              </ul>
              <ul className="grid gap-2">
                {checks.map((check) => {
                  const ok = check.count === 0;
                  return (
                    <li
                      key={check.label}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm',
                        ok ? 'bg-[#f1f5ef] text-[#2c4a33]' : 'bg-[#fbf1e4] text-[#7a4b1e]',
                      )}
                    >
                      {ok ? (
                        <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
                      ) : (
                        <check.icon aria-hidden="true" className="size-4 shrink-0" />
                      )}
                      <span className="flex-1">{check.label}</span>
                      <strong className="tabular-nums">
                        {products.data ? (ok ? 'Aucun' : check.count) : '…'}
                      </strong>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Section>

        <Section
          title="Vitrine de l’accueil"
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6efe4] px-2.5 py-1 text-xs font-semibold text-[#7a5a35]">
              <Sparkles aria-hidden="true" className="size-3.5" />
              {featured.length} mis en avant
            </span>
          }
        >
          {featured.length === 0 ? (
            <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-black/10 p-6 text-center text-sm text-charcoal/60">
              <div>
                <Sparkles aria-hidden="true" className="mx-auto mb-3 size-6 text-sprout" />
                Cochez « Mettre en avant » sur un article publié pour l’afficher en page d’accueil.
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-4 gap-2.5">
              {featured.slice(0, 4).map((product) => (
                <li key={product.id}>
                  <Link
                    to={`products/${product.id}`}
                    className="group block overflow-hidden rounded-xl bg-[#ebe5da]"
                    title={product.name}
                  >
                    {product.image ? (
                      <img
                        src={cloudinaryUrl(product.image.url, 320)}
                        alt={product.name}
                        className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="grid aspect-[4/5] place-items-center text-xs">
                        {product.name}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 space-y-3.5">
            <p className="studio-label">Par catégorie</p>
            {byCategory.length === 0 && (
              <p className="text-sm text-charcoal/55">Aucune catégorie active.</p>
            )}
            {byCategory.map((entry) => (
              <div
                key={entry.name}
                className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-3 text-sm"
              >
                <span className="truncate">{entry.name}</span>
                <span className="studio-bar">
                  <span style={{ width: `${String((entry.count / maxCategory) * 100)}%` }} />
                </span>
                <span className="text-right font-semibold tabular-nums">{entry.count}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title="Derniers articles"
        action={
          <Link to="products" className="studio-btn studio-btn--light !min-h-9 !text-xs">
            Tout le catalogue <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        }
      >
        {products.isPending ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="grid min-h-40 place-items-center text-center text-sm text-charcoal/60">
            <div>
              <p>Votre catalogue est vide.</p>
              <Link to="products/nouveau" className="studio-btn studio-btn--dark mt-4">
                <Plus aria-hidden="true" className="size-4" /> Créer le premier article
              </Link>
            </div>
          </div>
        ) : (
          <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {items.slice(0, 6).map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        )}
      </Section>

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Section
          title="Messages récents"
          action={
            <Link
              to="messages"
              className="text-xs font-semibold underline-offset-4 hover:underline"
            >
              Tout voir
            </Link>
          }
        >
          {messages.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : !messages.data || messages.data.items.length === 0 ? (
            <div className="flex items-center gap-4 rounded-2xl bg-[#f6f3ee] p-4 text-sm text-charcoal/65">
              <span className="grid size-10 place-items-center rounded-full bg-white">
                <Mail aria-hidden="true" className="size-4" />
              </span>
              Aucun nouveau message. Tout est à jour.
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {messages.data.items.slice(0, 4).map((message) => (
                <li key={message.id}>
                  <Link
                    to={`messages/${message.id}`}
                    className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[#f6f3ee]"
                  >
                    <span className="studio-avatar studio-avatar--light !size-9 !text-[0.65rem]">
                      {message.customerName.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {message.customerName}
                      </span>
                      <span className="block truncate text-xs text-charcoal/55">
                        {message.subject}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-charcoal/45">
                      {timeAgo(message.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Raccourcis">
          <ul className="grid grid-cols-2 gap-3">
            {[
              { to: 'products/nouveau', label: 'Ajouter un article', icon: Plus },
              { to: 'categories', label: 'Collections', icon: Tags },
              { to: 'media', label: 'Photothèque', icon: Images },
              { to: 'pages', label: 'Textes du site', icon: LayoutTemplate },
            ].map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex h-full flex-col justify-between gap-6 rounded-2xl bg-[#f6f3ee] p-4 text-sm font-semibold transition-colors hover:bg-[#141412] hover:text-ivory"
                >
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
                  <span className="flex items-center justify-between gap-2">
                    {label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
