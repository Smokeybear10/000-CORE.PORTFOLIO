// About page functionality (no scroll-triggered entrance animations)

// Stack dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.stack-header').forEach((header) => {
    header.addEventListener('click', () => {
      const section = header.parentElement;
      const isActive = section.classList.contains('active');
      document.querySelectorAll('.stack-section').forEach(s => s.classList.remove('active'));
      if (!isActive) section.classList.add('active');
    });
  });
});

window.initAboutAnimations = function () {};
window.cleanupAboutAnimations = function () {};
