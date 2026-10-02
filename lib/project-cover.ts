export const coverSceneNames = [
  'voice',
  'memory',
  'overlap',
  'ideas',
  'data',
  'publishing',
  'evaluation',
] as const;
export type CoverSceneName = (typeof coverSceneNames)[number];
export type CoverPalette = 'sea' | 'mist' | 'lilac';

/** Every project chooses intentional artwork. See docs/project-cover-system.md. */
export type ProjectCover =
  | {
      kind: 'svg';
      scene: CoverSceneName;
      palette: CoverPalette;
      label: string;
      detail: string;
    }
  | {
      kind: 'image';
      src: string;
      position: string;
      /** Images are an explicit owner-approved exception to the SVG family. */
      approvedBy: 'owner';
      reason: string;
    };
