/** Public, reviewed media only. Missing media is omitted from the visitor experience. */
export type ProjectDemo = {
  kind: 'embed';
  url: `https://${string}`;
  title: string;
  description: string;
};

export interface ProjectRecording {
  id: string;
  title: string;
  description: string;
  src: string;
  poster?: string;
  orientation?: 'landscape' | 'portrait';
  captions?: { src: string; language: string; label: string };
  /** A readable equivalent, including any important visual steps. */
  transcript: string;
}

/** The owner's own demo film on YouTube. It takes the cover's place on the project page. */
export interface ProjectFilm {
  youtubeId: string;
  /** The video's title on YouTube; names the player for screen readers. */
  title: string;
  /** Running time as shown, for example `1:08`. */
  duration: string;
  /** One sentence on what the film shows. */
  caption: string;
}

export interface ProjectMedia {
  demo?: ProjectDemo;
  recordings?: readonly ProjectRecording[];
  film?: ProjectFilm;
}
