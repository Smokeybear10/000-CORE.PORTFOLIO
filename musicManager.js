// Global Music Manager for Portfolio Site
// Handles persistent music playback across page navigation

class MusicManager {
  constructor() {
    this.audioElement = null;
    this.isPlaying = false;
    this.currentTrack = 'Assets/Resonance.mp3'; // Default track
    this.volume = 0.5;
    this.currentTime = 25; // Default start time
    this.storageKey = 'portfolioMusicState';
    
    // Track-specific settings
    this.trackSettings = {
      'Assets/Emotions.mp3': { volume: 0.2, startTime: 0 },
      'Assets/Resonance.mp3': { volume: 0.5, startTime: 25 }
    };
    
    this.init();
  }
  
  init() {
    // Find audio element on the page
    this.audioElement = document.getElementById('backgroundMusic');
    if (!this.audioElement) {
      console.warn('No background music element found');
      return;
    }
    
    // Load saved state from sessionStorage
    this.loadMusicState();
    
    // Set up audio element
    this.setupAudioElement();
    
    // Set up navigation listeners to save state before page change
    this.setupNavigationListeners();
    
    // Auto-start music if it was playing
    if (this.isPlaying) {
      this.playMusic();
    }
    
    // Save state periodically
    this.startStateSaving();
  }
  
  setupAudioElement() {
    if (!this.audioElement) return;
    
    // Apply current settings
    this.audioElement.volume = this.volume;
    this.audioElement.currentTime = this.currentTime;
    this.audioElement.loop = true;
    
    // Update track if different from current source
    const currentSrc = this.audioElement.querySelector('source')?.src || '';
    if (!currentSrc.includes(this.currentTrack.split('/').pop())) {
      const source = this.audioElement.querySelector('source');
      if (source) {
        source.src = this.currentTrack;
        this.audioElement.load();
        this.audioElement.currentTime = this.currentTime;
      }
    }
  }
  
  loadMusicState() {
    try {
      const savedState = sessionStorage.getItem(this.storageKey);
      if (savedState) {
        const state = JSON.parse(savedState);
        this.isPlaying = state.isPlaying || false;
        this.currentTrack = state.currentTrack || this.currentTrack;
        this.volume = state.volume || this.volume;
        this.currentTime = state.currentTime || this.currentTime;
        
        console.log('Loaded music state:', state);
      }
    } catch (error) {
      console.warn('Failed to load music state:', error);
    }
  }
  
  saveMusicState() {
    if (!this.audioElement) return;
    
    try {
      const state = {
        isPlaying: this.isPlaying,
        currentTrack: this.currentTrack,
        volume: this.audioElement.volume,
        currentTime: this.audioElement.currentTime,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save music state:', error);
    }
  }
  
  playMusic() {
    if (!this.audioElement) return;
    
    this.audioElement.play()
      .then(() => {
        this.isPlaying = true;
        this.updateMuteIcon(true);
        console.log('Music started successfully');
      })
      .catch(error => {
        console.log('Music play failed:', error);
        this.isPlaying = false;
        this.updateMuteIcon(false);
      });
  }
  
  pauseMusic() {
    if (!this.audioElement) return;
    
    this.audioElement.pause();
    this.isPlaying = false;
    this.updateMuteIcon(false);
  }
  
  toggleMusic() {
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
    this.saveMusicState();
  }
  
  switchTrack(trackPath, options = {}) {
    if (!this.audioElement) return;
    
    const wasPlaying = this.isPlaying;
    
    // Save current state
    this.saveMusicState();
    
    // Update track
    this.currentTrack = trackPath;
    
    // Apply track-specific settings
    const trackConfig = this.trackSettings[trackPath] || {};
    this.volume = options.volume || trackConfig.volume || 0.5;
    this.currentTime = options.startTime || trackConfig.startTime || 0;
    
    // Update audio element
    const source = this.audioElement.querySelector('source');
    if (source) {
      source.src = trackPath;
      this.audioElement.load();
      this.audioElement.volume = this.volume;
      this.audioElement.currentTime = this.currentTime;
      
      // Resume playing if it was playing before
      if (wasPlaying) {
        this.playMusic();
      }
    }
  }
  
  updateMuteIcon(isPlaying) {
    const muteIcon = document.getElementById('muteIcon');
    if (!muteIcon) return;
    
    const mutedIcon = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    const playingIcon = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
    
    muteIcon.innerHTML = isPlaying ? playingIcon : mutedIcon;
  }
  
  setupNavigationListeners() {
    // Listen for navigation clicks to save state before page change
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('.nav-link');
      if (navLink && !navLink.classList.contains('active')) {
        // Save state before navigation
        this.saveMusicState();
      }
    });
    
    // Save state before page unload
    window.addEventListener('beforeunload', () => {
      this.saveMusicState();
    });
    
    // Save state on visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      this.saveMusicState();
    });
  }
  
  startStateSaving() {
    // Save state every 5 seconds while playing
    setInterval(() => {
      if (this.isPlaying) {
        this.saveMusicState();
      }
    }, 5000);
  }
  
  // Method to start music on user interaction (for autoplay policy compliance)
  tryAutoStart() {
    if (this.isPlaying && this.audioElement) {
      this.playMusic();
    }
  }
  
  // Method to handle page-specific track switching
  setPageTrack(pageName) {
    const trackMap = {
      'index': 'Assets/Emotions.mp3',
      'home': 'Assets/Emotions.mp3',
      'about': 'Assets/Resonance.mp3',
      'experience': 'Assets/Resonance.mp3',
      'projects': 'Assets/Resonance.mp3',
      'contact': 'Assets/Resonance.mp3'
    };
    
    const targetTrack = trackMap[pageName.toLowerCase()] || 'Assets/Resonance.mp3';
    
    // Only switch if different from current track
    if (this.currentTrack !== targetTrack) {
      this.switchTrack(targetTrack);
    }
    
    // Set up index page hover music functionality
    if (pageName.toLowerCase() === 'index' || pageName.toLowerCase() === 'home') {
      this.setupIndexPageHoverMusic();
    }
  }
  
  // Special hover music functionality for index page
  setupIndexPageHoverMusic() {
    const hoverMusic = document.getElementById('hoverMusic');
    if (!hoverMusic) return;
    
    let isHovering = false;
    let currentFadeInterval = null;
    
    // Set up hover music
    hoverMusic.volume = 0;
    hoverMusic.currentTime = 25;
    hoverMusic.loop = true;
    
    const fadeToHover = () => {
      if (!this.isPlaying || isHovering) return;
      
      if (currentFadeInterval) {
        clearInterval(currentFadeInterval);
        currentFadeInterval = null;
      }
      
      isHovering = true;
      
      if (hoverMusic.paused) {
        hoverMusic.play().catch(e => console.log('Hover music play failed:', e));
      }
      
      currentFadeInterval = setInterval(() => {
        if (this.audioElement.volume > 0) {
          this.audioElement.volume = Math.max(0, this.audioElement.volume - 0.05);
        }
        if (hoverMusic.volume < 0.5) {
          hoverMusic.volume = Math.min(0.5, hoverMusic.volume + 0.05);
        }
        
        if (this.audioElement.volume <= 0 && hoverMusic.volume >= 0.5) {
          clearInterval(currentFadeInterval);
          currentFadeInterval = null;
        }
      }, 50);
    };
    
    const fadeToBackground = () => {
      if (!this.isPlaying || !isHovering) return;
      
      if (currentFadeInterval) {
        clearInterval(currentFadeInterval);
        currentFadeInterval = null;
      }
      
      isHovering = false;
      
      currentFadeInterval = setInterval(() => {
        if (hoverMusic.volume > 0) {
          hoverMusic.volume = Math.max(0, hoverMusic.volume - 0.05);
        }
        if (this.audioElement.volume < 0.2) {
          this.audioElement.volume = Math.min(0.2, this.audioElement.volume + 0.05);
        }
        
        if (hoverMusic.volume <= 0 && this.audioElement.volume >= 0.2) {
          clearInterval(currentFadeInterval);
          currentFadeInterval = null;
          hoverMusic.pause();
        }
      }, 50);
    };
    
    // Add hover listeners to navigation area
    const navContainer = document.querySelector('.bottom-nav');
    if (navContainer) {
      navContainer.addEventListener('mouseenter', fadeToHover);
      navContainer.addEventListener('mouseleave', fadeToBackground);
    }
  }
}

// Global music manager instance
let musicManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  musicManager = new MusicManager();
  
  // Set up mute button click handler
  const muteContainer = document.getElementById('muteContainer');
  if (muteContainer) {
    muteContainer.addEventListener('click', () => {
      musicManager.toggleMusic();
    });
  }
  
  // Try auto-start on any user interaction
  const enableMusicOnInteraction = () => {
    musicManager.tryAutoStart();
    // Remove listeners after first successful start
    document.removeEventListener('click', enableMusicOnInteraction);
    document.removeEventListener('keydown', enableMusicOnInteraction);
    document.removeEventListener('touchstart', enableMusicOnInteraction);
  };

  document.addEventListener('click', enableMusicOnInteraction);
  document.addEventListener('keydown', enableMusicOnInteraction);
  document.addEventListener('touchstart', enableMusicOnInteraction);
  
  // Determine current page and set appropriate track
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  musicManager.setPageTrack(currentPage);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicManager;
}
