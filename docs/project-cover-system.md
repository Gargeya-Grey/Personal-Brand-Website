# Project cover system

Use custom SVG artwork as the default for every project. The owner expects one recognizable visual family across the homepage, Playground, and project pages. Odicto and TwinAatma established the direction; they are examples of the collection-wide standard, not the only projects that need artwork.

Read [DESIGN.md](../DESIGN.md#project-cover-art-direction) for the approved Edudojo reference, reusable generation prompt, project-specific briefs, and visual acceptance criteria. This guide covers implementation; the prompt is not a change to the SVG default.

## Adding or changing a cover

1. Read the project's purpose and choose one visual idea that explains it: voice becoming text, memory carried forward, overlapping predictions, or data being cleaned. Finish this step with a one-sentence description of the picture.
2. Use an existing scene only when its meaning fits. Otherwise add a named scene to `components/project-covers/scenes.tsx` and its typed key in `lib/project-cover.ts`. Compose it from the shared primitives; keep project-specific drawing out of the page and shared frame.
3. Add the required `cover` field to the project's record in `data/selected-work.ts`. All public placements consume that same field through `WorkVisual`. A new project must not silently inherit a generic fallback.
4. Check the whole collection, not just the new card. Run `node --experimental-strip-types scripts/check-project-covers.mjs`, changed-file lint, and the production build. Inspect the covers in both themes at 320px and desktop, including their project-page placement. Completion means intentional artwork, readable unclipped captions, no overflow, and unchanged demo access.

Example metadata (choose the scene that actually fits):

```ts
cover: {
  kind: 'svg',
  scene: 'voice',
  palette: 'mist',
  label: 'Voice → text',
  detail: 'Desktop + Android',
},
```

## Visual grammar

| Part | Standard |
| --- | --- |
| Canvas | Shared `640 × 320` viewBox. Keep the main shape approximately inside x=70–570, y=25–250; ground shadow near y=267. |
| Composition | One dominant metaphor, a small number of related forms, room around them. A different color alone does not make a new project cover. |
| Materials | Follow the art direction in [DESIGN.md](../DESIGN.md#project-cover-art-direction). Shared SVG primitives provide translucent planes, beveled edges, and soft shadows; use `GlassPanel`, `Ground`, and `Approval` only where their meaning fits. |
| Color | `sea`, `mist`, or `lilac` backdrop; shared sea-glass material, ink, and highlight tokens in `app/project-media.css`. Theme changes belong there, not in individual scenes. |
| Drawing | Code-authored SVG paths and shapes. Use CSS tokens and per-instance gradient IDs supplied by the frame. No external scripts, fonts, or assets inside SVG scenes. |
| Words | Keep words in the HTML caption, not in the SVG. Two useful short phrases, each at most 32 characters. Project titles and longer explanations belong in card copy. |
| Motion | Covers are still illustrations. Existing link/focus feedback is sufficient; the actual demo supplies interaction. |
| Accessibility | Cover is decorative beside the labelled project link/title. Keep controls in the demo, not inside an aria-hidden drawing. |
| Resizing | Preserve the composition rather than stretching it. Shared frames handle card, homepage, and detail-page dimensions. Inspect narrow captions for wrapping and clipping. |

The scene catalog in `components/project-covers/scenes.tsx` is the executable reference. Its examples span voice, memory, overlap, creative pairing, data cleaning, and publishing. Extend the vocabulary instead of multiplying ad hoc card implementations.

## Approved image exception

Edudojo uses `/project-art/edudojo-gate.png`, the owner-approved minimal gate illustration: pale wood, ascending stone steps, and a sea-glass background. Use centered cropping. The owner chose this version after an in-page comparison with the forest artwork in both themes. The original `/edudojo.png` is retained as a source asset, not the current project cover. Its homepage also uses the owner's exact gate mark as a separate watermark; the illustration is not a replacement logo.

The typed `image` variant records the approval and reason in the project record. Preserve this exception; another raster or generated image requires a new explicit owner request. The default for future projects remains custom SVG. This illustration was generated with the built-in ChatGPT Images tool using the original forest gate and the site's project grid as references. The direction was a single minimal architectural gate and ascending path, with restrained materials, generous space, a muted sea-green backdrop, and no text or dense foliage.

## Keep artwork and evidence distinct

Covers express a project's idea; they are not screenshots or demonstrations of the running product. Playable apps and real recordings use the separate media system described in `docs/publishing-experiments.md`. Each project remains one click from its demo page, and browser tools stay interactive there.
