// COMPLETELY REWRITTEN SPA PROJECTS JAVASCRIPT

// Project data with enhanced information
const projectData = {
  verilog: {
    title: "Verilog-Based ALU for 16-bit RISC-V Processor",
    description: "Designed and implemented a comprehensive Arithmetic Logic Unit (ALU) in Verilog for a 16-bit RISC-V processor architecture. The project involved creating modular components for arithmetic operations, logical operations, and control logic while ensuring optimal timing and resource utilization.",
    tech: ["Verilog", "RISC-V", "Digital Design", "FPGA", "ModelSim", "Quartus"],
    image: "Images/ProjectPhotos/Verilog.png",
    features: [
      "16-bit arithmetic operations (ADD, SUB, MUL, DIV)",
      "Logical operations (AND, OR, XOR, NOT, shifts)",
      "Conditional branching and jump instructions",
      "Register file with 32 x 16-bit registers",
      "Pipeline hazard detection and resolution",
      "FPGA synthesis and timing optimization"
    ],
    technical: "The ALU was designed using hierarchical Verilog modules with separate components for arithmetic, logic, and control operations. The design features a 5-stage pipeline with forwarding units to handle data hazards. Custom testbenches were developed to verify functionality across all instruction types, and the design was synthesized for Altera Cyclone IV FPGA with timing closure at 50MHz.",
    challenges: "The primary challenge was achieving timing closure while maintaining full RISC-V compatibility. This required careful pipeline stage balancing and the implementation of bypassing logic. Memory alignment issues were resolved through custom address translation units.",
    links: [
      { text: "GitHub Repository", url: "#", type: "github", error: "Not publicly available" },
      { text: "Technical Documentation", url: "#", type: "docs", error: "Not publicly available" }
    ],
    gallery: ["Images/ProjectPhotos/Verilog.png"]
  },
  flywheel: {
    title: "Magnetically Levitating Flywheel Generator",
    description: "Developed an innovative energy storage system using magnetic levitation technology to reduce friction losses in flywheel energy storage. The project integrated electromagnetic controls, power electronics, and real-time monitoring systems to achieve stable levitation and energy conversion.",
    tech: ["Electromagnetic Design", "Power Electronics", "Control Systems", "MATLAB/Simulink", "PCB Design", "Embedded Systems"],
    image: "Images/ProjectPhotos/MagneticallyLevitating.png",
    features: [
      "Magnetic bearing system with 5 degrees of freedom control",
      "High-speed flywheel (up to 15,000 RPM)",
      "Power electronics for motor/generator operation",
      "Real-time control system with feedback loops",
      "Energy storage capacity of 1kWh",
      "Efficiency rating of 92% round-trip"
    ],
    technical: "The system uses active magnetic bearings controlled by PID loops running at 10kHz. The power electronics stage features a three-phase inverter with space vector PWM control. The flywheel is made from carbon fiber composite for optimal strength-to-weight ratio. MATLAB/Simulink was used for control system design and simulation.",
    challenges: "Achieving stable levitation required extensive control system tuning and vibration analysis. The high-speed rotation introduced gyroscopic effects that needed compensation. Electromagnetic interference was minimized through careful PCB layout and shielding.",
    links: [
      { text: "Project Report", url: "#", type: "docs", error: "Not publicly available" },
      { text: "CAD Models", url: "#", type: "design", error: "Not publicly available" }
    ],
    gallery: ["Images/ProjectPhotos/MagneticallyLevitating.png"]
  },
  fightiq: {
    title: "Predictive Analysis of Fight Outcomes in MMA",
    description: "This machine learning system predicts MMA fight outcomes by analyzing comprehensive fighter statistics and historical performance data. The project leverages a differential-based approach to compare fighters across 183+ attributes spanning striking mechanics, grappling proficiency, physical characteristics, and career trajectories. Rather than evaluating fighters in isolation, the system calculates relative advantages between opponents—capturing crucial factors like reach differentials, striking accuracy gaps, and defensive capability disparities. By training and benchmarking seven supervised learning algorithms on historical UFC data, the system generates probabilistic confidence scores for hypothetical matchups, with Gradient Boosting selected as the production model through rigorous cross-validation and comparative performance analysis.",
    tech: ["Python", "Machine Learning", "Gradient Boosting", "Random Forest", "scikit-learn", "pandas", "NumPy", "Data Analysis"],
    image: "Images/ProjectPhotos/FightIQ.png",
    features: [
      { title: "Differential-Based Feature Extraction", detail: "Compares 183+ fighter attributes across striking metrics, grappling statistics, physical characteristics, and historical performance indicators to capture relative advantages rather than absolute statistics" },
      { title: "Multi-Domain Career Statistics", detail: "Processes and normalizes fighter data across striking accuracy by target and range, takedown defense percentages, submission attempts, control time, stamina metrics, and competition frequency" },
      { title: "Ensemble Algorithm Benchmarking", detail: "Evaluates 7 supervised learning models including Gradient Boosting, Random Forest, SVM, KNN, MLP Neural Network, Decision Tree, and Logistic Regression" },
      { title: "Feature Importance Analysis", detail: "Implements cross-validation and statistical evaluation to identify key predictive attributes including win/loss ratios, striking differentials, defensive capabilities, and physical advantages" },
      { title: "Interactive Prediction Interface", detail: "Accepts any two fighter names as input and generates fight outcome predictions with probabilistic confidence scores based on model certainty levels" },
      { title: "Real-Time Differential Computation", detail: "Automatically calculates fighter attribute differentials from career-averaged statistics for novel matchup predictions" }
    ],
    technical: "The system processes historical UFC data from Kaggle through a preprocessing pipeline that transforms raw statistics into differential features across 183+ attributes covering striking, grappling, physical, and career metrics. Seven supervised learning algorithms undergo stratified cross-validation with performance evaluated via precision, recall, F1-scores, and ROC-AUC metrics. Gradient Boosting Classifier is selected as the production model based on superior accuracy and feature importance rankings, effectively capturing non-linear relationships while maintaining generalization on unseen matchups. The prediction interface implements a real-time pipeline that accepts fighter names, computes career-averaged differentials dynamically, and generates probabilistic predictions with confidence scores, with feature analysis identifying win/loss ratios, strike differentials, takedown defense, and physical advantages as primary predictors.",
    links: [
      { text: "GitHub Repository", url: "https://github.com/Smokeybear10/UFC-Analytics-Engine", type: "github" },
      { text: "Model Documentation", url: "#", type: "docs", error: "Not publicly available" },
      { text: "Feature Analysis Report", url: "#", type: "docs", error: "Not publicly available" }
    ],
    gallery: ["Images/ProjectPhotos/FightIQ.png"]
  },
  website: {
    title: "Personal Portfolio Website",
    description: "A modern portfolio website showcasing projects and technical expertise through interactive 3D animations and responsive design. Built as a vanilla JavaScript Single Page Application, the site features custom routing, Three.js 3D model rendering, and GSAP animations. The implementation prioritizes performance optimization and cross-device compatibility while demonstrating proficiency in modern web development practices including component architecture, asset management, and progressive enhancement strategies.",
    tech: ["HTML5", "CSS3", "JavaScript", "GSAP", "Three.js", "Responsive Design", "Web Performance"],
    image: "Assets/Portfolio.gif",
    features: [
      { title: "Custom 3D Animations and Models", detail: "Three.js-powered 3D model rendering with optimized loading strategies, dynamic model switching, and interactive controls for enhanced visual engagement" },
      { title: "Single Page Application (SPA) Architecture", detail: "Custom routing and state management system built in vanilla JavaScript, enabling seamless navigation without page reloads and improved user experience" },
      { title: "Responsive Design for All Device Sizes", detail: "Modern CSS Grid and Flexbox layouts ensure optimal viewing experience across desktop, tablet, and mobile devices with adaptive breakpoints" },
      { title: "Interactive Project Showcase Wheel", detail: "3D rotating carousel displaying featured projects with drag-to-spin functionality, auto-rotation, and smooth animations using GSAP and CSS transforms" },
      { title: "Optimized Loading and Performance", detail: "Lazy loading strategies, asset optimization, and progressive enhancement ensure fast initial load times and smooth interactions across all connection speeds" },
      { title: "Cross-Browser Compatibility", detail: "Progressive enhancement approach guarantees consistent functionality across modern browsers with graceful fallbacks for older browser versions" }
    ],
    technical: "The site implements a custom SPA router with hash-based navigation and dynamic content loading. Three.js handles 3D model rendering with lazy loading and level-of-detail optimization, while GSAP provides hardware-accelerated animations with timeline control. The styling system uses CSS Grid and Flexbox with custom properties for theme customization. Performance optimizations include code splitting, asset preloading, and intersection observers for viewport-based lazy loading.",
    links: [
      { text: "Live Website", url: "https://thomasou.com", type: "live" },
      { text: "Source Code", url: "https://github.com/Smokeybear10/PortfolioWebsite-Ver2.0", type: "github" }
    ],
    gallery: ["Assets/Portfolio.gif"]
  },
  poker: {
    title: "Bayesian Poker Analysis Engine with Monte Carlo CFR",
    description: "A high-performance poker solver implementing Bayesian inference and Monte Carlo Counterfactual Regret Minimization to achieve superhuman-level play in multiplayer No Limit Texas Hold'em. Built in Rust, the engine combines probabilistic modeling with game theory optimization to analyze opponent behavior patterns, estimate bluffing tendencies, and compute optimal decision-making strategies. Hierarchical hand abstraction reduces computational complexity while maintaining strategic fidelity, enabling the system to process billions of game states and generate near-optimal blueprint strategies. The architecture leverages thread-safe parallel processing and memory-efficient data structures to handle the intensive computational demands of poker strategy generation.",
    tech: ["Rust", "Monte Carlo CFR", "Game Theory", "Hand Abstraction", "PostgreSQL", "Parallel Computing"],
    image: "Images/ProjectPhotos/Montepoke1.gif",
    features: [
      { title: "Hierarchical Hand Abstraction", detail: "Reduces game complexity through efficient representation across all betting streets (preflop, flop, turn, river) using k-means++ seeding and strategic clustering" },
      { title: "Monte Carlo Counterfactual Regret Minimization (CFR) Training", detail: "Implements external sampling MCCFR with iterative regret updates, strategy accumulation with linear weighting, and convergence-based checkpointing" },
      { title: "Real-Time Strategy Optimization and Blueprint Generation", detail: "Produces near-optimal strategies through resource-intensive offline training, persisting abstractions and policies to disk for rapid gameplay analysis" },
      { title: "Memory-Efficient Abstractions for No Limit Texas Hold'em", detail: "Utilizes precise struct and trait systems with bijective card representations to minimize memory footprint while maintaining strategic fidelity" },
      { title: "Parallel Computing for Accelerated Training", detail: "Leverages thread-safe multi-processing and idiomatic Rust concurrency patterns to handle computationally intensive strategy generation" },
      { title: "Advanced Gameplay Analysis and Strategy Evaluation", detail: "PostgreSQL-backed query system with extensive indexing enables efficient lookups across learned strategies, abstractions, and distance metrics" }
    ],
    technical: "The system architecture consists of five core modules: the cards module provides nanosecond hand evaluation and fast equity calculations, the gameplay module implements complete NLHE rules with complex showdown logic, and the clustering module exhaustively iterates through 3.1 trillion isomorphic situations while running hierarchical k-means clustering and calculating Earth Mover's Distance. The mccfr module performs iterative training using external sampling with dynamic tree construction, updating regret values and accumulating strategy updates with linear weighting until convergence. The analysis module provides a PostgreSQL-backed query interface with CLI tools and an Actix web server, enabling efficient lookups across learned strategies, abstractions, and distance metrics for advanced gameplay analysis.",
    links: [
      { text: "GitHub Repository", url: "https://github.com/Smokeybear10/MontePokerG", type: "github" },
      { text: "Strategy Analyzer", url: "#", type: "demo", error: "Website is currently down" },
      { text: "Technical Documentation", url: "#", type: "docs", error: "Website is currently down" }
    ],
    gallery: ["Images/ProjectPhotos/Montepoke1.gif", "Images/ProjectPhotos/Montepoke2.gif"]
  },
  smartcv: {
    title: "AI-Powered Resume Optimizer",
    description: "An intelligent resume optimization tool that streamlines the job application process through AI-driven analysis and professional template building. The platform leverages Google Gemini AI to provide comprehensive resume analysis, ATS compatibility checks, skills gap identification, and content optimization suggestions. Users can build tailored, recruiter-ready resumes from scratch using four premium templates or import existing documents for enhancement. The system integrates multi-portal job search capabilities with LinkedIn scraping, location-based filtering, and company insights, while providing analytics dashboards to track resume performance and optimization metrics over time.",
    tech: ["Python", "Streamlit", "Google Gemini AI", "Selenium", "SQLite", "NLP", "ATS Optimization"],
    image: "Images/ProjectPhotos/SmartCV.png",
    features: [
      { title: "AI-Powered Resume Analysis", detail: "Utilizes Google Gemini AI for advanced content analysis, ATS compatibility scoring, skills gap identification, and optimization recommendations across 50+ predefined job roles" },
      { title: "Professional Resume Builder", detail: "Offers 4 premium templates (Modern, Professional, Minimal, Creative) with real-time preview and export capabilities in PDF and DOCX formats" },
      { title: "Smart Job Matching System", detail: "Integrates LinkedIn scraping and multi-portal search with location-based filtering, company insights, and market analysis for targeted job discovery" },
      { title: "Document Import & Parsing", detail: "Supports existing resume uploads in PDF and DOCX formats with intelligent parsing for content extraction and enhancement" },
      { title: "Comprehensive Analytics Dashboard", detail: "Tracks resume performance metrics, improvement trends, success rates, and provides exportable reports for detailed analysis" },
      { title: "Keyword & Skills Optimization", detail: "Analyzes keyword density, validates section structure, identifies missing skills for target roles, and provides course recommendations based on skill gaps" }
    ],
    technical: "The application is built using Streamlit as the web framework with a modular Python architecture. The AI analysis engine integrates Google Gemini API for natural language processing and content quality assessment, generating performance scores from 0-100 with actionable optimization suggestions. The resume parsing module handles document import using PDF and DOCX libraries, while the builder generates professional documents with customizable templates. Job search functionality implements web scraping with Selenium ChromeDriver for LinkedIn integration and multi-portal aggregation. A SQLite database manages user data, resume versions, and analytics metrics through a lightweight ORM layer. The system employs ATS optimization algorithms that analyze keyword density, validate formatting compatibility, and check section structure against industry standards to maximize applicant tracking system parse rates.",
    links: [
      { text: "GitHub Repository", url: "https://github.com/Smokeybear10/SmartCV", type: "github" },
      { text: "Live Demo", url: "#", type: "demo", error: "Website is currently down" },
      { text: "Documentation", url: "#", type: "docs", error: "Website is currently down" }
    ],
    gallery: ["Images/ProjectPhotos/SmartCV.png"]
  }
};

// Global variables
let currentRotation = 0;
let isDragging = false;
let startX = 0;
let velocity = 0.3;
let isModalOpen = false;
let isHovering = false; // Track if hovering over a card
let autoRotationSpeed = 0.3;

// Initialize projects functionality
function initProjects() {
  console.log('PROJECTS JS: Starting projects initialization...');
  
  // Force show projects content
  const projectsContent = document.getElementById('projects-content');
  if (projectsContent) {
    console.log('PROJECTS JS: Found projects content, forcing visibility...');
    projectsContent.style.display = 'block';
    projectsContent.style.opacity = '1';
    projectsContent.style.visibility = 'visible';
    projectsContent.style.pointerEvents = 'auto';
    projectsContent.style.zIndex = '1000';
  } else {
    console.error('PROJECTS JS: Projects content not found!');
  }
  
  // Wait a bit then setup functionality
  setTimeout(() => {
    console.log('PROJECTS JS: Setting up wheel and modals...');
    
    // Setup wheel rotation
    setupWheelRotation();
    
    // Setup project modals
    setupProjectModals();
    
    console.log('PROJECTS JS: Projects functionality initialized successfully');
  }, 100);
}

// Setup wheel rotation
function setupWheelRotation() {
  const wheelContainer = document.querySelector('.wheel-container');
  if (!wheelContainer) {
    console.error('Wheel container not found');
    return;
  }
  
  console.log('Setting up wheel rotation...');
  
  // Auto rotation with hover slowdown
  function autoRotate() {
    let targetSpeed = autoRotationSpeed;
    if (isModalOpen) {
      targetSpeed = 0; // Stop completely when modal is open
    } else if (isHovering) {
      targetSpeed = autoRotationSpeed * 0.1; // Slow down significantly when hovering
    }
    
    if (!isDragging) {
      // Smoothly transition velocity towards target speed
      if (Math.abs(velocity - targetSpeed) > 0.01) {
        velocity += (targetSpeed - velocity) * 0.1; // Smooth transition
      } else {
        velocity = targetSpeed;
      }
      currentRotation += velocity;
      wheelContainer.style.transform = `rotateX(-22deg) rotateY(${currentRotation}deg)`;
    }
    requestAnimationFrame(autoRotate);
  }
  autoRotate();
  
  // Mouse drag events
  wheelContainer.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  
  // Touch drag events
  wheelContainer.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', endDrag);
  
  function startDrag(e) {
    isDragging = true;
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    velocity = 0;
    e.preventDefault();
  }
  
  function drag(e) {
    if (!isDragging) return;
    
    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - startX;
    
    currentRotation += deltaX * 0.5;
    wheelContainer.style.transform = `rotateX(-22deg) rotateY(${currentRotation}deg)`;
    
    startX = currentX;
    e.preventDefault();
  }
  
  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    velocity = autoRotationSpeed; // Resume auto rotation
  }
}

// Setup project modals
function setupProjectModals() {
  const projectCards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('projectModal');
  const backBtn = document.getElementById('backBtn');
  const closeBtn = document.getElementById('closeBtn');
  
  if (!modal) {
    console.error('Modal elements not found');
    return;
  }
  
  console.log('Setting up project modals for', projectCards.length, 'cards');
  
  // Add click handlers to project cards
  projectCards.forEach((card, index) => {
    const projectId = card.dataset.project;
    console.log(`Setting up card ${index}: ${projectId}`);
    
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Card clicked:', projectId);
      
      const project = projectData[projectId];
      if (!project) {
        console.error('Project data not found:', projectId);
        return;
      }
      
      // Populate modal content
      populateModalContent(project);
      
      // Show modal
      isModalOpen = true;
      modal.style.display = 'block';
      
      // Hide all navigation elements
      hideAllNavigation();
      
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
    });
    
    // Add hover listeners to control wheel speed
    card.addEventListener('mouseenter', () => {
      isHovering = true;
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
    });
    
    // Force pointer events
    card.style.pointerEvents = 'auto';
    card.style.cursor = 'pointer';
  });
  
  // Close modal handlers
  if (backBtn) {
    backBtn.addEventListener('click', closeModal);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
  });
  
  function closeModal() {
    isModalOpen = false;
    modal.classList.remove('show');
    
    // Show all navigation elements again
    showAllNavigation();
    
    setTimeout(() => {
      modal.style.display = 'none';
    }, 500);
  }
}

// Populate modal with project content
function populateModalContent(project) {
  // Set hero image and title
  const heroImage = document.getElementById('projectHeroImage');
  const title = document.getElementById('projectTitle');
  const techStack = document.getElementById('projectTechStack');
  const description = document.getElementById('projectDescription');
  const features = document.getElementById('projectFeatures');
  const technical = document.getElementById('projectTechnical');
  const links = document.getElementById('projectLinks');
  const gallery = document.getElementById('projectGallery');
  
  // Hero section
  if (heroImage && project.image) {
    heroImage.src = project.image;
    heroImage.alt = project.title;
  }
  
  if (title) {
    title.textContent = project.title;
  }
  
  // Tech stack badges
  if (techStack && project.tech) {
    techStack.innerHTML = project.tech.map(tech => 
      `<span class="tech-badge">${tech}</span>`
    ).join('');
  }
  
  // Description
  if (description) {
    description.textContent = project.description;
  }
  
  // Features list - handle both string and object formats
  if (features && project.features) {
    features.innerHTML = project.features.map((feature, index) => {
      if (typeof feature === 'object' && feature.title && feature.detail) {
        return `<li class="collapsible-feature">
          <div class="feature-title collapsed" data-index="${index}">${feature.title}</div>
          <div class="feature-detail">${feature.detail}</div>
        </li>`;
      } else {
        return `<li>${feature}</li>`;
      }
    }).join('');

    // Add click handlers for collapsible features
    document.querySelectorAll('.feature-title').forEach(title => {
      title.addEventListener('click', function() {
        const detail = this.nextElementSibling;
        this.classList.toggle('collapsed');
        detail.classList.toggle('expanded');
      });
    });
  }
  
  // Technical details
  if (technical && project.technical) {
    technical.textContent = project.technical;
  }

  // Links
  if (links && project.links) {
    links.innerHTML = project.links.map(link => {
      const icon = getLinkIcon(link.type);
      if (link.error) {
        return `<span class="project-link disabled" title="${link.error}">${icon} ${link.text} <span class="error-indicator">⚠️</span></span>`;
      } else {
        return `<a href="${link.url}" class="project-link" target="_blank">${icon} ${link.text}</a>`;
      }
    }).join('');
  }
  
  // Gallery
  if (gallery && project.gallery) {
    gallery.innerHTML = project.gallery.map(image =>
      `<div class="gallery-image">
        <img src="${image}" alt="Project gallery image" />
      </div>`
    ).join('');

    // Add click handlers for lightbox
    document.querySelectorAll('.gallery-image').forEach(galleryItem => {
      galleryItem.addEventListener('click', function() {
        const img = this.querySelector('img');
        openLightbox(img.src);
      });
    });
  }
}

// Lightbox functionality
function openLightbox(imageSrc) {
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImage = document.getElementById('lightboxImage');

  if (lightbox && lightboxImage) {
    lightboxImage.src = imageSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('imageLightbox');

  if (lightbox) {
    // Add closing animation
    lightbox.classList.add('closing');

    // Wait for animation to complete before hiding
    setTimeout(() => {
      lightbox.classList.remove('active');
      lightbox.classList.remove('closing');
      document.body.style.overflow = '';
    }, 300); // Match animation duration
  }
}

// Initialize lightbox close handlers
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('imageLightbox');

  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target === this) {
        closeLightbox();
      }
    });
  }

  // Close lightbox with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });
});

// Get appropriate icon for link type
function getLinkIcon(type) {
  const icons = {
    github: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    docs: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>',
    demo: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>',
    live: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" /></svg>',
    video: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" /></svg>',
    app: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.1 5.9,23 7,23H17C18.1,23 19,22.1 19,21V3C19,1.89 18.1,1 17,1Z" /></svg>',
    design: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z" /></svg>',
    data: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z" /></svg>'
  };
  return icons[type] || icons.docs;
}

// Cleanup function
function cleanupProjects() {
  console.log('Cleaning up projects functionality');
  isModalOpen = false;
  isDragging = false;
  velocity = 0;
}

// Global navigation control functions
function hideAllNavigation() {
  console.log('Hiding all navigation elements');
  const navigationSelectors = [
    '.bottom-nav',
    '.mobile-menu-btn', 
    '.nav-buttons',
    '.hello-nav-btn',
    '.nav-btn',
    '.nav-link',
    '.spa-nav-btn',
    '.nav-close-btn'
  ];
  
  navigationSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      element.style.opacity = '0';
    });
  });
}

function showAllNavigation() {
  console.log('Showing all navigation elements');
  const navigationElements = [
    { selector: '.bottom-nav', display: 'flex' },
    { selector: '.mobile-menu-btn', display: 'flex' }, 
    { selector: '.nav-buttons', display: 'block' },
    { selector: '.hello-nav-btn', display: 'inline-block' },
    { selector: '.nav-btn', display: 'block' },
    { selector: '.nav-link', display: 'block' },
    { selector: '.spa-nav-btn', display: 'block' },
    { selector: '.nav-close-btn', display: 'block' }
  ];
  
  navigationElements.forEach(nav => {
    const elements = document.querySelectorAll(nav.selector);
    elements.forEach(element => {
      element.style.display = nav.display;
      element.style.visibility = 'visible';
      element.style.opacity = '1';
    });
  });
}

// Export for SPA system
window.projectsRouteNew = {
  init: initProjects,
  cleanup: cleanupProjects
};

// Export navigation functions globally
window.hideAllNavigation = hideAllNavigation;
window.showAllNavigation = showAllNavigation;