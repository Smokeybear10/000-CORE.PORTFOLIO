// Simple navigation with dynamic model loading - HOME AND EXPERIENCE PAGES
document.addEventListener('DOMContentLoaded', () => {
  // Wait for SPA to initialize, then check route
  setTimeout(() => {
    const currentRoute = document.body.getAttribute('data-current-route');
    if (currentRoute !== 'experience' && currentRoute !== 'home') {
      console.log('Navigation.js: Skipping model setup - not on home or experience page, current route:', currentRoute);
      return;
    }

    initializeNavigationModels();
  }, 500);
});

// Function to initialize navigation models for experience page
function initializeNavigationModels() {
  // Prevent duplicate initialization
  if (window.navModelsInitialized) {
    console.log('Navigation models already initialized, skipping...');
    return;
  }
  window.navModelsInitialized = true;

  const navLinks = document.querySelectorAll('.nav-link');
  const projectsLinks = document.querySelectorAll('.nav-link');
  console.log('Found nav links:', projectsLinks.length);
  projectsLinks.forEach((link, index) => {
    console.log(`Nav link ${index + 1}:`, link.textContent.trim());
  });
  const cubeContainer = document.getElementById('cube-container');
  const modelContainer = document.getElementById('model-container');

  // Set up dynamic model hover for multiple navigation links
  const modelNavLinks = ['projects', 'experience', 'about', 'contact'];
  
  modelNavLinks.forEach(linkName => {
    const navLink = Array.from(projectsLinks).find(link => 
      link.textContent.toLowerCase().trim() === linkName
    );
    
    if (navLink && cubeContainer && modelContainer) {
      console.log(`Setting up ${linkName} hover functionality`);
      
      // Function to show the model (works for both hover and touch)
      function showModel() {
        console.log(`Showing ${linkName} model - loading 3D model`);
        
        // Clear any pending hide timeout immediately
        if (window.hideModelTimeout) {
          clearTimeout(window.hideModelTimeout);
          window.hideModelTimeout = null;
          console.log(`Cleared pending hide timeout`);
        }
        
        // Set current hovered model immediately
        window.currentHoveredModel = linkName;
        console.log(`Set currentHoveredModel to: ${linkName}`);
        
        // Load and show the appropriate model
        if (window.loadAndShowModel) {
          window.loadAndShowModel(linkName);
        }
        
        // Fade out cube, fade in 3D model
        cubeContainer.style.opacity = '0';
        modelContainer.style.display = 'block';
        modelContainer.style.opacity = '1';
        
        // Disable cube animations
        if (window.setCubeVisible) window.setCubeVisible(false);
        
        // Gradient overlay removed
        
        // Force model to stay visible after a small delay (in case of race conditions)
        setTimeout(() => {
          if (window.currentHoveredModel === linkName) {
            modelContainer.style.display = 'block';
            modelContainer.style.opacity = '1';
            console.log(`Force-ensured ${linkName} model is visible`);
          }
        }, 200);
        
        console.log(`After ${linkName} show - Model visible`);
      }

      // Desktop hover events
      navLink.addEventListener('mouseenter', showModel);
      
      // Touch events for mobile (especially horizontal mode)
      navLink.addEventListener('touchstart', (e) => {
        // Don't prevent default to allow navigation clicks to work
        showModel();
      });
      
      navLink.addEventListener('mouseleave', () => {
        console.log(`Left ${linkName} hover - scheduling hide check`);
        
        // Clear current hovered model if it's this one
        if (window.currentHoveredModel === linkName) {
          window.currentHoveredModel = null;
        }
        
        // Schedule hiding with a delay to allow switching between buttons
        window.hideModelTimeout = setTimeout(() => {
          if (!window.currentHoveredModel) {
            console.log(`Hiding model - no button hovered`);
            // Fade out 3D model, fade in cube
            cubeContainer.style.opacity = '1';
            modelContainer.style.opacity = '0';
            
            // Re-enable cube animations
            if (window.setCubeVisible) window.setCubeVisible(true);
            
            setTimeout(() => {
              modelContainer.style.display = 'none';
            }, 300);
          }
        }, 150); // Delay to allow switching between buttons
        
        // Gradient overlay removed
      });
    } else {
      console.log(`Missing elements for ${linkName}:`, { 
        navLink: !!navLink, 
        cubeContainer: !!cubeContainer, 
        modelContainer: !!modelContainer 
      });
    }
  });
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const linkText = link.textContent.toLowerCase().trim();
      let targetPage = '';
      
      // Map navigation to target pages
      switch(linkText) {
        case 'home':
          targetPage = 'home.html';
          break;
        case 'about':
          targetPage = 'about.html';
          break;
        case 'experience':
          targetPage = 'experience.html';
          break;
        case 'projects':
          targetPage = 'Projects.html';
          break;
        case 'contact':
          targetPage = 'contact.html';
          break;
        default:
          return;
      }
      
      if (targetPage) {
        // Slow ease-out transition
        document.body.style.transition = 'opacity 0.8s ease-out';
        document.body.style.opacity = '0';
        
        // Navigate after ease-out
        setTimeout(() => {
          window.location.href = targetPage;
        }, 800);
      }
    });
  });
}

// Make it available globally so experience route can call it
window.initializeNavigationModels = initializeNavigationModels;