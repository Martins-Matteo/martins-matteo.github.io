// CUSTOM CURSOR
const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');

document.addEventListener('mousemove', (e) => {
  if (cursor) cursor.style.cssText += `left:${e.clientX}px;top:${e.clientY}px;`;
  if (cursorRing) {
    setTimeout(() => {
      cursorRing.style.cssText += `left:${e.clientX}px;top:${e.clientY}px;`;
    }, 80);
  }
});

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursor) { cursor.style.width = '20px'; cursor.style.height = '20px'; }
    if (cursorRing) { cursorRing.style.width = '50px'; cursorRing.style.height = '50px'; }
  });
  el.addEventListener('mouseleave', () => {
    if (cursor) { cursor.style.width = '12px'; cursor.style.height = '12px'; }
    if (cursorRing) { cursorRing.style.width = '36px'; cursorRing.style.height = '36px'; }
  });
});

// ACTIVE NAV LINK
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
  if (currentPage === '' && link.getAttribute('href') === 'index.html') link.classList.add('active');
});

// SKILL BARS ANIMATION
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.skills-grid, .skill-item').forEach(el => observer.observe(el));

// SCROLL REVEAL
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .project-card, .stat-box').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

// CONTACT FORM
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = 'MESSAGE ENVOYÉ ✓';
    btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
    setTimeout(() => {
      btn.textContent = 'ENVOYER';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}

// GLITCH EFFECT ON TITLE HOVER
document.querySelectorAll('.hero h1').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.filter = 'drop-shadow(2px 0 0 rgba(6,182,212,0.5)) drop-shadow(-2px 0 0 rgba(124,58,237,0.5))';
    setTimeout(() => el.style.filter = '', 200);
  });
});
