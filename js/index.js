// TYPING ANIMATION FOR ABOUT PAGE - DISABLED
/*
const aboutRoles = [
  "GTO Poker Nerd",
  "CTF Fanatic",
  "Full Stack Developer",
  "DeFi Enthusiast",
  "MonteCarlo Researcher"
];
const aboutTypingDelay = 120, aboutErasingDelay = 80, aboutNewTextDelay = 2500;
let aboutRoleIndex = 0, aboutCharIndex = 0;
const aboutTypedEl = document.querySelector(".about-typed-text");
let aboutIsTyping = false;

function typeAboutRole() {
  if (!aboutTypedEl) return;

  if (!aboutIsTyping) {
    aboutIsTyping = true;
    aboutTypedEl.classList.add('typing');
  }

  if (aboutCharIndex < aboutRoles[aboutRoleIndex].length) {
    aboutTypedEl.textContent += aboutRoles[aboutRoleIndex].charAt(aboutCharIndex++);
    setTimeout(typeAboutRole, aboutTypingDelay + Math.random() * 40 - 20);
  } else {
    aboutIsTyping = false;
    aboutTypedEl.classList.remove('typing');
    setTimeout(eraseAboutRole, aboutNewTextDelay);
  }
}

// STARTUP ANIMATION - DISABLED
/*
// Custom cursor animation
// Check if this is a fresh visit or internal navigation
function isFirstVisit() {
  // Check if we came from another page on the same site
  const referrer = document.referrer;
  const currentDomain = window.location.hostname;

  // If referrer is from the same domain, it's internal navigation - skip animation
  if (referrer) {
    try {
      const referrerDomain = new URL(referrer).hostname;
      if (referrerDomain === currentDomain) {
        return false; // Internal navigation, skip animation
      }
    } catch (e) {
      // If we can't parse referrer, continue with other checks
    }
  }

  // Always show animation for page reloads, direct visits, bookmarks, or external links
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  // Force scroll to top
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  const preloader = document.getElementById('startup-preloader');
  const clickButton = document.getElementById('startupClickButton');

  // Check if this is a first visit
  console.log('Is first visit:', isFirstVisit());

  if (isFirstVisit()) {
    // First visit - show startup animation
    console.log('Running startup animation');
    document.body.style.overflow = 'hidden';

    if (preloader) {
      preloader.style.display = 'flex';
      preloader.style.opacity = '1';
    }

    if (clickButton) {
      clickButton.style.opacity = '0';
      clickButton.classList.remove('show');
    }

    // Reset letter positions using GSAP to ensure proper state
    gsap.set('.startup-name-text span', {
      y: '100%'
    });

    // Run startup animation
    runStartupAnimation();
  } else {
    // Return visit - skip animation and go straight to content
    console.log('Skipping startup animation');
    if (preloader) {
      preloader.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
  }

  function runStartupAnimation() {
    console.log('runStartupAnimation called');
    const bars = document.querySelectorAll('.preloader-bar');
    console.log('Preloader:', preloader, 'Bars:', bars.length, 'ClickButton:', clickButton);

    if (preloader && bars.length > 0) {
      console.log('Starting GSAP timeline');
      const tl = gsap.timeline({
        defaults: {
          ease: 'power1.inOut',
        }
      });

      // First animate the name letters up (slower)
      tl.to('.startup-name-text span', {
        y: 0,
        stagger: 0.08,
        duration: 0.3,
      });

      // Then show the click button after a delay
      tl.to(clickButton, {
        delay: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          clickButton.classList.add('show');
        }
      });

      // Handle click button
      clickButton.addEventListener('click', () => {
        gsap.to(preloader, {
          autoAlpha: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            // Re-enable scrolling after animation completes
            document.body.style.overflow = 'auto';
          }
        });
      });
    } else {
      console.log('Animation conditions not met, showing content');
      // Fallback - ensure content is accessible
      if (preloader) {
        preloader.style.display = 'none';
      }
      document.body.style.overflow = 'auto';
    }
  }

  // Start typing animation for about page
  if (aboutTypedEl) {
    aboutTypedEl.classList.add('show');
    aboutTypedEl.textContent = '';
    aboutRoleIndex = 0;
    aboutCharIndex = 0;
    aboutIsTyping = false;
    typeAboutRole();
  }
});
*/

// Typing animation - DISABLED
/*
document.addEventListener('DOMContentLoaded', () => {
  // Start typing animation for about page
  const aboutTypedEl = document.querySelector(".about-typed-text");
  if (aboutTypedEl) {
    aboutTypedEl.classList.add('show');
    aboutTypedEl.textContent = '';
    aboutRoleIndex = 0;
    aboutCharIndex = 0;
    aboutIsTyping = false;
    typeAboutRole();
  }
});
*/

// Interactive canvas star field with mouse repulsion
(function() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Style canvas to be background
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '-1';
  document.body.insertBefore(canvas, document.body.firstChild);

  let stars = [];
  let mouse = { x: null, y: null };
  const numStars = 200;
  const repulsionRadius = 150;
  const repulsionForce = 0.5;
  const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

  class Star {
    constructor() {
      this.reset();
      // Random initial position
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.homeX = Math.random() * canvas.width;
      this.homeY = Math.random() * canvas.height;
      this.x = this.homeX;
      this.y = this.homeY;
      this.vx = 0;
      this.vy = 0;
      this.size = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.4 + 0.35;
      this.twinkleSpeed = Math.random() * 0.01 + 0.002;
      this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    update() {
      // Calculate distance from mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Repulsion force
        if (distance < repulsionRadius) {
          const force = (1 - distance / repulsionRadius) * repulsionForce;
          this.vx += (dx / distance) * force;
          this.vy += (dy / distance) * force;
        }
      }

      // Return to home position
      const homeForce = 0.1;
      this.vx += (this.homeX - this.x) * homeForce;
      this.vy += (this.homeY - this.y) * homeForce;

      // Apply friction
      this.vx *= 0.85;
      this.vy *= 0.85;

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Twinkle effect
      const twinkle = Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset);
      this.currentOpacity = this.opacity + twinkle * 0.08;
    }

    draw(parallax) {
      ctx.beginPath();
      ctx.arc(this.x + parallax.x, this.y + parallax.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.currentOpacity})`;
      ctx.fill();

      // Add glow for larger stars
      if (this.size > 1.5) {
        ctx.beginPath();
        ctx.arc(this.x + parallax.x, this.y + parallax.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.currentOpacity * 0.1})`;
        ctx.fill();
      }
    }
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recalculate home positions for existing stars
    stars.forEach(star => {
      const percentX = star.homeX / canvas.width || Math.random();
      const percentY = star.homeY / canvas.height || Math.random();
      star.homeX = percentX * canvas.width;
      star.homeY = percentY * canvas.height;
    });
  }

  function init() {
    resize();
    stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smooth parallax interpolation
    parallax.x += (parallax.targetX - parallax.x) * 0.08;
    parallax.y += (parallax.targetY - parallax.y) * 0.08;

    stars.forEach(star => {
      star.update();
      star.draw(parallax);
    });

    requestAnimationFrame(animate);
  }

  // Event listeners
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Parallax target relative to center (small factor for subtle shift)
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.5;
    parallax.targetX = (e.clientX - cx) * 0.02;
    parallax.targetY = (e.clientY - cy) * 0.02;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
    parallax.targetX = 0;
    parallax.targetY = 0;
  });

  // Initialize and start animation
  init();
  animate();
})();