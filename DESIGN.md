---
name: Edudojo.ai Design System
description: The official design system for Edudojo.ai, balancing traditional academic authority (The Digital Sensei) with modern high-end editorial clarity and AI-driven innovation.
version: 1.0.0

# Base design tokens mapped to the Google design.md specification
modes:
  light:
    colors:
      background:
        primary: "#f3fcf9"           # "Wet" or "fluid" canvas white background
        canvas: "#FFFFFF"            # Secondary crisp background
      text:
        primary: "#0F172A"           # Pedagogical Navy: Deep, academic ink
        muted: "#475569"             # Soft slate for subtext
      accent:
        primary: "#10B981"           # Algorithmic Mint: AI-driven growth
        accent-dark: "#065F46"       # Dark mint for high-contrast focus
        glass-border: "rgba(183, 234, 217, 0.3)" # Original brand mint translucent stroke
      elevation:
        shadow: "rgba(15, 23, 42, 0.05)"
        shadow-hover: "rgba(16, 185, 129, 0.12)"
  dark:
    colors:
      background:
        primary: "#1F2938"           # Slate Container: Deep, stable UI base
        canvas: "#111827"            # Extremely dark canvas
      text:
        primary: "#EDEDED"           # Institutional Ash: Premium contrast
        muted: "#9CA3AF"             # Soft grey for secondary text
      accent:
        primary: "#10B981"           # Algorithmic Mint: Maintained for brand parity
        accent-dark: "#059669"       # Muted mint
        glass-border: "rgba(255, 255, 255, 0.1)" # Soft frosted border
      elevation:
        shadow: "rgba(0, 0, 0, 0.2)"
        shadow-hover: "rgba(16, 185, 129, 0.15)"

# Shared typography system (The 3-Tier Hierarchy)
typography:
  families:
    branding: Lato
    ui: Rethink Sans
    editorial: Google Sans Flex
  
  # Google Sans Flex variable axis standards
  axes:
    GRAD: 25   # subtle ink-spread weight boost
    ROND: 25   # soft letterforms to reduce visual friction
    WDTH: 100  # standard width
  
  # Responsive Hierarchy & Weights
  hierarchy:
    display-lg:
      fontFamily: "{typography.families.editorial}"
      fontSize: 3.5rem
      fontWeight: 550
      lineHeight: "1.1"
      letterSpacing: "-0.02em"
    headline-lg:
      fontFamily: "{typography.families.editorial}"
      fontSize: 2.5rem
      fontWeight: 480
      lineHeight: "1.2"
    title-lg:
      fontFamily: "{typography.families.editorial}"
      fontSize: 2.0rem
      fontWeight: 480
      lineHeight: "1.3"
    body-lg:
      fontFamily: "{typography.families.editorial}"
      fontSize: 1.125rem
      fontWeight: 350 # Editorial Medium
      lineHeight: "1.6"
    body-md:
      fontFamily: "{typography.families.editorial}"
      fontSize: 1.0rem
      fontWeight: 350
      lineHeight: "1.6"
    ui-text:
      fontFamily: "{typography.families.ui}"
      fontSize: 1.0rem
      fontWeight: 200 # Refined UI weight
      lineHeight: "1.4"
    ui-text-bold:
      fontFamily: "{typography.families.ui}"
      fontSize: 1.0rem
      fontWeight: 400
      lineHeight: "1.4"
    wordmark:
      fontFamily: "{typography.families.branding}"
      fontSize: 1.25rem
      fontWeight: 700 # Structural Authority

# Spacing System
spacing:
  base: 8px
  scale:
    xs: 4px
    sm: 8px
    md: 16px
    lg: 24px
    xl: 32px
    xxl: 48px
    layout-lg: 88px  # 11 * 8px: Roomy gaps for premium editorial breathing
    layout-xl: 112px # 14 * 8px

# Border Radii
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  full: 9999px

# High-End Glassmorphism Utilities
components:
  liquid-glass:
    background-light: "rgba(255, 255, 255, 0.1)"
    background-dark: "rgba(255, 255, 255, 0.02)"
    blur: 24px
    border-light: "{modes.light.colors.accent.glass-border}"
    border-dark: "{modes.dark.colors.accent.glass-border}"
    shadow-light: "inset 0 2px 1px rgb(241, 251, 247)"
    shadow-dark: "inset 0 2px 1px rgba(255, 255, 255, 0.15)"
  
  liquid-glass-sm:
    background-light: "rgba(255, 255, 255, 0.03)"
    background-dark: "rgba(255, 255, 255, 0.01)"
    blur: 16px
    border-light: "{modes.light.colors.accent.glass-border}"
    border-dark: "{modes.dark.colors.accent.glass-border}"
    shadow-light: "inset 0 1px 0.5px rgb(241, 251, 247)"
    shadow-dark: "inset 0 1px 0.5px rgba(255, 255, 255, 0.1)"

  hover-card:
    transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.28s cubic-bezier(0.4, 0, 0.2, 1)"
    lift: "translateY(-2px) translateZ(0)"
    shadow-blur: "0 10px 30px"
---

# Edudojo.ai Design System Specification

Welcome to the **Edudojo.ai Design System**. This document defines the visual architecture, design tokens, and user experience paradigms that represent our brand's digital identity. It acts as the single source of truth for both developers and AI-driven coding agents, ensuring that all UI generated across pages, components, and interactive environments maintains institutional elegance, extreme visual clarity, and brand consistency.

---

## 1. Design Philosophy & Creative North Star: "The Digital Sensei"

In elite educational technology, authority and credibility are not projected through aggressive colors, heavy cards, or standard templates. Instead, we project confidence through **Quiet Academic Presence**, **Translucent Depth**, and **Generous Negative Space**. 

Our style is defined as **Editorial Glassmorphism**. We treat UI surfaces not as flat boards, but as stacked layers of premium, refractive glass floating over a rich, fluid backdrop. 

### Core Design Rules:
1. **The Asymmetry Rule:** We reject rigid, perfectly centered templates. Hero sections, navigation chips, and grids should leverage asymmetrical layouts—shifting content subtly to the left or right to feel like a high-end academic journal or modern editorial piece.
2. **The "No-Line" Rule:** Standard solid, high-opacity `1px` borders for dividing layouts are **strictly prohibited**. Visual boundaries must instead be achieved through:
   - **Tonal Shifts:** Transitioning smoothly between backgrounds (e.g., `#f3fcf9` to `#FFFFFF` on Light mode).
   - **High-Blur Separation:** Using generous shadows with up to `30px` blur.
   - **Ethereal Glass borders:** Using high-translucency accents (such as a 30% opacity brand mint border).
3. **The Power Gap:** We employ a non-standard typography system where bold, oversized displays are contrasted against dense, ultra-light editorial copy, letting text breathe using spacing scales like `88px` or `112px`.

---

## 2. Dual-Theme Color System

To support both **Light Mode** (Daytime learning focus) and **Dark Mode** (Deep coding and nighttime focus) seamlessly, we use semantic names that map to their respective visual roles.

### Light Mode (Daytime Focus)
- **Primary Background:** `#f3fcf9` — A custom, "wet" fluid mint white that acts as a soothing, glare-free canvas.
- **Surface Canvas:** `#FFFFFF` — Used for cards and elevated container backgrounds.
- **Pedagogical Navy:** `#0F172A` — Deep, academic midnight ink used for primary typography, wordmarks, and foundational structures.
- **Algorithmic Mint:** `#10B981` — Highly saturated emerald mint used exclusively for CTAs, success states, and the `.ai` wordmark extension.
- **Glass Border:** `rgba(183, 234, 217, 0.3)` — Ultra-soft mint border to outline translucent containers without adding visual noise.

### Dark Mode (Nighttime Deep Work)
- **Primary Background:** `#1F2938` — Slate Container: A calm, mid-depth charcoal slate that prevents high-contrast eye strain.
- **Surface Canvas:** `#111827` — Deep charcoal grey used for primary panels and containers.
- **Institutional Ash:** `#EDEDED` — Premium warm off-white that replaces Pedagogical Navy for typography, ensuring perfect WCAG accessibility.
- **Algorithmic Mint:** `#10B981` — Maintained identically across both themes to retain immediate brand recognition.
- **Glass Border:** `rgba(255, 255, 255, 0.1)` — Soft white frosted stroke for dark containers.

### Safety & Validation Accents (Red Team Protocol)
For safety and security pages, active error warnings, and adversarial audit simulations (such as `/platform/red-team`), we utilize a dedicated high-fidelity crimson palette:
- **Red Team Crimson (Light Mode):** `#DC2626` (Red-600) / `#B91C1C` (Red-700). Applied over desaturated glowing background layers (`bg-red-500/[0.08]` to `bg-red-600/[0.03]`) and outlined with thin borders (`border-red-500/35`). Highlighting text utilizes a high-contrast crimson (`text-red-700`) with matching glass badges (`bg-red-500/[0.05]`) for premium aesthetic restraint.
- **Red Team Coral (Dark Mode):** `#F87171` (Red-400) / `#EF4444` (Red-500). Replaces light mode crimson to ensure strict WCAG compliance and high-contrast glowing elements (`dark:text-red-400` and `dark:text-red-500`) over dark canvas panels (`bg-white/[0.02]` or dark gradient combinations).

---

## 3. The 3-Tier Typography System

Edudojo utilizes a three-tier typography hierarchy to establish authority and reading comfort.

| Tier | Font Family | Usage Context | Aesthetic Role | Implementation Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Tier I: Branding** | **Lato** | Wordmarks, Logo Marks, Core Identity | Structural Authority | Use Lato Bold for "Edudojo" and Lato Medium for the ".ai" suffix. |
| **Tier II: UI Framework** | **Rethink Sans** | Navbar, Footer, Navigation Controls, Dashboard Labels | Modern Professionalism | Use ultra-light weights (`200` to `400`) to keep navigation refined. |
| **Tier III: Pedagogical** | **Google Sans Flex** | Hero Headlines, Section Titles, Body Copy, Articles | Adaptive Clarity | Variable font fine-tuned with exact axes for high density. |

### Variable Font Axes (Tier III - Google Sans Flex)
To achieve the premium "editorial" look, you **MUST** configure the variable axes exactly as follows:
- **GRAD (Grade):** `25` — subtle ink-spread weight boost that improves high-density reading contrast.
- **ROND (Rounded):** `25` — softens character corners slightly to minimize visual fatigue.
- **WDTH (Width):** `100` — standard proportional letter width.

### Weight Scale Hierarchy
To maintain consistent visual weight and accessibility across different canvases (due to the "halation effect" where light text on a dark background appears thicker than dark text on a light background), the system employs dynamic weight-scale profiles:

| Context | Light Mode Weight (Dynamic Boost) | Dark Mode Weight (Standard Specs) | Aesthetic/Readability Rationale |
| :--- | :--- | :--- | :--- |
| **Hero Title** | `600` | `550` | Maximum structural headline impact |
| **Global Headings & Bold** | `580` | `480` | High-contrast, clear anchor weights |
| **Main Content / Articles** | `390` | `350` | Comfort and long-duration legibility |
| **Home Page Content & Paragraphs**| `360` | `240` | Breezy, elegant editorial narrative |
| **UI Framework Controls** | `200` base, `400` bold | `200` base, `400` bold | Refined, thin navbar and badge widgets |


---

## 4. Spacing & Rhythm

All spacing values are multiples of the standard `8px` base unit, ensuring mathematical rhythm.
- **Micro-interactions (Chips, Steppers):** `4px` to `8px` (`spacing.xs` to `spacing.sm`).
- **Component Internal Padding:** `16px` to `24px` (`spacing.md` to `spacing.lg`).
- **Standard Card Margins:** `32px` (`spacing.xl`).
- **Oversized Layout Gaps:** `88px` (`layout-lg`) and `112px` (`layout-xl`). Large, empty margins are the secret to Edudojo's premium, airy layout.

---

## 5. UI Elements & Premium Utilities

### Liquid Glass Containers (`.liquid-glass`)
Used for primary page wrappers, large hero containers, and main cards. It simulates frosted, highly-refractive glass.

```css
.liquid-glass {
  /* Dynamic Backgrounds based on theme */
  background-color: rgba(255, 255, 255, 0.1); 
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  
  /* Semi-transparent mint stroke for light mode, soft white for dark */
  border: 1px solid rgba(183, 234, 217, 0.3);
  
  /* Double shadow formula: subtle outer ambient shadow + sharp inner highlight */
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.1),
    inset 0 2px 1px rgb(241, 251, 247);
}

/* Dark Mode Override */
.dark .liquid-glass {
  background-color: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.2),
    inset 0 2px 1px rgba(255, 255, 255, 0.15);
}
```

### UI Sub-Elements (`.liquid-glass-sm`)
Used for nested chips, small navigation bars, badge tags, and icons.

```css
.liquid-glass-sm {
  background-color: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(183, 234, 217, 0.3);
  box-shadow: 
    0 4px 20px -5px rgba(0, 0, 0, 0.05),
    inset 0 1px 0.5px rgb(241, 251, 247);
}

/* Dark Mode Override */
.dark .liquid-glass-sm {
  background-color: rgba(255, 255, 255, 0.01);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 20px -5px rgba(0, 0, 0, 0.1),
    inset 0 1px 0.5px rgba(255, 255, 255, 0.1);
}
```

### Transparent Readability Blur Shield (`backdrop-blur-[3px]`)
When overlaying heavy editorial typography directly on top of active, moving background canvases (such as the `FluidConstructionBackground`), colored background boxes or gradient vignettes will cause visible color banding and boxy cloud artifacts on dark screens due to GPU layer-blending limits. 

To solve this, we employ a **100% transparent backdrop-blur container**:
* **Aesthetic Role:** Defocuses and softens background particles as they drift behind text, maintaining absolute typography legibility without any color boundaries or smudges.
* **Implementation:** Apply `absolute pointer-events-none -z-10 -inset-6 backdrop-blur-[3px] rounded-3xl` on a container with no background color.

```css
.readability-shield {
  position: absolute;
  pointer-events: none;
  z-index: -10;
  inset: -24px; /* Expand slightly beyond text margins */
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  border-radius: 24px; /* Curved squircle aesthetic */
}
```

### High-Performance Hover Cards (`.hover-card`)
To prevent "animation stutter" and text blurring during translation, we implement **GPU Acceleration** from the start and avoid animating properties that cause layout repaints (like `box-shadow` directly).

```css
.hover-card {
  position: relative;
  border: 1px solid rgba(226, 232, 240, 1); /* slate-200 */
  will-change: transform;
  transform: translateZ(0); /* Promotes layer to GPU */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .hover-card {
  border-color: rgba(255, 255, 255, 0.05);
}

.hover-card:hover {
  transform: translateY(-2px) translateZ(0);
  border-color: #10B981; /* Algorithmic Mint focus */
}

/* Shadow transitions via opacity on pseudo-element (zero repaint cost) */
.hover-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.12);
  opacity: 0;
  transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.hover-card:hover::after {
  opacity: 1;
}
```

### Premium Icon Hover Card Micro-interactions
Standard cards with custom icons (such as in `/company/about`, `/platform/dashboard`, `/pilot`, `/methodology/process-over-product`, and the home page's flagship Bento grid) must follow a cohesive, delightful hover interaction:
1. **Parent Container:** Must be marked with the `group` class to orchestrate child hover states.
2. **Icon Container Shift:** The icon container starts with a light accent background (e.g. `bg-algorithmic-mint/10 border border-algorithmic-mint/20 text-algorithmic-mint`) and transitions gracefully on hover to a **solid accent background with a high-contrast icon** (e.g., `group-hover:bg-algorithmic-mint group-hover:text-pedagogical-navy`).
3. **Refined Physics:** The icon itself undergoes an elastic, multi-axis transform: a scale-up (`group-hover:scale-110`) and a subtle rotation (`group-hover:rotate-3`) backed by a fluid ease-out transition (`transition-all duration-500 ease-out`). This dynamic visual response makes UI tiles feel satisfying and reactive.

### Dynamic Scrollspy Table of Contents (TOC)
Long editorial and legal pages (such as `/company/privacy`) utilize a sticky, self-updating Table of Contents panel. To maintain perfect mechanical reliability and avoid jarring state jumping:
1. **Consistent Scroll Spacing:** Apply native CSS `scroll-mt-32` (`128px` offset) on all section headers to clear sticky headers comfortably.
2. **Mathematical Viewport Tracking:** Instead of fragile intersection observers, run a lightweight window scroll listener that polls `getBoundingClientRect()`. Apply a strict coordinate threshold of `rect.top <= 160` (160px from viewport top) to detect the current section, completely preventing jumping bugs where click-to-anchor transitions skip items.
3. **Bottom-of-Page Safeguard:** Implement a DOM-height check (`Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight`) to automatically force the final navigation highlight active when the user hits the footer.
4. **Visual Highlights:** The active TOC anchor receives a prominent accent highlight (`text-algorithmic-mint font-semibold`) and a sharp vertical border stroke (`border-l-2 border-algorithmic-mint/50`), while inactive links transition gracefully to a muted opacity.

### Asymmetrical Flex Grid Column Alignment
When building asymmetrical columns (such as the `/company/contact` page's two-column grid where form input heights differ from support channel details), avoid crooked bottom alignment:
1. **Flex Box Stretch:** Configure both grid columns to stretch to the maximum grid height on desktop and act as vertical flex containers (`flex flex-col justify-between`).
2. **Push to Boundaries:** Group all standard upper page elements inside a nested div, and place the final card (e.g., the **Support Card** on the left and the **Founder's Note Card** on the right) at the absolute root of the column.
3. **Symmetric Bottom Edge:** The `justify-between` utility will naturally push both cards to align pixel-perfectly at the bottom edge, maintaining a clean visual baseline across asymmetrical screens.

### Unified Outline Typography & Scroll-Driven Border Shine
When rendering oversized structural text with hollow/outlined styling, follow these implementation rules:
1. **Unifying Intersecting Contours:** Standard CSS `-webkit-text-stroke` with transparent backgrounds causes internal path overlaps to show through (e.g. crossbars on characters like `A`, `R`, and `M`). To solve this, render the text using SVG `<text>`, fill it with a solid color identical to the background (e.g., `fill="#020617"`), and specify `paintOrder="stroke fill"` (or `paint-order: stroke fill`). This draws the stroke first and paints the fill on top, masking all overlapping intersections.
2. **Viewport-Linked Shine Sweep:** Rather than static outline shades, animate the stroke using a linear gradient mapping coordinates (`x1`, `x2`) directly to the viewport scroll position. Bind `scrollYProgress` using Framer Motion's `useScroll` relative to the component itself, and animate gradient offsets from `-100%` to `200%` over a precise scroll range of `[0.70, 1.10]` to sweep highlights across character contours as the user scrolls to the bottom.
3. **Responsive Scaling:** SVG text scales dynamically inside a `viewBox` using fluid `w-full h-auto` dimensions, eliminating font size wrapping and layout fractures common with viewport units (`vw`) under extreme user zoom levels.


---

## 6. How to Replicate Everywhere (Next.js, React, CSS, Tailwind)

To implement this design system in any project, follow these structural configurations:

### A. Custom CSS Variables Setup (`index.css` / `globals.css`)
Inject the core tokens at the root level of your project style sheet:

```css
@import "tailwindcss";

@theme {
  --color-pedagogical-navy: #0F172A;
  --color-algorithmic-mint: #10B981;
  --color-algorithmic-mint-dark: #065F46;
  --color-canvas-white: #FFFFFF;
  --color-slate-container: #1F2938;
  --color-institutional-ash: #EDEDED;
  
  --font-sans: var(--font-lato), sans-serif;
  --font-google-sans-flex: var(--font-google-sans-flex);
  --font-rethink-sans: var(--font-rethink-sans);
  --font-lato: var(--font-lato);
}

@custom-variant dark (&:is(.dark *));

@layer base {
  :root {
    --text-primary: var(--color-pedagogical-navy);
    --bg-primary: #f3fcf9;
    --accent: var(--color-algorithmic-mint);
  }
  
  html.dark {
    --text-primary: var(--color-institutional-ash);
    --bg-primary: var(--color-slate-container);
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: color 150ms ease, background-color 150ms ease;
  }
}
```

### B. Applying Variable Font Axis Globally
Ensure that any container rendering Pedagogical content incorporates the exact flexible settings. In Next.js, configure the main content wrapper:

```jsx
// React Component Layout Wrapper
export default function SiteLayout({ children }) {
  return (
    <main className="site-content" style={{
      fontFamily: "var(--font-google-sans-flex)",
      fontVariationSettings: '"slnt" 0, "wdth" 100, "GRAD" 25, "ROND" 25',
    }}>
      {children}
    </main>
  );
}
```

---

## 7. Do's and Don'ts

### Do:
- **Do** leverage large background blur filters (`backdrop-blur-2xl`) combined with highly-diluted background opacity values (`10%` light, `2%` dark) to simulate premium structural refraction.
- **Do** use pure transparent backdrop-blur layers (`backdrop-blur-[3px] rounded-3xl`) to isolate text from moving background elements/particles rather than colored vignette boxes, which cause banding and visual blocks in dark mode.
- **Do** use premium modern sans-serifs (like `Rethink Sans` with high-tracking uppercase labels) for active status panels, dashboards, and router controls instead of standard system monospace fonts.
- **Do** allow content spaces to expand. Give headings and titles massive padding-bottoms (`mb-8` to `mb-12`) to keep the workspace "roomy" and calm.
- **Do** tint all drop shadows with the primary text color (navy or ash) instead of generic pure black `#000000` to prevent cheap styling.

### Don't:
- **Don't** use standard 1px borders between lists or cards. Let white space or alternating backgrounds act as separators.
- **Don't** use typewriter monospace fonts (`font-mono` falling back to Courier/Consolas) for technical status dashboard cards unless explicitly aiming for a low-fidelity retro CLI aesthetic.
- **Don't** load heavy gradients across body containers. Gradients are only allowed as a 135-degree angle in primary CTAs and progress trackers.
- **Don't** break the typography system by changing weights manually on body copy. Stick to the defined `350` and `240` values to safeguard elegance.
