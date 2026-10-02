/* Portfolio v2 : volontairement minimal.
   1. Année courante dans le pied de page
   2. Bouton « Copier l'adresse » sur la page Contact */

'use strict';

document.querySelectorAll('.annee').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

const boutonCopie = document.querySelector('[data-copier]');
if (boutonCopie) {
  const retour = document.querySelector('.copie-retour');
  boutonCopie.addEventListener('click', async () => {
    const adresse = boutonCopie.dataset.copier;
    try {
      await navigator.clipboard.writeText(adresse);
      retour.textContent = 'Adresse copiée.';
    } catch {
      retour.textContent = 'Copie impossible ici : sélectionnez l\'adresse ci-dessus.';
    }
  });
}
