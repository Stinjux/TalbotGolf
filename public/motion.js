
'use strict';
/* 01 — Réglages. Durées et décalages en secondes ; positions ScrollTrigger en CSS. */
const SETTINGS = {
  curveDuration: .48, curveStagger: .12, titleDuration: .75, titleDelay: .1,
  entranceDuration: .65, columnStagger: .08, ruleDuration: .7,
  entranceStart: 'top 75%', dockDistance: .8, planStart: 'top 75%', planEnd: 'bottom 55%',
  counterDuration: 1.6, finalDuration: 1, finalLogoDelay: .3,
  coursesDelivered: null // Remplacer null par le nombre exact de parcours livrés.
};
const courses = document.querySelector('#courses-count');
if (courses && Number.isInteger(SETTINGS.coursesDelivered) && SETTINGS.coursesDelivered >= 0) {
  courses.dataset.count = SETTINGS.coursesDelivered;
  courses.textContent = SETTINGS.coursesDelivered;
  courses.setAttribute('aria-label', SETTINGS.coursesDelivered + ' parcours livrés');
  document.querySelector('#courses-note').remove();
}
/* Tout est visible sans JavaScript, sans CDN ou si une dépendance échoue. */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  const counted = new WeakSet();
  let introPlayed = false;
  const format = new Intl.NumberFormat('fr-FR');
  const hint = (nodes, value) => gsap.utils.toArray(nodes).forEach(n => n.style.willChange = value);
  const release = nodes => gsap.utils.toArray(nodes).forEach(n => n.style.removeProperty('will-change'));
  /* matchMedia annule les animations et restaure les styles à chaque changement de mode. */
  media.add({desktop:'(min-width:768px)', mobile:'(max-width:767px)', reduce:'(prefers-reduced-motion:reduce)'}, context => {
    const {desktop, reduce} = context.conditions;
    const counterNodes = [...document.querySelectorAll('[data-count]')];
    if (reduce) {
      counterNodes.forEach(n => {n.textContent = format.format(+n.dataset.count) + (n.dataset.suffix || ''); counted.add(n);});
      return; // Ni déclencheur de scroll, ni dessin, ni animation en mode réduit.
    }
    const cleanupNodes = [];
    const track = nodes => {const list=gsap.utils.toArray(nodes);cleanupNodes.push(...list);return list;};
    let flying = null, drawRoot = document.querySelector('.hero-art');
    /* 02 — Le même symbole reste dans une couche fixe ; seule sa transformation varie.
       Ses coordonnées sont mesurées, jamais animées via top/left/width. Pas de pin. */
    if (desktop) {
      const slot=document.querySelector('.hero-symbol'), target=document.querySelector('.symbol-slot');
      flying=document.createElement('div');flying.className='flying-symbol';flying.setAttribute('aria-hidden','true');
      flying.append(drawRoot.cloneNode(true));document.body.append(flying);drawRoot=flying.querySelector('svg');
      gsap.set('.hero-symbol > svg, .nav-symbol',{opacity:0});
      let origin, destination, baseWidth=280;
      function measure(){const r=slot.getBoundingClientRect(),t=target.getBoundingClientRect();origin={x:r.left,y:r.top+window.scrollY,width:r.width};destination={x:t.left,y:t.top,width:t.width};}
      const progress={value:0};
      function place(){const p=progress.value, y=origin.y-window.scrollY;
        gsap.set(flying,{x:origin.x+(destination.x-origin.x)*p,y:y+(destination.y-y)*p,scale:(origin.width+(destination.width-origin.width)*p)/baseWidth});
      }
      measure();place();track(flying);
      gsap.to(progress,{value:1,ease:'none',onUpdate:place,scrollTrigger:{trigger:'#hero',start:0,end:()=>'+='+Math.max(1,slot.closest('.hero').offsetHeight*SETTINGS.dockDistance),scrub:true,
        onRefreshInit:measure,onRefresh:place,onUpdate:self=>{if(self.isActive)hint(flying,'transform');else release(flying);place();}}});
    }
    /* 03 — Introduction : quatre courbes du bas vers le haut, puis le titre. */
    const curves=track(drawRoot.querySelectorAll('.curve')),title=track('.hero-title');
    if (!introPlayed) {
      introPlayed=true;
      curves.forEach(path=>{const length=path.getTotalLength();gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});});
      gsap.set(title,{y:24,opacity:0});
      gsap.timeline().to(curves,{strokeDashoffset:0,duration:SETTINGS.curveDuration,stagger:SETTINGS.curveStagger,ease:'power2.out',onStart:()=>hint(curves,'stroke-dashoffset'),onComplete:()=>release(curves)})
      .to(title,{y:0,opacity:1,duration:SETTINGS.titleDuration,ease:'power2.out',onStart:()=>hint(title,'transform, opacity'),onComplete:()=>release(title)},'+='+SETTINGS.titleDelay);
    }
    /* 04 — Approche : ligne horizontale et trois entrées décalées. */
    const rule=track('.rule'),columns=track('.column');
    gsap.from(rule,{scaleX:0,duration:SETTINGS.ruleDuration,ease:'power2.out',onStart:()=>hint(rule,'transform'),onComplete:()=>release(rule),scrollTrigger:{trigger:'#approche',start:SETTINGS.entranceStart,once:true}});
    gsap.from(columns,{y:desktop?24:0,opacity:0,duration:SETTINGS.entranceDuration,stagger:SETTINGS.columnStagger,ease:'power2.out',onStart:()=>hint(columns,'transform, opacity'),onComplete:()=>release(columns),scrollTrigger:{trigger:'#approche',start:SETTINGS.entranceStart,once:true}});
    /* 05 — Plan : seuils calculés sur la longueur réelle du chemin SVG.
       stroke-dashoffset et clip-path sont les deux exceptions nécessaires au brief. */
    const route=document.querySelector('#route'),labels=track('.plan-label');track(route);
    if (desktop) {
      const length=route.getTotalLength();gsap.set(route,{strokeDasharray:length,strokeDashoffset:length});gsap.set(labels,{opacity:0});
      // Chercher le point du chemin le plus proche de chaque repère.
      function fraction(x,y){let best=Infinity,at=0;for(let i=0;i<=500;i++){const p=route.getPointAtLength(length*i/500),d=(p.x-x)**2+(p.y-y)**2;if(d<best){best=d;at=i/500;}}return at;}
      const thresholds=[0,fraction(553,210),fraction(853,105)];
      const timeline=gsap.timeline({scrollTrigger:{trigger:'.drawing',start:SETTINGS.planStart,end:SETTINGS.planEnd,scrub:true,
        onToggle:self=>{if(self.isActive){hint(route,'stroke-dashoffset');hint(labels,'opacity');}else{release(route);release(labels);}}}});
      timeline.to(route,{strokeDashoffset:0,duration:1,ease:'none'},0);
      labels.forEach((label,i)=>timeline.to(label,{opacity:1,duration:.04,ease:'none'},Math.min(thresholds[i],.96)));
    } else {
      const drawing=track('.drawing');gsap.from(drawing,{opacity:0,duration:SETTINGS.entranceDuration,onStart:()=>hint(drawing,'opacity'),onComplete:()=>release(drawing),scrollTrigger:{trigger:'.drawing',start:SETTINGS.entranceStart,once:true}});
    }
    /* 06 — Compteurs : une seule incrémentation, y compris après un redimensionnement. */
    counterNodes.forEach(node=>{
      const end=+node.dataset.count,suffix=node.dataset.suffix||'';
      if(counted.has(node)){node.textContent=format.format(end)+suffix;return;}
      const state={value:0};node.textContent='0'+suffix;
      gsap.to(state,{value:end,duration:SETTINGS.counterDuration,ease:'power2.out',snap:{value:1},onStart:()=>counted.add(node),onUpdate:()=>{node.textContent=format.format(state.value)+suffix;},onComplete:()=>{node.textContent=format.format(end)+suffix;},scrollTrigger:{trigger:node,start:SETTINGS.entranceStart,once:true}});
    });
    /* 07 — Masque du bas vers le haut ; fondu simple sur mobile. */
    const panel=track('.contact-panel'),brand=track('.contact-brand');
    const finale=gsap.timeline({scrollTrigger:{trigger:'#contact',start:SETTINGS.entranceStart,once:true}});
    finale.from(panel,desktop?{clipPath:'inset(100% 0 0 0)',duration:SETTINGS.finalDuration,ease:'power2.out',onStart:()=>hint(panel,'clip-path'),onComplete:()=>release(panel)}:{opacity:0,duration:SETTINGS.entranceDuration,onStart:()=>hint(panel,'opacity'),onComplete:()=>release(panel)})
      .from(brand,{opacity:0,duration:SETTINGS.entranceDuration,onStart:()=>hint(brand,'opacity'),onComplete:()=>release(brand)},SETTINGS.finalLogoDelay);
    /* Les liens restent accessibles même si l'utilisateur navigue au clavier. */
    const revealOnFocus=()=>{finale.progress(1);release(panel);release(brand);};
    document.querySelector('#contact').addEventListener('focusin',revealOnFocus);
    return ()=>{flying?.remove();release(cleanupNodes);document.querySelector('#contact').removeEventListener('focusin',revealOnFocus);};
  });
  // Recalcul après chargement de la police, sans déplacer ni détourner le scroll.
  document.fonts?.ready.then(()=>ScrollTrigger.refresh());
}
