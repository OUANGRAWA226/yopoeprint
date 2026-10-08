# YopoePrint API — Backend NestJS

API REST complète pour la plateforme d'imprimerie en ligne YopoePrint.

---

## 🚀 Installation rapide (Windows)

### 1. Prérequis

- **Node.js 18+** → https://nodejs.org
- **Compte Supabase** → https://supabase.com (gratuit)
- **VS Code** → https://code.visualstudio.com

### 2. Installer les dépendances

```bash
cd yopoeprint-api
npm install
```

### 3. Configurer Supabase

**a) Créer un projet Supabase**
- Allez sur https://supabase.com → New Project
- Choisissez un nom : `yopoeprint`
- Choisissez un mot de passe fort
- Région : `West EU` (la plus proche)

**b) Récupérer les credentials**
- Dashboard Supabase → Settings → Database
- Copiez : Host, Port, User, Password, Database

**c) Créer le fichier .env**
```bash
# Copier le fichier exemple
cp .env.example .env
# Puis remplir avec vos vraies valeurs
```

### 4. Lancer le serveur

```bash
# Mode développement (avec hot-reload)
npm run start:dev

# Le serveur démarre sur : http://localhost:3001
# Documentation Swagger : http://localhost:3001/docs
```

---

## 🗄️ Configuration Supabase (.env)

```env
DB_HOST=db.VOTRE_REF.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE
DB_NAME=postgres
DB_SSL=true
```

> ⚠️ En mode `development`, les tables sont **créées automatiquement** au démarrage (`synchronize: true`).
> En production, utilisez les migrations.

---

## 💳 Configuration CinetPay

1. Créez un compte sur https://cinetpay.com
2. Allez dans **API & Integration**
3. Copiez votre `API Key` et `Site ID`

```env
CINETPAY_API_KEY=votre_api_key
CINETPAY_SITE_ID=votre_site_id
CINETPAY_SECRET_KEY=votre_secret
```

**Modes de paiement supportés :**
| Méthode       | Code       | Disponible |
|--------------|------------|------------|
| Orange Money | XOF        | ✅ BF      |
| Moov Money   | XOF        | ✅ BF      |
| Visa         | XOF        | ✅         |
| Mastercard   | XOF        | ✅         |

---

## 📋 Routes de l'API

### 🔐 Authentification — `/api/v1/auth`

| Méthode | Route           | Description          | Auth |
|---------|-----------------|----------------------|------|
| POST    | `/register`     | Créer un compte      | ❌   |
| POST    | `/login`        | Se connecter         | ❌   |
| POST    | `/logout`       | Se déconnecter       | ✅   |
| GET     | `/me`           | Mon profil           | ✅   |
| POST    | `/refresh`      | Renouveler le token  | ❌   |

### 📦 Produits — `/api/v1/products`

| Méthode | Route                   | Description              | Auth     |
|---------|-------------------------|--------------------------|----------|
| GET     | `/`                     | Liste des produits        | ❌       |
| GET     | `/popular`              | Produits populaires       | ❌       |
| GET     | `/:slug`                | Détail d'un produit       | ❌       |
| POST    | `/calculate-price`      | Calculer un prix          | ❌       |
| POST    | `/`                     | Créer un produit          | ✅ Admin |
| PUT     | `/:id`                  | Modifier un produit       | ✅ Admin |
| PATCH   | `/:id/toggle`           | Activer/désactiver        | ✅ Admin |

### 🛒 Commandes — `/api/v1/orders`

| Méthode | Route                    | Description              | Auth     |
|---------|--------------------------|--------------------------|----------|
| POST    | `/`                      | Créer une commande        | ✅       |
| GET     | `/my-orders`             | Mes commandes             | ✅       |
| GET     | `/my-orders/:id`         | Détail commande           | ✅       |
| GET     | `/track/:orderNumber`    | Suivi public              | ❌       |
| GET     | `/`                      | Toutes les commandes      | ✅ Admin |
| PATCH   | `/:id/status`            | Changer le statut         | ✅ Admin |

### 💳 Paiements — `/api/v1/payments`

| Méthode | Route                     | Description                  | Auth |
|---------|---------------------------|------------------------------|------|
| POST    | `/:orderId/init`          | Initier un paiement CinetPay | ✅   |
| GET     | `/:orderId/status`        | Statut du paiement           | ✅   |
| POST    | `/webhook`                | Webhook CinetPay             | ❌   |
| GET     | `/verify/:transactionId`  | Vérifier un paiement         | ✅   |

---

## 📁 Structure du projet

```
yopoeprint-api/
├── src/
│   ├── main.ts                     # Démarrage + Swagger + CORS
│   ├── app.module.ts               # Module racine
│   ├── config/                     # Variables d'environnement typées
│   ├── database/
│   │   └── data-source.ts          # Configuration TypeORM
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts   # Protection routes JWT
│   │   │   └── admin.guard.ts      # Protection routes admin
│   │   ├── decorators/
│   │   │   └── current-user.ts     # @CurrentUser()
│   │   └── filters/
│   │       └── global-exception.filter.ts
│   └── modules/
│       ├── auth/
│       │   ├── auth.service.ts     # Register, Login, JWT
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.dto.ts
│       │   └── jwt.strategy.ts
│       ├── products/
│       │   ├── products.service.ts # CRUD + calcul prix
│       │   ├── products.controller.ts
│       │   ├── products.module.ts
│       │   ├── product.entity.ts   # Table "products"
│       │   └── product.dto.ts
│       ├── orders/
│       │   ├── orders.service.ts   # Création + suivi commandes
│       │   ├── orders.controller.ts
│       │   ├── orders.module.ts
│       │   ├── order.entity.ts     # Table "orders"
│       │   └── order.dto.ts
│       ├── payments/
│       │   ├── payments.service.ts # CinetPay integration
│       │   ├── payments.controller.ts
│       │   └── payments.module.ts
│       └── users/
│           └── user.entity.ts      # Table "users"
```

---

## 🔄 Flux de paiement CinetPay

```
Client                    API YopoePrint           CinetPay
  │                            │                       │
  │── POST /orders ──────────► │                       │
  │◄─ { orderId, total } ──── │                       │
  │                            │                       │
  │── POST /payments/:id/init ►│                       │
  │                            │── POST /payment ─────►│
  │                            │◄─ { paymentUrl } ─── │
  │◄─ { paymentUrl } ──────── │                       │
  │                            │                       │
  │── Redirect paymentUrl ─────────────────────────►  │
  │◄─ Paiement Orange/Moov/Visa ────────────────────  │
  │                            │                       │
  │                            │◄── Webhook POST ───── │
  │                            │    (confirmation)     │
  │                            │── Confirme commande   │
  │◄── Redirect return_url ─── │                       │
```

---

## 🔧 Scripts disponibles

```bash
npm run start:dev      # Développement avec hot-reload
npm run build          # Compiler pour production
npm run start          # Démarrer en production
npm run migration:run  # Appliquer les migrations
```

---

## 🔗 Connexion avec le Frontend Next.js

Dans votre frontend YopoePrint, créez `src/lib/api.ts` :

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

---

*YopoePrint API v1.0 · contact@yopoeprint.bf · Ouagadougou, Burkina Faso*
