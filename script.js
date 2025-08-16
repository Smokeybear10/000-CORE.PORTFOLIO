// GSAP ScrollTrigger setup
gsap.registerPlugin(ScrollTrigger);

// HERO TEXT FADING & ROTATING ROLES
const roles = [
  "Frontend Dev",
  "Mathematician",
  "AI Engineer",
  "Statistical Analyst",
  "Quant Analyst",
  "Poker Nerd"
];
const typingDelay = 120, erasingDelay = 80, newTextDelay = 2500;
let roleIndex = 0, charIndex = 0;
const typedEl = document.querySelector(".typed-words");
let isTyping = false;

function typeRole() {
  if (!typedEl) return;
  
  // Ensure we're in typing mode
  if (!isTyping) {
    isTyping = true;
    typedEl.classList.add('typing');
  }
  
  if (charIndex < roles[roleIndex].length) {
    typedEl.textContent += roles[roleIndex].charAt(charIndex++);
    setTimeout(typeRole, typingDelay + Math.random() * 40 - 20); // Add slight variation
  } else {
    // Finished typing this word
    isTyping = false;
    typedEl.classList.remove('typing');
    setTimeout(eraseRole, newTextDelay);
  }
}

function eraseRole() {
  if (!typedEl) return;
  
  // Ensure we're in erasing mode
  if (!isTyping) {
    isTyping = true;
    typedEl.classList.add('typing');
  }
  
  if (charIndex > 0) {
    typedEl.textContent = roles[roleIndex].substring(0, charIndex--);
    setTimeout(eraseRole, erasingDelay);
  } else {
    // Move to next role
    roleIndex = (roleIndex + 1) % roles.length;
    typedEl.textContent = "";
    
    // Brief pause with cursor hidden between words
    isTyping = false;
    typedEl.classList.remove('typing');
    setTimeout(() => {
      typeRole();
    }, 300);
  }
}



document.addEventListener("DOMContentLoaded", () => {

  heroSection.addEventListener("mousemove", (e) => {

    // Apply glow to hero title
    const titleIntensity = Math.max(0, 1 - titleDistance / maxDistance);
    const titleGlowIntensity = 8 + (titleIntensity * 24);
    const titleGlowSpread = 16 + (titleIntensity * 48);
    heroTitle.style.textShadow = `0 0 ${titleGlowIntensity}px #F97316, 0 0 ${titleGlowSpread}px #F97316`;
    
    
    // Apply faint blue glow to button
    const btnIntensity = Math.max(0, 1 - btnDistance / maxDistance);
    const btnGlowIntensity = 2 + (btnIntensity * 8);
    const btnGlowSpread = 4 + (btnIntensity * 16);
    heroBtn.style.textShadow = `0 0 ${btnGlowIntensity}px #F97316, 0 0 ${btnGlowSpread}px #F97316`;
    heroBtn.style.boxShadow = `0 0 ${btnGlowIntensity * 3}px #F97316`;
  });

  // Role typing will be triggered after bio typing completes

  function scrollToAbout() {
    // Removed smooth scrolling to eliminate snapping behavior
  }
  
  if (aboutBtn) aboutBtn.addEventListener("click", scrollToAbout);
  if (aboutNavLink) aboutNavLink.addEventListener("click", scrollToAbout);

  
  // Sequential pop-in/pop-out animations with specific order for about page
  function updateWordVisibility() {
    const viewportTop = window.scrollY;
    const viewportBottom = window.scrollY + window.innerHeight;
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    const viewportHeight = window.innerHeight;
    
    // Define the specific about page sequence (removed education elements)
    const aboutSequence = [
      { selector: '.about-quote-full p', name: 'quote' },
      { selector: '.about-left h2', name: 'greeting' },
      { selector: '.about-photo', name: 'photo' },
      { selector: '.about-welcome', name: 'welcome' },
      { selector: '.about-right p:not(.about-welcome)', name: 'description' },
      { selector: '.journey-btn', name: 'button' }
    ];
    
  
    
    // Handle other page elements with standard fade animation
    const otherElements = document.querySelectorAll('h1, h2, h3, p, .journey-btn, .typed-words, .tech');
    
    otherElements.forEach(element => {
      // Skip about page elements (already handled above)
      if (element.closest('#about')) return;
      
      // Skip specific about me elements that have their own fade-in logic
      if (element.classList.contains('about-hi-sticky') || 
          element.classList.contains('about-hi-photo') || 
          element.classList.contains('about-hi-subtitle') || 
          element.id === 'para-1' || 
          element.id === 'para-2' || 
          element.classList.contains('about-nav-buttons')) return;
      
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementCenter = elementTop + rect.height / 2;
      
      // Standard fade zones for non-about elements
      // Special handling for typed-words to make it appear later when scrolling
      let topFadeZone, bottomFadeZone;
      if (element.classList.contains('typed-words')) {
        topFadeZone = viewportTop + (viewportHeight * 0.4); // Increased from 0.2 to 0.4 - appears later
        bottomFadeZone = viewportBottom - (viewportHeight * 0.4);
      } else {
        topFadeZone = viewportTop + (viewportHeight * 0.2);
        bottomFadeZone = viewportBottom - (viewportHeight * 0.2);
      }
      
      let targetOpacity = 1;
      let targetY = 0;
      let targetScale = 1;
      
      // Handle typed-words visibility - no loading animation needed
      if (element.classList.contains('typed-words')) {
        const isVisible = elementCenter >= topFadeZone && elementCenter <= bottomFadeZone;
        
        if (isVisible) {
          // Show the element and start role typing immediately
          if (!element.classList.contains('show')) {
            element.classList.add('show');
          }
        }
      }
      
      if (elementCenter < topFadeZone) {
        const fadeProgress = Math.max(0, Math.min(1, (topFadeZone - elementCenter) / (viewportHeight * 0.3)));
        targetOpacity = 1 - (fadeProgress * 0.8);
        targetY = -fadeProgress * 30;
        targetScale = 1 - (fadeProgress * 0.05);
      } else if (elementCenter > bottomFadeZone) {
        const fadeProgress = Math.max(0, Math.min(1, (elementCenter - bottomFadeZone) / (viewportHeight * 0.3)));
        targetOpacity = 1 - (fadeProgress * 0.9);
        targetY = fadeProgress * 40;
        targetScale = 1 - (fadeProgress * 0.08);
      }
      
      gsap.to(element, {
        opacity: targetOpacity,
        y: targetY,
        scale: targetScale,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true
      });
    });
  }

  // Disabled to prevent conflicts with custom about me fade-in logic
  // window.addEventListener('scroll', updateWordVisibility);
  // window.addEventListener('DOMContentLoaded', updateWordVisibility);
  
  
  // Initialize element animations
  initializeElementAnimations();

  // Hamburger menu functionality
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const navSlide = document.querySelector('.nav-slide');
  
  function toggleNav() {
    const isOpen = hamburgerMenu.classList.toggle('open');
    navSlide.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  
  hamburgerMenu.addEventListener('click', toggleNav);
  
  // Close nav when clicking on nav links
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburgerMenu.classList.remove('open');
      navSlide.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
  
  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (
      navSlide.classList.contains('open') &&
      !navSlide.contains(e.target) &&
      !hamburgerMenu.contains(e.target)
    ) {
      hamburgerMenu.classList.remove('open');
      navSlide.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Per-letter repel/magnetic animation for hero name
  const heroSpacer = document.querySelector('.hero-spacer');
  if (heroSpacer) {
    const letters = heroSpacer.querySelectorAll('.hero-name span');
    heroSpacer.addEventListener('mousemove', (e) => {
      const rect = heroSpacer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      letters.forEach(letter => {
        const letterRect = letter.getBoundingClientRect();
        const letterX = letterRect.left + letterRect.width / 2 - rect.left;
        const letterY = letterRect.top + letterRect.height / 2 - rect.top;
        const dx = mouseX - letterX;
        const dy = mouseY - letterY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = 180; // px
        if (dist < maxDist) {
          const repel = (1 - dist / maxDist) * 60; // max 60px movement for more effect
          const angle = Math.atan2(dy, dx);
          const tx = -Math.cos(angle) * repel;
          const ty = -Math.sin(angle) * repel;
          gsap.to(letter, {
            x: tx,
            y: ty,
            scale: 1.18 - (dist / maxDist) * 0.18,
            rotate: (1 - dist / maxDist) * 8 * (Math.random() > 0.5 ? 1 : -1),
            duration: 0.32,
            ease: 'expo.out',
            overwrite: true
          });
        } else {
          gsap.to(letter, {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.5,
            ease: 'expo.out',
            overwrite: true
          });
        }
      });
    });
    heroSpacer.addEventListener('mouseleave', () => {
      letters.forEach(letter => {
        gsap.to(letter, {
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)',
          overwrite: true
        });
      });
    });
  }
});

// GSAP ANIMATIONS
gsap.registerPlugin(ScrollTrigger);


// Element animation system (removed education elements - controlled by handleScreenFade)
function initializeElementAnimations() {
  const animatableElements = [
    '.about-quote-full p',
    '.about-welcome',
    '.about-photo',
    '.about-right p:not(.about-welcome)',
    '.journey-btn',
    '.stack-heading',
    '.tech'
  ];
  
  animatableElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.dataset.animated = 'false';
    });
  });
}




// HERO SCROLL - Elements fade out naturally as they scroll up
window.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  if (!hero) return;
  
  const scrollY = window.scrollY;
  const heroHeight = hero.offsetHeight;
  
  // Calculate fade based on how much the hero has scrolled out of view
  const fadeProgress = Math.min(1, scrollY / (heroHeight * 0.8));
  const opacity = 1 - fadeProgress;
  
  // Apply fade to all hero elements
  const heroSpacer = document.querySelector('.hero-spacer');
  const heroTypingCard = document.querySelector('.hero-typing-card');
  const heroIntroBlurb = document.querySelector('.hero-intro-blurb');
  
  if (heroSpacer) {
    gsap.set(heroSpacer, {
      opacity: opacity,
      overwrite: true
    });
  }
  
  if (heroTypingCard) {
    gsap.set(heroTypingCard, {
      opacity: opacity,
      overwrite: true
    });
  }
  
  if (heroIntroBlurb) {
    gsap.set(heroIntroBlurb, {
      opacity: opacity,
      overwrite: true
    });
  }
});



// Initialize typed-words element for role cycling
if (typedEl) {
  typedEl.classList.add('show'); // Make it visible
  typedEl.textContent = ''; // Start empty
}

// Variable to track if elements should be fading out
let shouldFadeOut = false;
let fadeOutOpacity = 1;


// Track scroll direction
let lastScrollY = window.scrollY;
let scrollDirection = 'down';

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
  lastScrollY = currentScrollY;
});

// Handle right education container fade-in after black box appears
function handleRightEducationFadeIn() {
  const blackBox = document.querySelector('.screen-width-black-box');
  const educationElements = document.querySelectorAll('.right-education-container .timeline-container, .right-education-container .experience-cards-container, .right-education-container .research-cards-container');
  
  if (!blackBox || !educationElements.length) return;
  
  // Check if black box has faded in (opacity > 0.5)
  const blackBoxStyle = window.getComputedStyle(blackBox);
  const blackBoxOpacity = parseFloat(blackBoxStyle.opacity);
  
  if (blackBoxOpacity > 0.5) {
    // Black box is visible, so fade in the education elements
    educationElements.forEach(element => {
      element.classList.add('fade-in');
    });
  } else {
    // Black box not visible yet, keep education elements hidden
    educationElements.forEach(element => {
      element.classList.remove('fade-in');
    });
  }
}

// Handle black box fade-in after buttons appear
function handleBlackBoxFadeIn() {
  const blackBox = document.querySelector('.screen-width-black-box');
  const buttons = document.querySelector('.about-nav-buttons');
  
  if (!blackBox || !buttons) return;
  
  // Check if buttons have faded in (opacity > 0.5)
  const buttonsStyle = window.getComputedStyle(buttons);
  const buttonsOpacity = parseFloat(buttonsStyle.opacity);
  
  if (buttonsOpacity > 0.5) {
    // Buttons are visible, so fade in the black box
    blackBox.classList.add('fade-in');
  } else {
    // Buttons not visible yet, keep black box hidden
    blackBox.classList.remove('fade-in');
  }
}

// Handle fade-in for about me elements
function handleAllFadeIns() {
  const windowWidth = window.innerWidth;
  const isVerticalMode = windowWidth <= 964;
  
  if (isVerticalMode) {
    handleMobileFadeIn();
  } else {
    handleDesktopFadeIn();
  }
  
  handleBlackBoxFadeIn();
  handleRightEducationFadeIn();
}

// Desktop fade-in logic with scroll-dependent opacity
function handleDesktopFadeIn() {
  // Desktop mode sticky positions: .about-hi-sticky(20vh), .about-hi-photo(10vh), .about-hi-subtitle(35vh), #para-1(40vh), #para-2(50vh), .about-nav-buttons(65vh)
  const elements = [
    { selector: '.about-hi-sticky', startOffset: .7, endOffset: 0.5, fadeOutOffset: -0.1 }, // 100% - 20vh = 80vh
    { selector: '.about-hi-photo', startOffset: 0.62, endOffset: 0.5 }, // 100% - 10vh = 90vh  
    { selector: '.about-hi-subtitle', startOffset: 0.73, endOffset: 0.46 }, // 100% - 35vh = 65vh
    { selector: '#para-1', startOffset: 0.8, endOffset: 0.7 }, // 100% - 40vh = 60vh
    { selector: '#para-2', startOffset: 0.85, endOffset: 0.6 }, // 100% - 50vh = 50vh
    { selector: '.about-nav-buttons', startOffset: 0.9, endOffset: 0.7 } // 100% - 65vh = 35vh
  ];
  
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  
  elements.forEach(({ selector, startOffset, endOffset, fadeOutOffset }) => {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const elementCenter = elementTop + rect.height / 2;
    
    // Calculate fade based on element position relative to viewport
    const fadeStartPoint = scrollY + (windowHeight * startOffset);
    const fadeEndPoint = scrollY + (windowHeight * endOffset);
    
    let opacity = 0;
    
    // Handle fade-out for elements that have fadeOutOffset (like HELLO I AM THOMAS)
    if (fadeOutOffset !== undefined) {
      const fadeOutPoint = scrollY + (windowHeight * fadeOutOffset);
      
      if (elementCenter <= fadeOutPoint) {
        // Element is past fade-out point - calculate fade-out
        const fadeOutDistance = windowHeight * 0.3; // 30% of viewport for fade-out zone
        const distancePastFadeOut = fadeOutPoint - elementCenter;
        opacity = Math.max(0, 1 - (distancePastFadeOut / fadeOutDistance));
      } else if (elementCenter <= fadeEndPoint) {
        // Element is in visible zone - fully visible
        opacity = 1;
      } else if (elementCenter >= fadeStartPoint) {
        // Element is before fade start point - invisible
        opacity = 0;
      } else {
        // Element is in fade-in zone - calculate progressive opacity
        const fadeDistance = fadeStartPoint - fadeEndPoint;
        const currentDistance = elementCenter - fadeEndPoint;
        opacity = Math.max(0, Math.min(1, 1 - (currentDistance / fadeDistance)));
      }
    } else {
      // Standard fade-in only logic for other elements
      if (elementCenter <= fadeEndPoint) {
        opacity = 1;
      } else if (elementCenter >= fadeStartPoint) {
        opacity = 0;
      } else {
        const fadeDistance = fadeStartPoint - fadeEndPoint;
        const currentDistance = elementCenter - fadeEndPoint;
        opacity = Math.max(0, Math.min(1, 1 - (currentDistance / fadeDistance)));
      }
    }
    
    // Apply the calculated opacity directly - no CSS transitions, pure scroll control
    element.style.opacity = opacity;
    element.style.setProperty('opacity', opacity, 'important'); // Force with !important
  });
}

// Scroll-dependent mobile fade-in function
function handleMobileFadeIn() {
  // Mobile mode sticky positions: .about-hi-sticky(12vh), .about-hi-photo(-3.5vh), .about-hi-subtitle(54vh), #para-1(58vh), #para-2(66vh), .about-nav-buttons(78vh)
  const elements = [
    { selector: '.about-hi-sticky', startOffset: .6, endOffset: 0.4 }, // No fade-out, stays visible
    { selector: '.about-hi-photo', startOffset: 0.6, endOffset: .5 }, // 100% - (-3.5vh) = 103.5vh  
    { selector: '.about-hi-subtitle', startOffset: 0.8, endOffset: 0.6 }, // 100% - 54vh = 46vh
    { selector: '#para-1', startOffset: .8, endOffset: 0.6 }, // 100% - 58vh = 42vh
    { selector: '#para-2', startOffset: .86, endOffset: 0.70 }, // 100% - 66vh = 34vh
    { selector: '.about-nav-buttons', startOffset: .9, endOffset: 0.83 } // 100% - 78vh = 22vh
  ];
  
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  
  elements.forEach(({ selector, startOffset, endOffset, fadeOutOffset }) => {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const elementCenter = elementTop + rect.height / 2;
    
    // Calculate fade based on element position relative to viewport
    const fadeStartPoint = scrollY + (windowHeight * startOffset); // Start fading when element is at 90% viewport
    const fadeEndPoint = scrollY + (windowHeight * endOffset);     // Fully visible when element is at 50% viewport
    
    let opacity = 0;
    
    // Handle fade-out for elements that have fadeOutOffset (like HELLO I AM THOMAS)
    if (fadeOutOffset !== undefined) {
      const fadeOutPoint = scrollY + (windowHeight * fadeOutOffset); // Fade out when element reaches -20% viewport
      
      if (elementCenter <= fadeOutPoint) {
        // Element is past fade-out point - calculate fade-out
        const fadeOutDistance = windowHeight * 0.3; // 30% of viewport for fade-out zone
        const distancePastFadeOut = fadeOutPoint - elementCenter;
        opacity = Math.max(0, 1 - (distancePastFadeOut / fadeOutDistance));
      } else if (elementCenter <= fadeEndPoint) {
        // Element is in visible zone - fully visible
        opacity = 1;
      } else if (elementCenter >= fadeStartPoint) {
        // Element is before fade start point - invisible
        opacity = 0;
      } else {
        // Element is in fade-in zone - calculate progressive opacity
        const fadeDistance = fadeStartPoint - fadeEndPoint;
        const currentDistance = elementCenter - fadeEndPoint;
        opacity = Math.max(0, Math.min(1, 1 - (currentDistance / fadeDistance)));
      }
    } else {
      // Standard fade-in only logic for other elements
      if (elementCenter <= fadeEndPoint) {
        opacity = 1;
      } else if (elementCenter >= fadeStartPoint) {
        opacity = 0;
      } else {
        const fadeDistance = fadeStartPoint - fadeEndPoint;
        const currentDistance = elementCenter - fadeEndPoint;
        opacity = Math.max(0, Math.min(1, 1 - (currentDistance / fadeDistance)));
      }
    }
    
    // Apply the calculated opacity directly - no CSS transitions, pure scroll control
    element.style.opacity = opacity;
    element.style.setProperty('opacity', opacity, 'important'); // Force with !important
    
    // Debug log for HELLO I AM THOMAS element
    if (selector === '.about-hi-sticky') {
      console.log(`HELLO I AM THOMAS: opacity=${opacity}, actual style=${element.style.opacity}, computed=${window.getComputedStyle(element).opacity}`);
    }
  });
}

// DISABLED - This function was interfering with individual element fade-ins
// function handleAboutSectionFade() {
//   const aboutContainer = document.querySelector('#about .container');
//   const educationSection = document.getElementById('experience');
//   
//   if (!aboutContainer || !educationSection) return;
//   
//   const scrollY = window.scrollY;
//   const aboutRect = aboutContainer.getBoundingClientRect();
//   const aboutEnd = scrollY + aboutRect.top + aboutRect.height;
//   
//   // Start fading at the very end of the about section
//   const fadeStartPoint = aboutEnd - 100; // Start fade 100px before end
//   const fadeEndPoint = aboutEnd; // Complete fade at end
//   
//   let fadeProgress = 0;
//   
//   if (scrollY >= fadeStartPoint && scrollY <= fadeEndPoint) {
//     // Quick fade - calculate progress over small distance
//     fadeProgress = (scrollY - fadeStartPoint) / (fadeEndPoint - fadeStartPoint);
//     fadeProgress = Math.max(0, Math.min(1, fadeProgress));
//   } else if (scrollY > fadeEndPoint) {
//     fadeProgress = 1; // Fully faded
//   }
//   
//   // Apply quick fade effect to about section
//   aboutContainer.style.opacity = 1 - fadeProgress;
// }

// Continuously update Thomas Ou section position to track "HELLO. I AM THOMAS" element
function updateThomasOuPosition() {
  const thomasOuSection = document.querySelector('.thomas-ou-section');
  const aboutThomasOu = document.querySelector('.about-hi-sticky');
  
  // Only update position if the element is visible (has fade-in class)
  if (thomasOuSection && aboutThomasOu && thomasOuSection.classList.contains('fade-in')) {
    const aboutThomasRect = aboutThomasOu.getBoundingClientRect();
    
    // Continuously update fixed position to track the reference element
    thomasOuSection.style.position = 'fixed';
    thomasOuSection.style.top = (aboutThomasRect.top + 80) + 'px';
    thomasOuSection.style.left = aboutThomasRect.left + 'px';
    thomasOuSection.style.zIndex = '1000';
  }
}

// Handle solid black box background when education content appears  
function handleScreenFade() {
  const aboutSection = document.getElementById('about');
  const overlay = document.querySelector('.screen-fade-overlay');
  const thomasOuSection = document.querySelector('.thomas-ou-section');
  const aboutThomasOu = document.querySelector('.about-hi-sticky');
  const thomasOuTitle = document.querySelector('.thomas-ou-title');
  const thomasOuDetails = document.querySelector('.thomas-ou-details');
  
  if (!aboutSection || !overlay) return;
  
  const aboutRect = aboutSection.getBoundingClientRect();
  const scrollY = window.scrollY;
  const aboutStart = scrollY + aboutRect.top;
  const aboutHeight = aboutRect.height;
  const windowHeight = window.innerHeight;
  
  // Different overlay start and fade-out points for mobile vs desktop
  const windowWidth = window.innerWidth;
  const isMobileMode = windowWidth <= 964;
  
  // Show black overlay at different points for mobile vs desktop
  const overlayStartPoint = isMobileMode 
    ? aboutStart + (aboutHeight * 0.25) // Start at 52% through about section for mobile
    : aboutStart + (aboutHeight * 0.4); // Start at 30% through about section for desktop
  const overlayEndPoint = isMobileMode 
    ? aboutStart + aboutHeight + (windowHeight * 1) // Fade out even much later in mobile mode
    : aboutStart + aboutHeight + (windowHeight * 1.2); // Fade out much sooner in desktop mode
  
  // Mobile elements fade out earlier than the overlay
  const mobileElementsFadeOutPoint = aboutStart + (aboutHeight * 0.73); // Fade out at 60% through about section
  
  if (scrollY >= overlayStartPoint && scrollY <= overlayEndPoint) {
    // Show full black background
    overlay.style.opacity = 1;
    
    // Fade in Thomas Ou title and details elements at the same time as the black overlay
    if (thomasOuTitle) {
      thomasOuTitle.classList.add('fade-in');
    }
    if (thomasOuDetails) {
      thomasOuDetails.classList.add('fade-in');
    }
    
    // Fade in mobile elements (for vertical mode) but only if we haven't reached their fade-out point
    const mobileHelloThomas = document.querySelector('.mobile-hello-thomas');
    const mobileSummaryContainer = document.querySelector('.mobile-summary-container');
    if (scrollY < mobileElementsFadeOutPoint) {
      if (mobileHelloThomas) {
        mobileHelloThomas.classList.add('fade-in');
      }
      if (mobileSummaryContainer) {
        mobileSummaryContainer.classList.add('fade-in');
      }
    } else {
      // Fade out mobile elements if we're past their fade-out point
      if (mobileHelloThomas) {
        mobileHelloThomas.classList.remove('fade-in');
      }
      if (mobileSummaryContainer) {
        mobileSummaryContainer.classList.remove('fade-in');
      }
    }
    
    // Fade in education content at the same time as black overlay
    const educationContentRight = document.querySelector('.education-content-right');
    if (educationContentRight) {
      educationContentRight.classList.add('fade-in');
    }
    
    // Fade in education timeline at the same time, but fade out at 95% through about section
    const educationTimeline = document.querySelector('.education-timeline-fixed');
    const timelineFadeOutPoint = aboutStart + (aboutHeight * 0.90); // Fade out at 80% through about section
    
    if (educationTimeline && scrollY < timelineFadeOutPoint) {
      educationTimeline.classList.add('fade-in');
    } else if (educationTimeline) {
      educationTimeline.classList.remove('fade-in');
    }
    
    // Update navigation highlighting based on scroll position (outside timeline logic)
    const educationNavItem = document.querySelector('[data-section="education"]');
    const experienceNavItem = document.querySelector('[data-section="experience"]');
    const researchNavItem = document.querySelector('[data-section="research"]');
    
    // Navigation based on spatial sections using section titles as boundaries
    const experienceTitle = document.querySelector('.experience-section-title');
    const researchTitle = document.querySelector('.research-section-title');
    
    // Get section positions
    const experienceRect = experienceTitle ? experienceTitle.getBoundingClientRect() : null;
    const researchRect = researchTitle ? researchTitle.getBoundingClientRect() : null;
    
    // Clear all active states
    if (educationNavItem) educationNavItem.classList.remove('active');
    if (experienceNavItem) experienceNavItem.classList.remove('active');
    if (researchNavItem) researchNavItem.classList.remove('active');
    
    // Simple spatial boundaries
    if (researchRect && researchRect.top < windowHeight * 0.6) {
      // Research section is visible
      if (researchNavItem) researchNavItem.classList.add('active');
    } else if (experienceRect && experienceRect.top < windowHeight * 0.6) {
      // Experience section is visible
      if (experienceNavItem) experienceNavItem.classList.add('active');
    } else if (scrollY >= overlayStartPoint) {
      // Education area (everything above experience)
      if (educationNavItem) educationNavItem.classList.add('active');
    }

    // Handle section focus animation based on navigation indicators
    const timelineContainer = document.querySelector('.timeline-container');
    const experienceContainer = document.querySelector('.experience-cards-container');
    const researchContainer = document.querySelector('.research-cards-container');
    const educationTitleElement = document.querySelector('.education-section-title');
    const experienceTitleElement = document.querySelector('.experience-section-title');
    const researchTitleElement = document.querySelector('.research-section-title');
    
    // Remove all focus classes first
    if (timelineContainer) timelineContainer.classList.remove('in-focus');
    if (experienceContainer) experienceContainer.classList.remove('in-focus');
    if (researchContainer) researchContainer.classList.remove('in-focus');
    if (educationTitleElement) educationTitleElement.classList.remove('in-focus');
    if (experienceTitleElement) experienceTitleElement.classList.remove('in-focus');
    if (researchTitleElement) researchTitleElement.classList.remove('in-focus');
    
    // Add focus class based on which navigation item is active
    if (researchNavItem && researchNavItem.classList.contains('active')) {
      if (researchContainer) researchContainer.classList.add('in-focus');
      if (researchTitleElement) researchTitleElement.classList.add('in-focus');
    } else if (experienceNavItem && experienceNavItem.classList.contains('active')) {
      if (experienceContainer) experienceContainer.classList.add('in-focus');
      if (experienceTitleElement) experienceTitleElement.classList.add('in-focus');
    } else if (educationNavItem && educationNavItem.classList.contains('active')) {
      if (timelineContainer) timelineContainer.classList.add('in-focus');
      if (educationTitleElement) educationTitleElement.classList.add('in-focus');
    }
    
    // Fade in Thomas Ou section and position it fixed relative to viewport based on "HELLO. I AM THOMAS"
    if (thomasOuSection && aboutThomasOu) {
      const aboutThomasRect = aboutThomasOu.getBoundingClientRect();
      
      // Apply fixed positioning using viewport coordinates from getBoundingClientRect
      thomasOuSection.style.position = 'fixed';
      thomasOuSection.style.top = (aboutThomasRect.top + 80) + 'px';
      thomasOuSection.style.left = aboutThomasRect.left + 'px';
      thomasOuSection.style.zIndex = '1000'; // Ensure it stays on top
      thomasOuSection.classList.add('fade-in');
    }
  } else {
    // Hide overlay when outside the range
    overlay.style.opacity = 0;
    
    // Fade out Thomas Ou title and details elements when the black overlay disappears
    if (thomasOuTitle) {
      thomasOuTitle.classList.remove('fade-in');
    }
    if (thomasOuDetails) {
      thomasOuDetails.classList.remove('fade-in');
    }
    
    // Fade out mobile elements (for vertical mode)
    const mobileHelloThomas = document.querySelector('.mobile-hello-thomas');
    const mobileSummaryContainer = document.querySelector('.mobile-summary-container');
    if (mobileHelloThomas) {
      mobileHelloThomas.classList.remove('fade-in');
    }
    if (mobileSummaryContainer) {
      mobileSummaryContainer.classList.remove('fade-in');
    }
    
    // Fade out education content when black overlay disappears
    const educationContentRight = document.querySelector('.education-content-right');
    if (educationContentRight) {
      educationContentRight.classList.remove('fade-in');
    }
    
    // Fade out education timeline at the same time
    const educationTimeline = document.querySelector('.education-timeline-fixed');
    if (educationTimeline) {
      educationTimeline.classList.remove('fade-in');
    }
    
    // Fade out Thomas Ou section but maintain fixed positioning
    if (thomasOuSection) {
      thomasOuSection.classList.remove('fade-in');
      // Keep fixed positioning even when hidden
      thomasOuSection.style.position = 'fixed';
    }
  }
}

// Add scroll listener for all fade-ins
window.addEventListener('scroll', handleAllFadeIns);
window.addEventListener('scroll', handleScreenFade);
window.addEventListener('scroll', updateThomasOuPosition);
window.addEventListener('DOMContentLoaded', handleAllFadeIns);
window.addEventListener('DOMContentLoaded', handleScreenFade);
window.addEventListener('DOMContentLoaded', updateThomasOuPosition);

// Start role typing animation on DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
  // Start role typing immediately since no bio typing needed
  if (typedEl) {
    roleIndex = 0;
    charIndex = 0;
    isTyping = false;
    typeRole();
  }

  // Experience Cards Modal Functionality
  const experienceData = {
    'flushing-cpa': {
      title: 'Data & Analytics',
      company: 'Flushing CPA Tax Center',
      location: 'New York, NY',
      year: 'Feb 2024 -- May 2024',
      details: [
        'Engineered ETL pipelines automating high-volume data ingestion, improved projection accuracy by 15%.',
        'Created Excel-based compliance detection macros; streamlined anomaly detection in client returns.',
        'Built and validated regression models to estimate quarterly tax liabilities for SMBs.'
      ]
    },
    'spodnick-law': {
      title: 'Legal Research & NLP',
      company: 'Offices of Jonathan Spodnick',
      location: 'Trumbull, CT',
      year: 'Sep 2023 -- Dec 2023',
      details: [
        'Conducted legal research and prepared discovery documentation for state-level personal injury cases.',
        'Built a Python-based NLP tool to categorize legal texts and reduce manual review time.',
        'Used statistical methods to analyze injury claim trends and settlement values.'
      ]
    },
    'citic-securities': {
      title: 'Fintech Analyst',
      company: 'CITIC Securities',
      location: 'Beijing, China',
      year: 'Jun 2023 -- Jul 2023',
      details: [
        'Contributed to listing proposal for $11B spaceflight network company by analyzing growth metrics.',
        'Assessed the market impact of regulatory penalties during CITIC\'s RMB regulatory penalty.',
        'Supported the preparation of a prospectus for issuing $18 billion in convertible bonds for a regional bank.'
      ]
    }
  };

  // Research Cards Modal Functionality
  const researchData = {
    'pppl': {
      title: 'Research Assistant',
      company: 'Princeton Plasma Physics Lab (PPPL)',
      year: 'Jul 2024 -- Aug 2024',
      details: [
        'Simulated charged particle behavior in tokamak reactors under varied magnetic/plasma conditions.',
        'Built statistical models to predict fusion rates based on confinement and operational variables.'
      ]
    },
    'capstone': {
      title: 'Bayesian Behavioral Modeling Approach to Opponent Profiling',
      company: 'Capstone Project',
      year: 'Sep 2023 -- May 2024',
      details: [
        'Designed a Bayesian inference model to estimate opponent bluffing tendencies across multi-street poker hands using betting patterns, position, and stack context.',
        'Built poker engine to simulate hand histories and dynamically update probabilistic opponent profiles.',
        'Applied game-theoretic reasoning and EV optimization to generate counter-strategies against varying bluff frequencies and behavioral profiles.'
      ]
    }
  };

  // Research card click handlers
  document.querySelectorAll('.research-card').forEach(card => {
    card.addEventListener('click', () => {
      const researchId = card.dataset.research;
      const research = researchData[researchId];
      
      if (research) {
        const modal = document.getElementById('research-modal');
        const modalContent = modal.querySelector('.research-modal-content');
        
        // Populate modal content
        modal.querySelector('.research-year-badge').textContent = research.year;
        modal.querySelector('.research-modal-title').textContent = research.title;
        modal.querySelector('.research-modal-company').textContent = research.company;
        
        // Populate details
        const detailsContainer = modal.querySelector('.research-modal-details');
        detailsContainer.innerHTML = '<ul>' + research.details.map(detail => `<li>${detail}</li>`).join('') + '</ul>';
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Research modal close functionality
  const researchModal = document.getElementById('research-modal');
  const researchModalClose = researchModal.querySelector('.research-modal-close');
  
  function closeResearchModal() {
    researchModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  researchModalClose.addEventListener('click', closeResearchModal);
  
  // Close modal when clicking outside
  researchModal.addEventListener('click', (e) => {
    if (e.target === researchModal) {
      closeResearchModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && researchModal.classList.contains('active')) {
      closeResearchModal();
    }
  });


  // Experience card click handlers
  document.querySelectorAll('.experience-card').forEach(card => {
    card.addEventListener('click', () => {
      const experienceId = card.dataset.experience;
      const experience = experienceData[experienceId];
      
      if (experience) {
        const modal = document.getElementById('experience-modal');
        const modalContent = modal.querySelector('.experience-modal-content');
        
        // Populate modal content
        modal.querySelector('.experience-year-badge').textContent = experience.year;
        modal.querySelector('.experience-modal-title').textContent = experience.title;
        modal.querySelector('.experience-modal-company').textContent = experience.company;
        modal.querySelector('.experience-modal-location').textContent = experience.location;
        
        // Populate details
        const detailsContainer = modal.querySelector('.experience-modal-details');
        detailsContainer.innerHTML = '<ul>' + experience.details.map(detail => `<li>${detail}</li>`).join('') + '</ul>';
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Modal close functionality
  const experienceModal = document.getElementById('experience-modal');
  const experienceModalClose = experienceModal.querySelector('.experience-modal-close');
  
  function closeExperienceModal() {
    experienceModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  experienceModalClose.addEventListener('click', closeExperienceModal);
  
  // Close modal when clicking outside
  experienceModal.addEventListener('click', (e) => {
    if (e.target === experienceModal) {
      closeExperienceModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && experienceModal.classList.contains('active')) {
      closeExperienceModal();
    }
  });

});

