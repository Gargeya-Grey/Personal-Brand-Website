import type { ProjectCover } from '@/lib/project-cover';
import type { ProjectMedia } from '@/lib/project-media';

export interface WorkProject extends ProjectMedia {
  id: string;
  cover: ProjectCover;
  title: string;
  category: string;
  kind?: 'In your browser' | 'Software' | 'Experiments';
  subtitle: string;
  description: string;
  purpose: string;
  decision: string;
  state: string;
  steps: readonly string[];
  tags: readonly string[];
  source?: string;
  action: string;
  href: string;
  missing?: string;
}

/** One record supplies the project page, Playground entry, and sitemap. */
export const allWork: readonly WorkProject[] = [
  {
    id: 'odicto',
    cover: {
      kind: 'svg',
      scene: 'voice',
      palette: 'mist',
      label: 'Voice → text',
      detail: 'Desktop + Android',
    },
    title: 'Odicto',
    category: 'Desktop + Android',
    subtitle: 'Your voice, in the app you’re already using.',
    description:
      'Speak into a desktop hotkey or an Android keyboard. Odicto turns your voice into text where you’re already writing.',
    purpose:
      'A thought often arrives faster than I can type it. Odicto is a way to get it down without opening another editor: a hotkey on the computer, a microphone in the keyboard on Android.',
    decision:
      'One idea, two implementations. Desktop dictation can run locally with Whisper. Android sends voice requests directly to the provider you configure, without an Odicto backend. Both separate transcription from optional AI assistance.',
    state:
      'Two public repositories, each with its own setup instructions. Desktop covers Windows, macOS, and Linux; the mobile app targets Android. The Android build requires your own provider keys. iOS is not available.',
    steps: ['Choose desktop or Android', 'Speak', 'Transcribe', 'Keep writing'],
    tags: ['Whisper', 'Python / Qt', 'Android / Kotlin'],
    source: 'https://github.com/Gargeya-Grey/Odicto',
    action: 'Desktop source & setup',
    href: 'https://github.com/Gargeya-Grey/Odicto',
    missing: 'A short screen recording showing dictation inside an everyday app.',
  },
  {
    id: 'edudojo',
    cover: {
      kind: 'image',
      src: '/project-art/edudojo-gate.png',
      position: 'center',
      approvedBy: 'owner',
      reason: 'The owner approved the minimal gate illustration after comparing it with the forest artwork in both themes; retain the separate gate-logo watermark.',
    },
    title: 'Edudojo',
    category: 'Startup',
    subtitle: 'Give teachers more to discuss than a finished answer.',
    description:
      'My startup for learning with AI. A questioning coach and a process journal help students revise their work and teachers review how it developed.',
    purpose:
      'When AI can produce a polished assignment, the final file leaves a lot unsaid. I’m building Edudojo to make space for questions, attempts, and revision during the work.',
    decision:
      'The coach asks students to explain and revisit their ideas. A process journal records activity for teacher review; it does not score understanding or prove who wrote an answer. The teacher retains that judgment.',
    state:
      'I’m the founder and chief architect. The MVP is in testing, with a planned usability pilot in Jaipur. The public site includes illustrative product walkthroughs and the pilot plan.',
    steps: ['Draft', 'Question', 'Revise', 'Review the process'],
    tags: ['Education', 'Socratic AI', 'Process journals'],
    source: undefined,
    action: 'Explore Edudojo & the pilot',
    href: 'https://edudojo.ai',
    missing:
      'A product walkthrough with permission to show student work, plus a concrete learning or pilot outcome.',
  },
  {
    id: 'dataclean',
    cover: {
      kind: 'svg',
      scene: 'data',
      palette: 'sea',
      label: 'Inspect → change → check',
      detail: 'A cleaner dataset',
    },
    title: 'DataCleanOpenEnv',
    category: 'Agent experiment',
    subtitle: 'Can an agent clean data without breaking it?',
    description:
      'An OpenEnv hackathon environment where agents practise data cleaning and privacy tasks against SQLite.',
    purpose:
      'Reading a database is different from safely changing one. This environment gives agents tasks such as normalising dates, masking sensitive text, and resolving duplicate entities.',
    decision:
      'Grade the database state after actions, not just an agent’s explanation. The environment provides execution feedback and task rewards, with penalties for destructive actions.',
    state:
      'A public hackathon project with task definitions, a grader, tests, and a baseline runner. It is an experimental environment, not a production compliance guarantee.',
    steps: ['Inspect the schema', 'Choose an action', 'Change the data', 'Check the result'],
    tags: ['OpenEnv', 'Python', 'SQLite'],
    source: 'https://github.com/Gargeya-Grey/DataCleanOpenEnv',
    action: 'Explore the repository',
    href: 'https://github.com/Gargeya-Grey/DataCleanOpenEnv',
    missing: 'One recorded task run, including a failed attempt and what changed on the next try.',
  },
  {
    id: 'twinaatma',
    cover: {
      kind: 'svg',
      scene: 'memory',
      palette: 'lilac',
      label: 'Context → continuity',
      detail: 'Memory, with your approval',
    },
    title: 'TwinAatma',
    category: 'Personal AI memory',
    subtitle: 'Start the next conversation with some shared history.',
    description:
      'A local memory for your AI tools: notes, decisions, and preferences you own, with proposed changes for you to review.',
    purpose:
      'A new AI conversation often starts with explaining yourself again. TwinAatma gives an assistant relevant context from a collection of notes you can read and keep.',
    decision:
      'Memory should be inspectable. Notes live in Markdown, and changes to the model of your preferences are proposed for approval. A lesson from one conversation can inform the next without silently rewriting who you are.',
    state:
      'A public, local-first toolkit with an MCP memory interface and optional Obsidian or Notion workflows. It needs a compatible AI host and initial setup; this is a developer tool, not a hosted chat service.',
    steps: ['Load context', 'Have a conversation', 'Review a proposed memory', 'Carry it forward'],
    tags: ['Markdown', 'Python', 'MCP'],
    source: 'https://github.com/Gargeya-Grey/TwinAatma',
    action: 'Explore TwinAatma',
    href: 'https://github.com/Gargeya-Grey/TwinAatma',
    missing: 'A recording of a memory proposal, approval, and retrieval in a later conversation.',
  },
  {
    id: 'box-lab',
    cover: {
      kind: 'svg',
      scene: 'overlap',
      palette: 'mist',
      label: 'Prediction → overlap',
      detail: 'Find the shared area',
    },
    title: 'The overlap lab',
    category: 'Computer vision experiment',
    kind: 'In your browser',
    subtitle: 'How close is close enough?',
    description:
      'Move a prediction, resize it, and discover how computer vision measures a match. Try it on this page, with no account or installation.',
    purpose:
      'A computer can draw a box around an object. But did it find the right area? The lab makes one measure of that answer something you can see and change.',
    decision:
      'Intersection over union divides the shared area by the total area covered by both boxes. The threshold changes the verdict, not the overlap. Real benchmarks also consider classes, confidence, and missed or duplicate detections.',
    state:
      'A working geometric teaching tool. It is not a running AI model or a reproduction of my research results. All calculations happen in your browser.',
    steps: [],
    tags: ['Computer vision', 'Geometry', 'React'],
    action: 'Read the related research',
    href: '/research',
    demo: {
      kind: 'native',
      app: 'box-lab',
      title: 'Move the box. See the difference.',
      description: 'Adjust the prediction and threshold. A perfect overlap is 1; no overlap is 0.',
    },
  },
  {
    id: 'idea-mixer',
    cover: {
      kind: 'svg',
      scene: 'ideas',
      palette: 'sea',
      label: 'Audience + constraint',
      detail: 'Make an unlikely pairing',
    },
    title: 'Idea mixer',
    category: 'Creative tool',
    kind: 'In your browser',
    subtitle: 'Good ideas have unlikely parents.',
    description:
      'Pair an audience with an unexpected constraint, then save the prompts you want to explore. A small creative tool you can use right here.',
    purpose:
      'An empty page can be harder to work with than a useful constraint. This mixer gives you a starting point small enough to build on.',
    decision:
      'Choose an audience and a constraint instead of asking a model for an answer. The combination leaves the interesting work to you.',
    state:
      'Works in your browser without an account or AI calls. Saved ideas stay in this browser on this device; they do not sync to a server.',
    steps: [],
    tags: ['Creative prompts', 'React', 'Local storage'],
    action: 'Explore more projects',
    href: '/playground',
    demo: {
      kind: 'native',
      app: 'idea-mixer',
      title: 'Make an unlikely pairing.',
      description: 'Mix, save, and revisit the combinations that spark something.',
    },
  },
  {
    id: 'personal-brand',
    cover: {
      kind: 'svg',
      scene: 'publishing',
      palette: 'lilac',
      label: 'Code → publish → explore',
      detail: 'A home for the work',
    },
    title: 'This website',
    category: 'Personal publishing system',
    kind: 'Experiments',
    subtitle: 'A home for things I make and think about.',
    description:
      'Projects, research, writing, and films in one place, with a private workspace for publishing.',
    purpose:
      'My work used to be scattered across repositories, articles, and social profiles. This site gives those pieces a shared starting point.',
    decision:
      'Public pages are built around the work. Browser experiments run here, project pages explain the decisions, and editorial tools stay behind authentication.',
    state:
      'You are using the public site. The source is available; the publishing workspace and personal tools are private.',
    steps: [],
    tags: ['Next.js', 'TypeScript', 'Editorial CMS'],
    source: 'https://github.com/Gargeya-Grey/Personal-Brand-Website',
    action: 'Read the source',
    href: 'https://github.com/Gargeya-Grey/Personal-Brand-Website',
  },
];

/** Homepage order is intentional; other experiments keep their existing routes. */
export const selectedWork = ['edudojo', 'odicto', 'twinaatma'].map((id) =>
  allWork.find((work) => work.id === id)!,
);
