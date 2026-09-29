/** Public, reviewed media only. Missing media is omitted from the visitor experience. */
export type ProjectDemo =
  | { kind: 'native'; app: 'box-lab' | 'idea-mixer'; title: string; description: string }
  | { kind: 'embed'; url: `https://${string}`; title: string; description: string };

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

export interface ProjectMedia {
  demo?: ProjectDemo;
  recordings?: readonly ProjectRecording[];
}
