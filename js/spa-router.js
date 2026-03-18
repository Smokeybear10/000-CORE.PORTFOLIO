// SPA Router System
class SPARouter {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.isTransitioning = false;
    this.pendingInitialRoute = 'home';
    this.hasActivatedInitialRoute = false;
    this.init();
  }

  addRoute(path, config) {
    this.routes.set(path, {
      title: config.title,
      contentSelector: config.contentSelector,
      onEnter: config.onEnter || null,
      onExit: config.onExit || null,
      showElements: config.showElements || [],
      hideElements: config.hideElements || []
    });

    if (!this.hasActivatedInitialRoute && path === this.pendingInitialRoute) {
      this.hasActivatedInitialRoute = true;
      this.navigateToRoute(this.pendingInitialRoute, false);
    }
  }

  init() {
    window.addEventListener('popstate', () => {
      this.navigateToRoute(this.getRouteFromLocation(), false);
    });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-spa-route]');
      if (link) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.navigateTo(link.getAttribute('data-spa-route'));
        return false;
      }

      const navLink = e.target.closest('.nav-link');
      if (navLink) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    }, true);

    this.pendingInitialRoute = this.getRouteFromLocation();
  }

  navigateTo(route, updateHistory = true) {
    if (this.isTransitioning || route === this.currentRoute) return;
    return this.navigateToRoute(route, updateHistory);
  }

  async navigateToRoute(route, updateHistory = true) {
    const resolvedRoute = this.routes.has(route) ? route : 'home';
    if (!this.routes.has(resolvedRoute)) return;

    this.isTransitioning = true;
    const routeConfig = this.routes.get(resolvedRoute);

    if (this.currentRoute && this.routes.has(this.currentRoute)) {
      const currentConfig = this.routes.get(this.currentRoute);
      if (currentConfig.onExit) {
        await currentConfig.onExit();
      }
    }

    await this.fadeOut();
    this.closeMobileNav();
    this.updateElementVisibility(routeConfig);

    document.title = routeConfig.title;
    this.showContent(routeConfig.contentSelector);
    this.updateNavigation(resolvedRoute);

    if (updateHistory) {
      window.history.pushState(
        { route: resolvedRoute },
        routeConfig.title,
        this.getUrlForRoute(resolvedRoute)
      );
    }

    await this.fadeIn();

    if (routeConfig.onEnter) {
      await routeConfig.onEnter();
    }

    this.currentRoute = resolvedRoute;
    this.isTransitioning = false;
    window.dispatchEvent(new CustomEvent('spa-route-changed', { detail: { route: resolvedRoute } }));
  }

  getRouteFromLocation() {
    const hashRoute = this.normalizeRoute(window.location.hash.replace(/^#/, '').trim());
    if (hashRoute) return hashRoute;

    const path = (window.location.pathname || '').toLowerCase();
    if (path.endsWith('/about') || path.endsWith('/about.html')) return 'about';
    if (path.endsWith('/experience') || path.endsWith('/experience.html')) return 'experience';
    if (path.endsWith('/projects') || path.endsWith('/projects.html')) return 'projects';
    if (path.endsWith('/contact') || path.endsWith('/contact.html')) return 'contact';
    return 'home';
  }

  getUrlForRoute(route) {
    const pathname = window.location.pathname?.includes('index.html')
      ? window.location.pathname
      : '/index.html';
    return route === 'home' ? pathname : `${pathname}#${route}`;
  }

  normalizeRoute(route) {
    const normalizedRoute = (route || '').trim().toLowerCase();
    const validRoutes = new Set(['home', 'about', 'experience', 'projects', 'contact']);
    return validRoutes.has(normalizedRoute) ? normalizedRoute : null;
  }

  updateElementVisibility(routeConfig) {
    routeConfig.hideElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.style.display = 'none');
    });
    routeConfig.showElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.style.display = '');
    });
  }

  showContent(contentSelector) {
    document.querySelectorAll('[data-route-content]').forEach(el => {
      el.style.display = 'none';
    });
    const targetContent = document.querySelector(contentSelector);
    if (targetContent) {
      targetContent.style.display = 'block';
    }
  }

  updateNavigation(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-spa-route') === route) {
        link.classList.add('active');
      }
    });
  }

  fadeOut() {
    return new Promise(resolve => {
      document.querySelectorAll('[data-route-content]').forEach(content => {
        content.style.transition = 'opacity 0.4s ease-out';
        content.style.opacity = '0';
      });
      setTimeout(resolve, 400);
    });
  }

  fadeIn() {
    return new Promise(resolve => {
      setTimeout(() => {
        document.querySelectorAll('[data-route-content]:not([style*="display: none"])').forEach(content => {
          content.style.transition = 'opacity 0.4s ease-in';
          content.style.opacity = '1';
        });
        setTimeout(resolve, 400);
      }, 100);
    });
  }

  closeMobileNav() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const bottomNav = document.querySelector('.bottom-nav');
    if (mobileMenuBtn && bottomNav) {
      mobileMenuBtn.classList.remove('active');
      bottomNav.classList.remove('show');
    }
  }

  getCurrentRoute() {
    return this.currentRoute;
  }
}

window.SPARouter = SPARouter;
