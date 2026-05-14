# THOMAS | Personal Portfolio

**Live demo: [thomasou.com](https://thomasou.com)**

A single-page portfolio site with custom SPA routing, interactive 3D models, and scroll-driven animations. No frameworks — vanilla JavaScript, Three.js, and CSS.

![Portfolio Demo](Images/ProjectPhotos/THOMAS.gif)

![Portfolio Demo 2](Images/ProjectPhotos/THOMAS2.gif)

## Quick Start

```bash
# no build step — just serve the files
npx serve . -l 2000
```

Open `http://localhost:2000`.

## What It Does

Five routes handled by a custom hash-based SPA router with animated transitions, per-route cleanup, and lazy asset loading.

**Home**
- Typing animation with name and title
- Interactive 3D cube built in Three.js with drag controls and momentum physics
- Hovering nav links swaps the displayed 3D animal model in real-time

**About**
- Bio section with expandable tools/skills dropdown
- Languages, frameworks, databases organized by category

**Experience**
- Dual-panel layout: left side shows rotating 3D animal heads that swap based on which section is scrolled into view
- Education timeline, professional experience cards, and research cards
- Scroll-driven section focus dimming — only the active section is bright

**Projects**
- Rotating wheel carousel for featured projects
- Full-screen modal with image gallery, tech stack, and links

**Contact**
- Email, LinkedIn, GitHub links with SVG icons and Three.js background

## Tech Stack

| Layer | Tools |
|---|---|
| Language | Vanilla JavaScript, HTML5, CSS3 |
| 3D | Three.js, Google Model-Viewer (GLB) |
| Animation | GSAP 3 |
| Routing | Custom SPA router (hash-based) |
| Hosting | Netlify |
| Testing | Node.js + jsdom |

## Project Structure

```
index.html                  # Single entry point — all 5 routes defined here
style.css                   # Global base styles
js/
  spa-router.js             # Core SPA routing class
  spa-init.js               # Route registration and lifecycle hooks
  spa-projects-new.js       # Project data, carousel, and modal logic
  3d-cube.js                # Three.js cube with drag physics
  dynamic-models.js         # GLB model loading/unloading
  navigation.js             # Nav hover model switching
  experience.js             # Experience page scroll logic
  contact.js                # Contact page with Three.js background
  about.js                  # About page helpers
styles/
  index.css                 # Home page
  about.css                 # About page
  experience.css            # Experience page + timeline
  projects-new.css          # Project carousel + modal
  contact.css               # Contact page
  spa.css                   # Route transition animations
  bg-effects.css            # Aurora blobs, noise, vignette
Models/                     # 14 GLB 3D models (~30MB)
Images/
  ProjectPhotos/            # Project gallery images and GIFs
  Icons/                    # Tech stack icons
Assets/
  Resume.pdf
tests/                      # SPA routing and cleanup tests
```

## How the Router Works

Each route registers an `onEnter` and `onExit` callback. On navigation, the router fades out the current content, swaps the visible `[data-route-content]` div, runs the new route's initialization (3D model loading, scroll listeners, animations), and fades in. On exit, it tears down event listeners and disposes Three.js resources to prevent memory leaks across route changes.

---

Built by Thomas Ou
