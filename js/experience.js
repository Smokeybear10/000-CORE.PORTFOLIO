// Scroll to top on page load
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// Custom cursor animation
document.addEventListener('DOMContentLoaded', () => {
  const customCursor = document.getElementById('custom-cursor');

  // Show cursor on all devices
  // Mouse move handler for custom cursor
  function handleMouseMove(e) {
    if (!customCursor) return;
    
    gsap.set(customCursor, {
      x: e.clientX,
      y: e.clientY,
      opacity: 1,
    });
  }
  
  // Touch device detection - hide custom cursor on touch devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice && customCursor) {
    customCursor.style.display = 'none';
    return;
  }
  
  // Hide cursor when mouse leaves window
  function handleMouseLeave() {
    if (!customCursor) return;
    gsap.to(customCursor, {
      opacity: 0,
      duration: 0.2
    });
  }
  
  // Force show cursor initially
  if (customCursor) {
    customCursor.style.opacity = '1';
    customCursor.style.display = 'block';
    customCursor.style.visibility = 'visible';
  }
  
  window.addEventListener('mousemove', handleMouseMove);
  // Touch events removed - allow normal touch interaction
  window.addEventListener('mouseleave', handleMouseLeave);
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

  // Initial call and scroll listener
  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress);
});

// Experience text fade effect
document.addEventListener('DOMContentLoaded', () => {
  const experienceWhite = document.querySelector('.title-experience-white');
  
  function updateExperienceWhiteOpacity() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Only fade in when reaching the bottom
    const fadeInPoint = documentHeight - windowHeight - 100; // Start fading in 100px before bottom
    
    let opacity = 0;
    if (scrollY >= fadeInPoint) {
      opacity = Math.min(1, (scrollY - fadeInPoint) / 100);
    }
    
    if (experienceWhite) {
      experienceWhite.style.opacity = opacity;
    }
  }
  
  // Initial call and scroll listeners
  updateExperienceWhiteOpacity();
  window.addEventListener('scroll', updateExperienceWhiteOpacity);
});

// Animal containers fade in/out based on section focus
document.addEventListener('DOMContentLoaded', () => {
  const horseContainer = document.querySelector('.horse-container');
  const bullContainer = document.querySelector('.bull-container-new');
  const lionContainer = document.querySelector('.lion-container-new');
  const educationTitle = document.querySelector('.education-title');
  const navButtons = document.querySelector('.nav-buttons.permanent-buttons');
  
  function updateAnimalVisibility() {
    // Check which section is in focus
    const timelineContainer = document.querySelector('.timeline-container');
    const experienceContainer = document.querySelector('.experience-cards');
    const researchContainer = document.querySelector('.research-cards');
    
    const isEducationInFocus = timelineContainer && timelineContainer.classList.contains('in-view');
    const isExperienceInFocus = experienceContainer && experienceContainer.classList.contains('in-view');
    const isResearchInFocus = researchContainer && researchContainer.classList.contains('in-view');
    
    // Horse shows for education
    if (horseContainer) {
      if (isEducationInFocus) {
        horseContainer.classList.add('visible');
      } else {
        horseContainer.classList.remove('visible');
      }
    }
    
    // Bull shows for experience
    if (bullContainer) {
      if (isExperienceInFocus) {
        bullContainer.style.opacity = '1';
        bullContainer.style.visibility = 'visible';
      } else {
        bullContainer.style.opacity = '0';
        bullContainer.style.visibility = 'hidden';
      }
    }
    
    // Lion shows for research
    if (lionContainer) {
      if (isResearchInFocus) {
        lionContainer.style.opacity = '1';
        lionContainer.style.visibility = 'visible';
      } else {
        lionContainer.style.opacity = '0';
        lionContainer.style.visibility = 'hidden';
      }
    }
    
    // Research title shows when research is in focus
    const researchTitle = document.querySelector('.research-title');
    if (researchTitle) {
      if (isResearchInFocus) {
        researchTitle.style.opacity = '1';
        researchTitle.style.visibility = 'visible';
      } else {
        researchTitle.style.opacity = '0';
        researchTitle.style.visibility = 'hidden';
      }
    }
    
    // Experience title shows when experience is in focus
    const experienceTitle = document.querySelector('.experience-title');
    if (experienceTitle) {
      if (isExperienceInFocus) {
        experienceTitle.style.opacity = '1';
        experienceTitle.style.visibility = 'visible';
      } else {
        experienceTitle.style.opacity = '0';
        experienceTitle.style.visibility = 'hidden';
      }
    }
    
    // Education title shows when education is in focus
    if (isEducationInFocus) {
      if (educationTitle) educationTitle.classList.add('visible');
    } else {
      if (educationTitle) educationTitle.classList.remove('visible');
    }
    
    // Nav buttons show when education, experience, OR research is in focus (don't fade out until footer)
    if (isEducationInFocus || isExperienceInFocus || isResearchInFocus) {
      if (navButtons) navButtons.classList.add('visible');
    } else {
      if (navButtons) navButtons.classList.remove('visible');
    }
  }
  
  // Initial call and scroll listener
  updateAnimalVisibility();
  window.addEventListener('scroll', updateAnimalVisibility);
  window.addEventListener('resize', updateAnimalVisibility);
});


// Single section focus - only one section can be in focus at a time
document.addEventListener('DOMContentLoaded', () => {
  const timelineContainer = document.querySelector('.timeline-container');
  const experienceContainer = document.querySelector('.experience-cards');
  const researchContainer = document.querySelector('.research-cards');
  const helloContentMobile = document.querySelector('.hello-content-mobile');
  const helloSection = document.querySelector('.top-container .hello-section'); // Hello I am Thomas section
  
  const sections = [
    { element: timelineContainer, name: 'education' },
    { element: experienceContainer, name: 'experience' },
    { element: researchContainer, name: 'research' },
    { element: helloContentMobile, name: 'hello-mobile' }
  ].filter(section => section.element);
  
  function updateSectionVisibility() {
    const windowHeight = window.innerHeight;
    let activeSection = null;
    let maxVisibility = 0;
    
    // Handle Hello section visibility
    const helloSections = document.querySelectorAll('.hello-section');
    const helloVisibleElements = document.querySelectorAll('.hello-visible');
    let helloInView = false;
    
    if (helloSection) {
      const helloRect = helloSection.getBoundingClientRect();
      const helloVisibleTop = Math.max(0, helloRect.top);
      const helloVisibleBottom = Math.min(windowHeight, helloRect.bottom);
      const helloVisibleHeight = Math.max(0, helloVisibleBottom - helloVisibleTop);
      const helloVisibilityRatio = helloRect.height > 0 ? helloVisibleHeight / helloRect.height : 0;
      
      // If Hello section is significantly visible
      if (helloVisibilityRatio > 0.3) {
        helloInView = true;
        // Brighten hello sections
        helloSections.forEach(section => {
          section.style.opacity = '1';
        });
        // Show photo and buttons
        helloVisibleElements.forEach(element => {
          element.classList.add('show');
        });
        // Dim all other sections
        sections.forEach(section => {
          section.element.classList.remove('in-view');
        });
        // Update hello button styling when hello section is in view
        if (window.updateHelloButtonStyling) {
          window.updateHelloButtonStyling('about', true);
        }
        return;
      } else {
        // Dim hello sections
        helloSections.forEach(section => {
          section.style.opacity = '0.3';
        });
        // Hide photo and buttons
        helloVisibleElements.forEach(element => {
          element.classList.remove('show');
        });
      }
    }
    
    // Find which section is most visible
    sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(windowHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const totalHeight = rect.height;
      const visibilityRatio = totalHeight > 0 ? visibleHeight / totalHeight : 0;
      
      // Different thresholds for different sections
      let threshold = 0.3; // Default for education and experience
      if (section.name === 'research') {
        threshold = 0.5; // Higher threshold for research - needs more visibility to stay in focus
      }
      
      // Check if we're close to footer for research section
      let finalVisibilityRatio = visibilityRatio;
      if (section.name === 'research') {
        const footer = document.querySelector('footer');
        if (footer) {
          const footerRect = footer.getBoundingClientRect();
          const distanceToFooter = footerRect.top - windowHeight;
          
          // If footer is within 200px of viewport, reduce research visibility
          if (distanceToFooter < 50) {
            const footerProximity = Math.max(0, (50 - distanceToFooter) / 50);
            finalVisibilityRatio = visibilityRatio * (1 - footerProximity * 0.8);
          }
        }
      }
      
      if (finalVisibilityRatio > maxVisibility && finalVisibilityRatio > threshold) {
        maxVisibility = finalVisibilityRatio;
        activeSection = section;
      }
    });
    
    // Apply focus to most visible section, dim others
    sections.forEach(section => {
      if (section === activeSection) {
        section.element.classList.add('in-view');
              } else {
        section.element.classList.remove('in-view');
      }
    });

    // Update navigation button highlighting
    const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
    if (navButtons.length >= 4) {
      // Remove active class from all buttons
      navButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class based on current section
      let currentSectionName = 'about'; // default (top section is About)
      if (activeSection) {
        if (activeSection.name === 'education') {
          navButtons[1]?.classList.add('active'); // Education button
          currentSectionName = 'education';
        } else if (activeSection.name === 'experience') {
          navButtons[2]?.classList.add('active'); // Experience button
          currentSectionName = 'experience';
        } else if (activeSection.name === 'research') {
          navButtons[3]?.classList.add('active'); // Research button
          currentSectionName = 'research';
        }
      } else {
        // When no section is active, we're in the About section (top)
        navButtons[0]?.classList.add('active'); // About button
      }
      
      // Store current section globally
      window.currentSection = currentSectionName;
      
      // Handle hello-content-mobile in vertical mode
      const isVerticalMode = window.innerHeight > window.innerWidth || window.innerWidth <= 768;
      const helloContentMobile = document.querySelector('.hello-content-mobile');
      
      if (isVerticalMode && helloContentMobile) {
        if (currentSectionName === 'about') {
          // In about section - make hello-content-mobile bright
          helloContentMobile.classList.add('in-view');
        } else {
          // In other sections - dim hello-content-mobile
          helloContentMobile.classList.remove('in-view');
        }
      }
      
      // Update button styling based on new active states
      if (window.updateButtonStyling) {
        window.updateButtonStyling();
      }
      
      // Update hello button styling based on current section and hello visibility
      if (window.updateHelloButtonStyling) {
        window.updateHelloButtonStyling(currentSectionName, false); // Not in hello section when other sections are active
      }
    }
  }
  
  // Initial call and scroll listener
  updateSectionVisibility();
  window.addEventListener('scroll', updateSectionVisibility);
  window.addEventListener('resize', updateSectionVisibility);
});

     // Navigation button click handlers
 document.addEventListener('DOMContentLoaded', () => {
   const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
   
   // Function to update button styling based on active state
   window.updateButtonStyling = function() {
     navButtons.forEach((button) => {
       // Remove any inline styling that might override CSS
       button.style.borderColor = '';
       button.style.boxShadow = '';
       button.style.background = '';
       button.style.color = '';
       button.style.textShadow = '';
       // Let CSS handle the styling based on .active class
     });
   }
   
   // Initial styling update
   window.updateButtonStyling();
   
   navButtons.forEach((button, index) => {
     // Mouse enter event - let CSS handle hover styling
     button.addEventListener('mouseenter', () => {
       // Remove any conflicting inline styles and let CSS :hover handle it
       button.style.borderColor = '';
       button.style.boxShadow = '';
       button.style.transform = 'translateY(-2px) scale(1.05)';
     });
     
     // Mouse leave event - let CSS handle styling
     button.addEventListener('mouseleave', () => {
       // Remove inline styles and let CSS handle normal state
       button.style.borderColor = '';
       button.style.boxShadow = '';
       button.style.transform = 'none';
     });
     
     // Click handler
     button.addEventListener('click', () => {
       let targetElement = null;
       
       // Map buttons to sections (About=0, Education=1, Experience=2, Research=3)
       switch(index) {
         case 0: // About - scroll to top
           window.scrollTo({ top: 0, behavior: 'smooth' });
           return;
         case 1: // Education
           targetElement = document.querySelector('.timeline-container');
           break;
         case 2: // Experience
           targetElement = document.querySelector('.experience-cards');
           break;
         case 3: // Research
           targetElement = document.querySelector('.research-cards');
           break;
       }
       
       if (targetElement) {
         targetElement.scrollIntoView({ 
           behavior: 'smooth',
           block: 'center'
         });
       }
     });
   });

   // Hello navigation button click handlers
   const helloNavButtons = document.querySelectorAll('.hello-nav-btn');
   
   // Function to update hello button styling - only About button is magenta when hello section is in view
   window.updateHelloButtonStyling = function(currentSection, isHelloInView) {
     helloNavButtons.forEach((button) => {
       const section = button.getAttribute('data-section');
       
       // About button is magenta only when the hello section is actually in view
       if (isHelloInView && section === 'about') {
         button.style.borderColor = '#ff00ff';
         button.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.6)';
       } else {
         button.style.borderColor = '#ffffff';
         button.style.boxShadow = 'none';
       }
     });
   }
   
   // Add hover effects with JavaScript
   helloNavButtons.forEach((button) => {
     const section = button.getAttribute('data-section');
     
     // Mouse enter event
     button.addEventListener('mouseenter', () => {
       if (button.style.borderColor === 'rgb(255, 0, 255)') {
         // Active button gets stronger glow on hover
         button.style.boxShadow = '0 0 25px rgba(255, 0, 255, 0.8)';
       } else {
         // Other buttons get cyan glow on hover
         button.style.borderColor = '#00ffff';
         button.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.6)';
       }
       button.style.transform = 'translateY(-2px) scale(1.05)';
     });
     
     // Mouse leave event
     button.addEventListener('mouseleave', () => {
       // Restore the current section styling
       const isHelloVisible = document.querySelector('.hello-section') && 
                             document.querySelector('.hello-section').style.opacity === '1';
       window.updateHelloButtonStyling(window.currentSection || 'about', isHelloVisible);
       button.style.transform = 'none';
     });
     
     // Click handler
     button.addEventListener('click', (e) => {
       console.log('Hello nav button clicked:', button.getAttribute('data-section'));
       e.preventDefault();
       e.stopPropagation();
       
       const section = button.getAttribute('data-section');
       let targetElement = null;
       
       switch(section) {
         case 'about':
           console.log('About button clicked - scrolling to top');
           window.scrollTo({ top: 0, behavior: 'smooth' });
           return;
         case 'education':
           targetElement = document.querySelector('.timeline-container');
           break;
         case 'experience':
           targetElement = document.querySelector('.experience-cards');
           break;
         case 'research':
           targetElement = document.querySelector('.research-cards');
           break;
       }
       
       if (targetElement) {
         console.log('Scrolling to:', section);
         targetElement.scrollIntoView({ 
           behavior: 'smooth',
           block: 'center'
         });
       }
     });
   });
 });


 // Simple navigation with ease-out
 document.addEventListener('DOMContentLoaded', () => {
   const navLinks = document.querySelectorAll('.nav-link');
   
   navLinks.forEach(link => {
     link.addEventListener('click', (e) => {
       e.preventDefault();
       
       const linkText = link.textContent.toLowerCase().trim();
       let targetPage = '';
       
       // Map navigation to target pages
       switch(linkText) {
         case 'home':
           targetPage = 'index.html';
           break;
         case 'about':
           targetPage = 'about.html';
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
 });

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const bottomNav = document.querySelector('.bottom-nav');
  const closeBtn = document.querySelector('.nav-close-btn');
  
  console.log('Mobile menu elements found:', {
    mobileMenuBtn: !!mobileMenuBtn,
    bottomNav: !!bottomNav,
    closeBtn: !!closeBtn
  });
  
  if (mobileMenuBtn && bottomNav) {
    // Use capture phase to run before spa-router
    mobileMenuBtn.addEventListener('click', (e) => {
      console.log('Mobile menu clicked!');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Force the toggle with explicit if/else logic
      if (mobileMenuBtn.classList.contains('active')) {
        mobileMenuBtn.classList.remove('active');
        bottomNav.classList.remove('show');
      } else {
        mobileMenuBtn.classList.add('active');
        bottomNav.classList.add('show');
      }
      
      console.log('After toggle - classes:', {
        menuActive: mobileMenuBtn.classList.contains('active'),
        navShow: bottomNav.classList.contains('show')
      });
      
      return false;
    }, true); // Use capture phase to run before spa-router
    
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

// Experience and Research data for modals
const experienceData = {
  0: { // Data & Analytics at Flushing CPA
    title: "Data & Analytics",
    company: "Flushing CPA Tax Center",
    location: "Feb 2024 - May 2024",
    description: "• Designed and implemented ETL pipelines in Python to automate the ingestion and processing of over 50,000 financial records, improving tax projection accuracy by 15% through enhanced data quality controls and validation procedures.<br>&nbsp;<br>• Built Excel VBA macros for automated compliance anomaly detection in client tax returns, reducing manual review time by 40% and flagging high-risk discrepancies for further investigation.<br>&nbsp;<br>• Developed regression models using Python and scikit-learn to forecast quarterly tax liabilities for small business clients, achieving 92% prediction accuracy."
  },
  1: { // Legal Intern at Jonathan Spodnick
    title: "Legal Intern",
    company: "Jonathan E Spodnick Law Office",
    location: "Sep 2023 - Dec 2023",
    description: "• Engineered a Python-based NLP text classification system using spaCy and NLTK to automatically categorize over 1,000 legal documents by case type and relevance, reducing manual review time by 50%. The system streamlined discovery processes and improved case preparation efficiency.<br>&nbsp;<br>• Conducted statistical analysis on personal injury settlement data using regression and clustering techniques to identify trends in claim values and case outcomes, providing data-driven insights for case strategy.<br>&nbsp;<br>• Automated discovery documentation workflows through Python scripts for document parsing, metadata extraction, and evidence organization."
  },
  2: { // Fintech Analyst at CITIC
    title: "Fintech Analyst",
    company: "CITIC Securities",
    location: "Summer 2023",
    description: "• Assisted in preparing a listing proposal for an $11 billion spaceflight network company by developing data-driven presentations that showcased CITIC's core investment banking capabilities and sector expertise.<br>&nbsp;<br>• Analyzed socio-political impacts on China's financial markets during CITIC's RMB regulatory penalty, collaborating with a 9-person team to develop risk mitigation strategies that minimized adverse effects on stock price performance.<br>&nbsp;<br>• Supported the preparation and documentation of an $18 billion convertible bond prospectus for a regional banking client, ensuring regulatory compliance and investor disclosure requirements.<br>&nbsp;<br>• Contributed to deal structuring and financial modeling processes across multiple high-value transactions, supporting senior analysts in client relationship management and transaction execution."
  },
  3: { // Research Assistant - CURF
    title: "Research Assistant",
    company: "University of Pennsylvania",
    location: "Jul 2025 - Present",
    description: "• Working under Professor Michael C. Horowitz to digitize and analyze over 50 years of historical U.S. military appropriations data. Developing a Python-based OCR and data extraction pipeline to convert archival documents into structured data for statistical analysis.<br>&nbsp;<br>• Designing SQL database schemas and implementing data normalization procedures to enable analysis of bureaucratic resource allocation patterns and defense innovation trends. Applying natural language processing techniques for automated document classification and named entity extraction from unstructured historical text.<br>&nbsp;<br>• This research explores how bureaucratic structure and resource allocation influence defense innovation and military capability development."
  },
  4: { // PPPL Research Assistant
    title: "Research Assistant",
    company: "Princeton Plasma Physics Laboratory (PPPL)",
    location: "Jul 2024 - Aug 2024",
    description: "• Implemented Monte Carlo simulations in Python to model charged particle trajectories in tokamak fusion reactors under varying magnetic field configurations and plasma conditions.<br>&nbsp;<br>• Developed predictive statistical models using scikit-learn to forecast fusion reaction rates based on plasma confinement parameters, achieving R² > 0.90 on validation data.<br>&nbsp;<br>• Automated data processing pipeline capable of handling 100GB+ of simulation output using Pandas and NumPy, reducing analysis time by 75% and enabling faster iteration on reactor design parameters."
  }
};

// Card click functionality with modal support
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  const modal = document.getElementById('experienceModal');
  const modalContent = document.getElementById('modalContent');
  const closeBtn = document.querySelector('.close');
  
  cards.forEach((card, index) => {
    // Add click and touch handlers
    const handleCardClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Add visual feedback
      card.style.transform = 'scale(0.98)';
      setTimeout(() => {
        card.style.transform = '';
      }, 150);
      
      // Get experience data
      const experience = experienceData[index];
      
      if (experience) {
        // Create modal content
        modalContent.innerHTML = `
          <h2>${experience.title}</h2>
          <div class="modal-company">${experience.company}</div>
          <div class="modal-location">${experience.location}</div>
          <p>${experience.description}</p>
        `;
        
        // Show modal with animation
        modal.style.display = 'block';
        setTimeout(() => {
          modal.classList.add('show');
        }, 10);
      }
    };
    
    // Add both click and touch events
    card.addEventListener('click', handleCardClick);
    card.addEventListener('touchend', handleCardClick);
    
    // Prevent touch conflicts with scrolling
    card.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: false });
  });

  // Close modal functionality
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 400);
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 400);
    }
  });

  // Close modal with escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'block') {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 400);
    }
  });
});

// Helper functions for SPA initialization
function initScrollProgress() {
  const scrollProgressBar = document.querySelector('.scroll-progress-bar');
  if (!scrollProgressBar) return;

  function updateScrollProgress() {
    const { scrollHeight, clientHeight } = document.documentElement;
    const scrollableHeight = scrollHeight - clientHeight;
    const scrollY = window.scrollY;
    const scrollProgress = (scrollY / scrollableHeight) * 100;
    scrollProgressBar.style.transform = `translateY(-${100 - scrollProgress}%)`;
  }
  
  window.experienceScrollHandlers.push(updateScrollProgress);
  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress();
}

function initModalFunctionality() {
  const cards = document.querySelectorAll('.card');
  const modal = document.getElementById('experienceModal');
  const modalContent = document.getElementById('modalContent');
  const closeBtn = document.querySelector('.close');
  
  if (!modal || !modalContent) return;
  
  cards.forEach((card, index) => {
    const handleCardClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const experience = experienceData[index];
      if (experience) {
        modalContent.innerHTML = `
          <h2>${experience.title}</h2>
          <div class="modal-company">${experience.company}</div>
          <div class="modal-location">${experience.location}</div>
          <p>${experience.description}</p>
        `;
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
      }
    };
    
    card.addEventListener('click', handleCardClick);
    card.addEventListener('touchend', handleCardClick);
  });
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 400);
    });
  }
}

// SPA-specific initialization functions
window.initExperienceAnimations = function() {
  console.log('🚀 Initializing experience animations for SPA...');
  
  // Clean up existing handlers
  if (window.experienceScrollHandlers) {
    window.experienceScrollHandlers.forEach(handler => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    });
    window.experienceScrollHandlers = [];
  }
  
  // Check if we're in vertical mode
  const isVerticalMode = window.innerHeight > window.innerWidth || window.innerWidth <= 768;
  console.log('📱 Vertical mode detected:', isVerticalMode);
  
  // Set up initial state based on mode
  setTimeout(() => {
    if (isVerticalMode) {
      // In vertical mode - hide left section 3D models and show about section first
      console.log('🔧 Setting up vertical mode initial state...');
      
      // Hide left section elements
      const leftSection = document.querySelector('.left-section');
      const horseContainer = document.querySelector('.horse-container');
      const bullContainer = document.querySelector('.bull-container-new');
      const lionContainer = document.querySelector('.lion-container-new');
      const educationTitle = document.querySelector('.education-title');
      const experienceTitle = document.querySelector('.experience-title');
      const researchTitle = document.querySelector('.research-title');
      
      if (leftSection) leftSection.style.display = 'none';
      if (horseContainer) horseContainer.style.display = 'none';
      if (bullContainer) bullContainer.style.display = 'none';
      if (lionContainer) lionContainer.style.display = 'none';
      if (educationTitle) educationTitle.style.display = 'none';
      if (experienceTitle) experienceTitle.style.display = 'none';
      if (researchTitle) researchTitle.style.display = 'none';
      
      // Show about section first (bright hello sections, dim other sections)
      const helloSections = document.querySelectorAll('.hello-section');
      const helloVisibleElements = document.querySelectorAll('.hello-visible');
      const profilePhotos = document.querySelectorAll('.profile-photo');
      
      helloSections.forEach(section => {
        section.style.opacity = '1';
      });
      helloVisibleElements.forEach(element => {
        element.classList.add('show');
      });
      profilePhotos.forEach(photo => {
        photo.style.display = 'block';
        photo.style.visibility = 'visible';
        photo.style.opacity = '1';
        photo.classList.add('in-view');
      });
      
      // Dim all content sections initially
      const sections = document.querySelectorAll('.timeline-container, .experience-cards, .research-cards');
      sections.forEach(section => {
        section.classList.remove('in-view');
      });
      
      // Set about button as active
      const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
      navButtons.forEach(btn => btn.classList.remove('active'));
      if (navButtons[0]) navButtons[0].classList.add('active');
      
    } else {
      // In horizontal mode - use normal initialization
      console.log('🖥️ Setting up horizontal mode initial state...');
      
      // Show left section
      const leftSection = document.querySelector('.left-section');
      if (leftSection) leftSection.style.display = 'block';
      
      // Ensure profile photos are visible
      const profilePhotos = document.querySelectorAll('.profile-photo');
      profilePhotos.forEach(photo => {
        photo.style.display = 'block';
        photo.style.visibility = 'visible';
        photo.style.opacity = '1';
      });
    }
    
    // Initialize core functionality
    initScrollProgress();
    initSectionFocusForSPA();
    initNavigationButtonsForSPA();
    initModalFunctionality();
    
    // Force update button styling
    if (window.updateButtonStyling) {
      window.updateButtonStyling();
    }
    
  }, 150);
  
  console.log('✅ Experience animations initialized');
};

window.cleanupExperienceAnimations = function() {
  
  // Remove other scroll handlers
  if (window.experienceScrollHandlers) {
    window.experienceScrollHandlers.forEach(handler => {
      window.removeEventListener('scroll', handler);
    });
    window.experienceScrollHandlers = [];
  }
  
  console.log('Experience animations cleaned up');
};

// Store scroll handlers for cleanup
window.experienceScrollHandlers = [];

// SPA-compatible section focus initialization
function initSectionFocusForSPA() {
  console.log('🔍 Setting up section focus detection for SPA...');
  const timelineContainer = document.querySelector('.timeline-container');
  const experienceContainer = document.querySelector('.experience-cards');
  const researchContainer = document.querySelector('.research-cards');
  const helloContentMobile = document.querySelector('.hello-content-mobile');
  const helloSection = document.querySelector('.top-container .hello-section');
  
  console.log('📋 Found elements:', {
    timelineContainer: !!timelineContainer,
    experienceContainer: !!experienceContainer, 
    researchContainer: !!researchContainer,
    helloContentMobile: !!helloContentMobile,
    helloSection: !!helloSection
  });
  
  const sections = [
    { element: timelineContainer, name: 'education' },
    { element: experienceContainer, name: 'experience' },
    { element: researchContainer, name: 'research' },
    { element: helloContentMobile, name: 'hello-mobile' }
  ].filter(section => section.element);
  
  function updateSectionVisibility() {
    const windowHeight = window.innerHeight;
    let activeSection = null;
    let maxVisibility = 0;
    
    // Handle Hello section visibility
    const helloSections = document.querySelectorAll('.hello-section');
    const helloVisibleElements = document.querySelectorAll('.hello-visible');
    let helloInView = false;
    
    if (helloSection) {
      const helloRect = helloSection.getBoundingClientRect();
      const helloVisibleTop = Math.max(0, helloRect.top);
      const helloVisibleBottom = Math.min(windowHeight, helloRect.bottom);
      const helloVisibleHeight = Math.max(0, helloVisibleBottom - helloVisibleTop);
      const helloVisibilityRatio = helloRect.height > 0 ? helloVisibleHeight / helloRect.height : 0;
      
      // If Hello section is significantly visible
      if (helloVisibilityRatio > 0.3) {
        helloInView = true;
        // Brighten hello sections
        helloSections.forEach(section => {
          section.style.opacity = '1';
        });
        // Show photo and buttons
        helloVisibleElements.forEach(element => {
          element.classList.add('show');
        });
        // Dim all other sections
        sections.forEach(section => {
          section.element.classList.remove('in-view');
        });
        // Update hello button styling when hello section is in view
        if (window.updateHelloButtonStyling) {
          window.updateHelloButtonStyling('about', true);
        }
        // return; // TEMPORARILY DISABLED TO TEST SCROLL DETECTION
      } else {
        // Dim hello sections
        helloSections.forEach(section => {
          section.style.opacity = '0.3';
        });
        // Hide photo and buttons
        helloVisibleElements.forEach(element => {
          element.classList.remove('show');
        });
      }
    }
    
    // DRASTICALLY SIMPLIFIED: Use scroll position to determine active section
    const scrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollableHeight = documentHeight - windowHeight;
    let scrollPercent = 0;
    
    // Debug: Force scrollable detection if content seems reasonable
    const hasMultipleSections = sections.length >= 3;
    const contentHeight = document.body.scrollHeight;
    
    // Override non-scrollable detection if we have multiple sections OR we're in SPA mode
    const isSPAMode = document.body.hasAttribute('data-current-route');
    const forceScrollableDetection = (hasMultipleSections && contentHeight > windowHeight * 0.8) || 
                                   (isSPAMode && hasMultipleSections);
    

    // Handle case where document isn't tall enough to scroll (unless we're forcing scrollable detection)
    if (scrollableHeight <= 0 && !forceScrollableDetection) {
      // For non-scrollable content, use viewport-based detection instead
      
      // Get the positions of each section relative to viewport
      const educationSection = document.querySelector('.timeline-container');
      const experienceSection = document.querySelector('.experience-cards');
      const researchSection = document.querySelector('.research-cards');
      
      if (educationSection && experienceSection && researchSection) {
        const educationRect = educationSection.getBoundingClientRect();
        const experienceRect = experienceSection.getBoundingClientRect();
        const researchRect = researchSection.getBoundingClientRect();
        
        
        // Check if we're at the top (About section should be active)
        const topThreshold = 50; // If education section is more than 50px from top, we're in About
        if (educationRect.top > topThreshold) {
          activeSection = null; // About section (no section active)
        } else {
          // Determine which section is most visible in viewport
          const viewportCenter = windowHeight / 2;
          
          // Only consider sections that are actually visible (top < windowHeight)
          const visibleSections = [];
          if (educationRect.top < windowHeight && educationRect.bottom > 0) {
            visibleSections.push({ name: 'education', rect: educationRect, section: sections.find(s => s.name === 'education') });
          }
          if (experienceRect.top < windowHeight && experienceRect.bottom > 0) {
            visibleSections.push({ name: 'experience', rect: experienceRect, section: sections.find(s => s.name === 'experience') });
          }
          if (researchRect.top < windowHeight && researchRect.bottom > 0) {
            visibleSections.push({ name: 'research', rect: researchRect, section: sections.find(s => s.name === 'research') });
          }
          
          if (visibleSections.length === 0) {
            activeSection = null; // No sections visible (About)
            console.log('🎯 SPA: About section (no sections visible)');
          } else {
            // Find the section with the most area in viewport
            let bestSection = null;
            let maxVisibleArea = 0;
            
            visibleSections.forEach(({ name, rect, section }) => {
              const visibleTop = Math.max(0, rect.top);
              const visibleBottom = Math.min(windowHeight, rect.bottom);
              const visibleArea = Math.max(0, visibleBottom - visibleTop);
              
              
              if (visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea;
                bestSection = section;
              }
            });
            
            activeSection = bestSection;
          }
        }
      } else {
        // Fallback: start with About section (no section active)
        activeSection = null;
      }
    } else {
      // Use the corrected scrollable height if we forced detection
      const effectiveScrollableHeight = (forceScrollableDetection && scrollableHeight <= 0) ? 
        (contentHeight - windowHeight) : scrollableHeight;
      
      scrollPercent = scrollY / effectiveScrollableHeight;
      
      // Simple scroll-based section detection - adjusted for better spacing
      if (scrollPercent < 0.15) {
        // Top 15% = About (no active section)
        activeSection = null;
      } else if (scrollPercent < 0.45) {
        // 15-45% = Education
        activeSection = sections.find(s => s.name === 'education');
      } else if (scrollPercent < 0.75) {
        // 45-75% = Experience  
        activeSection = sections.find(s => s.name === 'experience');
      } else {
        // 75%+ = Research
        activeSection = sections.find(s => s.name === 'research');
      }
    }
    
    
    
    // Apply focus to most visible section, dim others
    sections.forEach(section => {
      if (section === activeSection) {
        section.element.classList.add('in-view');
        console.log('SPA - Setting as active:', section.name);
      } else {
        section.element.classList.remove('in-view');
      }
    });

    // Update navigation button highlighting
    const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
    if (navButtons.length >= 4) {
      // Remove active class from all buttons
      navButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class based on current section
      let currentSectionName = 'about'; // default (top section is About)
      if (activeSection) {
        if (activeSection.name === 'education') {
          navButtons[1]?.classList.add('active'); // Education button
          currentSectionName = 'education';
        } else if (activeSection.name === 'experience') {
          navButtons[2]?.classList.add('active'); // Experience button
          currentSectionName = 'experience';
        } else if (activeSection.name === 'research') {
          navButtons[3]?.classList.add('active'); // Research button
          currentSectionName = 'research';
        }
      } else {
        // When no section is active, we're in the About section (top)
        navButtons[0]?.classList.add('active'); // About button
      }
      
      // Store current section globally
      window.currentSection = currentSectionName;
      
      // Handle hello-content-mobile in vertical mode
      const isVerticalMode = window.innerHeight > window.innerWidth || window.innerWidth <= 768;
      const helloContentMobile = document.querySelector('.hello-content-mobile');
      
      if (isVerticalMode && helloContentMobile) {
        if (currentSectionName === 'about') {
          // In about section - make hello-content-mobile bright
          helloContentMobile.classList.add('in-view');
        } else {
          // In other sections - dim hello-content-mobile
          helloContentMobile.classList.remove('in-view');
        }
      }
      
      // Update button styling based on new active states
      if (window.updateButtonStyling) {
        window.updateButtonStyling();
      }
      
      // Update hello button styling based on current section and hello visibility
      if (window.updateHelloButtonStyling) {
        window.updateHelloButtonStyling(currentSectionName, false); // Not in hello section when other sections are active
      }
    }
    
    // Also update animal visibility - INLINE VERSION
    
    const isEducationInFocus = activeSection && activeSection.name === 'education';
    const isExperienceInFocus = activeSection && activeSection.name === 'experience';
    const isResearchInFocus = activeSection && activeSection.name === 'research';
    
    
    const horseContainer = document.querySelector('.horse-container');
    const bullContainer = document.querySelector('.bull-container-new');
    const lionContainer = document.querySelector('.lion-container-new');
    const educationTitle = document.querySelector('.education-title');
    const experienceTitle = document.querySelector('.experience-title');
    const researchTitle = document.querySelector('.research-title');
    
    
    // Horse shows for education
    if (horseContainer) {
      if (isEducationInFocus) {
        horseContainer.classList.add('visible');
      } else {
        horseContainer.classList.remove('visible');
      }
    }
    
    // Bull shows for experience
    if (bullContainer) {
      if (isExperienceInFocus) {
        bullContainer.style.opacity = '1';
        bullContainer.style.visibility = 'visible';
      } else {
        bullContainer.style.opacity = '0';
        bullContainer.style.visibility = 'hidden';
      }
    }
    
    // Lion shows for research
    if (lionContainer) {
      if (isResearchInFocus) {
        lionContainer.style.opacity = '1';
        lionContainer.style.visibility = 'visible';
      } else {
        lionContainer.style.opacity = '0';
        lionContainer.style.visibility = 'hidden';
      }
    }
    
    // Education title shows when education is in focus
    if (educationTitle) {
      if (isEducationInFocus) {
        educationTitle.classList.add('visible');
      } else {
        educationTitle.classList.remove('visible');
      }
    }
    
    // Experience title shows when experience is in focus
    if (experienceTitle) {
      if (isExperienceInFocus) {
        experienceTitle.style.opacity = '1';
        experienceTitle.style.visibility = 'visible';
      } else {
        experienceTitle.style.opacity = '0';
        experienceTitle.style.visibility = 'hidden';
      }
    }
    
    // Research title shows when research is in focus
    if (researchTitle) {
      if (isResearchInFocus) {
        researchTitle.style.opacity = '1';
        researchTitle.style.visibility = 'visible';
      } else {
        researchTitle.style.opacity = '0';
        researchTitle.style.visibility = 'hidden';
      }
    }
  }
  
  // Store the handler for cleanup
  window.experienceScrollHandlers.push(updateSectionVisibility);
  
  // Simple scroll detection for terminal
  window.addEventListener('scroll', () => {
    console.log(`Scroll: ${window.scrollY}px, DocHeight: ${document.documentElement.scrollHeight}, WindowHeight: ${window.innerHeight}`);
  });
  
  // Initial call and scroll listener
  updateSectionVisibility();
  window.addEventListener('scroll', updateSectionVisibility);
  window.addEventListener('resize', updateSectionVisibility);
  
  // For SPA mode, if no scroll is possible, add a timer-based section detection
  const currentRoute = document.body.getAttribute('data-current-route');
  if (currentRoute === 'experience') {
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    
    if (documentHeight <= windowHeight + 10) {
      // Content isn't scrollable, add viewport-based detection
      setInterval(() => {
        const educationSection = document.querySelector('.timeline-container');
        const experienceSection = document.querySelector('.experience-cards');
        const researchSection = document.querySelector('.research-cards');
        
        if (educationSection && experienceSection && researchSection) {
          const educationRect = educationSection.getBoundingClientRect();
          const experienceRect = experienceSection.getBoundingClientRect();
          const researchRect = researchSection.getBoundingClientRect();
          
          const centerY = windowHeight / 2;
          let activeSection = null;
          
          // Check which section is active based on viewport position
          if (educationRect.top > centerY) {
            // Above education section = About section
            activeSection = null; // About (no section active)
          } else if (educationRect.top <= centerY && educationRect.bottom >= centerY) {
            activeSection = sections.find(s => s.name === 'education');
          } else if (experienceRect.top <= centerY && experienceRect.bottom >= centerY) {
            activeSection = sections.find(s => s.name === 'experience');
          } else if (researchRect.top <= centerY && researchRect.bottom >= centerY) {
            activeSection = sections.find(s => s.name === 'research');
          } else if (researchRect.bottom < centerY) {
            // Below research section = still Research
            activeSection = sections.find(s => s.name === 'research');
          }
          
          // Update sections
          sections.forEach(section => {
            if (section === activeSection) {
              section.element.classList.add('in-view');
            } else {
              section.element.classList.remove('in-view');
            }
          });
          
          // Handle Hello/About content visibility
          const helloSections = document.querySelectorAll('.hello-section');
          const helloVisibleElements = document.querySelectorAll('.hello-visible');
          const helloContentMobile = document.querySelector('.hello-content-mobile');
          
          // Check if we're in vertical/mobile mode
          const isVerticalMode = window.innerHeight > window.innerWidth;
          
          // Handle left section visibility (3D models, titles, nav buttons)
          const leftSection = document.querySelector('.left-section');
          const horseContainer = document.querySelector('.horse-container');
          const bullContainer = document.querySelector('.bull-container-new');
          const lionContainer = document.querySelector('.lion-container-new');
          const educationTitle = document.querySelector('.education-title');
          const experienceTitle = document.querySelector('.experience-title');
          const researchTitle = document.querySelector('.research-title');
          const navButtonsContainer = document.querySelector('.nav-buttons.permanent-buttons');
          
          if (isVerticalMode) {
            // Hide all left section content in vertical mode
            if (leftSection) leftSection.style.display = 'none';
            if (horseContainer) horseContainer.style.display = 'none';
            if (bullContainer) bullContainer.style.display = 'none';
            if (lionContainer) lionContainer.style.display = 'none';
            if (educationTitle) educationTitle.style.display = 'none';
            if (experienceTitle) experienceTitle.style.display = 'none';
            if (researchTitle) researchTitle.style.display = 'none';
            if (navButtonsContainer) navButtonsContainer.style.display = 'none';
          } else {
            // Show left section content in horizontal mode
            if (leftSection) leftSection.style.display = 'block';
            if (navButtonsContainer) {
              navButtonsContainer.style.display = 'grid';
              // Ensure it maintains the 2x2 grid layout
              navButtonsContainer.style.gridTemplateColumns = '1fr 1fr';
            }
            // 3D models and titles will be shown/hidden based on active section below
          }
          
          if (activeSection === null) {
            // About section is active - show hello content
            helloSections.forEach(section => {
              section.style.opacity = '1';
            });
            helloVisibleElements.forEach(element => {
              element.classList.add('show');
            });
            // Make profile photo bright when about is active
            const profilePhoto = document.querySelector('.profile-photo');
            if (profilePhoto) profilePhoto.classList.add('in-view');
            if (helloContentMobile) {
              if (isVerticalMode) {
                // Show mobile content in vertical mode
                helloContentMobile.style.display = 'block';
                helloContentMobile.style.opacity = '1';
                helloContentMobile.style.visibility = 'visible';
              } else {
                // Hide mobile content in horizontal mode
                helloContentMobile.style.display = 'none';
              }
            }
          } else {
            // Other sections active - dim hello content
            helloSections.forEach(section => {
              section.style.opacity = '0.3';
            });
            helloVisibleElements.forEach(element => {
              element.classList.remove('show');
            });
            // Dim profile photo when about is not active
            const profilePhoto = document.querySelector('.profile-photo');
            if (profilePhoto) profilePhoto.classList.remove('in-view');
            if (helloContentMobile) {
              if (isVerticalMode) {
                helloContentMobile.style.opacity = '0.3';
              } else {
                // Always hidden in horizontal mode
                helloContentMobile.style.display = 'none';
              }
            }
          }
          
          // Update navigation buttons
          const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
          navButtons.forEach(btn => btn.classList.remove('active'));
          
          if (activeSection) {
            if (activeSection.name === 'education' && navButtons[1]) {
              navButtons[1].classList.add('active');
            } else if (activeSection.name === 'experience' && navButtons[2]) {
              navButtons[2].classList.add('active');
            } else if (activeSection.name === 'research' && navButtons[3]) {
              navButtons[3].classList.add('active');
            }
          } else if (navButtons[0]) {
            navButtons[0].classList.add('active'); // About
          }
          
          // Update button styling and animal visibility
          if (window.updateButtonStyling) {
            window.updateButtonStyling();
          }
          updateAnimalVisibility();
        }
      }, 100); // Check every 100ms
    }
  }
  
  
  
  
  // Force initial state - For SPA experience route (mode-aware)
  setTimeout(() => {
    const currentRoute = document.body.getAttribute('data-current-route');
    
    if (currentRoute === 'experience') {
      const isVerticalMode = window.innerHeight > window.innerWidth || window.innerWidth <= 768;
      
      if (!isVerticalMode) {
        // Only activate education section in horizontal mode
        sections.forEach(section => {
          section.element.classList.remove('in-view');
        });
        
        // Find and activate education section
        const educationSection = sections.find(s => s.name === 'education');
        if (educationSection) {
          educationSection.element.classList.add('in-view');
          
          // Update navigation buttons
          const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
          navButtons.forEach(btn => btn.classList.remove('active'));
          if (navButtons[1]) navButtons[1].classList.add('active'); // Education button
          
          // Update button styling
          if (window.updateButtonStyling) {
            window.updateButtonStyling();
          }
          
          // Show education elements
          const horseContainer = document.querySelector('.horse-container');
          const educationTitle = document.querySelector('.education-title');
          
          if (horseContainer) horseContainer.classList.add('visible');
          if (educationTitle) educationTitle.classList.add('visible');
        }
      }
      // In vertical mode, don't override the About section setup from earlier
      
      // Add manual section switching for SPA since scroll detection doesn't work
      const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
      navButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          // Remove active from all sections
          sections.forEach(section => {
            section.element.classList.remove('in-view');
          });
          
          // Remove active from all buttons
          navButtons.forEach(btn => btn.classList.remove('active'));
          
          // Activate clicked button
          button.classList.add('active');
          
          // Activate corresponding section
          let targetSection = null;
          switch(index) {
            case 0: // About - no section active
              break;
            case 1: // Education
              targetSection = sections.find(s => s.name === 'education');
              break;
            case 2: // Experience
              targetSection = sections.find(s => s.name === 'experience');
              break;
            case 3: // Research
              targetSection = sections.find(s => s.name === 'research');
              break;
          }
          
          if (targetSection) {
            targetSection.element.classList.add('in-view');
          }
          
          // Update button styling
          if (window.updateButtonStyling) {
            window.updateButtonStyling();
          }
          
          // Manually trigger animal visibility update
          updateAnimalVisibility();
        });
      });
      
    } else {
      updateSectionVisibility();
    }
  }, 100);
}

// SPA-compatible navigation buttons initialization  
function initNavigationButtonsForSPA() {
  // The navigation button logic is already global, so it should work
  // Just ensure the button styling function is available
  if (!window.updateButtonStyling) {
    const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
    
    window.updateButtonStyling = function() {
      navButtons.forEach((button) => {
        if (button.classList.contains('active')) {
          button.style.borderColor = '#ff00ff';
          button.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.6)';
        } else {
          button.style.borderColor = '#ffffff';
          button.style.boxShadow = 'none';
        }
      });
    }
  }
}

// Animal visibility function that can be called from SPA
function updateAnimalVisibility() {
  // Check which section is in focus
  const timelineContainer = document.querySelector('.timeline-container');
  const experienceContainer = document.querySelector('.experience-cards');
  const researchContainer = document.querySelector('.research-cards');
  
  const isEducationInFocus = timelineContainer && timelineContainer.classList.contains('in-view');
  const isExperienceInFocus = experienceContainer && experienceContainer.classList.contains('in-view');
  const isResearchInFocus = researchContainer && researchContainer.classList.contains('in-view');
  
  
  const horseContainer = document.querySelector('.horse-container');
  const bullContainer = document.querySelector('.bull-container-new');
  const lionContainer = document.querySelector('.lion-container-new');
  const educationTitle = document.querySelector('.education-title');
  const navButtons = document.querySelector('.nav-buttons.permanent-buttons');
  
  
  // Horse shows for education
  if (horseContainer) {
    if (isEducationInFocus) {
      horseContainer.classList.add('visible');
    } else {
      horseContainer.classList.remove('visible');
    }
  }
  
  // Bull shows for experience
  if (bullContainer) {
    if (isExperienceInFocus) {
      bullContainer.style.opacity = '1';
      bullContainer.style.visibility = 'visible';
    } else {
      bullContainer.style.opacity = '0';
      bullContainer.style.visibility = 'hidden';
    }
  }
  
  // Lion shows for research
  if (lionContainer) {
    if (isResearchInFocus) {
      lionContainer.style.opacity = '1';
      lionContainer.style.visibility = 'visible';
    } else {
      lionContainer.style.opacity = '0';
      lionContainer.style.visibility = 'hidden';
    }
  }
  
  // Research title shows when research is in focus
  const researchTitle = document.querySelector('.research-title');
  if (researchTitle) {
    if (isResearchInFocus) {
      researchTitle.style.opacity = '1';
      researchTitle.style.visibility = 'visible';
    } else {
      researchTitle.style.opacity = '0';
      researchTitle.style.visibility = 'hidden';
    }
  }
  
  // Experience title shows when experience is in focus
  const experienceTitle = document.querySelector('.experience-title');
  if (experienceTitle) {
    if (isExperienceInFocus) {
      experienceTitle.style.opacity = '1';
      experienceTitle.style.visibility = 'visible';
    } else {
      experienceTitle.style.opacity = '0';
      experienceTitle.style.visibility = 'hidden';
    }
  }
  
  // Education title shows when education is in focus
  if (isEducationInFocus) {
    if (educationTitle) {
      educationTitle.classList.add('visible');
    }
  } else {
    if (educationTitle) {
      educationTitle.classList.remove('visible');
    }
  }
  
  // Nav buttons show when education, experience, OR research is in focus (don't fade out until footer)
  if (isEducationInFocus || isExperienceInFocus || isResearchInFocus) {
    if (navButtons) navButtons.classList.add('visible');
  } else {
    if (navButtons) navButtons.classList.remove('visible');
  }
}