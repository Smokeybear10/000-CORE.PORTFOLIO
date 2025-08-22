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
let scrollProgressHandler = null;

function initScrollProgress() {
  const scrollProgressBar = document.querySelector('.scroll-progress-bar');

  function updateScrollProgress() {
    if (!scrollProgressBar) return;
    
    const { scrollHeight, clientHeight } = document.documentElement;
    const scrollableHeight = scrollHeight - clientHeight;
    const scrollY = window.scrollY;
    const scrollProgress = (scrollY / scrollableHeight) * 100;
    
    scrollProgressBar.style.transform = `translateY(-${100 - scrollProgress}%)`;
  }

  // Remove existing handler if any
  if (scrollProgressHandler) {
    window.removeEventListener('scroll', scrollProgressHandler);
  }
  
  scrollProgressHandler = updateScrollProgress;
  
  // Initial call and scroll listener
  updateScrollProgress();
  window.addEventListener('scroll', scrollProgressHandler);
}

// Initialize on DOM ready for standalone experience page
document.addEventListener('DOMContentLoaded', () => {
  // Only init if we're on the experience page directly
  if (window.location.pathname.includes('experience') && !window.location.pathname.includes('spa')) {
    initScrollProgress();
  }
});

// Experience text fade effect
let experienceWhiteHandler = null;

function initExperienceFadeEffects() {
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
  
  // Remove existing handler if any
  if (experienceWhiteHandler) {
    window.removeEventListener('scroll', experienceWhiteHandler);
  }
  
  experienceWhiteHandler = updateExperienceWhiteOpacity;
  window.experienceScrollHandlers.push(experienceWhiteHandler);
  
  // Initial call and scroll listeners
  updateExperienceWhiteOpacity();
  window.addEventListener('scroll', experienceWhiteHandler);
}

// Initialize on DOM ready for standalone experience page
document.addEventListener('DOMContentLoaded', () => {
  // Only init if we're on the experience page directly
  if (window.location.pathname.includes('experience') && !window.location.pathname.includes('spa')) {
    initExperienceFadeEffects();
  }
});

// Animal containers fade in/out based on section focus
let animalVisibilityHandler = null;

function initAnimalContainerVisibility() {
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
        console.log('Setting as active:', section.name); // Debug
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
       if (button.classList.contains('active')) {
         button.style.borderColor = '#ff00ff';
         button.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.6)';
       } else {
         button.style.borderColor = '#ffffff';
         button.style.boxShadow = 'none';
       }
     });
   }
   
   // Initial styling update
   window.updateButtonStyling();
   
   navButtons.forEach((button, index) => {
     // Mouse enter event
     button.addEventListener('mouseenter', () => {
       if (button.classList.contains('active')) {
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
       if (button.classList.contains('active')) {
         // Active button returns to normal magenta glow
         button.style.borderColor = '#ff00ff';
         button.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.6)';
       } else {
         // Other buttons return to white
         button.style.borderColor = '#ffffff';
         button.style.boxShadow = 'none';
       }
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
     button.addEventListener('click', () => {
       const section = button.getAttribute('data-section');
       let targetElement = null;
       
       switch(section) {
         case 'about':
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
  
  if (mobileMenuBtn && bottomNav) {
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

// Experience and Research data for modals
const experienceData = {
  0: { // Data & Analytics at Flushing CPA
    title: "Data & Analytics",
    company: "Flushing CPA Tax Center",
    location: "Spring 2024",
    description: "• Designed and implemented automated data extraction, transformation, and loading processes to handle large-scale tax datasets from multiple sources, reducing manual processing time by 25% while improving financial projection accuracy by 15%.<br>&nbsp;<br>• Created VBA macros and automated workflows to systematically scan 300+ client tax records for compliance issues, implementing alert systems that reduced compliance review time by 30%.<br>&nbsp;<br>• Constructed predictive statistical models using historical financial data and industry benchmarks to forecast quarterly tax liabilities for 150+ small and medium business clients with 85% accuracy.<br>&nbsp;<br>• Established standardized data processing workflows and maintained centralized tax databases, achieving 98% data accuracy and supporting seamless operations during peak tax season periods."
  },
  1: { // Legal Research at Jonathan Spodnick
    title: "Legal Research Intern",
    company: "Offices of Jonathan Spodnick",
    location: "Fall 2023",
    description: "• Researched legal cases and prepared court documents including motions, briefs, and discovery materials for 25+ personal injury lawsuits.<br>&nbsp;<br>• Built a Python-based natural language processing tool to automatically categorize legal documents, reducing manual review time by 40%.<br>&nbsp;<br>• Applied statistical analysis to examine injury claim patterns and settlement data across 200+ cases, informing case valuation strategies.<br>&nbsp;<br>• Streamlined document processing workflows and maintained organized case databases, improving case preparation efficiency by 35%."
  },
  2: { // Fintech Analyst at CITIC
    title: "Fintech Analyst",
    company: "CITIC Securities",
    location: "Summer 2023",
    description: "• Assisted in preparing a listing proposal for an $11 billion spaceflight network company by developing data-driven presentations that showcased CITIC's core investment banking capabilities and sector expertise.<br>&nbsp;<br>• Analyzed socio-political impacts on China's financial markets during CITIC's RMB regulatory penalty, collaborating with a 9-person team to develop risk mitigation strategies that minimized adverse effects on stock price performance.<br>&nbsp;<br>• Supported the preparation and documentation of an $18 billion convertible bond prospectus for a regional banking client, ensuring regulatory compliance and investor disclosure requirements.<br>&nbsp;<br>• Contributed to deal structuring and financial modeling processes across multiple high-value transactions, supporting senior analysts in client relationship management and transaction execution."
  },
  3: { // DoD Research Assistant
    title: "Military Tech Analyst",
    company: "University Of Pennsylvania",
    location: "Summer 2025",
    description: "• Transcribed and analyzed military technology proposals from BOF Annual Reports (1897-1908), systematically cataloging over 200+ inventions including subject details, proposer information, and military adoption outcomes across 11 annual reporting periods.<br>&nbsp;<br>• Evaluated technological significance and historical impact of proposed military innovations, providing evidence-based recommendations for deeper research prioritization while assessing factors including adoption success, technological advancement, and lasting influence on modern defense systems.<br>&nbsp;<br>• Synthesized findings from diverse primary and secondary sources including patent databases, military testing records, newspaper archives, and academic collections to create comprehensive technology profiles supporting ongoing historical military innovation research initiatives."
  },
  4: { // PPPL Research Assistant
    title: "Research Assistant", 
    company: "Princeton Plasma Physics Lab (PPPL)",
    location: "Summer 2024",
    description: "• Analyzed plasma confinement mechanisms to study charged particle behavior within tokamak reactor configurations, examining magnetic field interactions and particle trajectory dynamics.<br>&nbsp;<br>• Simulated the effects of magnetic field strength variations and plasma density changes on reactor performance metrics, identifying optimal operating parameters for maximum energy output efficiency.<br>&nbsp;<br>• Developed statistical models to predict fusion reaction rates under different operating conditions, incorporating plasma temperature, density, and confinement variables to forecast reactor performance.<br>&nbsp;<br>• Collaborated with research team to validate simulation results against experimental data, contributing to ongoing fusion energy research and reactor optimization studies."
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

// SPA-specific initialization functions
window.initExperienceAnimations = function() {
  console.log('Initializing experience animations for SPA...');
  
  // Initialize scroll progress
  initScrollProgress();
  
  // Initialize experience fade effects
  initExperienceFadeEffects();
  
  // Initialize animal container visibility
  initAnimalContainerVisibility();
  
  // Initialize section focus effects
  initSectionFocusEffects();
  
  // Initialize hello navigation
  initHelloNavigation();
  
  // Initialize hello buttons
  initHelloButtons();
  
  console.log('Experience animations initialized');
};

window.cleanupExperienceAnimations = function() {
  console.log('Cleaning up experience animations...');
  
  // Remove scroll progress handler
  if (scrollProgressHandler) {
    window.removeEventListener('scroll', scrollProgressHandler);
    scrollProgressHandler = null;
  }
  
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