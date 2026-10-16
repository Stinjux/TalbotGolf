/* TalbotGolf — défilement natif, scènes composées et améliorations progressives. */
(function () {
  'use strict';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.getElementById('entete');
  const year = document.getElementById('annee');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Les commandes restent indépendantes du moteur visuel. */
  const toggle = document.querySelector('.entete__bouton');
  const nav = document.getElementById('nav-principale');
  function closeMenu(restoreFocus) {
    if (!nav || !toggle) return;
    const wasOpen = nav.hasAttribute('data-ouvert');
    delete nav.dataset.ouvert;
    toggle.setAttribute('aria-expanded', 'false');
    header.classList.remove('menu-ouvert');
    if (restoreFocus && wasOpen) toggle.focus();
  }
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      if (nav.hasAttribute('data-ouvert')) closeMenu(false);
      else {
        nav.dataset.ouvert = '';
        toggle.setAttribute('aria-expanded', 'true');
        header.classList.add('menu-ouvert');
      }
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
    window.addEventListener('resize', () => { if (innerWidth > 880) closeMenu(false); });
  }

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, p) => a.map((v, i) => Math.round(v + (b[i] - v) * p));
  const effects = [];
  const visibleEffects = new Set();
  const animations = new Set();
  const counters = new Map();
  const navigation = [...document.querySelectorAll('.nav a[href^="#"]')].map(link => ({link, section: document.querySelector(link.getAttribute('href')), top: 0}));
  let request = 0;
  let navIndex = -2;
  let opaque = false;
  let width = innerWidth;
  let height = innerHeight;
  let pageLength = 1;
  let steps = [];
  let heroTravel = 1;
  const hero = document.querySelector('.heros');
  const scene = document.querySelector('.heros__scene');
  const trace = document.querySelector('.metier__trace');
  const dots = [...document.querySelectorAll('.metier__trace span')];
  const articles = [...document.querySelectorAll('.temps')];
  const pins = [
    {element: document.querySelector('.metier__intro'), className: 'intro-fixe', top: 125, minWidth: 881},
    {element: document.querySelector('.portrait__figure'), className: 'figure-fixe', top: 116, minWidth: 1121},
    ...[...document.querySelectorAll('.realisation:not(.realisation--avec-bande):not(.realisation--vertical) .realisation__texte')].map(element => ({element, className: 'texte-fixe', top: 110, minWidth: 1121}))
  ];
  const canAnimate = 'IntersectionObserver' in window && 'animate' in Element.prototype;
  const motionEnabled = () => canAnimate && !reduced.matches;

  function schedule() { if (!request) request = requestAnimationFrame(render); }
  function measure() {
    width = innerWidth;
    height = innerHeight;
    const y = scrollY;
    pageLength = Math.max(1, document.documentElement.scrollHeight - height);
    navigation.forEach(item => { if (item.section) item.top = item.section.getBoundingClientRect().top + y; });
    steps = articles.map(el => el.getBoundingClientRect().top + y);
    heroTravel = Math.max(1, hero.offsetHeight - scene.offsetHeight - 91);
    // Un élément plus haut que l'écran reste dans le flux et se lit entièrement.
    const pinStates = pins.map(pin => width >= pin.minWidth && pin.element.offsetHeight + pin.top + 24 < height);
    pins.forEach((pin, index) => pin.element.classList.toggle(pin.className, pinStates[index]));
    schedule();
  }
  function render() {
    request = 0;
    const y = scrollY;
    const nextOpaque = y > 60;
    if (nextOpaque !== opaque) { header.classList.toggle('est-opaque', nextOpaque); opaque = nextOpaque; }
    header.style.setProperty('--lecture', clamp(y / pageLength).toFixed(4));
    let current = -1;
    navigation.forEach((item, i) => { if (item.top <= y + height * .38) current = i; });
    if (current !== navIndex) {
      navigation.forEach((item, i) => { if (i === current) item.link.setAttribute('aria-current', 'location'); else item.link.removeAttribute('aria-current'); });
      navIndex = current;
    }
    if (!motionEnabled()) return;
    // Toutes les lectures géométriques précèdent les écritures de styles.
    const frame = [...visibleEffects].map(effect => ({effect, rect: effect.element.getBoundingClientRect()}));
    frame.forEach(({effect, rect}) => effect.paint(rect, y));
    let step = 0;
    steps.forEach((top, i) => { if (top < y + height * .55) step = i; });
    dots.forEach((dot, i) => dot.classList.toggle('est-actif', i <= step));
  }
  function register(element, paint) {
    if (!element) return;
    const effect = {element, paint};
    effects.push(effect);
    if (!('IntersectionObserver' in window)) return;
    effectObserver.observe(element);
  }
  const effectObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      effects.filter(effect => effect.element === entry.target).forEach(effect => {
        if (entry.isIntersecting) visibleEffects.add(effect); else visibleEffects.delete(effect);
      });
    });
    schedule();
  }, {rootMargin: '40% 0px'}) : null;

  /* Le prologue se déplie sans capture de la molette ni déplacement imposé. */
  register(hero, rect => {
    const progress = width > 1024 && height >= 740 ? clamp(-rect.top / heroTravel) : 0;
    hero.style.setProperty('--hero', progress.toFixed(4));
    hero.toggleAttribute('data-sorti', progress > .4);
  });
  register(document.querySelector('.metier'), rect => {
    const progress = clamp((height * .35 - rect.top) / Math.max(1, rect.height - height * .6));
    trace.style.setProperty('--terrain', progress.toFixed(4));
  });
  register(document.querySelector('.realisations'), rect => {
    const progress = clamp((height - rect.top) / (rect.height + height));
    const color = mix([237,230,215], [221,225,207], progress);
    ['r','g','b'].forEach((channel, i) => document.querySelector('.realisations').style.setProperty('--papier-' + channel, color[i]));
  });

  /* Deux profondeurs : grand paysage et archives, sans bouger les textes. */
  document.querySelectorAll('.parallaxe .cadre').forEach(frame => {
    register(frame, rect => {
      const progress = clamp((height - rect.top) / (height + rect.height));
      const amplitude = width > 900 ? Math.min(38, rect.height * .045) : 0;
      frame.style.setProperty('--image-y', ((progress - .5) * amplitude * 2).toFixed(2) + 'px');
      frame.style.setProperty('--image-scale', width > 900 ? (1.13 - progress * .035).toFixed(4) : '1');
    });
  });
  const archiveGroup = document.querySelector('.carriere__archives');
  const archives = [...archiveGroup.querySelectorAll('.figure')];
  register(archiveGroup, rect => {
    const progress = clamp((height - rect.top) / (height + rect.height));
    archives.forEach((figure, i) => figure.style.setProperty('--archive-y', width > 900 ? ((progress - .5) * [-65,80,-95][i]).toFixed(2) + 'px' : '0px'));
  });
  const contours = document.querySelector('.chiffres__motif');
  contours.querySelectorAll('path').forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.dataset.longueur = String(length);
  });
  register(document.querySelector('.chiffres'), rect => {
    const progress = clamp((height * .9 - rect.top) / Math.max(1, rect.height + height * .15));
    contours.querySelectorAll('path').forEach((path, i) => { path.style.strokeDashoffset = String(Number(path.dataset.longueur) * (1 - clamp(progress * 1.4 - i * .04))); });
  });

  /* Encrage mot à mot : même texte, même ordre et même lecture accessible. */
  function wrapWords(element, className) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const words = [];
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) fragment.appendChild(document.createTextNode(part));
        else {
          const span = document.createElement('span');
          span.className = className;
          span.textContent = part;
          fragment.appendChild(span);
          words.push(span);
        }
      });
      node.replaceWith(fragment);
    });
    return words;
  }
  const titles = new Map();
  document.querySelectorAll('.titre-masque').forEach(title => titles.set(title, wrapWords(title, 'mot-titre')));
  document.querySelectorAll('.realisations__charniere, .citation p').forEach(element => {
    const words = wrapWords(element, 'mot-encre');
    const portrait = !!element.closest('.portrait');
    register(element, rect => {
      const progress = clamp((height * .88 - rect.top) / (height * .48 + rect.height));
      element.style.setProperty('--encrage', progress.toFixed(4));
      words.forEach((word, i) => {
        const p = clamp(progress * (words.length + 4) / 4 - i / 4);
        word.style.setProperty('--mot-couleur', 'rgb(' + mix(portrait ? [218,179,156] : [107,115,87], portrait ? [250,242,224] : [33,62,50], p).join(',') + ')');
      });
    });
  });

  /* Apparitions orchestrées : des masques différenciés et une perspective
     interne à l'image. Aucun état caché permanent, aucun délai pour lire. */
  function play(element, frames, options) {
    if (!motionEnabled()) return;
    const animation = element.animate(frames, {duration: 900, fill: 'backwards', easing: 'cubic-bezier(.19,1,.22,1)', ...options});
    animations.add(animation);
    const done = () => animations.delete(animation);
    animation.onfinish = done;
    animation.oncancel = done;
  }
  function reveal(element) {
    element.classList.add('est-visible');
    if (!motionEnabled()) return;
    if (titles.has(element)) {
      titles.get(element).forEach((word, index) => play(word, [
        {transform: 'translate3d(0,75%,0)', clipPath:'inset(0 0 100% 0)', opacity: .2},
        {transform: 'translate3d(0,0,0)', clipPath:'inset(-20% -3% -20% -3%)', opacity: 1}
      ], {duration: 1100, delay: Math.min(index * 42, 240)}));
    } else if (element.classList.contains('masque')) {
      const frame = element.querySelector('.cadre');
      const reverse = !!element.closest('.realisation--inverse');
      const middle = !!element.closest('.bande');
      play(frame, [
        {clipPath: middle ? 'inset(22% 8% 22% 8%)' : reverse ? 'inset(0 0 0 96%)' : 'inset(0 96% 0 0)'},
        {clipPath: 'inset(0)'}
      ], {duration: middle ? 1500 : 1250});
      const caption = element.querySelector('.legende');
      if (caption) play(caption, [{opacity:.45,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}], {duration:800,delay:120});
    } else {
      play(element, [{opacity:.4,transform:'translate3d(0,20px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}], {duration:850});
    }
  }
  const revealElements = [...document.querySelectorAll('.reveal,.titre-masque,.masque')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, {threshold: .08, rootMargin: '0px 0px -5% 0px'});
    revealElements.forEach(el => observer.observe(el));
  } else revealElements.forEach(el => el.classList.add('est-visible'));

  /* Les valeurs d'origine restent dans le HTML et reviennent immédiatement
     si le mouvement est réduit ou si l'onglet passe en arrière-plan. */
  function finishCounter(element) {
    if (counters.has(element)) cancelAnimationFrame(counters.get(element));
    counters.delete(element);
    element.textContent = element.dataset.compteur;
  }
  function count(element) {
    if (!motionEnabled() || document.hidden) return finishCounter(element);
    const target = Number(element.dataset.compteur);
    let start;
    function step(now) {
      if (start === undefined) start = now;
      const progress = clamp((now - start) / 1500);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) counters.set(element, requestAnimationFrame(step)); else finishCounter(element);
    }
    counters.set(element, requestAnimationFrame(step));
  }
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { count(entry.target); counterObserver.unobserve(entry.target); } });
    }, {threshold: .6});
    document.querySelectorAll('[data-compteur]').forEach(el => counterObserver.observe(el));
  }
  function settle() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
    [...counters.keys()].forEach(finishCounter);
  }
  function syncMotion() {
    root.classList.toggle('cinema', motionEnabled());
    if (!motionEnabled()) {
      settle();
      contours.querySelectorAll('path').forEach(path => path.style.strokeDashoffset = '0');
    }
    measure();
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); else schedule(); });
  if (reduced.addEventListener) reduced.addEventListener('change', syncMotion);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  if (document.fonts) document.fonts.ready.then(measure);
  syncMotion();

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
