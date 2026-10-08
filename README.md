# YopoePrint — Frontend Next.js

Plateforme d'imprimerie en ligne pour le Burkina Faso, inspirée de HelloPrint.

---

## 🚀 Installation rapide (Windows)

### Prérequis

1. **Node.js 18+** — Télécharger sur https://nodejs.org (choisir LTS)
2. **VS Code** — Télécharger sur https://code.visualstudio.com
3. **Git** — Télécharger sur https://git-scm.com

### Démarrer le projet

Ouvrez un terminal (PowerShell ou CMD) dans le dossier du projet :

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir dans le navigateur
# → http://localhost:3000
```

---

## 📁 Structure du projet

```
yopoeprint/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── layout.tsx          # Layout global (nav, footer)
│   │   ├── catalogue/          # Page catalogue
│   │   ├── produit/[slug]/     # Page produit individuelle
│   │   ├── panier/             # Page panier
│   │   ├── commande/           # Tunnel de commande
│   │   ├── mon-compte/         # Espace client
│   │   ├── devis/              # Demande de devis
│   │   ├── blog/               # Blog & ressources
│   │   └── connexion/          # Page de connexion
│   │
│   ├── components/
│   │   ├── layout/             # Topbar, Navbar, MenuBar, Footer
│   │   ├── home/               # Sections de la page d'accueil
│   │   ├── product/            # ProductCard, ProductConfigurator
│   │   ├── ui/                 # Composants UI réutilisables
│   │   └── shared/             # Composants partagés
│   │
│   ├── lib/
│   │   └── data.ts             # Données produits + utilitaires prix
│   │
│   ├── hooks/
│   │   └── useCart.ts          # Store Zustand panier
│   │
│   ├── types/
│   │   └── index.ts            # Types TypeScript
│   │
│   └── styles/
│       └── globals.css         # Styles globaux + design tokens
│
├── public/                     # Assets statiques
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🎨 Couleurs de la marque

| Variable       | Couleur   | Usage                        |
|---------------|-----------|------------------------------|
| `blue-deep`   | `#0E2347` | Fond sombre, texte principal |
| `blue-mid`    | `#1A3A6B` | Boutons, liens, nav          |
| `blue-light`  | `#2A5298` | Variantes bleues             |
| `blue-pale`   | `#E8EEF8` | Fonds clairs, hover          |
| `gold`        | `#C9A84C` | Accent principal, CTA        |
| `gold-light`  | `#E2C46E` | Hover gold                   |
| `gold-pale`   | `#FDF6E3` | Fonds gold clair             |

---

## 🔧 Technologies utilisées

| Couche         | Technologie          | Version  |
|---------------|----------------------|----------|
| Framework     | Next.js (App Router) | 14.2.5   |
| Langage       | TypeScript           | 5.x      |
| Styles        | Tailwind CSS         | 3.4.x    |
| State         | Zustand              | 4.5.x    |
| Icons         | Lucide React         | 0.383    |
| Animations    | Framer Motion        | 11.x     |
| Formulaires   | React Hook Form + Zod| Latest   |

---

## 📄 Pages principales

| URL                      | Page                              | Statut   |
|--------------------------|-----------------------------------|----------|
| `/`                      | Accueil                           | ✅ Prêt  |
| `/catalogue`             | Catalogue produits                | ✅ Prêt  |
| `/produit/[slug]`        | Page produit + configurateur      | ✅ Prêt  |
| `/panier`                | Panier                            | ✅ Prêt  |
| `/connexion`             | Connexion                         | ✅ Prêt  |
| `/commande`              | Tunnel de commande                | 🔄 À dev |
| `/mon-compte`            | Espace client                     | 🔄 À dev |
| `/devis`                 | Demande de devis                  | 🔄 À dev |
| `/blog`                  | Blog                              | 🔄 À dev |
| `/inscription`           | Inscription                       | 🔄 À dev |

---

## 🗺️ Prochaines étapes

### Phase 1 (Semaine 1-2) — Pages restantes
- [ ] Page inscription
- [ ] Page commande (tunnel 3 étapes)
- [ ] Espace client (historique commandes)
- [ ] Page devis

### Phase 2 (Semaine 3-4) — Intégrations
- [ ] Intégration CinetPay (Orange Money, Moov Money)
- [ ] Authentification Clerk
- [ ] Connexion backend NestJS

### Phase 3 (Mois 2) — Backend
- [ ] API NestJS (produits, commandes, clients)
- [ ] Base de données PostgreSQL (Supabase)
- [ ] Upload fichiers Cloudinary
- [ ] Notifications SMS (Hub2) et email (Resend)

---

## 📱 Extensions VS Code recommandées

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript React code snippets
- GitLens

---

## 🆘 Problèmes fréquents

**Erreur `npm install` :** Vérifiez la version de Node.js (`node -v` doit être ≥ 18)

**Port 3000 occupé :** `npm run dev -- -p 3001`

**Erreurs TypeScript :** Normal pendant le développement, ignorez les warnings.

---

*YopoePrint — contact@yopoeprint.bf · Ouagadougou, Burkina Faso*
