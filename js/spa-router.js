// SPA Router System
class SPARouter {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.isTransitioning = false;
    
    // Initialize router
    this.init();
  }

  // Register a route
  addRoute(path, config) {
    console.log('Adding route:', path, config);
    this.routes.set(path, {
      title: config.title,
      contentSelector: config.contentSelector,
      onEnter: config.onEnter || null,
      onExit: config.onExit || null,
      showElements: config.showElements || [],
      hideElements: config.hideElements || []
    });
    console.log('Route registered. Total routes:', this.routes.size);
  }

  // Initialize router
  init() {
    // Handle browser back/forward - always go to home
    window.addEventListener('popstate', (e) => {
      this.navigateToRoute('home', false);
    });

    // Handle navigation clicks - aggressive capture
    document.addEventListener('click', (e) => {
      console.log('Click detected on:', e.target);
      
      // Check for SPA route first
      const link = e.target.closest('[data-spa-route]');
      if (link) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const route = link.getAttribute('data-spa-route');
        console.log('SPA Navigation clicked:', route);
        this.navigateTo(route);
        return false;
      }
      
      // Also prevent any navigation links in the nav
      const navLink = e.target.closest('.nav-link');
      if (navLink) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log('Navigation link clicked, preventing default');
        return false;
      }
    }, true); // Use capture phase

    // Always start on home page regardless of URL
    this.navigateToRoute('home', false);
  }

  // Get route name from path
  getRouteFromPath(path) {
    if (path === '/' || path === '/index.html' || path === '') return 'home';
    if (path === '/about.html' || path === '/about') return 'about';
    return 'home';
  }

  // Navigate to a route
  navigateTo(route, updateHistory = true) {
    if (this.isTransitioning || route === this.currentRoute) return;
    
    this.navigateToRoute(route, updateHistory);
  }

  // Internal navigation logic
  async navigateToRoute(route, updateHistory = true) {
    console.log('Navigating to route:', route);
    if (!this.routes.has(route)) {
      console.warn(`Route "${route}" not found`);
      return;
    }

    this.isTransitioning = true;
    const routeConfig = this.routes.get(route);
    console.log('Route config:', routeConfig);

    // Call onExit for current route
    if (this.currentRoute && this.routes.has(this.currentRoute)) {
      const currentConfig = this.routes.get(this.currentRoute);
      if (currentConfig.onExit) {
        await currentConfig.onExit();
      }
    }

    // Fade out current content
    await this.fadeOut();

    // Auto-close mobile nav when navigating to new page
    this.closeMobileNav();

    // Hide/show elements
    this.updateElementVisibility(routeConfig);

    // Update page title
    document.title = routeConfig.title;

    // Show new content
    this.showContent(routeConfig.contentSelector);

    // Update navigation
    this.updateNavigation(route);

    // Always keep URL as index.html regardless of route
    if (updateHistory) {
      const url = window.location.pathname.includes('index.html') ? window.location.pathname : '/index.html';
      window.history.replaceState({ route }, routeConfig.title, url);
    }

    // Fade in new content
    await this.fadeIn();

    // Call onEnter for new route
    if (routeConfig.onEnter) {
      await routeConfig.onEnter();
    }

    this.currentRoute = route;
    this.isTransitioning = false;
  }

  // Update element visibility
  updateElementVisibility(routeConfig) {
    // Hide elements
    routeConfig.hideElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.style.display = 'none');
    });

    // Show elements
    routeConfig.showElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.style.display = '');
    });
  }

  // Show content for route
  showContent(contentSelector) {
    // Hide all route content
    document.querySelectorAll('[data-route-content]').forEach(el => {
      el.style.display = 'none';
    });

    // Show target content
    const targetContent = document.querySelector(contentSelector);
    if (targetContent) {
      targetContent.style.display = 'block';
    }
  }

  // Update navigation active state
  updateNavigation(route) {
    // Update new SPA navigation
    if (window.updateNavActive) {
      window.updateNavActive(route);
    }
    
    // Remove active class from all old nav links (if any)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Update new nav buttons
    document.querySelectorAll('.spa-nav-btn').forEach(btn => {
      const btnRoute = btn.getAttribute('data-route');
      if (btnRoute === route) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Fade out animation
  fadeOut() {
    return new Promise(resolve => {
      // Fade out all route content
      const allContent = document.querySelectorAll('[data-route-content]');
      allContent.forEach(content => {
        content.style.transition = 'opacity 0.4s ease-out';
        content.style.opacity = '0';
      });
      setTimeout(resolve, 400);
    });
  }

  // Fade in animation
  fadeIn() {
    return new Promise(resolve => {
      setTimeout(() => {
        // Fade in visible content
        const visibleContent = document.querySelectorAll('[data-route-content]:not([style*="display: none"])');
        visibleContent.forEach(content => {
          content.style.transition = 'opacity 0.4s ease-in';
          content.style.opacity = '1';
        });
        setTimeout(resolve, 400);
      }, 100);
    });
  }

  // Close mobile nav
  closeMobileNav() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (mobileMenuBtn && bottomNav) {
      // Close the mobile nav
      mobileMenuBtn.classList.remove('active');
      bottomNav.classList.remove('show');
      console.log('Mobile nav auto-closed on route change');
    }
  }

  // Get current route
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Export for use in other files
window.SPARouter = SPARouter;