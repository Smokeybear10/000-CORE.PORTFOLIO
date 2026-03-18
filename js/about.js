// Text entrance animations for About page
let aboutScrollTriggers = [];

function setupAboutAnimations() {
  cleanupAboutAnimationsInternal();

  gsap.registerPlugin(ScrollTrigger);

  const st1 = gsap.fromTo('.profile-text h2',
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0, duration: 1, ease: "power2.out",
      scrollTrigger: { trigger: '.profile-text h2', start: "top 80%", toggleActions: "play none none reverse" }
    }
  );
  if (st1.scrollTrigger) aboutScrollTriggers.push(st1.scrollTrigger);

  gsap.utils.toArray('.profile-text p').forEach((paragraph) => {
    const tween = gsap.fromTo(paragraph,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: paragraph, start: "top 85%", toggleActions: "play none none reverse" }
      }
    );
    if (tween.scrollTrigger) aboutScrollTriggers.push(tween.scrollTrigger);
  });

  const st2 = gsap.fromTo('.profile-image',
    { opacity: 0, scale: 0.8, rotation: -5 },
    {
      opacity: 1, scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)",
      scrollTrigger: { trigger: '.profile-image', start: "top 80%", toggleActions: "play none none reverse" }
    }
  );
  if (st2.scrollTrigger) aboutScrollTriggers.push(st2.scrollTrigger);

  gsap.utils.toArray('.info-section').forEach((section) => {
    const tween = gsap.fromTo(section,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: section, start: "top 80%", end: "bottom 20%", toggleActions: "play none none reverse" }
      }
    );
    if (tween.scrollTrigger) aboutScrollTriggers.push(tween.scrollTrigger);
  });

  gsap.utils.toArray('.icon-container').forEach((icon, i) => {
    const tween = gsap.fromTo(icon,
      { opacity: 0, scale: 0, rotation: 180 },
      {
        opacity: 1, scale: 1, rotation: 0, duration: 0.6, delay: i * 0.05, ease: "back.out(1.7)",
        scrollTrigger: { trigger: icon, start: "top 90%", toggleActions: "play none none reverse" }
      }
    );
    if (tween.scrollTrigger) aboutScrollTriggers.push(tween.scrollTrigger);
  });
}

function cleanupAboutAnimationsInternal() {
  aboutScrollTriggers.forEach(st => st.kill());
  aboutScrollTriggers = [];
}

// Stack dropdown functionality (only needs to bind once)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.stack-header').forEach((header) => {
    header.addEventListener('click', () => {
      const section = header.parentElement;
      const isActive = section.classList.contains('active');
      document.querySelectorAll('.stack-section').forEach(s => s.classList.remove('active'));
      if (!isActive) section.classList.add('active');
    });
  });

  // Initial setup if starting on about route
  if (document.body.getAttribute('data-current-route') === 'about') {
    setupAboutAnimations();
  }
});

window.initAboutAnimations = function () {
  setupAboutAnimations();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
};

window.cleanupAboutAnimations = function () {
  cleanupAboutAnimationsInternal();
};
