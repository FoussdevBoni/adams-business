import { Images, LayoutTemplate, Package, Tags } from 'lucide-react';
import { Link } from 'react-router';

const links = [
  {
    path: 'products',
    label: 'Produits',
    detail: 'Articles, prix, variantes et disponibilités',
    icon: Package,
  },
  {
    path: 'categories',
    label: 'Catégories',
    detail: 'Organiser les collections de la boutique',
    icon: Tags,
  },
  { path: 'media', label: 'Photographies', detail: 'Importer et gérer les images', icon: Images },
  {
    path: 'pages',
    label: 'Contenus',
    detail: 'Modifier et publier les textes de la boutique',
    icon: LayoutTemplate,
  },
];

export function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Administration de la boutique</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {links.map(({ path, label, detail, icon: Icon }) => (
          <li key={path}>
            <Link
              className="block h-full border border-forest/15 bg-paper p-5 hover:bg-sand/30"
              to={path}
            >
              <Icon aria-hidden="true" size={22} />
              <h2 className="mt-3 text-lg font-bold">{label}</h2>
              <p>{detail}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
