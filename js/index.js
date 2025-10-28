// TYPING ANIMATION FOR ABOUT PAGE
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

function eraseAboutRole() {
  if (!aboutTypedEl) return;
  
  if (!aboutIsTyping) {
    aboutIsTyping = true;
    aboutTypedEl.classList.add('typing');
  }
  
  if (aboutCharIndex > 0) {
    aboutTypedEl.textContent = aboutRoles[aboutRoleIndex].substring(0, aboutCharIndex--);
    setTimeout(eraseAboutRole, aboutErasingDelay);
  } else {
    aboutRoleIndex = (aboutRoleIndex + 1) % aboutRoles.length;
    aboutTypedEl.textContent = "";
    
    aboutIsTyping = false;
    aboutTypedEl.classList.remove('typing');
    setTimeout(() => {
      typeAboutRole();
    }, 300);
  }
}

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