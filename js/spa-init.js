// Typing animation — runs independently on page load
(function() {
  let typingRunId = 0;
  let typingTimeoutIds = [];

  function clearTypingTimeouts() {
    typingTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    typingTimeoutIds = [];
  }

  function scheduleTypingStep(callback, delay, runId) {
    const timeoutId = setTimeout(() => {
      typingTimeoutIds = typingTimeoutIds.filter((id) => id !== timeoutId);
      if (runId !== typingRunId) return;
      callback();
    }, delay);

    typingTimeoutIds.push(timeoutId);
  }

  function startTyping() {
    const typedText1 = document.querySelector('.typed-text-1');
    const typedText2 = document.querySelector('.typed-text-2');
    const cursor1 = document.querySelector('.cursor-1');
    const cursor2 = document.querySelector('.cursor-2');

    if (!typedText1 || !typedText2) return;

    typingRunId += 1;
    const runId = typingRunId;
    clearTypingTimeouts();

    const text1 = 'THOMAS';
    const text2 = 'OU';
    const typingDelay = 250;
    let i1 = 0;
    let i2 = 0;

    function typeLine1() {
      if (runId !== typingRunId) return;
      if (i1 < text1.length) {
        typedText1.textContent += text1.charAt(i1);
        i1++;
        scheduleTypingStep(typeLine1, typingDelay, runId);
      } else {
        if (cursor1) cursor1.style.display = 'none';
        if (cursor2) cursor2.style.display = 'inline-block';
        scheduleTypingStep(typeLine2, typingDelay, runId);
      }
    }

    function typeLine2() {
      if (runId !== typingRunId) return;
      if (i2 < text2.length) {
        typedText2.textContent += text2.charAt(i2);
        i2++;
        scheduleTypingStep(typeLine2, typingDelay, runId);
      } else {
        if (cursor2) cursor2.style.display = 'none';
      }
    }

    typedText1.textContent = '';
    typedText2.textContent = '';
    if (cursor1) cursor1.style.display = 'inline-block';
    if (cursor2) cursor2.style.display = 'none';

    scheduleTypingStep(typeLine1, 500, runId);
  }

  // Also expose for SPA route re-entry
  window.initHomeAnimations = startTyping;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTyping);
  } else {
    startTyping();
  }
})();

// SPA Initialization and Route Management
document.addEventListener('DOMContentLoaded', () => {
  const router = new SPARouter();

  router.addRoute('home', {
    title: 'Thomas Ou • Portfolio',
    contentSelector: '#home-content',
    showElements: ['.name-heading', '#cube-container', '#model-container'],
    hideElements: ['.scroll-progress'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'home');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const homeNavLink = document.querySelector('.nav-link[data-spa-route="home"]');
      if (homeNavLink) homeNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'block';

      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'block';

      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'block';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      if (window.initHomeAnimations) {
        window.initHomeAnimations();
      }

      if (window.init3DCube) {
        window.init3DCube();
      }

      if (window.initializeNavigationModels) {
        window.initializeNavigationModels();
      }

      window.scrollTo(0, 0);
    },
    onExit: async () => {
      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';

      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';

      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      if (window.cleanup3DCube) {
        window.cleanup3DCube();
      }

      if (window.cleanupDynamicModels) {
        window.cleanupDynamicModels();
      }

      if (window.cleanupNavigationModels) {
        window.cleanupNavigationModels();
      } else {
        window.navModelsInitialized = false;
      }
    }
  });

  router.addRoute('about', {
    title: 'Thomas Ou • About',
    contentSelector: '#about-content',
    showElements: ['.scroll-progress'],
    hideElements: ['.name-heading', '#cube-container', '#model-container'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'about');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const aboutNavLink = document.querySelector('.nav-link[data-spa-route="about"]');
      if (aboutNavLink) aboutNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';
      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';
      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'block';

      if (window.initAboutAnimations) {
        window.initAboutAnimations();
      }

      window.scrollTo(0, 0);

      if (window.updateScrollProgress) {
        window.updateScrollProgress();
      }
    },
    onExit: async () => {
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      if (window.cleanupAboutAnimations) {
        window.cleanupAboutAnimations();
      }
    }
  });

  router.addRoute('experience', {
    title: 'Thomas Ou • Experience',
    contentSelector: '#experience-content',
    showElements: ['.scroll-progress'],
    hideElements: ['.name-heading', '#cube-container', '#model-container'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'experience');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const experienceNavLink = document.querySelector('.nav-link[data-spa-route="experience"]');
      if (experienceNavLink) experienceNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';
      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';
      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'block';

      setTimeout(() => {
        const allProfilePhotos = document.querySelectorAll('.profile-photo');
        const leftSection = document.querySelector('.left-section');
        const helloVisibleElements = document.querySelectorAll('.hello-visible');

        allProfilePhotos.forEach(photo => {
          photo.style.display = 'block';
          photo.style.visibility = 'visible';
          photo.style.setProperty('display', 'block', 'important');
        });

        if (leftSection) {
          leftSection.style.display = 'block';
          leftSection.style.visibility = 'visible';
          leftSection.style.setProperty('display', 'block', 'important');
        }

        helloVisibleElements.forEach(element => {
          element.style.display = 'block';
          element.style.visibility = 'visible';
          element.classList.add('show');
        });

        if (window.initExperienceAnimations) {
          window.initExperienceAnimations();
        } else {
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

      window.scrollTo(0, 0);
    },
    onExit: async () => {
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      if (window.cleanupExperienceAnimations) {
        window.cleanupExperienceAnimations();
      }
    }
  });

  router.addRoute('projects', {
    title: 'Thomas Ou • Projects',
    contentSelector: '#projects-content',
    showElements: [],
    hideElements: ['.name-heading', '#cube-container', '#model-container', '.scroll-progress'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'projects');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const projectsNavLink = document.querySelector('.nav-link[data-spa-route="projects"]');
      if (projectsNavLink) projectsNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';
      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';
      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      const projectsContent = document.getElementById('projects-content');
      if (projectsContent) {
        projectsContent.style.display = 'block';
        projectsContent.style.opacity = '1';
        projectsContent.style.visibility = 'visible';
        projectsContent.style.pointerEvents = 'auto';
        projectsContent.style.zIndex = '1000';
      }

      if (window.projectsRouteNew && window.projectsRouteNew.init) {
        window.projectsRouteNew.init();
      }

      window.scrollTo(0, 0);
    },
    onExit: async () => {
      if (window.projectsRouteNew && window.projectsRouteNew.cleanup) {
        window.projectsRouteNew.cleanup();
      }
    }
  });

  router.addRoute('contact', {
    title: 'Thomas Ou • Contact',
    contentSelector: '#contact-content',
    showElements: [],
    hideElements: ['.name-heading', '#cube-container', '#model-container', '.scroll-progress'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'contact');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const contactNavLink = document.querySelector('.nav-link[data-spa-route="contact"]');
      if (contactNavLink) contactNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';
      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';
      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      const contactContent = document.getElementById('contact-content');
      if (contactContent) {
        contactContent.style.display = 'block';
        contactContent.style.opacity = '1';
        contactContent.style.visibility = 'visible';
        contactContent.style.pointerEvents = 'auto';
        contactContent.style.zIndex = '1000';
      }

      if (window.contactRoute && window.contactRoute.init) {
        window.contactRoute.init();
      }

      window.scrollTo(0, 0);
    },
    onExit: async () => {
      if (window.contactRoute && window.contactRoute.cleanup) {
        window.contactRoute.cleanup();
      }
    }
  });

  window.spaRouter = router;

  window.navigateToRoute = (route) => {
    router.navigateTo(route);
  };

});

window.initAboutAnimations = () => {
  if (window.ScrollTrigger) {
    window.ScrollTrigger.refresh();
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
