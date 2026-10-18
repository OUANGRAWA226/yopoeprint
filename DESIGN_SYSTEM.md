# Système de design — boutique YopoePrint

Règles en vigueur sur le storefront (`src/`). Les valeurs viennent de `tailwind.config.js` et `src/styles/globals.css` : on n'écrit plus de couleurs ni de tailles en dur.

## Couleurs

| Rôle | Classe | Usage |
|---|---|---|
| Action | `primary` (vert, `--primary: 146 100% 24%`) | Boutons d'action, liens d'action, sélection. **Seule couleur d'action** : pas d'orange, de rouge ou d'ambre pour les CTA. |
| Texte principal | `foreground` / `gray-900` | Titres, texte courant |
| Texte secondaire | `gray-600` (corps), `gray-500` (mentions) | Jamais `gray-300`/`gray-400` pour du texte sur fond clair (contraste < 4,5:1) |
| Fonds | `white`, `gray-50`, `gray-100` | Pages et cartes |
| Fond sombre | `gray-900` / `gray-950` | Bandeaux, pied de page. Texte : `white`, `gray-300`, `gray-400` ; accent : `emerald-400` (pas `primary`, trop sombre sur fond sombre) |
| Sémantique | `red-600` erreur, `amber-700` avertissement, `emerald-700` succès | Messages d'état uniquement |

- Une seule famille de gris : **`gray`** (plus de `slate`).
- Texte blanc sur fond coloré : teinte **700** minimum (`emerald-700`, `amber-700`, `teal-700`).
- Couleurs de marque tierces autorisées : WhatsApp (`#25D366`), Orange Money (`orange-500`), Moov (`sky-500`).

## Typographie

- Polices : `font-display` (Poppins) pour les titres, `font-sans` (Inter) pour le reste.
- Échelle : `text-2xs` (11 px, libellés courts et badges uniquement), `text-xs` 12, `text-sm` 14, `text-base` 16, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`.
- Pas de taille arbitraire (`text-[13px]`…), sauf les annotations de schémas techniques (`text-[10px]`).
- Graisses : `font-medium`, `font-semibold`, `font-bold`, `font-extrabold` (titres). Pas de `font-black`.
- Montants et quantités : `tabular-nums` (police normale). `font-mono` réservé aux codes : n° de commande, références, codes promo, dimensions.

## Formes

- Arrondis : `rounded-lg` (champs, badges), `rounded-xl` (boutons, cartes), `rounded-2xl` (panneaux), `rounded-3xl` (grands blocs), `rounded-full` (pastilles, avatars).
- Pas de rayon arbitraire (`rounded-[32px]`).

## Icônes

- Une seule bibliothèque dans l'interface : **lucide-react**.
- Pas d'emoji ni de caractère Unicode (▭, ⇌, ✨…) comme icône de bouton ou d'option. Les emojis restent tolérés dans le contenu éditorial.

## Accessibilité

- Focus clavier : anneau global `:focus-visible` (2 px, couleur `--ring`) défini dans `globals.css` ; ne pas le masquer.
- Boutons icône seule : `aria-label` obligatoire ; bascules : `aria-pressed`.
- Contraste mesuré : 4,5:1 pour le texte courant, 3:1 au-delà de 24 px (ou 18,66 px en gras).

- Lien d'évitement « Aller au contenu » (premier élément au clavier) vers `<main id="contenu">`, dans `ConditionalUI`.
- Animations : le réglage système « réduire les animations » coupe défilement doux, animations décoratives et rotation automatique du carrousel (`globals.css`, `page.tsx`). Le carrousel se met aussi en pause au survol et au focus clavier.

## États

- Chargement : squelettes (`Skeleton` de `src/components/ui/Skeleton.tsx`) à la forme du contenu ; spinner seulement dans un bouton en cours d'envoi.
- Messages de formulaire : composant `Alert` (`src/components/ui/Alert.tsx`), tons `error` (annoncé aux lecteurs d'écran), `success`, `info`. Pas de bloc d'alerte écrit à la main.
- Erreur réseau ≠ liste vide : afficher « … ne répond pas » avec un bouton **Réessayer**, jamais « Aucun résultat ».

## Coordonnées

- Téléphone et WhatsApp : toujours via `src/lib/contact.ts` (`CONTACT_PHONE`, `CONTACT_PHONE_DISPLAY`, `WHATSAPP_URL`), configuré par `NEXT_PUBLIC_CONTACT_PHONE`.

## Hors périmètre de ce document

L'admin (`yopoeprint-admin`) garde son identité bleu marine / or ; l'aligner est un chantier séparé.
