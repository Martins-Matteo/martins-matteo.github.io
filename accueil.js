/* ============================================================
   SCRIPT ACCUEIL — fond animé du hero
   1. Champ de particules lavande (canvas 2D maison, très léger)
   2. Icosaèdre filaire Three.js : rotation lente, suit la
      souris, se transforme au défilement.
   Les deux animations se mettent en pause quand le hero sort
   de l'écran ou que l'onglet est masqué, et sont figées si
   l'utilisateur préfère réduire les animations.
   ============================================================ */

'use strict';

(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Visibilité partagée : pilote la pause des deux animations
  let heroVisible = true;
  let ongletVisible = !document.hidden;

  new IntersectionObserver((entrees) => {
    heroVisible = entrees[0].isIntersecting;
  }, { threshold: 0.05 }).observe(hero);

  document.addEventListener('visibilitychange', () => {
    ongletVisible = !document.hidden;
  });

  const estActif = () => heroVisible && ongletVisible;

  /* ============================================================
     1. PARTICULES
     ============================================================ */

  (function initParticules() {
    const toile = document.getElementById('toile-particules');
    if (!toile) return;

    const ctx = toile.getContext('2d');
    let largeur = 0;
    let hauteur = 0;

    const redimensionner = () => {
      largeur = toile.clientWidth;
      hauteur = toile.clientHeight;
      // Limite le ratio de pixels pour préserver les performances
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      toile.width = largeur * ratio;
      toile.height = hauteur * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    redimensionner();
    window.addEventListener('resize', redimensionner);

    // Moins de particules sur petit écran
    const nombre = window.innerWidth < 700 ? 26 : 70;
    const particules = Array.from({ length: nombre }, () => ({
      x: Math.random(),
      y: Math.random(),
      rayon: Math.random() * 1.5 + 0.4,
      vitesse: Math.random() * 0.00045 + 0.00012,
      phase: Math.random() * Math.PI * 2,      // décalage du scintillement
      opacite: Math.random() * 0.4 + 0.12
    }));

    const dessiner = (temps) => {
      ctx.clearRect(0, 0, largeur, hauteur);
      for (const p of particules) {
        // Scintillement doux, propre à chaque particule
        const scintillement = 0.65 + 0.35 * Math.sin(temps * 0.001 + p.phase);
        ctx.globalAlpha = p.opacite * scintillement;
        ctx.fillStyle = '#C4B5FD';
        ctx.beginPath();
        ctx.arc(p.x * largeur, p.y * hauteur, p.rayon, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (reduit) {
      // Animations réduites : une seule image fixe
      dessiner(0);
      return;
    }

    const boucle = (temps) => {
      if (estActif()) {
        for (const p of particules) {
          p.y -= p.vitesse;                    // dérive lente vers le haut
          if (p.y < -0.02) p.y = 1.02;
        }
        dessiner(temps);
      }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  })();

  /* ============================================================
     2. OBJET 3D — icosaèdre filaire (Three.js)
     ============================================================ */

  (function initObjet3D() {
    const toile = document.getElementById('toile-3d');
    if (!toile || typeof THREE === 'undefined') return;

    const rendu = new THREE.WebGLRenderer({
      canvas: toile,
      alpha: true,
      antialias: true
    });
    rendu.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.z = 3.4;

    // Groupe : enveloppe filaire + structure interne + sommets
    const groupe = new THREE.Group();

    // Enveloppe : arêtes de l'icosaèdre en violet
    const geometrieExterne = new THREE.IcosahedronGeometry(1.15, 0);
    const enveloppe = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometrieExterne),
      new THREE.LineBasicMaterial({ color: 0x8B5CF6, transparent: true, opacity: 0.55 })
    );
    groupe.add(enveloppe);

    // Structure interne plus fine et plus discrète, en magenta
    const geometrieInterne = new THREE.IcosahedronGeometry(0.72, 1);
    const structure = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometrieInterne),
      new THREE.LineBasicMaterial({ color: 0xE754C8, transparent: true, opacity: 0.16 })
    );
    groupe.add(structure);

    // Points lumineux aux sommets de l'enveloppe
    const sommets = new THREE.Points(
      geometrieExterne,
      new THREE.PointsMaterial({ color: 0xE754C8, size: 0.045, transparent: true, opacity: 0.9 })
    );
    groupe.add(sommets);

    scene.add(groupe);

    // Position de l'objet : à droite du texte sur grand écran,
    // centré (et plus discret, via CSS) sur mobile
    const placerGroupe = () => {
      groupe.position.x = window.innerWidth > 860 ? 1.05 : 0;
    };

    const redimensionner = () => {
      const largeur = toile.clientWidth;
      const hauteur = toile.clientHeight;
      rendu.setSize(largeur, hauteur, false);
      camera.aspect = largeur / hauteur;
      camera.updateProjectionMatrix();
      placerGroupe();
    };
    redimensionner();
    window.addEventListener('resize', redimensionner);

    // Cible de rotation pilotée par la souris (suivie avec inertie)
    let cibleX = 0;
    let cibleY = 0;
    window.addEventListener('pointermove', (e) => {
      cibleY = (e.clientX / window.innerWidth - 0.5) * 0.6;
      cibleX = (e.clientY / window.innerHeight - 0.5) * 0.45;
    });

    if (reduit) {
      // Animations réduites : une seule image fixe, légèrement inclinée
      groupe.rotation.set(0.4, 0.6, 0);
      rendu.render(scene, camera);
      return;
    }

    let derive = 0; // rotation continue indépendante de la souris

    const boucle = () => {
      if (estActif()) {
        derive += 0.0016;

        // Le défilement fait tourner, grossir et descendre l'objet
        const progression = Math.min(1, window.scrollY / window.innerHeight);

        groupe.rotation.y += (derive + cibleY - groupe.rotation.y) * 0.05;
        groupe.rotation.x += (cibleX + progression * 0.8 - groupe.rotation.x) * 0.05;
        groupe.rotation.z = progression * 0.9;

        const echelle = 1 + progression * 0.35;
        groupe.scale.set(echelle, echelle, echelle);
        groupe.position.y = -progression * 0.7;

        // La structure interne tourne à contre-sens, lentement
        structure.rotation.y -= 0.003;
        structure.rotation.x += 0.0015;

        rendu.render(scene, camera);
      }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  })();
})();
