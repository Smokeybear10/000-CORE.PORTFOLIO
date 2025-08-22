// Simple SPA Navigation Handler with Music
document.addEventListener('DOMContentLoaded', () => {
  console.log('SPA Navigation initialized');
  
  // Get navigation buttons
  const navButtons = document.querySelectorAll('.spa-nav-btn');
  const navContainer = document.querySelector('.spa-nav');
  console.log('Found nav buttons:', navButtons.length);
  
  // Music elements
  const backgroundMusic = document.getElementById('backgroundMusic');
  const hoverMusic = document.getElementById('hoverMusic');
  
  let isHovering = false;
  let currentFadeInterval = null;
  
  // Music fade functions
  function fadeToHover() {
    if (!backgroundMusic || !hoverMusic || isHovering) return;
    
    // Clear any existing fade interval
    if (currentFadeInterval) {
      clearInterval(currentFadeInterval);
      currentFadeInterval = null;
    }
    
    isHovering = true;
    
    // Start hover music if not already playing
    if (hoverMusic.paused) {
      hoverMusic.play().catch(e => console.log('Hover music play failed:', e));
    }
    
    // Fade out emotions, fade in resonance
    currentFadeInterval = setInterval(() => {
      if (backgroundMusic.volume > 0) {
        backgroundMusic.volume = Math.max(0, backgroundMusic.volume - 0.05);
      }
      if (hoverMusic.volume < 0.5) {
        hoverMusic.volume = Math.min(0.5, hoverMusic.volume + 0.05);
      }
      
      if (backgroundMusic.volume <= 0 && hoverMusic.volume >= 0.5) {
        clearInterval(currentFadeInterval);
        currentFadeInterval = null;
      }
    }, 50);
  }
  
  function fadeToBackground() {
    if (!backgroundMusic || !hoverMusic || !isHovering) return;
    
    // Clear any existing fade interval
    if (currentFadeInterval) {
      clearInterval(currentFadeInterval);
      currentFadeInterval = null;
    }
    
    isHovering = false;
    
    // Get target volume based on current route
    const currentRoute = window.spaRouter ? window.spaRouter.getCurrentRoute() : 'home';
    const targetVolume = currentRoute === 'home' ? 0.2 : 0.3;
    
    // Fade out resonance, fade in emotions
    currentFadeInterval = setInterval(() => {
      if (hoverMusic.volume > 0) {
        hoverMusic.volume = Math.max(0, hoverMusic.volume - 0.05);
      }
      if (backgroundMusic.volume < targetVolume) {
        backgroundMusic.volume = Math.min(targetVolume, backgroundMusic.volume + 0.05);
      }
      
      if (hoverMusic.volume <= 0 && backgroundMusic.volume >= targetVolume) {
        clearInterval(currentFadeInterval);
        currentFadeInterval = null;
        hoverMusic.pause();
      }
    }, 50);
  }
  
  // Add hover listeners to navigation container
  if (navContainer && backgroundMusic && hoverMusic) {
    navContainer.addEventListener('mouseenter', fadeToHover);
    navContainer.addEventListener('mouseleave', fadeToBackground);
  }
  
  // Handle navigation clicks
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const route = button.getAttribute('data-route');
      console.log('Navigation clicked:', route);
      
      // Update active state
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Navigate using SPA router
      if (window.spaRouter) {
        window.spaRouter.navigateTo(route);
      } else {
        console.error('SPA Router not found');
      }
    });
  });
  
  // Function to update active nav state
  window.updateNavActive = (activeRoute) => {
    navButtons.forEach(btn => {
      const route = btn.getAttribute('data-route');
      if (route === activeRoute) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };
});