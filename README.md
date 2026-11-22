# Adam’s Business

Boutique béninoise de prêt-à-porter masculin. Le catalogue et l’administration reposent sur React/Vite, Node.js/Express et MongoDB Atlas via Mongoose. La commande se finalise sur WhatsApp. La livraison est gratuite à Cotonou et Abomey-Calavi, avec possibilité de vérifier les articles avant paiement.

## Démarrer

Utilisez Node.js 22 et le gestionnaire de paquets du dépôt, pnpm 10. Les scripts se lancent directement sur la machine.

1. Installez les dépendances avec `pnpm install --frozen-lockfile`.
2. Utilisez `backend/.env.example` pour configurer `backend/.env`. Renseignez **MONGODB_URI** avec l’URI Atlas `mongodb+srv://…/adams_business?…` d’un compte limité à cette base, puis autorisez votre adresse IP dans Atlas. Importez les paramètres de cette boutique uniquement.
3. Lancez `pnpm --filter @adams-business/backend db:check`, puis `pnpm dev` à la racine. Ouvrez `http://localhost:5173`. Vite relaie les appels à l’API sur le port 4000.
4. Créez le premier compte, puis ouvrez le lien d’activation unique imprimé par le script. La connexion se trouve sur `/connexion`.

```sh
pnpm --filter @adams-business/backend admin:create-super --email votre-adresse --name "Votre nom"
```

Pour enregistrer les photos en développement, configurez `MEDIA_LOCAL_DIR=.shop-media` et `APP_PUBLIC_URL=http://localhost:5173`. Pour un hébergement persistant, configurez Cloudinary avec un dossier dédié à la boutique et alimentez la médiathèque sur cet environnement.

## Charger le catalogue illustratif

Après activation du compte administrateur, exécutez la simulation, puis l’import avec `--apply`.

```sh
pnpm --filter @adams-business/backend seed:demo
pnpm --filter @adams-business/backend seed:demo --apply
```

Le script crée deux catégories et six références illustratives administrables, avec des visuels générés et 24 variantes. Les références illustratives ne représentent pas le stock réel. Les prix communiqués sont de 6 500 FCFA pour les polos et 8 000 FCFA pour les pantalons. Le catalogue publie uniquement les articles administrés via le backend.

Dans `/dashboard`, gérez les produits, catégories, médias et contenus. Chaque variante possède une taille, une couleur, un prix et une disponibilité. Le stockage existant conserve la taille dans `unit` et la couleur dans `packaging`.

## Vérifications

```sh
pnpm typecheck
pnpm build
pnpm --filter @adams-business/frontend test
```

Les tests backend qui utilisent une vraie base exigent une URI Atlas distincte dans `MONGODB_TEST_URI`, pointant vers `adams_business_test`. Utilisez un compte limité à la base de test.

