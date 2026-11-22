export const publicNavItems = [
  { label: 'Boutique', path: '/catalogue' },
  { label: 'Polos', path: '/catalogue?categorie=polos' },
  { label: 'Pantalons', path: '/catalogue?categorie=pantalons' },
  { label: 'Nouveautés', path: '/catalogue?collection=nouveautes' },
] as const;

export const quotationRequestPath = '/panier';
