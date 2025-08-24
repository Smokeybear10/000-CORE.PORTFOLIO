// COMPLETELY REWRITTEN SPA PROJECTS JAVASCRIPT

// Project data
const projectData = {
  verilog: {
    title: "Verilog-Based ALU for 16-bit RISC-V Processor",
    description: "Designed and implemented a comprehensive Arithmetic Logic Unit (ALU) in Verilog for a 16-bit RISC-V processor architecture. The project involved creating modular components for arithmetic operations, logical operations, and control logic while ensuring optimal timing and resource utilization.",
    tech: ["Verilog", "RISC-V", "Digital Design", "FPGA", "ModelSim", "Quartus"],
    image: "Images/ProjectPhotos/Verilog.png"
  },
  flywheel: {
    title: "Magnetically Levitating Flywheel Generator", 
    description: "Developed an innovative energy storage system using magnetic levitation technology to reduce friction losses in flywheel energy storage. The project integrated electromagnetic controls, power electronics, and real-time monitoring systems to achieve stable levitation and energy conversion.",
    tech: ["Electromagnetic Design", "Power Electronics", "Control Systems", "MATLAB/Simulink", "PCB Design", "Embedded Systems"],
    image: "Images/ProjectPhotos/MagneticallyLevitating.png"
  },
  foosball: {
    title: "SmartTable System for Competitive Foosball",
    description: "Created an intelligent foosball table system with real-time score tracking, game analytics, and competitive features. The system uses computer vision for ball tracking, embedded sensors for goal detection, and a web interface for tournament management and player statistics.",
    tech: ["Computer Vision", "OpenCV", "Raspberry Pi", "Node.js", "React", "WebSocket", "3D Printing"],
    image: "Images/ProjectPhotos/SmartTable.png"
  },
  website: {
    title: "Portfolio Website with Interactive Design",
    description: "Designed and developed this interactive portfolio website featuring custom 3D animations, responsive design, and dynamic content. The site showcases modern web technologies while maintaining optimal performance and accessibility across all devices.",
    tech: ["HTML5", "CSS3", "JavaScript", "GSAP", "Three.js", "Responsive Design", "Web Performance"]
  },
  poker: {
    title: "Bayesian Poker Analysis Engine",
    description: "Implemented a sophisticated Bayesian inference system for analyzing poker gameplay and opponent behavior patterns. The engine uses probabilistic models to estimate bluffing tendencies, betting patterns, and optimal decision-making strategies across multi-street poker scenarios.",
    tech: ["Python", "Bayesian Inference", "Statistical Modeling", "Game Theory", "Data Analysis", "Machine Learning"],
    image: "Images/ProjectPhotos/ThreeVariable.png"
  },
  spikeball: {
    title: "Spike Sure Rim Detection for Spikeball",
    description: "Developed an automated rim detection system for competitive Spikeball using computer vision and machine learning. The system provides real-time analysis of ball-rim interactions to assist with officiating and player training, improving game accuracy and fairness.",
    tech: ["Computer Vision", "Machine Learning", "OpenCV", "Python", "Real-time Processing", "Sports Analytics"],
    image: "Images/ProjectPhotos/IMG_8763 [MacMini] [2025-07-24] [11.57.19 AM].JPG"
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
  const modalContent = document.getElementById('modalContent');
  const closeBtn = modal?.querySelector('.close');
  
  if (!modal || !modalContent) {
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
      
      // Create modal content
      modalContent.innerHTML = `
        <h2 style="color: #44ffff; font-family: 'Inter', sans-serif; margin-bottom: 1rem;">${project.title}</h2>
        ${project.image ? `<img src="${project.image}" alt="${project.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
        <p style="color: #ffffff; font-family: 'Inter', sans-serif; line-height: 1.6; margin-bottom: 1rem;">${project.description}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
          ${project.tech.map(tech => `<span style="background: rgba(255, 0, 255, 0.2); color: #ffffff; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; border: 1px solid rgba(255, 0, 255, 0.5);">${tech}</span>`).join('')}
        </div>
      `;
      
      // Show modal
      isModalOpen = true;
      modal.style.display = 'block';
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
    setTimeout(() => {
      modal.style.display = 'none';
    }, 400);
  }
}

// Cleanup function
function cleanupProjects() {
  console.log('Cleaning up projects functionality');
  isModalOpen = false;
  isDragging = false;
  velocity = 0;
}

// Export for SPA system
window.projectsRouteNew = {
  init: initProjects,
  cleanup: cleanupProjects
};