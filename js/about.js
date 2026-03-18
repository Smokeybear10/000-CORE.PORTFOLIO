// Text entrance animations for About page
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Animate profile text elements on scroll
  gsap.fromTo('.profile-text h2',
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0, duration: 1, ease: "power2.out",
      scrollTrigger: { trigger: '.profile-text h2', start: "top 80%", toggleActions: "play none none reverse" }
    }
  );

  gsap.utils.toArray('.profile-text p').forEach((paragraph) => {
    gsap.fromTo(paragraph,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: paragraph, start: "top 85%", toggleActions: "play none none reverse" }
      }
    );
  });

  // Animate profile image on scroll
  gsap.fromTo('.profile-image',
    { opacity: 0, scale: 0.8, rotation: -5 },
    {
      opacity: 1, scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)",
      scrollTrigger: { trigger: '.profile-image', start: "top 80%", toggleActions: "play none none reverse" }
    }
  );

  // Animate info sections on scroll
  gsap.utils.toArray('.info-section').forEach((section) => {
    gsap.fromTo(section,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: section, start: "top 80%", end: "bottom 20%", toggleActions: "play none none reverse" }
      }
    );
  });

  // Animate stack icons
  gsap.utils.toArray('.icon-container').forEach((icon, i) => {
    gsap.fromTo(icon,
      { opacity: 0, scale: 0, rotation: 180 },
      {
        opacity: 1, scale: 1, rotation: 0, duration: 0.6, delay: i * 0.05, ease: "back.out(1.7)",
        scrollTrigger: { trigger: icon, start: "top 90%", toggleActions: "play none none reverse" }
      }
    );
  });

  // Stack dropdown functionality
  document.querySelectorAll('.stack-header').forEach((header) => {
    header.addEventListener('click', () => {
      const section = header.parentElement;
      const isActive = section.classList.contains('active');

      // Close all other dropdowns
      document.querySelectorAll('.stack-section').forEach(s => {
        s.classList.remove('active');
      });

      // Toggle current dropdown
      if (!isActive) {
        section.classList.add('active');
      }
    });
  });
});
