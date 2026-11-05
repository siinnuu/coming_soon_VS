# VISUALWOXX — Coming Soon Landing Page

> **"Visual That Speaks Louder."**

A premium, visually striking Coming Soon landing page for **VisualWoxx**, a creative media and design agency. Crafted with bold typography, deep obsidian surfaces, electric magenta lighting, interactive 3D WebGL floating objects, and minimal editorial layouts.

---

## 🎨 Brand Identity

- **Brand Name:** VISUALWOXX
- **Tagline:** Visual That Speaks Louder.
- **Primary Typeface:** [Clash Display](https://www.fontshare.com/fonts/clash-display) (loaded via Fontshare CDN with high-end modern fallbacks)
- **Palette:**
  - Pure Black (`#000000`)
  - Electric Magenta (`#EA00FF`)
  - Primary Text: Pure White (`#FFFFFF`)
  - Secondary Text: Soft Grey (`#A0A0A0`)
  - Ambient Glows: Deep Purple to Electric Magenta gradients

---

## 🚀 Key Features

1. **Centralized Brand Identity & Logo**
   - Centralized top header displaying the transparent 3D VisualWoxx mark (`assets/logo.png`) paired with bold Clash Display typography: `VISUALWOXX — CREATIVE STUDIO`.
   - Subtle magenta hover glow and 3D tilt interaction.

2. **Full-Viewport Minimal Hero Composition**
   - Designed to fit `100dvh` seamlessly on desktop with zero unnecessary scrollbars.
   - Clean, minimal editorial layout focusing on the main statement:
     - Kicker: `"WE'RE BUILDING SOMETHING DIFFERENT."`
     - Headline: `"THE CREATIVE WORLD IS ABOUT TO GET LOUDER."`
     - Sub-tagline: `"COMING SOON. STAY CREATIVE."`

3. **Floating 3D & Abstract Elements**
   - **Three.js WebGL Engine:** Dynamic floating glossy meshes (Torus Knot, Obsidian Chrome Icosahedron with wireframe aura, Thin Torus Ring, Octahedron with magenta core) with real-time studio lighting and specular highlights.
   - **Interactive Mouse Parallax:** Floating shapes track cursor movement with silky smooth lerp physics.
   - **Self-Contained Fallback:** Vector SVG 3D floating shapes and 2D canvas particle drift ensure the page renders instantly even in offline environments.

4. **Functional Subscription Form (Connected to visualwoxx@gmail.com)**
   - Strict RFC 5322 email regex validation.
   - Interactive states: default, active focus glow, loading spinner, error feedback, and animated success banner (`"YOU'RE ON THE LIST."`).
   - **Automatic Email Forwarding:** Every new subscriber's email is forwarded straight to `visualwoxx@gmail.com` via FormSubmit AJAX.
   - **Local Storage Backup:** All submissions are also saved in `localStorage` (`visualwoxx_subscribers`) as a reliable fallback.
   - **Developer Console Inspection:** Run `getVisualWoxxSubscribers()` in your browser developer console to view all registered emails in a structured table.
   - "Subscribe another email" link allows testing multiple submissions without page reload.

5. **Social Media Section**
   - Minimal monochrome icons transitioning into glowing electric magenta on hover:
     - **Instagram:** [instagram.com/visualwoxx](https://www.instagram.com/visualwoxx)
     - **LinkedIn:** [linkedin.com/company/visualwoxx](https://www.linkedin.com/company/visualwoxx)

---

## 📂 Project Structure

```
VisualWoxxCS/
├── index.html          # Semantic HTML5 markup, meta tags, SVG assets, accessibility
├── assets/
│   ├── logo.png        # Transparent 3D VisualWoxx brand mark
│   └── visualwoxx-logo-trans.png
├── css/
│   └── styles.css      # Design tokens, glassmorphism, responsive clamp(), animations
├── js/
│   ├── main.js         # Validation, visualwoxx@gmail.com forwarding, parallax
│   └── three-scene.js  # 3D WebGL floating shapes, lighting, and 2D fallback
└── README.md           # Documentation & production guide
```

---

## 💻 How to Run Locally

You can open `index.html` directly in any web browser, or serve it using any local static server:

```bash
# Using Node.js
npx serve .

# Using Python
python -m http.server 3000
```
