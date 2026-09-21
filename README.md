# TalbotGolf — site vitrine

Page unique en HTML, CSS et JavaScript natif. Aucune dépendance, aucun build :
ouvrir `index.html` suffit. Pour le développement, un petit serveur local évite
les restrictions de fichier local :

```bash
python3 -m http.server 5310 --directory ~/Desktop/talbotgolf-site
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | structure et contenu de la page |
| `styles.css` | toutes les variables (couleurs, tailles, durées) en tête de fichier |
| `main.js` | en-tête au scroll, menu, révélations, compteurs, parallaxe, formulaire |
| `public/logos/` | logos fournis, copiés tels quels (SVG + favicons PNG) |
| `public/images/` | photothèque recadrée et déclinée en 900 / 1600 / 2400 px |

---

## 1. Textes rédigés pour l'exemple — à remplacer

Tout ce qui suit a été écrit faute d'information et doit être relu ou remplacé.

### Contenu inventé, à valider mot à mot
- **Chiffres clés** — « 35 années sur le terrain », « 18 parcours dessinés ou
  rénovés », « 620 hectares modelés ». Chiffres inventés.
  → `index.html`, attributs `data-compteur` de la section *Chiffres clés*.
- **Biographie de Stéphane** — les deux paragraphes du portrait (formation,
  arrivée au golf par le terrain, travail en France et au Maroc).
- **Citation** — « Je ne rends jamais un plan que je n'ai pas marché… ».
  Inventée : elle doit être une vraie phrase de Stéphane ou disparaître.
- **Descriptifs des deux réalisations** — le tracé d'Agadir (neuf premiers trous
  sur le relief, trous 12 à 16 en bord de falaise, cordon dunaire préservé) et
  l'extension de la Palmeraie (neuf trous le long de l'oued, parcours resté en
  service, palmiers prélevés sur place) sont plausibles mais non vérifiés.
- **Textes des quatre temps du métier** — Conseil, Conception, Réalisation,
  Exploitation. Ton et contenu à valider.
- **Année 2009** pour la Palmeraie : reprise du nom des fichiers photo.

### Coordonnées — encore fictives
- Téléphone `+33 6 00 00 00 00` → `index.html`, section *Contact* et `href="tel:"`.
- Courriel `contact@talbotgolf.com` → présent **à trois endroits** : le lien de
  la section contact, et la constante `ADRESSE` en bas de `main.js`.
- Zone d'intervention « France, Maroc et bassin méditerranéen ».

### Formulaire — pas encore connecté
Le formulaire n'envoie rien vers un serveur. Tant qu'aucun service n'est branché,
`main.js` ouvre le logiciel de messagerie avec un message prérempli. Pour un envoi
réel, ajouter une `action` au `<form>` (Formspree, Netlify Forms, script PHP…) et
retirer le gestionnaire `submit` de `main.js`.

---

## 2. Images

Les originaux n'ont pas été modifiés. Chaque photo a été recadrée pour retirer une
signature ou un pictogramme d'interface, puis déclinée en trois largeurs.

| Fichier livré | Origine | Recadrage | Emplacement |
|---|---|---|---|
| `agadir-trou14-ocean` | 4AGA-VueRealistiqueTrou14_Janv26 | −6,5 % à droite (pictogramme ✦) | héros |
| `agadir-masterplan` | AGA-VueGolf_Janv26 | −6,5 % à droite (✦) | métier — 01 Conseil |
| `agadir-plan-trous12-16` | AGA-Vue12-16v2_Dec25 | −6,5 % à droite (✦) | métier — 02 Conception, **en bichromie** |
| `palmeraie-fairways` | ExtensionPalmeraie2009-3 | −21 % en bas (FlyOverGreen) | métier — 03 Réalisation |
| `agadir-green14-jeu` | AGA-VueDepuisGreen14_Dec25 | −6,5 % à droite (✦) | métier — 04 Exploitation |
| `agadir-trous12-16-littoral` | AGA-VueGolfTrous12-16_Janv2026 | −4 % à droite (icônes) | réalisation 01 |
| `palmeraie-ensemble` | ExtensionPalmeraie2009 | −21 % en bas (FlyOverGreen) | réalisation 02 |
| `palmeraie-panoramique` | ExtensionPalmeraie2009-2 | −5 % en bas (logo) | bandeau pleine largeur |

Traitement appliqué en CSS, donc réversible : `saturate(.82) sepia(.05)` —
désaturation d'environ 18 % et un point de chaleur, pour que les verts de gazon
et les bleus de piscine restent dans la même famille. Le plan d'étude passe en
bichromie vert/crème (`.figure--bichromie`), ce qui règle aussi sa définition
plus faible.

### Ajouter une photo
Produire trois largeurs (900, 1600, 2400 px), les déposer dans `public/images/`,
puis renseigner `src`, `srcset`, `sizes`, `width`, `height` et un `alt`
descriptif. Toutes les images sont en `loading="lazy"`, **sauf celle du héros**
(`fetchpriority="high"`) : la charger paresseusement retarderait l'affichage du
plus grand élément de la page.

### Portrait de Stéphane — emplacement réservé
Aucune photo de Stéphane n'a été fournie. La section *Le praticien* contient un
cadre en sable marqué « Emplacement réservé au portrait ». Le bloc HTML de
remplacement est écrit en commentaire juste au-dessus, dans `index.html`.

---

## 3. Ajouter une réalisation

Dans `index.html`, dupliquer un bloc `<article class="realisation">` :

1. alterner la classe `realisation--inverse` d'un projet au suivant
   (image à gauche, puis à droite) ;
2. renuméroter `data-index` et le `<p class="realisation__numero">` ;
3. renseigner lieu, année et nature de l'intervention dans la `<dl class="fiche">` ;
4. le bandeau `<figure class="bande">` pleine largeur est facultatif : le réserver
   aux images panoramiques (rapport 2,4:1 ou plus).

Les classes `reveal`, `masque` et `parallaxe` suffisent à animer le nouveau bloc,
sans toucher au JavaScript.

---

## 4. Choix techniques

- **Typographies** : Newsreader (titres, légendes italiques) et Archivo (texte,
  interface — c'est la police du logo), servies par Google Fonts.
- **Animations** : IntersectionObserver et transitions CSS, sans bibliothèque.
  Fondu + montée de 28 px en 700 ms, `cubic-bezier(.16, 1, .3, 1)`, 90 ms de
  décalage entre éléments d'un même groupe, jouées **une seule fois**.
  Seuls `transform`, `opacity` et `clip-path` sont animés.
- **Sans JavaScript** : le script pose la classe `js` sur `<html>` ; toutes les
  règles d'animation en dépendent. Sans lui, la page s'affiche complète et fixe.
- **`prefers-reduced-motion: reduce`** : tout est visible immédiatement, aucune
  transition, aucune parallaxe.
- **Sous 900 px** : une seule colonne, parallaxe désactivée, héros à 84 % de la
  hauteur d'écran, cibles tactiles de 48 px, menu replié sous 880 px.
- **Accessibilité** : contrastes vérifiés au-delà de 4,5:1 sur tout le texte
  courant, lien d'évitement, `:focus-visible` laiton, hiérarchie de titres
  continue (un seul `h1`, puis `h2`/`h3`).
- **Référencement** : `title`, `description`, Open Graph et Twitter Card
  renseignés, image de partage pointée sur la vue du trou 14.

## 5. Ce qui reste à faire

- [ ] Remplacer les textes signalés en partie 1
- [ ] Fournir un portrait de Stéphane, et si possible des photos de chantier,
      d'engins et de plans de modelage : la page en manque pour incarner le métier
- [ ] Brancher le formulaire sur un service d'envoi
- [ ] Renseigner les vraies coordonnées
- [ ] Ajouter les réalisations manquantes (la page n'en présente que deux)
- [ ] Vérifier le nom exact et l'année des deux projets présentés
