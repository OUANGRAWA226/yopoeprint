# Guide de déploiement — YopoePrint

Boutique et back-office : **Vercel** · API : **Render** (Docker) · Base : **Supabase** (PostgreSQL)

Les adresses ci-dessous supposent le domaine `yopoeprint.bf`. Si vous lancez sur un autre
domaine, remplacez-le **partout** (boutique, admin, API, CinetPay, Google, Resend).

| Service   | Adresse de production               |
|-----------|-------------------------------------|
| Boutique  | `https://yopoeprint.bf`             |
| Admin     | `https://admin.yopoeprint.bf`       |
| API       | `https://yopoeprint-api.onrender.com` (ou `https://api.yopoeprint.bf`) |

---

## Prérequis

1. Code poussé sur GitHub (`git push`)
2. Comptes Vercel, Render (offre **Starter**, voir plus bas), Supabase, CinetPay, Cloudinary, Resend
3. Accès DNS au domaine (pour Vercel et pour Resend)

---

## Étape 1 — Base de données de production (Supabase)

1. Créer un **projet Supabase dédié à la production**. Ne jamais pointer un poste de dev
   (`NODE_ENV=development`, qui active `synchronize`) sur cette base.
2. Lancer les migrations **avant** la mise en service. Une base vide est prise en charge :
   la première migration (`InitialSchema`) crée `users`, `products`, `orders`.
   L'image Docker ne contient ni `src/` ni les devDependencies : exécuter depuis votre poste,
   avec les variables `DB_*` de production dans `yopoeprint-api/.env` :
   ```
   cd yopoeprint-api
   npm ci
   npm run migration:run
   ```
   À refaire à chaque déploiement qui ajoute un fichier dans `src/database/migrations/`.
3. Activer les sauvegardes (Supabase › Database › Backups ; l'offre gratuite n'a pas de restauration à un instant donné).

---

## Étape 2 — API NestJS (Render)

1. Render › **New** › **Web Service** › dépôt GitHub
2. **Root Directory** : `yopoeprint-api` · **Runtime** : `Docker` (build et start gérés par le Dockerfile)
3. **Instance** : **Starter (7 $/mois) minimum**. L'offre gratuite met l'API en veille après 15 min :
   premier visiteur bloqué ~30 s et notifications CinetPay perdues pendant le réveil.
4. **Environment Variables** — modèle complet et commenté : [`yopoeprint-api/.env.example`](yopoeprint-api/.env.example)

   | Variable | Valeur |
   |---|---|
   | `NODE_ENV` | `production` |
   | `BACKEND_URL` | URL publique de l'API (sert à la `notify_url` CinetPay) |
   | `FRONTEND_URL` | `https://yopoeprint.bf` (CORS, liens des emails, retour paiement) |
   | `ADMIN_URL` | `https://admin.yopoeprint.bf` |
   | `DB_HOST` · `DB_PORT` (`6543`) · `DB_USERNAME` · `DB_PASSWORD` · `DB_NAME` · `DB_SSL` (`true`) | Supabase › Settings › Database |
   | `JWT_SECRET` · `JWT_REFRESH_SECRET` | deux valeurs **différentes**, 32 caractères min. (commande ci-dessous) |
   | `ADMIN_SETUP_TOKEN` | code d'installation du premier admin (même commande) |
   | `CINETPAY_API_KEY` · `CINETPAY_SITE_ID` · `CINETPAY_SECRET_KEY` | tableau de bord CinetPay |
   | `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` | Cloudinary |
   | `RESEND_API_KEY` · `EMAIL_FROM` | Resend ; ex. `YopoePrint <noreply@yopoeprint.bf>` |
   | `GOOGLE_CLIENT_ID` | Google Cloud Console (voir étape 6) |

   Générer un secret :
   ```
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Au démarrage, l'API **refuse de démarrer** sans `DB_HOST`, `DB_PASSWORD`, `JWT_SECRET`,
   `JWT_REFRESH_SECRET`, et **écrit une erreur dans les logs Render** pour chaque autre variable
   manquante. Après le premier déploiement, lire les logs : aucune ligne `[Config]` ne doit rester.
5. **Create Web Service** → vérifier `GET https://<api>/api/v1/payments/webhook` → `{"status":"ok"}`.

---

## Étape 3 — Boutique (Vercel)

1. Vercel › **Add New Project** › dépôt GitHub · **Root Directory** : `/` (racine)
2. Variables — modèle : [`.env.example`](.env.example)

   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<api>/api/v1` |
   | `NEXT_PUBLIC_SITE_URL` | `https://yopoeprint.bf` (= `FRONTEND_URL` de l'API) |
   | `NEXT_PUBLIC_CONTACT_PHONE` | vrai numéro, ex. `+22670123456` (sinon numéro factice affiché) |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | = `GOOGLE_CLIENT_ID` de l'API |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dtie3vgyz` |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `useProducts` |

3. **Settings › Domains** : ajouter `yopoeprint.bf` et `www.yopoeprint.bf`.
4. Les variables `NEXT_PUBLIC_*` sont figées au build : **redéployer** après chaque modification.

---

## Étape 4 — Back-office (Vercel, second projet)

1. Vercel › **Add New Project** › **même dépôt** · **Root Directory** : `yopoeprint-admin`
2. Variables — modèle : [`yopoeprint-admin/.env.example`](yopoeprint-admin/.env.example)
   (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`)
3. **Domains** : `admin.yopoeprint.bf` (doit correspondre à `ADMIN_URL` de l'API).

---

## Étape 5 — Premier administrateur (immédiatement après le déploiement)

1. Ouvrir `https://admin.yopoeprint.bf/admin-setup` › **Créer un nouveau compte admin**.
2. Saisir le **code d'installation** (valeur de `ADMIN_SETUP_TOKEN`), puis vos informations.
   Ce compte devient **super administrateur**.
3. La route se ferme d'elle-même dès qu'un compte d'équipe existe. Vous pouvez ensuite
   vider `ADMIN_SETUP_TOKEN` sur Render.
4. Dans l'admin : créer le catalogue (produits, prix, options), les paramètres (zones de livraison,
   coordonnées, mentions légales), les bannières, et désactiver les codes promo de démonstration
   (`YOPPRINT15`, `YOPOE10`, `BURKINA`, `PROMO20`) s'ils ne sont pas voulus.

---

## Étape 6 — Services externes

**CinetPay** (tableau de bord)
- Notify URL : `https://<api>/api/v1/payments/webhook` (vérifiée en `GET`, notifications en `POST` signées `x-token`)
- Return URL : `https://yopoeprint.bf/commande/confirmation`
- Faire **un vrai paiement** de faible montant avec Orange Money, Moov Money et une carte, puis
  vérifier dans l'admin › Paiements que la commande passe à « payée » sans intervention.

**Resend**
- Domains › ajouter le domaine d'`EMAIL_FROM` et créer les enregistrements DNS (SPF, DKIM).
  Tant que le domaine n'est pas vérifié, les envois échouent (admin › Emails : statut « failed »).

**Google Identity Services**
- Google Cloud Console › Identifiants › ID client OAuth « Application Web » :
  **Origines JavaScript autorisées** = `https://yopoeprint.bf` et `https://www.yopoeprint.bf`.

**Surveillance**
- UptimeRobot (ou équivalent) sur `https://<api>/api/v1/payments/webhook` et la boutique.

---

## Vérifications avant ouverture

| Test | Attendu |
|---|---|
| Logs Render au démarrage | aucune ligne `[Config] … non définie` |
| `https://yopoeprint.bf` · `/catalogue` · une fiche produit | pages et prix affichés |
| Partage d'un lien sur WhatsApp | aperçu avec l'image YopoePrint |
| Inscription email + « Continuer avec Google » | compte créé, email de bienvenue reçu |
| Commande + paiement réel | statut « payée », email de confirmation, lien de suivi fonctionnel |
| `https://admin.yopoeprint.bf/admin-setup` (après installation) | création refusée |

---

## Notes

- 🔒 Ne jamais committer de fichier `.env` avec de vraies valeurs : uniquement les variables des plateformes.
- Swagger (`/docs`) est désactivé en production.
