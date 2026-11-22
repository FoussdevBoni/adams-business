import { ArrowRight, ArrowUpRight, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router';
import { Reveal } from '../../core/components/Reveal';
import { whatsappGroup } from '../../core/content/shop';
import { useDocumentMeta } from '../../core/hooks/useDocumentMeta';
import { SectionRenderer } from '../../modules/pages/components/SectionRenderer';
import { usePublishedPage } from '../../modules/pages/hooks/usePages';
import { ProductCard, ProductGridSkeleton } from '../../modules/products/components/ProductCard';
import { usePublicProducts } from '../../modules/products/hooks/useProducts';

const collections = [
  {
    label: 'Polos',
    price: '6 500 FCFA',
    path: '/catalogue?categorie=polos',
    image: '/images/adams-polo.jpg',
  },
  {
    label: 'Pantalons',
    price: '8 000 FCFA',
    path: '/catalogue?categorie=pantalons',
    image: '/images/adams-pantalon.jpg',
  },
] as const;

export function HomePage() {
  const page = usePublishedPage('home');
  const products = usePublicProducts({
    page: 1,
    search: '',
    category: '',
    sort: 'newest',
    featured: true,
    limit: 4,
  });
  const hero = page.data?.sections.find((section) => section.type === 'hero')?.data;
  const media = typeof hero?.imageId === 'string' ? page.data?.media[hero.imageId] : undefined;
  const title =
    typeof hero?.title === 'string' ? hero.title : 'Les essentiels du vestiaire masculin';
  const subtitle =
    typeof hero?.subtitle === 'string'
      ? hero.subtitle
      : 'Polos à 6 500 FCFA et pantalons à 8 000 FCFA. Trouvez votre coupe et commandez sur WhatsApp.';
  useDocumentMeta({
    title: page.data?.seo.title || 'Prêt-à-porter masculin',
    description: page.data?.seo.description || subtitle,
  });

  return (
    <>
      <section className="shop-hero">
        <div className="shop-hero-media">
          <img
            src={media?.url ?? '/images/adams-campagne.jpg'}
            alt={media?.alt ?? 'Polo noir en coton piqué porté par un mannequin'}
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="shop-hero-copy">
          <div>
            <p className="shop-eyebrow shop-fade-in">Prêt-à-porter masculin · Bénin</p>
            <h1 className="shop-display">
              <span className="shop-hero-line">
                <span>{title}</span>
              </span>
            </h1>
            {subtitle && <p className="shop-hero-lead shop-fade-in">{subtitle}</p>}
            <div className="shop-hero-actions shop-fade-in">
              <Link to="/catalogue" className="shop-button">
                Découvrir la collection
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <dl className="shop-hero-aside shop-fade-in">
            {collections.map((collection) => (
              <div key={collection.label}>
                <dt className="shop-eyebrow">{collection.label}</dt>
                <dd className="shop-price mt-1 text-lg">{collection.price}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ul className="shop-shell shop-benefits" aria-label="Nos engagements">
        <li>
          <Truck size={19} strokeWidth={1.6} aria-hidden="true" /> Livraison gratuite à Cotonou et
          Abomey-Calavi
        </li>
        <li>
          <ShieldCheck size={19} strokeWidth={1.6} aria-hidden="true" /> Vérification avant paiement
        </li>
        <li>
          <MessageCircle size={19} strokeWidth={1.6} aria-hidden="true" /> Commande simple sur
          WhatsApp
        </li>
      </ul>

      <section className="shop-shell shop-section" aria-labelledby="collections">
        <Reveal className="shop-section-heading">
          <div>
            <p className="shop-eyebrow">Le vestiaire</p>
            <h2 id="collections" className="shop-title">
              Les collections
            </h2>
          </div>
          <Link to="/catalogue" className="shop-link">
            Tout voir <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Reveal>
        <div className="shop-collections">
          {collections.map((collection, index) => (
            <Reveal key={collection.label} delay={index * 0.1}>
              <Link to={collection.path} className="shop-collection">
                <div className="shop-collection-media">
                  <img src={collection.image} alt="" loading="lazy" decoding="async" />
                </div>
                <span className="shop-collection-label">
                  <span>
                    <strong>{collection.label}</strong>
                    <small>{collection.price}</small>
                  </span>
                  <span className="shop-collection-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shop-shell pb-[clamp(3.5rem,8vw,6.5rem)]" aria-labelledby="new">
        <Reveal className="shop-section-heading">
          <div>
            <p className="shop-eyebrow">Sélection</p>
            <h2 id="new" className="shop-title">
              À découvrir
            </h2>
          </div>
          <Link to="/catalogue?collection=nouveautes" className="shop-link">
            Voir les nouveautés <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </Reveal>
        {products.isPending && <ProductGridSkeleton />}
        {products.isError && (
          <div className="border border-line bg-paper p-6 text-sm">
            <p>Les articles n’ont pas pu être chargés.</p>
            <button
              type="button"
              className="shop-link mt-3"
              onClick={() => void products.refetch()}
            >
              Réessayer le chargement
            </button>
          </div>
        )}
        {products.data && (
          <ul className="shop-products">
            {products.data.items.map((product, index) => (
              <Reveal as="li" key={product.id} delay={index * 0.07}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      {page.data && (
        <SectionRenderer
          sections={page.data.sections.filter((section) => section.type !== 'hero')}
          media={page.data.media}
        />
      )}

      <section className="bg-forest text-ivory" aria-labelledby="how">
        <div className="shop-shell shop-section">
          <Reveal className="mb-10 grid gap-4 md:mb-14 md:grid-cols-2 md:items-end">
            <div>
              <p className="shop-eyebrow !text-sprout">Commander</p>
              <h2 id="how" className="shop-title mt-3">
                Trois étapes, aucune inscription.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ivory/70 md:justify-self-end">
              Votre panier est transmis à Adam’s Business sur WhatsApp. Nous confirmons la
              disponibilité et convenons ensemble de la livraison.
            </p>
          </Reveal>
          <ol className="shop-steps">
            <Reveal as="li">
              <h3>Choisissez votre article</h3>
              <p>Sélectionnez la couleur et la taille qui vous conviennent.</p>
            </Reveal>
            <Reveal as="li" delay={0.08}>
              <h3>Préparez votre panier</h3>
              <p>Ajustez les quantités, le total se met à jour instantanément.</p>
            </Reveal>
            <Reveal as="li" delay={0.16}>
              <h3>Envoyez sur WhatsApp</h3>
              <p>Le récapitulatif est rédigé pour vous. Vous vérifiez avant de payer.</p>
            </Reveal>
          </ol>
        </div>
      </section>

      <section className="shop-shell shop-section" aria-labelledby="community">
        <Reveal className="grid items-end gap-6 border-t border-forest pt-8 md:grid-cols-[1fr_auto] md:pt-10">
          <div>
            <p className="shop-eyebrow">Communauté</p>
            <h2 id="community" className="shop-title mt-3 max-w-[16ch]">
              Les nouveautés sur WhatsApp
            </h2>
            <p className="mt-4 max-w-md text-charcoal/75">
              Découvrez les prochains arrivages dans le groupe Adam’s Business.
            </p>
          </div>
          <a
            href={whatsappGroup}
            target="_blank"
            rel="noreferrer"
            className="shop-button shop-button--ghost"
          >
            Rejoindre le groupe <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </Reveal>
      </section>
    </>
  );
}
