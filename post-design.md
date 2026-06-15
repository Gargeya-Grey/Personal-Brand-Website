# Edudojo.ai Blog Cover Image Design & Production Specification

This document defines the complete end-to-end pipeline for generating, formatting, and deploying AI-generated blog cover images (using models like `x-ai/grok-imagine-image-quality` or Midjourney). 

It ensures visual consistency, prevents AI hallucinations, guarantees UI accessibility, and optimizes for web performance and SEO.

---

## 1. Core Visual Style & Physics

*   **Aesthetic Theme:** "The Digital Sensei." A blend of traditional academic authority with cutting-edge engineering precision.
*   **Surfaces & Materials:**
    *   **Refractive Glass:** Translucent, frosted panels. *Mandatory physics keywords:* "subsurface scattering, light dispersion, caustics."
    *   **Pristine Textures:** Smooth ceramic, brushed steel, anodized aluminum.
    *   **Inorganic Enforcement:** Materials must be mathematically precise and hard-surfaced to prevent the AI from hallucinating fleshy, biological, or uncanny organic shapes when asked for "abstract forms."
*   **Composition & Framing:**
    *   **Rule of Thirds:** To combat the AI's overwhelming bias to place subjects dead-center, prompts must mandate: "Asymmetrical composition, subject placed on the rule of thirds grid, extreme negative space."
    *   **Photography Specs:** Macro lens, f/1.8 aperture, extreme bokeh (shallow depth of field).

---

## 2. Color Themes & UI Accessibility

To prevent a "wall of sameness" on the blog index, alternate between two themes. *Crucially, these themes are engineered to preserve the legibility of the website's text overlay.*

### Theme A: Midnight Canvas (Dark Mode)
*   **Dominant Tones:** Deep charcoal slate (`#1F2938`), midnight navy.
*   **Primary Accent:** Vivid Algorithmic Mint/Emerald green internal glow.
*   **Secondary Depth:** Subtle environmental reflections of deep oceanic blue or electric indigo.

### Theme B: Institutional Ash (Light Mode) *[Warning: Accessibility Risk]*
*   **Dominant Tones:** Crisp, bright white light, frosted glass, light ceramic grey.
*   **UI Contrast Mandate:** Because the blog UI overlays white text (Title, Author, Date) on the cover, Theme B images **must** include the prompt keyword: *"heavy dark vignette around the edges"* or the UI must apply a CSS dark gradient. Otherwise, the text will be invisible.
*   **Color Bleed Prevention:** Add *"clean color separation"* to prevent the Mint green glow from washing out the white/grey canvas into a muddy green tint.

---

## 3. Workflow: Metaphors & Continuity

Abstract tech concepts ("React Hooks", "Latency") cannot be drawn directly by an AI without resulting in garbage text or generic UI mockups. 

1.  **The Metaphor Translation Step:** Before prompting, translate the concept into a physical object. 
    *   *Latency* -> A frosted glass pendulum caught in slow motion.
    *   *Security* -> A heavy, interlocking anodized aluminum vault mechanism.
2.  **Serial Continuity:** If writing a multi-part series, **do not change the metaphor**. Re-use the exact same physical metaphor but change the camera angle (e.g., Part 1: Wide shot. Part 2: Macro close-up of the gears).
3.  **Reproducibility (SEED):** Always save the AI generation `SEED` and the exact prompt in the article's frontmatter. This allows you to generate a perfectly matched image months later if you add Part 3 to a series.

---

## 4. The Front-Loaded Prompt Architecture

AI models weight the beginning of the prompt heaviest. If you put 30 words of lighting instructions first, the AI will ignore the subject. Use this strict structural formula:

**Template:**
> `[Physical Metaphor], asymmetrical composition on rule of thirds grid :: Editorial 3D glassmorphism, [Theme A/B materials]. [Physics keywords: caustics, subsurface scattering]. :: [Colors]. Clean color separation. :: Cinematic studio lighting, f/1.8 aperture, extreme bokeh macro photography. --ar [Aspect Ratio] --no [Negative Constraints]`

**Example (Theme A - "State Synchronization"):**
> `An interconnected system of floating frosted glass gears, asymmetrical composition on rule of thirds grid :: Editorial 3D glassmorphism, smooth ceramic, subsurface scattering, caustics. :: Deep charcoal background, vivid mint green glowing accents, subtle deep blue environmental reflections. Clean color separation. :: Cinematic studio lighting, f/1.8 aperture, extreme bokeh macro photography. --ar 16:9`

*(Note: Always append `--ar 16:9` or your blog's exact aspect ratio to prevent the AI from generating a 1:1 square that your CSS will awkwardly crop and ruin.)*

---

## 5. Strict Negative Constraints

Supply these to prevent the AI from ruining the premium aesthetic.

*   **API Negative Parameter string:**
    `text, font, letters, typography, words, watermarks, UI elements, borders, people, faces, humans, hands, laptops, desks, offices, cartoon, vector, clip art, fleshy, biological, organic, busy background, warm colors, red, yellow, purple, noise, clutter`

---

## 6. Web Performance & SEO (Post-Processing)

An 8K AI image will destroy your website's load time and Lighthouse LCP score.

1.  **Format:** Never upload PNG or JPEG. Convert the final generated image to **WebP** or **AVIF**.
2.  **Compression:** The final file size must be **under 200KB**.
3.  **Dimensions:** Resize to exactly **1200x630** pixels (the standard for Open Graph / Twitter cards and optimal for blog headers).
4.  **Alt Text (SEO):** The `alt=""` attribute must NOT be "AI generated image". Use the *Physical Metaphor* from your prompt (e.g., `alt="Abstract 3D rendering of frosted glass gears representing state synchronization"`).
