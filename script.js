/* ============================================================
   SCRIPT COMMUN — toutes les pages
   1. Transitions entre les pages (voile)
   2. Curseur personnalisé
   3. Navigation (lien actif, barre au scroll, menu mobile)
   4. Révélations au scroll (GSAP + ScrollTrigger)
   5. Barres de compétences + compteurs animés
   6. Boutons magnétiques
   7. Projecteur sur les cartes (halo qui suit la souris)
   8. Assemblage des mots au scroll (paragraphes [data-mots])
   9. Formulaire de contact (simulation d'envoi)
   ============================================================ */

'use strict';

const docEl = document.documentElement;
const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointeurFin = window.matchMedia('(pointer: fine)').matches;
const gsapDispo = typeof window.gsap !== 'undefined';

if (gsapDispo && typeof window.ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ============================================================
   1. TRANSITIONS ENTRE LES PAGES
   Le voile noir disparaît à l'arrivée et revient avant de
   naviguer vers une autre page interne.
   ============================================================ */

// Arrivée : on révèle la page (pageshow couvre aussi le retour
// via le cache navigation du navigateur)
window.addEventListener('pageshow', () => {
  docEl.classList.remove('sortie');
  requestAnimationFrame(() => docEl.classList.add('pret'));
});

// Sortie : interception des liens internes vers les pages .html
document.addEventListener('click', (e) => {
  const lien = e.target.closest('a[href$=".html"]');
  if (!lien || lien.target === '_blank') return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const url = lien.getAttribute('href');
  if (!url || url.startsWith('http')) return;

  e.preventDefault();

  if (mouvementReduit) {
    window.location.href = url;
    return;
  }

  docEl.classList.remove('menu-ouvert');
  docEl.classList.add('sortie');
  setTimeout(() => { window.location.href = url; }, 340);
});

/* ============================================================
   2. CURSEUR PERSONNALISÉ
   Point précis + anneau qui suit avec inertie.
   Uniquement sur pointeur fin (pas de tactile), et désactivé
   si l'utilisateur préfère réduire les animations.
   ============================================================ */

(function initCurseur() {
  const point = document.querySelector('.curseur');
  const anneau = document.querySelector('.curseur-anneau');
  if (!point || !anneau || !pointeurFin || mouvementReduit) return;

  docEl.classList.add('curseur-actif');

  let sourisX = window.innerWidth / 2;
  let sourisY = window.innerHeight / 2;
  let anneauX = sourisX;
  let anneauY = sourisY;

  window.addEventListener('mousemove', (e) => {
    sourisX = e.clientX;
    sourisY = e.clientY;
    // Le point colle à la souris
    point.style.transform = `translate(${sourisX}px, ${sourisY}px) translate(-50%, -50%)`;
  });

  // L'anneau rattrape la souris avec un léger retard (inertie)
  (function suivre() {
    anneauX += (sourisX - anneauX) * 0.16;
    anneauY += (sourisY - anneauY) * 0.16;
    anneau.style.transform = `translate(${anneauX}px, ${anneauY}px) translate(-50%, -50%)`;
    requestAnimationFrame(suivre);
  })();

  // L'anneau s'agrandit au survol des éléments interactifs
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, textarea, [data-survol]')) {
      docEl.classList.add('survol');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, textarea, [data-survol]')) {
      docEl.classList.remove('survol');
    }
  });
})();

/* ============================================================
   3. NAVIGATION
   ============================================================ */

(function initNavigation() {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.burger');

  // La barre se solidifie dès qu'on quitte le sommet de page
  if (nav) {
    const majNav = () => nav.classList.toggle('solide', window.scrollY > 24);
    window.addEventListener('scroll', majNav, { passive: true });
    majNav();
  }

  // Menu mobile plein écran
  if (burger) {
    burger.addEventListener('click', () => {
      const ouvert = docEl.classList.toggle('menu-ouvert');
      burger.setAttribute('aria-expanded', String(ouvert));
    });
  }

  // Mise en évidence du lien de la page courante
  const pageCourante = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-liens a, .menu-mobile a').forEach((lien) => {
    const href = lien.getAttribute('href');
    if (href === pageCourante || (pageCourante === '' && href === 'index.html')) {
      lien.classList.add('actif');
    }
  });
})();

/* ============================================================
   4. RÉVÉLATIONS AU SCROLL
   [data-reveal]        → élément seul qui monte en fondu
   [data-reveal-groupe] → enfants révélés en cascade
   ============================================================ */

(function initRevelations() {
  if (!gsapDispo || typeof ScrollTrigger === 'undefined' || mouvementReduit) return;

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: parseFloat(el.dataset.delai || 0),
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  document.querySelectorAll('[data-reveal-groupe]').forEach((groupe) => {
    gsap.from(groupe.children, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: groupe, start: 'top 86%' }
    });
  });

  // Entrée de la page d'accueil : les éléments du hero arrivent en cascade
  const elementsIntro = document.querySelectorAll('[data-intro]');
  if (elementsIntro.length) {
    gsap.from(elementsIntro, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      stagger: 0.11,
      ease: 'power3.out',
      delay: 0.45
    });
  }

  // Parallaxe douce : le contenu du hero s'efface en défilant
  const hero = document.querySelector('.hero');
  if (hero) {
    gsap.to('.hero-contenu', {
      y: -70,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom 38%',
        scrub: true
      }
    });
  }
})();

/* ============================================================
   5. BARRES DE COMPÉTENCES + COMPTEURS
   Chaque .competence porte data-niveau="85" : la barre se
   remplit et le pourcentage défile à l'entrée dans l'écran.
   ============================================================ */

(function initCompetences() {
  const competences = document.querySelectorAll('.competence');
  if (!competences.length) return;

  const animerCompteur = (el, cible) => {
    const duree = 1300;
    const depart = performance.now();
    const tic = (t) => {
      const progression = Math.min(1, (t - depart) / duree);
      const lissee = 1 - Math.pow(1 - progression, 3); // accélération douce
      el.textContent = Math.round(cible * lissee) + '%';
      if (progression < 1) requestAnimationFrame(tic);
    };
    requestAnimationFrame(tic);
  };

  const observateur = new IntersectionObserver((entrees, obs) => {
    entrees.forEach((entree) => {
      if (!entree.isIntersecting) return;
      obs.unobserve(entree.target);

      const niveau = parseInt(entree.target.dataset.niveau, 10) || 0;
      const barre = entree.target.querySelector('.competence-remplissage');
      const pct = entree.target.querySelector('.competence-pct');

      if (barre) barre.style.width = niveau + '%';
      if (pct) {
        if (mouvementReduit) pct.textContent = niveau + '%';
        else animerCompteur(pct, niveau);
      }
    });
  }, { threshold: 0.4 });

  competences.forEach((c) => observateur.observe(c));
})();

/* ============================================================
   6. BOUTONS MAGNÉTIQUES
   Les boutons s'inclinent légèrement vers le curseur.
   ============================================================ */

(function initMagnetisme() {
  if (!pointeurFin || mouvementReduit) return;

  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.16}px, ${dy * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ============================================================
   7. PROJECTEUR SUR LES CARTES
   Pose les coordonnées de la souris en variables CSS pour
   le halo lumineux (voir .carte::after dans style.css).
   ============================================================ */

(function initProjecteur() {
  if (!pointeurFin) return;

  document.querySelectorAll('.carte, .projet-carte').forEach((carte) => {
    carte.addEventListener('mousemove', (e) => {
      const r = carte.getBoundingClientRect();
      carte.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      carte.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

/* ============================================================
   8. ASSEMBLAGE DES MOTS AU SCROLL
   Les paragraphes [data-mots] sont découpés mot à mot, puis
   chaque mot vient se poser à sa place (flou + rotation).
   Alternative légère à l'animation « bras robotisés ».
   ============================================================ */

(function initAssemblageMots() {
  if (!gsapDispo || typeof ScrollTrigger === 'undefined' || mouvementReduit) return;

  // Enveloppe chaque mot des nœuds texte dans un <span class="mot">
  // (récursif pour préserver les <strong> et autres balises)
  const decouperEnMots = (noeud) => {
    Array.from(noeud.childNodes).forEach((enfant) => {
      if (enfant.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        enfant.textContent.split(/(\s+)/).forEach((morceau) => {
          if (!morceau) return;
          if (/^\s+$/.test(morceau)) {
            fragment.appendChild(document.createTextNode(morceau));
          } else {
            const span = document.createElement('span');
            span.className = 'mot';
            span.textContent = morceau;
            fragment.appendChild(span);
          }
        });
        noeud.replaceChild(fragment, enfant);
      } else if (enfant.nodeType === Node.ELEMENT_NODE) {
        decouperEnMots(enfant);
      }
    });
  };

  document.querySelectorAll('[data-mots]').forEach((paragraphe) => {
    decouperEnMots(paragraphe);
    gsap.from(paragraphe.querySelectorAll('.mot'), {
      opacity: 0,
      y: 14,
      rotation: 3,
      filter: 'blur(5px)',
      duration: 0.55,
      stagger: 0.018,
      ease: 'power2.out',
      scrollTrigger: { trigger: paragraphe, start: 'top 85%' }
    });
  });
})();

/* ============================================================
   9. FORMULAIRE DE CONTACT (simulation d'envoi)
   ============================================================ */

(function initFormulaire() {
  const formulaire = document.querySelector('.formulaire-contact');
  if (!formulaire) return;

  formulaire.addEventListener('submit', (e) => {
    e.preventDefault();
    const bouton = formulaire.querySelector('button');
    const texteInitial = bouton.textContent;
    bouton.textContent = 'Message envoyé ✓';
    bouton.style.background = 'linear-gradient(115deg, #059669, #10b981)';
    setTimeout(() => {
      bouton.textContent = texteInitial;
      bouton.style.background = '';
      formulaire.reset();
    }, 3000);
  });
})();

/* ============================================================
   10. ACCORDÉON DES EXPÉRIENCES
   Chaque .exp-item possède un en-tête .exp-tete (bouton) et un
   panneau .exp-panneau dont la hauteur est animée à l'ouverture.
   L'item portant la classe « ouvert » est déplié au chargement.
   Les items se replient/déplient indépendamment.
   ============================================================ */

(function initAccordeon() {
  const items = document.querySelectorAll('.exp-item');
  if (!items.length) return;

  items.forEach((item) => {
    const tete = item.querySelector('.exp-tete');
    const panneau = item.querySelector('.exp-panneau');
    if (!tete || !panneau) return;

    // État initial : ouvert (hauteur auto) ou fermé (hauteur 0)
    const ouvertAuDepart = item.classList.contains('ouvert');
    panneau.style.height = ouvertAuDepart ? 'auto' : '0px';
    tete.setAttribute('aria-expanded', String(ouvertAuDepart));

    tete.addEventListener('click', () => {
      const estOuvert = item.classList.contains('ouvert');

      if (estOuvert) {
        // Fermeture : hauteur réelle → 0
        panneau.style.height = panneau.scrollHeight + 'px';
        requestAnimationFrame(() => { panneau.style.height = '0px'; });
        item.classList.remove('ouvert');
        tete.setAttribute('aria-expanded', 'false');
      } else {
        // Ouverture : 0 → hauteur réelle, puis « auto » pour rester souple
        item.classList.add('ouvert');
        tete.setAttribute('aria-expanded', 'true');
        panneau.style.height = panneau.scrollHeight + 'px';
        panneau.addEventListener('transitionend', function fin(e) {
          if (e.propertyName !== 'height') return;
          panneau.style.height = 'auto';
          panneau.removeEventListener('transitionend', fin);
        });

        // Petite entrée en cascade des sous-blocs (si GSAP dispo)
        if (gsapDispo && !mouvementReduit) {
          gsap.from(panneau.querySelectorAll('.exp-bloc'), {
            opacity: 0,
            y: 18,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out'
          });
        }
      }
    });
  });

  // Si la fenêtre est redimensionnée, un panneau ouvert reste en « auto »,
  // donc rien à recalculer : la hauteur s'adapte d'elle-même.
})();

/* ============================================================
   ANNÉE AUTOMATIQUE DANS LE PIED DE PAGE
   ============================================================ */

document.querySelectorAll('.annee-courante').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
