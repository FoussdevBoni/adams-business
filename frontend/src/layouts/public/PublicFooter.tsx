import { Link } from 'react-router';
import { whatsappGroup, whatsappLink } from '../../core/content/shop';
import { quotationRequestPath } from '../../core/navigation/publicNavigation';

export function PublicFooter() {
  return (
    <footer className="shop-footer">
      <div className="shop-shell">
        <div className="shop-footer-grid">
          <div className="max-w-sm">
            <p className="font-display text-2xl font-bold tracking-tight text-white">
              Des essentiels bien coupés, livrés chez vous.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#a59d90]">
              Prêt-à-porter masculin, boutique en ligne au Bénin. Commande sur WhatsApp,
              vérification avant paiement.
            </p>
          </div>
          <div>
            <h2>La boutique</h2>
            <ul>
              <li>
                <Link to="/catalogue">Tout le vestiaire</Link>
              </li>
              <li>
                <Link to="/catalogue?categorie=polos">Polos</Link>
              </li>
              <li>
                <Link to="/catalogue?categorie=pantalons">Pantalons</Link>
              </li>
              <li>
                <Link to="/catalogue?collection=nouveautes">Nouveautés</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>Commander</h2>
            <ul>
              <li>
                <Link to={quotationRequestPath}>Mon panier</Link>
              </li>
              <li>Livraison gratuite à Cotonou et Abomey-Calavi</li>
            </ul>
          </div>
          <div>
            <h2>Nous suivre</h2>
            <ul>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noreferrer">
                  +229 01 94 71 71 13
                </a>
              </li>
              <li>
                <a href={whatsappGroup} target="_blank" rel="noreferrer">
                  Groupe WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="shop-footer-mark mt-14" aria-hidden="true">
          Adam’s Business
        </p>
        <p className="mt-6 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-5 text-xs text-[#8c857a]">
          <span>© {new Date().getFullYear()} Adam’s Business</span>
          <span>Boutique en ligne · Bénin</span>
        </p>
      </div>
    </footer>
  );
}
