// About page functionality for SPA (without navigation)

// Text entrance animations
document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);
  
  // Animate profile text elements on scroll
  gsap.fromTo('.profile-text h2', 
    {
      opacity: 0,
      y: 50
    },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: '.profile-text h2',
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    }
  );
  
  gsap.utils.toArray('.profile-text p').forEach((paragraph, i) => {
    gsap.fromTo(paragraph, 
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: paragraph,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
  
  // Animate profile image on scroll
  gsap.fromTo('.profile-image', 
    {
      opacity: 0,
      scale: 0.8,
      rotation: -5
    },
    {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1.2,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: '.profile-image',
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    }
  );
  
  // Animate info sections on scroll
  gsap.utils.toArray('.info-section').forEach((section, i) => {
    gsap.fromTo(section, 
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
  
  // Animate stack icons
  gsap.utils.toArray('.icon-container').forEach((icon, i) => {
    gsap.fromTo(icon, 
      {
        opacity: 0,
        scale: 0,
        rotation: 180
      },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.6,
        delay: i * 0.05,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: icon,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
});

// Scroll animations for content sections
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  
  // Animate info sections on scroll
  gsap.utils.toArray('.info-section').forEach((section, i) => {
    gsap.fromTo(section, 
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  // Animate skill tags
  gsap.utils.toArray('.skill-tag').forEach((tag, i) => {
    gsap.fromTo(tag,
      {
        opacity: 0,
        scale: 0.8
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        delay: i * 0.05,
        scrollTrigger: {
          trigger: tag,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  // Stack dropdown functionality
  document.querySelectorAll('.stack-header').forEach((header, index) => {
    header.addEventListener('click', () => {
      const section = header.parentElement;
      const isActive = section.classList.contains('active');
      
      // Close all other dropdowns
      document.querySelectorAll('.stack-section').forEach(s => {
        s.classList.remove('active');
      });
      
      // Toggle current dropdown
      if (!isActive) {
        section.classList.add('active');
      }
    });
  });
});

// Scroll progress indicator
document.addEventListener('DOMContentLoaded', () => {
  const scrollProgressBar = document.querySelector('.scroll-progress-bar');
  function updateScrollProgress() {
    if (!scrollProgressBar) return;
    
    const { scrollHeight, clientHeight } = document.documentElement;
    const scrollableHeight = scrollHeight - clientHeight;
    const scrollY = window.scrollY;
    const scrollProgress = (scrollY / scrollableHeight) * 100;
    
    scrollProgressBar.style.transform = `translateY(-${100 - scrollProgress}%)`;
  }
  
  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress(); // Initial call
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const bottomNav = document.querySelector('.bottom-nav');
  
  if (mobileMenuBtn && bottomNav) {
    const closeBtn = document.querySelector('.nav-close-btn');
    
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      bottomNav.classList.toggle('show');
    });
    
    // Close button functionality
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        bottomNav.classList.remove('show');
      });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !bottomNav.contains(e.target)) {
        mobileMenuBtn.classList.remove('active');
        bottomNav.classList.remove('show');
      }
    });
  }
});