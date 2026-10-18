# ╔══════════════════════════════════════════════════════════════════════════╗
# ║             GUIDE DE DÉPLOIEMENT — YOPOEPRINT                           ║
# ║  Frontend : Vercel | Backend : Render | DB : Supabase                   ║
# ╚══════════════════════════════════════════════════════════════════════════╝

## PRÉREQUIS
1. Compte GitHub avec le code pushé (`git push`)
2. Compte Vercel (vercel.com) — gratuit
3. Compte Render (render.com) — gratuit tier disponible
4. Supabase (déjà configuré selon le .env)

---

## ÉTAPE 1 : Déployer le Backend NestJS sur Render

1. Aller sur https://render.com → **New** → **Web Service**
2. Connecter votre repo GitHub → choisir le dossier `yopoeprint-api`
3. Configurer le service :
   - **Root Directory** : `yopoeprint-api`
   - **Runtime** : `Docker` (notre Dockerfile est prêt)
   - **Build Command** : *(laissé vide, le Dockerfile gère tout)*
   - **Start Command** : *(laissé vide, CMD dans le Dockerfile)*
4. Dans **Environment Variables**, ajouter :

   | Variable              | Valeur                                         |
   |-----------------------|------------------------------------------------|
   | `NODE_ENV`            | `production` **(obligatoire)**                 |
   | `BACKEND_URL`         | `https://yopoeprint-api.onrender.com` **(obligatoire — sert à construire la notify_url CinetPay ; sans elle : `localhost`)** |
   | `PORT`                | `3001`                                         |
   | `API_PREFIX`          | `api/v1`                                       |
   | `DB_HOST`             | *(depuis Supabase → Settings → Database)*       |
   | `DB_PORT`             | `6543`                                         |
   | `DB_USERNAME`         | `postgres.[VOTRE_PROJECT_REF]`                 |
   | `DB_PASSWORD`         | `[VOTRE_MOT_DE_PASSE_SUPABASE]`                |
   | `DB_NAME`             | `postgres`                                     |
   | `DB_SSL`              | `true`                                         |
   | `JWT_SECRET`          | *(générer avec la commande ci-dessous)*         |
   | `JWT_EXPIRES_IN`      | `7d`                                           |
   | `FRONTEND_URL`        | `https://yopoeprint.vercel.app`                |
   | `CINETPAY_API_KEY`    | *(depuis votre tableau de bord CinetPay)*       |
   | `CINETPAY_SITE_ID`    | *(depuis votre tableau de bord CinetPay)*       |
   | `CINETPAY_SECRET_KEY` | *(clé secrète CinetPay)* **(obligatoire — vérification HMAC de l'en-tête `x-token` du webhook)** |
   | `CLOUDINARY_CLOUD_NAME`| `dtie3vgyz`                                   |
   | `CLOUDINARY_API_KEY`  | *(depuis Cloudinary)*                          |
   | `CLOUDINARY_API_SECRET`| *(depuis Cloudinary)*                         |

   🔐 **Pour générer JWT_SECRET** (exécuter dans un terminal) :
   ```
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Lancer les migrations TypeORM** sur la base Supabase **avant la mise en service**
   (`synchronize` est désactivé en production : sans migrations, le schéma n'est pas à jour).
   L'image Docker ne contient ni `src/` ni les devDependencies : exécuter la commande
   depuis votre poste (ou la CI), avec les mêmes variables `DB_*` que Render dans
   `yopoeprint-api/.env` :
   ```
   cd yopoeprint-api
   npm ci
   npm run migration:run
   ```
   À refaire à chaque déploiement qui ajoute une migration (`src/database/migrations/`).
6. Cliquer **Create Web Service** → attendre la fin du build (~3-5 min).
7. Récupérer l'URL de votre API, ex: `https://yopoeprint-api.onrender.com`
   (elle doit correspondre à `BACKEND_URL`).

---

## ÉTAPE 2 : Déployer le Frontend Next.js sur Vercel

1. Aller sur https://vercel.com → **Add New Project**
2. Importer votre repo GitHub (dossier racine `yopoeprint/`)
3. Framework auto-détecté : **Next.js** ✅
4. Dans **Environment Variables**, ajouter :

   | Variable                           | Valeur                                           |
   |------------------------------------|--------------------------------------------------|
   | `NEXT_PUBLIC_API_URL`              | `https://yopoeprint-api.onrender.com/api/v1`     |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`| `dtie3vgyz`                                      |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`| `useProducts`                                 |

5. Cliquer **Deploy** → attendre ~2 min.
6. Votre URL de production : `https://yopoeprint.vercel.app` 🎉

---

## ÉTAPE 3 : Vérifications Post-Déploiement

Tester manuellement ces URL dans le navigateur :

| Test                    | URL                                                    |
|-------------------------|--------------------------------------------------------|
| API Health              | `GET https://yopoeprint-api.onrender.com/api/v1`       |
| Page d'accueil          | `https://yopoeprint.vercel.app`                        |
| Catalogue               | `https://yopoeprint.vercel.app/catalogue`              |
| Login                   | `https://yopoeprint.vercel.app/compte/connexion`       |

---

## ÉTAPE 4 : Configurer le Webhook CinetPay

Une fois les deux services en ligne, aller dans votre tableau de bord CinetPay :
- **Notify URL** : `https://yopoeprint-api.onrender.com/api/v1/payments/webhook`
  (CinetPay la vérifie d'abord en `GET`, puis notifie en `POST` avec l'en-tête `x-token`
  signé par `CINETPAY_SECRET_KEY`)
- **Return URL** : `https://yopoeprint.vercel.app/commande/confirmation`

---

## NOTES IMPORTANTES

- ⚠️ Render Free Tier "endort" l'instance après 15 min d'inactivité. La première
  requête après une période d'inactivité peut prendre ~30 secondes.
  Pour éviter cela, passer en **Starter ($7/mois)** ou utiliser un cron job
  de "keep-alive" (ex: une requête toutes les 10 min via UptimeRobot).

- ✅ Vercel est toujours actif et sans cold start pour Next.js (serverless).

- 🔒 Ne jamais committer le fichier `.env` avec de vraies valeurs.
  Utiliser uniquement les variables d'environnement des plateformes.
