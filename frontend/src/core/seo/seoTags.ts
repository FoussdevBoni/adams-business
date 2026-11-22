/**
 * Métadonnées SEO partagées par l'application (mise à jour à la navigation) et par la
 * génération des en-têtes HTML statiques au build (vite.config.ts). Aucune dépendance au DOM.
 */
export const SITE_NAME = 'Adam’s Business';
export const DEFAULT_DESCRIPTION =
  'Boutique béninoise de polos et pantalons pour homme. Livraison gratuite à Cotonou et Abomey-Calavi.';

/** Ajoute le nom du site, sans doublon si le titre le contient déjà (titre SEO du CMS). */
export function formatPageTitle(title: string | undefined): string {
  const trimmed = title?.trim();
  if (!trimmed) return SITE_NAME;
  return trimmed.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? trimmed
    : `${trimmed} | ${SITE_NAME}`;
}

/** URL canonique : sans paramètres de requête (filtres, pagination) ni barre finale. */
export function canonicalUrl(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/+$/, '');
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return `${base}${path}`;
}

export interface StaticPublicRoute {
  path: string;
  title: string;
  description: string;
}

/** Pages publiques fixes : en-têtes pré-générés au build pour les robots sans JavaScript. */
export const staticPublicRoutes: readonly StaticPublicRoute[] = [
  { path: '/', title: 'Prêt-à-porter masculin', description: DEFAULT_DESCRIPTION },
  { path: '/catalogue', title: 'Polos et pantalons homme', description: DEFAULT_DESCRIPTION },
  {
    path: '/panier',
    title: 'Votre panier',
    description: 'Préparez votre commande Adam’s Business sur WhatsApp.',
  },
];

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

const escapeAttribute = (value: string) =>
  value.replace(/[&<>"]/g, (character) => htmlEscapes[character] ?? character);

/** Bloc d'en-tête HTML (titre, description, canonical, Open Graph) d'une page statique. */
export function renderHeadTags(options: {
  title: string;
  description: string;
  url: string | null;
}): string {
  const title = escapeAttribute(formatPageTitle(options.title));
  const description = escapeAttribute(options.description);
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="index, follow" />`,
    ...(options.url
      ? [
          `<link rel="canonical" href="${escapeAttribute(options.url)}" />`,
          `<meta property="og:url" content="${escapeAttribute(options.url)}" />`,
        ]
      : []),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="fr_BJ" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join('\n    ');
}
