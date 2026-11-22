import type { SectionType } from './pageSections.js';

export interface PageDefinition {
  key: string;
  title: string;
  path: string | null;
  allowedSectionTypes: readonly SectionType[];
}

export const pageDefinitions: readonly PageDefinition[] = [
  {
    key: 'home',
    title: 'Accueil',
    path: '/',
    allowedSectionTypes: ['hero', 'richText', 'imageText', 'callToAction', 'faq'],
  },
  {
    key: 'catalog',
    title: 'Boutique',
    path: '/catalogue',
    allowedSectionTypes: ['hero', 'richText', 'callToAction', 'faq'],
  },
  {
    key: 'quotation-request',
    title: 'Panier',
    path: '/panier',
    allowedSectionTypes: ['hero', 'richText', 'faq'],
  },
];

export function getPageDefinition(key: string): PageDefinition | undefined {
  return pageDefinitions.find((definition) => definition.key === key);
}
