/* ==========================================================================
   TalbotGolf — comportements de page
   Défilement natif : aucune capture de la molette, aucun défilement imposé.
   Le script mesure la position des blocs et écrit des variables CSS
   (--entree, --traverse, --ouverture…) ; toute la chorégraphie est décrite
   dans styles.css, section 15. Sans ce fichier, ou en mouvement réduit, la
   page reste complète et fixe.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sceneFixe = window.matchMedia('(min-width: 1024px) and (min-height: 680px)');
  var observable = 'IntersectionObserver' in window;
  function mouvement() { return observable && !reduit.matches; }
  function borne(v, min, max) { return Math.min(max === undefined ? 1 : max, Math.max(min === undefined ? 0 : min, v)); }

  /* ---------------------------------------------------------------- Année */
  var annee = document.getElementById('annee');
  if (annee) { annee.textContent = String(new Date().getFullYear()); }

  /* ------------------------------------------------------ Menu replié      */
  var entete = document.getElementById('entete');
  var bouton = document.querySelector('.entete__bouton');
  var nav = document.getElementById('nav-principale');
  var arrierePlan = [document.getElementById('contenu'), document.querySelector('.pied')].filter(Boolean);

  function fermerMenu(rendreFocus) {
    if (!nav || !bouton || !nav.hasAttribute('data-ouvert')) { return; }
    delete nav.dataset.ouvert;
    bouton.setAttribute('aria-expanded', 'false');
    entete.classList.remove('menu-ouvert');
    root.style.removeProperty('overflow');
    arrierePlan.forEach(function (el) { el.inert = false; });
    if (rendreFocus) { bouton.focus(); }
  }
  function ouvrirMenu() {
    nav.dataset.ouvert = '';
    bouton.setAttribute('aria-expanded', 'true');
    entete.classList.add('menu-ouvert');
    root.style.overflow = 'hidden';                 // la page ne défile pas sous le menu
    arrierePlan.forEach(function (el) { el.inert = true; });
  }
  if (bouton && nav) {
    bouton.addEventListener('click', function () {
      if (nav.hasAttribute('data-ouvert')) { fermerMenu(false); } else { ouvrirMenu(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { fermerMenu(false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fermerMenu(true); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) { fermerMenu(false); } });
  }

  /* ------------------------------------------- Section en cours, fil de lecture */
  var liensNav = [].slice.call(document.querySelectorAll('.nav a[href^="#"]')).map(function (lien) {
    return { lien: lien, section: document.querySelector(lien.getAttribute('href')) };
  });
  var indexCourant = -2;
  function majNavigation(hauteur) {
    var courant = -1;
    liensNav.forEach(function (item, i) {
      if (item.section && item.section.getBoundingClientRect().top <= hauteur * .4) { courant = i; }
    });
    if (courant === indexCourant) { return; }
    indexCourant = courant;
    liensNav.forEach(function (item, i) {
      if (i === courant) { item.lien.setAttribute('aria-current', 'location'); }
      else { item.lien.removeAttribute('aria-current'); }
    });
  }

  /* ------------------------------------------------------ Moteur de défilement */
  var heros = document.querySelector('.heros');
  var etapes = document.querySelector('.metier__etapes');
  var rail = document.querySelector('.metier__trace');
  var jalons = rail ? [].slice.call(rail.querySelectorAll('span')) : [];
  var temps = [].slice.call(document.querySelectorAll('.temps'));
  var defilants = [].slice.call(document.querySelectorAll('[data-defile]'));
  var visibles = new Set();
  var demande = 0;

  var observateurDefile = observable ? new IntersectionObserver(function (entrees) {
    entrees.forEach(function (entree) {
      if (entree.isIntersecting) { visibles.add(entree.target); } else { visibles.delete(entree.target); }
    });
    planifier();
  }, { rootMargin: '20% 0px 20% 0px' }) : null;
  if (observateurDefile) { defilants.forEach(function (el) { observateurDefile.observe(el); }); }

  function planifier() { if (!demande) { demande = requestAnimationFrame(peindre); } }

  function peindre() {
    demande = 0;
    var hauteur = window.innerHeight;
    var y = window.scrollY;
    var longueur = Math.max(1, root.scrollHeight - hauteur);
    entete.style.setProperty('--lecture', borne(y / longueur).toFixed(4));
    majNavigation(hauteur);
    if (!root.classList.contains('moteur')) { return; }

    // Toutes les lectures géométriques d'abord, puis toutes les écritures.
    var mesures = [];
    visibles.forEach(function (el) { mesures.push([el, el.getBoundingClientRect()]); });
    var rHeros = heros ? heros.getBoundingClientRect() : null;
    var rEtapes = etapes ? etapes.getBoundingClientRect() : null;
    var hauts = temps.map(function (t) { return t.getBoundingClientRect().top; });

    mesures.forEach(function (m) {
      var r = m[1];
      var entree = borne((hauteur - r.top) / (hauteur * .62));
      var traverse = borne((r.top + r.height / 2 - hauteur / 2) / ((hauteur + r.height) / 2), -1, 1);
      m[0].style.setProperty('--entree', entree.toFixed(4));
      m[0].style.setProperty('--traverse', traverse.toFixed(4));
    });

    // Héros : la fenêtre s'ouvre sur les 70 premiers pour cent du parcours fixe.
    if (rHeros && rHeros.bottom > 0) {
      var parcours = Math.max(1, rHeros.height - hauteur);
      var ouverture = sceneFixe.matches ? borne(-rHeros.top / (parcours * .7)) : 0;
      heros.style.setProperty('--ouverture', ouverture.toFixed(4));
    }

    // Le rail des quatre temps : le trait suit la lecture, les jalons s'allument.
    if (rail && rEtapes && rEtapes.bottom > 0 && rEtapes.top < hauteur) {
      rail.style.setProperty('--etapes', borne((hauteur * .5 - rEtapes.top) / rEtapes.height).toFixed(4));
      jalons.forEach(function (jalon, i) {
        jalon.classList.toggle('est-actif', hauts[i] !== undefined && hauts[i] < hauteur * .5);
      });
    }
  }

  function mesurer() {
    // Les jalons du rail sont posés à la hauteur de chaque temps.
    jalons.forEach(function (jalon, i) {
      if (temps[i]) { jalon.style.setProperty('--y', (temps[i].offsetTop - 4) + 'px'); }
    });
    planifier();
  }

  /* ------------------------------------------------------ Encrage mot à mot */
  /* Même texte, même ordre : chaque mot devient un <span> que le défilement encre. */
  function decouperMots(conteneur, cible) {
    var parcourir = document.createTreeWalker(cible, NodeFilter.SHOW_TEXT);
    var noeuds = [];
    while (parcourir.nextNode()) { noeuds.push(parcourir.currentNode); }
    var n = 0;
    noeuds.forEach(function (noeud) {
      var fragment = document.createDocumentFragment();
      noeud.textContent.split(/(\s+)/).forEach(function (morceau) {
        if (!morceau) { return; }
        if (/^\s+$/.test(morceau)) { fragment.appendChild(document.createTextNode(morceau)); return; }
        var mot = document.createElement('span');
        mot.className = 'mot';
        mot.style.setProperty('--w', String(n++));
        mot.textContent = morceau;
        fragment.appendChild(mot);
      });
      noeud.parentNode.replaceChild(fragment, noeud);
    });
    conteneur.setAttribute('data-mots', '');
    conteneur.style.setProperty('--n', String(n));
  }
  var charniere = document.querySelector('.realisations__charniere');
  if (charniere) { decouperMots(charniere, charniere); }
  var citation = document.querySelector('.citation');
  if (citation && citation.querySelector('p')) { decouperMots(citation, citation.querySelector('p')); }

  /* ------------------------------------------------------ Apparitions      */
  /* Un léger décalage entre les éléments d'un même groupe ; une seule fois. */
  var apparitions = [].slice.call(document.querySelectorAll('.reveal, .titre-masque'));
  var groupes = new Map();
  apparitions.forEach(function (el) {
    var parent = el.parentElement;
    if (!groupes.has(parent)) { groupes.set(parent, []); }
    groupes.get(parent).push(el);
  });
  groupes.forEach(function (liste) {
    liste.forEach(function (el, i) { el.style.setProperty('--i', String(Math.min(i, 6))); });
  });
  document.querySelectorAll('.titre-masque').forEach(function (titre) {
    titre.querySelectorAll('.ligne__i').forEach(function (ligne, i) { ligne.style.setProperty('--i', String(i)); });
  });

  function toutAfficher() { apparitions.forEach(function (el) { el.classList.add('est-visible'); }); }
  if (observable) {
    var observateurApparitions = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) { return; }
        entree.target.classList.add('est-visible');
        observateurApparitions.unobserve(entree.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    apparitions.forEach(function (el) { observateurApparitions.observe(el); });
  } else {
    toutAfficher();
  }

  /* ------------------------------------------------------ Compteurs        */
  /* La valeur finale reste dans le HTML ; elle revient aussitôt si le
     mouvement est réduit ou si l'onglet passe en arrière-plan.             */
  var enCours = new Map();
  function terminerCompteur(el) {
    if (enCours.has(el)) { cancelAnimationFrame(enCours.get(el)); enCours.delete(el); }
    el.textContent = el.getAttribute('data-compteur');
  }
  function compter(el) {
    if (!mouvement() || document.hidden) { terminerCompteur(el); return; }
    var cible = parseInt(el.getAttribute('data-compteur'), 10);
    if (isNaN(cible)) { return; }
    var depart = null;
    function pas(t) {
      if (depart === null) { depart = t; }
      var p = borne((t - depart) / 1600);
      el.textContent = String(Math.round(cible * (1 - Math.pow(1 - p, 3))));
      if (p < 1) { enCours.set(el, requestAnimationFrame(pas)); } else { terminerCompteur(el); }
    }
    el.textContent = '0';
    enCours.set(el, requestAnimationFrame(pas));
  }
  if (observable) {
    var observateurCompteurs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) { return; }
        compter(entree.target);
        observateurCompteurs.unobserve(entree.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-compteur]').forEach(function (el) { observateurCompteurs.observe(el); });
  }

  /* ------------------------------------------------------ Mouvement réduit */
  function synchroniser() {
    var actif = mouvement();
    root.classList.toggle('moteur', actif);
    if (!actif) {
      toutAfficher();
      enCours.forEach(function (_, el) { terminerCompteur(el); });
    }
    mesurer();
  }
  if (reduit.addEventListener) { reduit.addEventListener('change', synchroniser); }
  if (sceneFixe.addEventListener) { sceneFixe.addEventListener('change', mesurer); }

  window.addEventListener('scroll', planifier, { passive: true });
  window.addEventListener('resize', mesurer, { passive: true });
  window.addEventListener('pageshow', mesurer);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { enCours.forEach(function (_, el) { terminerCompteur(el); }); }
  });
  if ('ResizeObserver' in window) { new ResizeObserver(mesurer).observe(document.body); }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(mesurer); }
  synchroniser();

  /* ------------------------------------------------------ Formulaire       */
  /* Voie de secours tant qu'aucun service d'envoi n'est branché : on compose
     un courriel prérempli. À remplacer par un vrai « action » côté serveur.  */
  var ADRESSE = 'stephane@talbotgolf.com';
  var formulaire = document.getElementById('formulaire');
  var retour = document.getElementById('formulaire-retour');

  if (formulaire) {
    formulaire.addEventListener('submit', function (e) {
      e.preventDefault();
      var nom = formulaire.elements.nom.value.trim();
      var email = formulaire.elements.email.value.trim();
      var projet = formulaire.elements.projet.value.trim();

      if (!nom || !email || !projet) {
        retour.textContent = 'Merci de renseigner votre nom, votre courriel et quelques mots sur le projet.';
        return;
      }
      if (email.indexOf('@') < 1 || email.indexOf('.', email.indexOf('@')) < 0) {
        retour.textContent = 'L’adresse de courriel ne semble pas valide.';
        return;
      }

      var sujet = 'Projet de parcours — ' + nom;
      var corps = projet + '\n\n—\n' + nom + '\n' + email;
      window.location.href = 'mailto:' + ADRESSE +
        '?subject=' + encodeURIComponent(sujet) +
        '&body=' + encodeURIComponent(corps);
      retour.textContent = 'Votre logiciel de messagerie s’ouvre avec le message prérempli.';
    });
  }
})();
