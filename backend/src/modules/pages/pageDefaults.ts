import type { DefaultPageContent } from './pageService.js';

export const defaultPageContents: readonly DefaultPageContent[] = [
  {
    key: 'home',
    seo: {
      title: 'Adam’s Business · Prêt-à-porter masculin',
      description: 'Polos et pantalons homme. Livraison gratuite à Cotonou et Abomey-Calavi.',
    },
    sections: [
      {
        type: 'hero',
        data: {
          title: 'Les essentiels du vestiaire masculin',
          subtitle:
            'Polos à 6 500 FCFA et pantalons à 8 000 FCFA. Trouvez votre coupe et commandez sur WhatsApp.',
          primaryLink: { label: 'Voir la collection', href: '/catalogue' },
        },
      },
    ],
  },
  {
    key: 'catalog',
    sections: [
      {
        type: 'hero',
        data: {
          eyebrow: 'Prêt-à-porter masculin',
          title: 'Le vestiaire Adam’s',
          subtitle: 'Trouvez votre coupe, votre couleur et votre taille.',
        },
      },
    ],
  },
  {
    key: 'quotation-request',
    sections: [{ type: 'hero', data: { title: 'Votre panier' } }],
  },
];
