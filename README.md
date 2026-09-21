# TalbotGolf — site vitrine

Page unique en HTML, CSS et JavaScript natif. Aucune dépendance, aucun build.
Un serveur Node minimal (`server.mjs`) sert le site en production, sur Railway.

```bash
npm start          # http://localhost:3000
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | structure et contenu de la page |
| `styles.css` | toutes les variables (couleurs, tailles, durées) en tête de fichier |
| `main.js` | en-tête au scroll, menu, révélations, compteurs, parallaxe, formulaire |
| `server.mjs` | serveur statique, en-têtes de sécurité, redirections, `/health` |
| `Dockerfile`, `railway.toml` | déploiement |
| `public/images/` | photothèque, déclinée en plusieurs largeurs |
| `public/logos/` | logos TalbotGolf fournis, copiés tels quels |
| `public/logos/tours/` | logos des cinq circuits, détourés et normalisés |

---

## 1. Textes rédigés pour l'exemple — à remplacer

Tout ce qui suit a été écrit faute d'information et doit être relu ou remplacé.

### Dates manquantes — le plus urgent
Trois réalisations n'affichent **aucune année**, faute de l'avoir : **Palm Ourika**,
**Palm Casablanca** et **Mazagan**. La page en compte cinq — le Golf d'Agadir n'y
figure plus, mais ses photos restent dans le héros et dans la section du métier. Le Royal Golf Marrakech porte « En cours ».
Pour ajouter une année, insérer dans la `<dl class="fiche">` du projet :
`<div><dt>Année</dt><dd>2014</dd></div>`.

### Contenu inventé, à valider mot à mot
- **Chiffres clés** — « 35 années sur le terrain », « 18 parcours dessinés ou
  rénovés », « 620 hectares modelés ». Chiffres inventés.
  → `index.html`, attributs `data-compteur`.
- **Citation du portrait** — « On ne dessine pas un trou de la même manière quand
  on l'a joué sous pression. » Inventée : elle doit devenir une vraie phrase de
  Stéphane, ou disparaître.
- **Descriptifs des cinq réalisations** — plausibles mais non vérifiés, en
  particulier : l'orientation des greens de Palm Ourika vers l'Atlas, les arbres
  conservés à Palm Casablanca, le parcours de la Palmeraie resté en service
  pendant les travaux.
- **Les deux paragraphes de la section Carrière** — « quatre continents », la
  lecture des greens, le rapport entre le jeu et le dessin.
- **Biographie du portrait** — sauf la mention de la couverture d'avril 1999,
  qui est documentée.
- **Lieu de Mazagan** — « El Jadida, Maroc » est déduit, à confirmer.
- **Textes des quatre temps du métier** — ton et contenu à valider.

### Coordonnées — encore fictives
- Téléphone `+33 6 00 00 00 00`.
- Courriel `contact@talbotgolf.com` → présent **à trois endroits** : le lien de la
  section contact, et la constante `ADRESSE` en bas de `main.js`.
- Zone d'intervention « France, Maroc et bassin méditerranéen ».

### Formulaire — pas encore connecté
Le formulaire n'envoie rien vers un serveur. `main.js` ouvre le logiciel de
messagerie avec un message prérempli. Pour un envoi réel, ajouter une `action` au
`<form>` (Formspree, Netlify Forms, script PHP…) et retirer le gestionnaire
`submit` de `main.js`.

---

## 2. Images

Les originaux n'ont pas été modifiés. Chaque photo a été recadrée si nécessaire,
puis déclinée en plusieurs largeurs.

| Fichier livré | Origine | Traitement | Emplacement |
|---|---|---|---|
| `agadir-trou14-ocean` | 4AGA-VueRealistiqueTrou14 | −6,5 % à droite (pictogramme ✦) | héros |
| `agadir-masterplan` | AGA-VueGolf_Janv26 | −6,5 % à droite (✦) | métier — 01 Conseil |
| `agadir-plan-trous12-16` | AGA-Vue12-16v2 | −6,5 % à droite (✦) | métier — 02 Conception, **bichromie** |
| `ourika-modelage` | Palmourika2 | — | métier — 03 Réalisation |
| `agadir-green14-jeu` | AGA-VueDepuisGreen14 | −6,5 % à droite (✦) | métier — 04 Exploitation |
| `ourika-crepuscule` · `ourika-clubhouse` | Palmourika3 · palmourika1 | — | réalisation 01 |
| `casablanca-ensemble` · `casablanca-jacaranda` | palmcasa1 · Palmcasa2 | — | réalisation 02 |
| `palmeraie-ensemble` · `palmeraie-fairways` | ExtensionPalmeraie2009 · -3 | −21 % en bas (FlyOverGreen) | réalisation 03 |
| `palmeraie-panoramique` | ExtensionPalmeraie2009-2 | −5 % en bas (logo) | bandeau pleine largeur |
| `mazagan-green-resort` · `mazagan-links` | mazagan1 · mazagan | — | réalisation 04 |
| `royal-marrakech-site` | RGM-PhotoSiteGolfRoyal2025 | — | réalisation 05 |
| `stephane-portrait` | StephaneTalbot | recadré en 4/5 | portrait |
| `couverture-golf-1999` | STalbot-MagasineQuebec | marges resserrées | carrière |
| `stephane-1999` · `stephane-canberra` | Talvest_chest2 · DSC_0040 | — | carrière |

Traitement appliqué en CSS, donc réversible : `saturate(.82) sepia(.05)` —
désaturation d'environ 18 % et un point de chaleur. Le plan d'étude d'Agadir
passe en bichromie vert/crème (`.figure--bichromie`).

**Définitions faibles.** Sept photos sont fournies entre 768 et 1024 px de large
(Palm Ourika, Palm Casablanca, Mazagan links). Elles sont donc placées dans des
colonnes étroites et ne peuvent pas passer en pleine largeur sans devenir floues.
Des fichiers plus grands permettraient des compositions plus généreuses.

**Photo non utilisée** : `agadir-trous12-16-littoral` a été retirée du dépôt, le
Golf d'Agadir n'étant plus listé comme réalisation. L'original reste dans le
dossier source.

**Manque toujours** : la photo avec le trophée, annoncée mais absente du dossier.

### Ajouter une photo
Produire deux ou trois largeurs, les déposer dans `public/images/`, puis
renseigner `src`, `srcset`, `sizes`, `width`, `height` et un `alt` descriptif.
Toutes les images sont en `loading="lazy"`, **sauf celle du héros**
(`fetchpriority="high"`).

---

## 3. Logos des circuits

`public/logos/tours/` contient les cinq logos détourés (fonds blancs et noir
retirés par diffusion depuis les coins), posés sur un canevas de 240 px de haut
avec une échelle propre à chacun, pour qu'ils paraissent de taille équivalente à
une hauteur CSS commune. Les couleurs d'origine sont conservées.

Ce sont des **marques déposées appartenant à leurs détenteurs**. La page porte
une mention en ce sens sous la rangée. Selon l'usage commercial qui sera fait du
site, une autorisation peut être nécessaire — c'est un point à vérifier.

---

## 4. Ajouter une réalisation

Dans `index.html`, dupliquer un bloc `<article class="realisation">` :

1. alterner `realisation--inverse` d'un projet au suivant (image à gauche, puis à droite) ;
2. `realisation--vertical` pour une photo au format portrait, `realisation--compact`
   pour resserrer la colonne d'image quand la photo est de définition modeste ;
3. un seul `<figure>` dans `.realisation__images` occupe toute la largeur ; deux
   `<figure>` avec `realisation__images--duo` se partagent l'espace en 7/4 ;
4. renuméroter `data-index` et le `<p class="realisation__numero">` ;
5. le bandeau `<figure class="bande">` pleine largeur est réservé aux panoramiques.

Les classes `reveal`, `masque` et `parallaxe` suffisent à animer le nouveau bloc,
sans toucher au JavaScript.

---

## 5. Choix techniques

- **Typographies** : Newsreader (titres, légendes italiques) et Archivo (texte,
  interface — c'est la police du logo), servies par Google Fonts.
- **Animations** : IntersectionObserver et transitions CSS, sans bibliothèque.
  Fondu + montée de 28 px en 700 ms, `cubic-bezier(.16, 1, .3, 1)`, 90 ms de
  décalage entre éléments d'un même groupe, jouées **une seule fois**.
- **Sans JavaScript** : le script pose la classe `js` sur `<html>` ; toutes les
  règles d'animation en dépendent. Sans lui, la page s'affiche complète et fixe.
- **`prefers-reduced-motion: reduce`** : tout est visible immédiatement.
- **Sous 900 px** : une seule colonne, parallaxe désactivée, duos empilés,
  cibles tactiles de 48 px, menu replié sous 880 px.
- **Accessibilité** : contrastes vérifiés au-delà de 4,5:1 sur le texte courant,
  lien d'évitement, `:focus-visible` laiton, hiérarchie de titres continue.
- **Sécurité** : `server.mjs` envoie une politique CSP stricte. Elle porte
  l'empreinte sha256 du court script en ligne de `index.html` — **toute
  modification de ce script oblige à recalculer l'empreinte**, sinon la page
  s'affichera sans la classe `js`.
- **Cache** : page revalidée à chaque visite, CSS et JS 5 minutes, images
  une journée. Les noms de fichiers ne portant pas d'empreinte, un cache long
  figerait une correction pendant des mois.

## 6. Ce qui reste à faire

- [ ] Fournir les années de Palm Ourika, Palm Casablanca et Mazagan
- [ ] Remplacer les textes signalés en partie 1
- [ ] Fournir la photo avec le trophée
- [ ] Fournir des fichiers plus grands pour les sept photos en basse définition
- [ ] Brancher le formulaire sur un service d'envoi
- [ ] Renseigner les vraies coordonnées
- [ ] Vérifier la question des marques pour les logos de circuits
