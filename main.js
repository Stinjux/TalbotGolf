/* ==========================================================================
   TalbotGolf — comportements de page
   Aucune dépendance : IntersectionObserver + transitions CSS.
   Le contenu reste entièrement lisible si ce fichier ne s'exécute pas.
   ========================================================================== */
(function () {
  'use strict';

  var MOUVEMENT_REDUIT = window.matchMedia('(prefers-reduced-motion: reduce)');
  var DECALAGE = 90;    // ms entre deux éléments d'un même groupe
  var SEUIL_ENTETE = 120;

  /* ---------------------------------------------------------------- Année */
  var annee = document.getElementById('annee');
  if (annee) { annee.textContent = String(new Date().getFullYear()); }

  /* ------------------------------------------------- En-tête au défilement */
  var entete = document.getElementById('entete');
  var enteteOpaque = false;

  function majEntete() {
    var doit = window.scrollY > SEUIL_ENTETE;
    if (doit !== enteteOpaque) {
      enteteOpaque = doit;
      entete.classList.toggle('est-opaque', doit);
    }
  }

  /* ------------------------------------------------------ Menu replié      */
  var bouton = document.querySelector('.entete__bouton');
  var nav = document.getElementById('nav-principale');

  function fermerMenu() {
    if (!nav) { return; }
    delete nav.dataset.ouvert;
    bouton.setAttribute('aria-expanded', 'false');
    entete.classList.remove('menu-ouvert');
  }

  if (bouton && nav) {
    bouton.addEventListener('click', function () {
      var ouvert = nav.hasAttribute('data-ouvert');
      if (ouvert) { fermerMenu(); }
      else {
        nav.dataset.ouvert = '';
        bouton.setAttribute('aria-expanded', 'true');
        entete.classList.add('menu-ouvert');   // barre opaque tant que le menu est déplié
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { fermerMenu(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { fermerMenu(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) { fermerMenu(); }
    });
  }

  /* ------------------------------------------------------ Révélations      */
  var animes = Array.prototype.slice.call(
    document.querySelectorAll('.reveal, .titre-masque, .masque')
  );

  // Décalage de 90 ms entre les éléments qui partagent le même parent.
  var groupes = new Map();
  animes.forEach(function (el) {
    var parent = el.parentElement;
    if (!groupes.has(parent)) { groupes.set(parent, []); }
    groupes.get(parent).push(el);
  });
  groupes.forEach(function (liste) {
    if (liste.length < 2) { return; }
    liste.forEach(function (el, i) {
      el.style.setProperty('--retard', (i * DECALAGE) + 'ms');
    });
  });

  // Les lignes d'un titre se décalent entre elles, après le retard du titre.
  document.querySelectorAll('.titre-masque').forEach(function (titre) {
    var base = parseInt(titre.style.getPropertyValue('--retard'), 10) || 0;
    titre.querySelectorAll('.ligne__i').forEach(function (ligne, i) {
      ligne.style.setProperty('--retard', (base + i * DECALAGE) + 'ms');
    });
  });

  function toutAfficher() {
    animes.forEach(function (el) { el.classList.add('est-visible'); });
  }

  if (MOUVEMENT_REDUIT.matches) {
    toutAfficher();
  } else if (!('IntersectionObserver' in window)) {
    toutAfficher();                       // vieux navigateur : rien n'est caché
  } else {
    var observateur = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) { return; }
        entree.target.classList.add('est-visible');
        observateur.unobserve(entree.target);   // une seule fois, jamais rejouée
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    animes.forEach(function (el) { observateur.observe(el); });
  }

  /* ------------------------------------------------------ Compteurs        */
  var compteurs = Array.prototype.slice.call(document.querySelectorAll('[data-compteur]'));

  function animerCompteur(el) {
    var cible = parseInt(el.getAttribute('data-compteur'), 10);
    if (isNaN(cible)) { return; }
    // Onglet en arrière-plan : requestAnimationFrame y est suspendu.
    // On pose directement la valeur finale plutôt que de laisser un « 0 » figé.
    if (document.visibilityState === 'hidden') { el.textContent = String(cible); return; }

    var duree = 1600;
    var depart = null;

    function pas(horodatage) {
      if (depart === null) { depart = horodatage; }
      var t = Math.min((horodatage - depart) / duree, 1);
      var adouci = 1 - Math.pow(1 - t, 3);            // sortie douce
      el.textContent = String(Math.round(cible * adouci));
      if (t < 1) { requestAnimationFrame(pas); }
      else { el.textContent = String(cible); }
    }
    el.textContent = '0';
    requestAnimationFrame(pas);
  }

  if (compteurs.length && !MOUVEMENT_REDUIT.matches && 'IntersectionObserver' in window) {
    var obsCompteurs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (!entree.isIntersecting) { return; }
        animerCompteur(entree.target);
        obsCompteurs.unobserve(entree.target);        // une seule fois
      });
    }, { threshold: 0.6 });
    compteurs.forEach(function (el) { obsCompteurs.observe(el); });
  }

  /* ------------------------------------------------------ Parallaxe        */
  /* Déplacement vertical de 11 % maximum, absorbé par l'agrandissement CSS
     de 12 % de l'image. Coupée sous 900 px et en mouvement réduit.           */
  var AMPLITUDE = 0.055;                              // ± 5,5 % de la hauteur
  var elementsParallaxe = Array.prototype.slice.call(document.querySelectorAll('.parallaxe'));
  var visibles = new Set();
  var demande = null;

  function parallaxeActive() {
    return !MOUVEMENT_REDUIT.matches && window.innerWidth > 900;
  }

  function placerImages() {
    demande = null;
    var hauteurEcran = window.innerHeight;
    visibles.forEach(function (el) {
      var cadre = el.querySelector('.cadre');
      if (!cadre) { return; }
      var r = cadre.getBoundingClientRect();
      // −1 quand le cadre arrive par le bas, +1 quand il sort par le haut
      var progression = (r.top + r.height / 2 - hauteurEcran / 2) / ((hauteurEcran + r.height) / 2);
      progression = Math.max(-1, Math.min(1, progression));
      el.style.setProperty('--py', (-progression * r.height * AMPLITUDE).toFixed(1) + 'px');
    });
  }

  function planifier() {
    if (demande === null && parallaxeActive()) {
      demande = requestAnimationFrame(placerImages);
    }
  }

  if (elementsParallaxe.length && 'IntersectionObserver' in window) {
    var obsParallaxe = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) { visibles.add(entree.target); }
        else { visibles.delete(entree.target); }
      });
      planifier();
    }, { rootMargin: '25% 0px 25% 0px' });
    elementsParallaxe.forEach(function (el) { obsParallaxe.observe(el); });
  }

  function reinitialiserParallaxe() {
    elementsParallaxe.forEach(function (el) { el.style.removeProperty('--py'); });
  }

  /* ------------------------------------------------------ Écoutes globales */
  window.addEventListener('scroll', function () {
    majEntete();
    planifier();
  }, { passive: true });

  window.addEventListener('resize', function () {
    majEntete();
    if (parallaxeActive()) { planifier(); } else { reinitialiserParallaxe(); }
  }, { passive: true });

  if (MOUVEMENT_REDUIT.addEventListener) {
    MOUVEMENT_REDUIT.addEventListener('change', function () {
      if (MOUVEMENT_REDUIT.matches) { toutAfficher(); reinitialiserParallaxe(); }
    });
  }

  majEntete();
  planifier();

  /* ------------------------------------------------------ Formulaire       */
  /* Voie de secours tant qu'aucun service d'envoi n'est branché : on compose
     un courriel prérempli. À remplacer par un vrai « action » côté serveur.  */
  var ADRESSE = 'contact@talbotgolf.com';
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
