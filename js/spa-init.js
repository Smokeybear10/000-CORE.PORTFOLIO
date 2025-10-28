// SPA Initialization and Route Management
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the SPA router
  const router = new SPARouter();

  // Register routes
  console.log('Registering SPA routes...');
  router.addRoute('home', {
    title: 'Thomas Ou • Portfolio',
    contentSelector: '#home-content',
    showElements: [
      '.startup-preloader',
      '.name-heading', 
      '.about-typing-card',
      '#cube-container',
      '#model-container'
    ],
    hideElements: [
      '.scroll-progress'
    ],
    onEnter: async () => {
      // Set body route attribute
      document.body.setAttribute('data-current-route', 'home');
      
      // Update navigation active state
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const homeNavLink = document.querySelector('.nav-link[data-spa-route="home"]');
      if (homeNavLink) homeNavLink.classList.add('active');
      
      // Show home elements
      document.querySelector('.name-heading').style.display = 'block';
      document.querySelector('.about-typing-card').style.display = 'flex';
      document.querySelector('#cube-container').style.display = 'block';
      document.querySelector('#model-container').style.display = 'block';
      
      // Hide scroll progress
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';
      
      // Restart home page animations
      if (window.initHomeAnimations) {
        window.initHomeAnimations();
      }
      
      // Restart 3D cube
      if (window.init3DCube) {
        window.init3DCube();
      }
      
      // Restart 3D models
      if (window.init3DModels) {
        window.init3DModels();
      }
      
      // Reset scroll position
      window.scrollTo(0, 0);
      
      // Update music to home track
      const backgroundMusic = document.getElementById('backgroundMusic');
      const hoverMusic = document.getElementById('hoverMusic');
      if (backgroundMusic && hoverMusic) {
        backgroundMusic.src = 'Assets/Emotions.mp3';
        hoverMusic.src = 'Assets/Resonance.mp3';
        backgroundMusic.volume = 0.2;
        hoverMusic.volume = 0;
        hoverMusic.currentTime = 25;
      }
      
    },
    onExit: async () => {
      // Hide home elements
      document.querySelector('.name-heading').style.display = 'none';
      document.querySelector('.about-typing-card').style.display = 'none';
      document.querySelector('#cube-container').style.display = 'none';
      document.querySelector('#model-container').style.display = 'none';
      
      // Clean up home page specific elements
      if (window.cleanup3DCube) {
        window.cleanup3DCube();
      }
      if (window.cleanup3DModels) {
        window.cleanup3DModels();
      }
    }
  });

  router.addRoute('about', {
    title: 'Thomas Ou • About',
    contentSelector: '#about-content',
    showElements: [
      '.scroll-progress'
    ],
    hideElements: [
      '.startup-preloader',
      '.name-heading',
      '.about-typing-card', 
      '#cube-container',
      '#model-container'
    ],
    onEnter: async () => {
      // Set body route attribute
      document.body.setAttribute('data-current-route', 'about');
      
      // Update navigation active state
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const aboutNavLink = document.querySelector('.nav-link[data-spa-route="about"]');
      if (aboutNavLink) aboutNavLink.classList.add('active');
      
      // Hide home elements
      document.querySelector('.name-heading').style.display = 'none';
      document.querySelector('.about-typing-card').style.display = 'none';
      document.querySelector('#cube-container').style.display = 'none';
      document.querySelector('#model-container').style.display = 'none';
      
      // Show about elements
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'block';
      
      // Restart about page animations
      if (window.initAboutAnimations) {
        window.initAboutAnimations();
      }
      
      // Reset scroll position
      window.scrollTo(0, 0);
      
      // Update scroll progress
      if (window.updateScrollProgress) {
        window.updateScrollProgress();
      }
      
      // Update music to about track
      const backgroundMusic = document.getElementById('backgroundMusic');
      if (backgroundMusic) {
        backgroundMusic.src = 'Assets/Resonance.mp3';
        backgroundMusic.volume = 0.3;
      }
      
    },
    onExit: async () => {
      // Hide about elements
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';
      
      // Clean up about page specific animations
      if (window.cleanupAboutAnimations) {
        window.cleanupAboutAnimations();
      }
    }
  });

  router.addRoute('experience', {
    title: 'Thomas Ou • Experience',
    contentSelector: '#experience-content',
    showElements: [
      '.scroll-progress'
    ],
    hideElements: [
      '.startup-preloader',
      '.name-heading',
      '.about-typing-card', 
      '#cube-container',
      '#model-container'
    ],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'experience');
      
      // Update navigation active state
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const experienceNavLink = document.querySelector('.nav-link[data-spa-route="experience"]');
      if (experienceNavLink) experienceNavLink.classList.add('active');
      
      // Hide home elements
      document.querySelector('.name-heading').style.display = 'none';
      document.querySelector('.about-typing-card').style.display = 'none';
      document.querySelector('#cube-container').style.display = 'none';
      document.querySelector('#model-container').style.display = 'none';
      
      // Show scroll progress
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'block';
      
      // Initialize experience page animations if available
      setTimeout(() => {
        // Ensure key elements are visible
        const profilePhoto = document.querySelector('.profile-photo.hello-visible');
        const allProfilePhotos = document.querySelectorAll('.profile-photo');
        const leftSection = document.querySelector('.left-section');
        const helloVisibleElements = document.querySelectorAll('.hello-visible');
        
        // Force all profile photos to be visible
        allProfilePhotos.forEach(photo => {
          photo.style.display = 'block';
          photo.style.visibility = 'visible';
          photo.style.opacity = '1';
          photo.style.setProperty('display', 'block', 'important');
        });
        
        if (leftSection) {
          leftSection.style.display = 'block';
          leftSection.style.visibility = 'visible';
          leftSection.style.setProperty('display', 'block', 'important');
        }
        
        // Show all hello-visible elements
        helloVisibleElements.forEach(element => {
          element.style.display = 'block';
          element.style.visibility = 'visible';
          element.classList.add('show');
        });
        
        // Initialize navigation model hover functionality
        if (window.initializeNavigationModels) {
          window.initializeNavigationModels();
        }
        
        if (window.initExperienceAnimations) {
          window.initExperienceAnimations();
        } else {
          console.log('Experience animations not available, falling back to basic setup');
          // Basic fallback - just ensure scroll progress works
          const scrollProgressBar = document.querySelector('.scroll-progress-bar');
          if (scrollProgressBar) {
            function updateScrollProgress() {
              const { scrollHeight, clientHeight } = document.documentElement;
              const scrollableHeight = scrollHeight - clientHeight;
              const scrollY = window.scrollY;
              const scrollProgress = (scrollY / scrollableHeight) * 100;
              scrollProgressBar.style.transform = `translateY(-${100 - scrollProgress}%)`;
            }
            window.addEventListener('scroll', updateScrollProgress);
            updateScrollProgress();
          }
        }
      }, 100);
      
      // Reset scroll position
      window.scrollTo(0, 0);
      
      // Update music to experience track
      const backgroundMusic = document.getElementById('backgroundMusic');
      if (backgroundMusic) {
        backgroundMusic.src = 'Assets/Resonance.mp3';
        backgroundMusic.volume = 0.3;
      }
    },
    onExit: async () => {
      // Hide experience elements
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';
      
      // Clean up experience animations if available
      if (window.cleanupExperienceAnimations) {
        window.cleanupExperienceAnimations();
      }
    }
  });

  router.addRoute('projects', {
    title: 'Thomas Ou • Projects',
    contentSelector: '#projects-content',
    showElements: [],
    hideElements: [
      '.startup-preloader',
      '.name-heading',
      '.about-typing-card', 
      '#cube-container',
      '#model-container',
      '.scroll-progress'
    ],
    onEnter: async () => {
      console.log('PROJECTS ROUTE: Entering projects route...');
      document.body.setAttribute('data-current-route', 'projects');
      
      // Update navigation active state
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const projectsNavLink = document.querySelector('.nav-link[data-spa-route="projects"]');
      if (projectsNavLink) projectsNavLink.classList.add('active');
      
      // Hide home elements
      const nameHeading = document.querySelector('.name-heading');
      const typingCard = document.querySelector('.about-typing-card');
      const cubeContainer = document.querySelector('#cube-container');
      const modelContainer = document.querySelector('#model-container');
      
      if (nameHeading) nameHeading.style.display = 'none';
      if (typingCard) typingCard.style.display = 'none';
      if (cubeContainer) cubeContainer.style.display = 'none';
      if (modelContainer) modelContainer.style.display = 'none';
      
      // Hide scroll progress
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';
      
      // Force show projects content
      const projectsContent = document.getElementById('projects-content');
      if (projectsContent) {
        console.log('PROJECTS ROUTE: Forcing projects content to show...');
        projectsContent.style.display = 'block';
        projectsContent.style.opacity = '1';
        projectsContent.style.visibility = 'visible';
        projectsContent.style.pointerEvents = 'auto';
        projectsContent.style.zIndex = '1000';
      } else {
        console.error('PROJECTS ROUTE: Projects content element not found!');
      }
      
      // Initialize projects functionality
      console.log('PROJECTS ROUTE: Initializing projects functionality...');
      if (window.projectsRouteNew && window.projectsRouteNew.init) {
        try {
          window.projectsRouteNew.init();
          console.log('PROJECTS ROUTE: Projects functionality initialized successfully');
        } catch (error) {
          console.error('PROJECTS ROUTE: Error initializing projects:', error);
        }
      } else {
        console.error('PROJECTS ROUTE: projectsRouteNew not found!');
      }
      
      // Update music to projects track (using Resonance)
      const backgroundMusic = document.getElementById('backgroundMusic');
      if (backgroundMusic) {
        backgroundMusic.src = 'Assets/Resonance.mp3';
        backgroundMusic.volume = 0.3;
      }
      
      window.scrollTo(0, 0);
      console.log('PROJECTS ROUTE: Route initialization complete');
    },
    onExit: async () => {
      // Clean up projects functionality
      if (window.projectsRouteNew && window.projectsRouteNew.cleanup) {
        window.projectsRouteNew.cleanup();
      }
    }
  });

  router.addRoute('contact', {
    title: 'Thomas Ou • Contact',
    contentSelector: '#contact-content',
    showElements: [],
    hideElements: [
      '.startup-preloader',
      '.name-heading',
      '.about-typing-card', 
      '#cube-container',
      '#model-container',
      '.scroll-progress'
    ],
    onEnter: async () => {
      console.log('CONTACT ROUTE: Entering contact route...');
      document.body.setAttribute('data-current-route', 'contact');
      
      // Update navigation active state
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const contactNavLink = document.querySelector('.nav-link[data-spa-route="contact"]');
      if (contactNavLink) contactNavLink.classList.add('active');
      
      // Hide home elements
      const nameHeading = document.querySelector('.name-heading');
      const typingCard = document.querySelector('.about-typing-card');
      const cubeContainer = document.querySelector('#cube-container');
      const modelContainer = document.querySelector('#model-container');
      const scrollProgress = document.querySelector('.scroll-progress');
      
      if (nameHeading) nameHeading.style.display = 'none';
      if (typingCard) typingCard.style.display = 'none';
      if (cubeContainer) cubeContainer.style.display = 'none';
      if (modelContainer) modelContainer.style.display = 'none';
      if (scrollProgress) scrollProgress.style.display = 'none';
      
      // Force show contact content
      const contactContent = document.getElementById('contact-content');
      if (contactContent) {
        console.log('CONTACT ROUTE: Forcing contact content to show...');
        contactContent.style.display = 'block';
        contactContent.style.opacity = '1';
        contactContent.style.visibility = 'visible';
        contactContent.style.pointerEvents = 'auto';
        contactContent.style.zIndex = '1000';
      } else {
        console.error('CONTACT ROUTE: Contact content element not found!');
      }
      
      // Initialize contact functionality
      console.log('CONTACT ROUTE: Initializing contact functionality...');
      if (window.contactRoute && window.contactRoute.init) {
        try {
          window.contactRoute.init();
          console.log('CONTACT ROUTE: Contact functionality initialized successfully');
        } catch (error) {
          console.error('CONTACT ROUTE: Error initializing contact:', error);
        }
      } else {
        console.error('CONTACT ROUTE: contactRoute not found!');
      }
      
      // Update music to contact track
      const backgroundMusic = document.getElementById('backgroundMusic');
      if (backgroundMusic) {
        backgroundMusic.src = 'Assets/Resonance.mp3';
        backgroundMusic.volume = 0.3;
      }
      
      window.scrollTo(0, 0);
      console.log('CONTACT ROUTE: Route initialization complete');
    },
    onExit: async () => {
      // Clean up contact functionality
      if (window.contactRoute && window.contactRoute.cleanup) {
        window.contactRoute.cleanup();
      }
    }
  });

  // Store router globally for access from other scripts
  window.spaRouter = router;

  // Initialize global SPA functions
  window.navigateToRoute = (route) => {
    router.navigateTo(route);
  };

  // Handle startup preloader for SPA
  const startupButton = document.getElementById('startupClickButton');
  if (startupButton) {
    startupButton.addEventListener('click', () => {
      const preloader = document.getElementById('startup-preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 800);
      }
    });
  }

  // Ensure music works across routes
  const setupGlobalMusic = () => {
    const backgroundMusic = document.getElementById('backgroundMusic');
    const hoverMusic = document.getElementById('hoverMusic');
    const muteContainer = document.getElementById('muteContainer');
    const muteIcon = document.getElementById('muteIcon');
    
    if (!backgroundMusic || !hoverMusic || !muteContainer) return;

    let isMuted = false;
    let isHoveringNav = false;

    // Set up audio sources
    backgroundMusic.src = 'Assets/Emotions.mp3';
    hoverMusic.src = 'Assets/Resonance.mp3';
    backgroundMusic.loop = true;
    hoverMusic.loop = true;

    const mutedIcon = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    const playingIcon = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;

    function updateMusic() {
      const currentRoute = document.body.getAttribute('data-current-route');
      const muteText = document.querySelector('.mute-text');
      
      // Update text based on route and hover state
      if (currentRoute === 'home' && !isHoveringNav) {
        if (muteText) muteText.textContent = 'emotions';
        if (!isMuted) {
          hoverMusic.pause();
          backgroundMusic.volume = 0.3;
          backgroundMusic.play().catch(console.log);
        }
      } else {
        if (muteText) muteText.textContent = 'resonance';
        if (!isMuted) {
          backgroundMusic.pause();
          hoverMusic.volume = 0.3;
          hoverMusic.play().catch(console.log);
        }
      }
    }

    function toggleMusic() {
      if (isMuted) {
        isMuted = false;
        muteIcon.innerHTML = playingIcon;
        updateMusic();
      } else {
        isMuted = true;
        muteIcon.innerHTML = mutedIcon;
        backgroundMusic.pause();
        hoverMusic.pause();
      }
    }

    // Initialize with playing icon and correct text
    muteIcon.innerHTML = playingIcon;
    updateMusic();

    // Mute button
    muteContainer.addEventListener('click', toggleMusic);

    // Navigation hover
    const navContainer = document.querySelector('.bottom-nav');
    if (navContainer) {
      navContainer.addEventListener('mouseenter', () => {
        isHoveringNav = true;
        updateMusic();
      });
      navContainer.addEventListener('mouseleave', () => {
        isHoveringNav = false;
        updateMusic();
      });
    }

    // Update music when route changes
    window.addEventListener('spa-route-changed', updateMusic);

    // Auto-start music on user interaction
    ['click', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        if (!isMuted) updateMusic();
      }, { once: true });
    });
  };

  // Initialize music after router is set up
  setTimeout(setupGlobalMusic, 100);


  // Additional click capture for navigation safety
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href]');
    if (target && target.classList.contains('nav-link')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      console.log('Intercepted nav link click, preventing navigation');
      
      // Get the route from data attribute
      const route = target.getAttribute('data-spa-route');
      if (route && window.spaRouter) {
        window.spaRouter.navigateTo(route);
      }
      return false;
    }
  }, true); // Use capture phase
});


// Global animation initialization functions
window.initHomeAnimations = () => {
  // Reinitialize home page specific animations
  if (window.typeAboutRole) {
    window.typeAboutRole();
  }
  
  // Restart startup animations if needed
  const preloader = document.getElementById('startup-preloader');
  if (preloader && preloader.style.display !== 'none') {
    // Preloader is visible, restart its animations
    if (window.initStartupAnimations) {
      window.initStartupAnimations();
    }
  }
};

window.initAboutAnimations = () => {
  // Reinitialize GSAP ScrollTriggers for about page
  if (window.ScrollTrigger) {
    window.ScrollTrigger.refresh();
  }
  
  // Restart about page specific animations
  if (window.restartAboutAnimations) {
    window.restartAboutAnimations();
  }
};

window.updateScrollProgress = () => {
  const scrollProgressBar = document.querySelector('.scroll-progress-bar');
  function updateProgress() {
    if (!scrollProgressBar) return;
    
    const { scrollHeight, clientHeight } = document.documentElement;
    const scrollableHeight = scrollHeight - clientHeight;
    const scrollY = window.scrollY;
    const scrollProgress = (scrollY / scrollableHeight) * 100;
    
    scrollProgressBar.style.transform = `translateY(-${100 - scrollProgress}%)`;
  }
  
  window.addEventListener('scroll', updateProgress);
  updateProgress();
};