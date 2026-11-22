const references = [
  {
    slug: 'polo-pique-noir',
    name: 'Polo en coton piqué · Noir',
    category: 'polos',
    color: 'Noir',
    shortDescription:
      'Un polo noir à la maille texturée, avec un col souple et une patte à deux boutons.',
    description:
      'Sa coupe droite laisse de l’aisance aux épaules. Le coton piqué donne de la tenue au col et se porte facilement avec un chino beige.',
    material: 'Coton piqué',
    fit: 'Droite',
    featured: true,
  },
  {
    slug: 'polo-lisere-marine',
    name: 'Polo à col contrasté · Bleu marine',
    category: 'polos',
    color: 'Bleu marine',
    shortDescription: 'Un polo bleu marine rehaussé d’un liseré ivoire au col et aux manches.',
    description:
      'La maille piquée et les finitions contrastées habillent une tenue simple. Portez-le avec un pantalon clair pour laisser ressortir le liseré.',
    material: 'Coton piqué',
    fit: 'Classique',
    featured: true,
  },
  {
    slug: 'polo-classique-blanc',
    name: 'Polo classique · Blanc',
    category: 'polos',
    color: 'Blanc',
    shortDescription: 'Un polo blanc à col uni et à manches courtes, facile à associer.',
    description:
      'La coupe classique reste droite sur le buste. Le col boutonné se porte ouvert pour une tenue décontractée ou fermé sous une veste légère.',
    material: 'Coton piqué',
    fit: 'Classique',
    featured: false,
  },
  {
    slug: 'chino-droit-beige',
    name: 'Chino coupe droite · Beige',
    category: 'pantalons',
    color: 'Beige',
    shortDescription: 'Un chino beige à jambe droite avec deux poches latérales.',
    description:
      'La toile de coton souple conserve une ligne droite du genou à l’ourlet. Associez-le à un polo noir et des baskets écrues.',
    material: 'Toile de coton',
    fit: 'Droite',
    featured: true,
  },
  {
    slug: 'pantalon-ajuste-noir',
    name: 'Pantalon coupe ajustée · Noir',
    category: 'pantalons',
    color: 'Noir',
    shortDescription: 'Un pantalon noir à la jambe légèrement resserrée, avec une finition sobre.',
    description:
      'La coupe suit la ligne de la jambe et se resserre à la cheville. Portez-le avec un polo blanc ou bleu marine.',
    material: 'Coton extensible',
    fit: 'Ajustée',
    featured: false,
  },
  {
    slug: 'chino-marine',
    name: 'Chino en toile de coton · Bleu marine',
    category: 'pantalons',
    color: 'Bleu marine',
    shortDescription: 'Un chino bleu marine avec poches latérales et fermeture zippée.',
    description:
      'La toile souple convient aux tenues de tous les jours. La jambe légèrement fuselée se porte avec des baskets basses ou des mocassins.',
    material: 'Toile de coton',
    fit: 'Fuselée',
    featured: true,
  },
] as const;

export type DemoAssetKey = (typeof references)[number]['slug'];

export const demoAssets = Object.fromEntries(
  references.map((reference) => [reference.slug, reference.name]),
) as Record<DemoAssetKey, string>;

export const demoCategories = [
  {
    slug: 'polos',
    name: 'Polos',
    description: 'Polos homme à manches courtes, à col uni ou contrasté.',
    imageKey: 'polo-pique-noir',
  },
  {
    slug: 'pantalons',
    name: 'Pantalons',
    description: 'Chinos et pantalons ajustés pour homme.',
    imageKey: 'chino-droit-beige',
  },
] as const;

export const demoProducts = references.map((reference) => {
  const isPolo = reference.category === 'polos';
  return {
    ...reference,
    imageKey: reference.slug,
    characteristics: [
      { label: 'Matière', value: reference.material },
      { label: 'Coupe', value: reference.fit },
      { label: 'Couleur', value: reference.color },
    ],
    variants: (isPolo ? ['S', 'M', 'L', 'XL'] : ['38', '40', '42', '44']).map((size) => ({
      label: `${reference.color} · ${size}`,
      sku: `${reference.slug}-${size}`,
      unit: size,
      packaging: reference.color,
      indicativePrice: isPolo ? 6500 : 8000,
      priceOnRequest: false,
      availability: 'available' as const,
      isActive: true,
    })),
  };
});
