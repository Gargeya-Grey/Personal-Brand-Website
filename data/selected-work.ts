import type { ProjectCover } from '@/lib/project-cover';
import type { ProjectMedia } from '@/lib/project-media';

export interface WorkProject extends ProjectMedia {
  id: string;
  cover: ProjectCover;
  title: string;
  category: string;
  kind?: 'Software' | 'Experiments';
  subtitle: string;
  description: string;
  purpose: string;
  decision: string;
  state: string;
  /** A few words on where the project stands, for indexes. Shortened from `state`, never beyond it. */
  stage?: string;
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
    id: 'evals',
    cover: {
      kind: 'svg',
      scene: 'evaluation',
      palette: 'sea',
      label: 'Evidence, on the same scale',
      detail: 'Public evaluation results',
    },
    title: 'Eval dashboard',
    category: 'AI evaluation',
    kind: 'Experiments',
    subtitle: 'Compare the evidence behind the answer.',
    description:
      'A public, read-only record for AI task evaluations. See the publication status and how verified results will be compared.',
    purpose:
      'Choosing an AI setup needs more than a convincing answer. This dashboard is a place to inspect published evidence from repeatable task evaluations.',
    decision:
      'Runs happen privately. Only reviewed, sanitized result summaries belong on the public site.',
    state:
      'No verified evaluation results are published yet. Examples and setup checks are not model results.',
    steps: [],
    tags: ['Evaluation', 'Evidence', 'Read-only results'],
    action: 'View the dashboard',
    href: '/playground/evals',
  },
  {
    id: 'odicto',
    cover: {
      kind: 'svg',
      scene: 'voice',
      palette: 'mist',
      label: 'Voice → text',
      detail: 'Desktop',
    },
    title: 'Odicto',
    category: 'Mac, Windows, Linux',
    subtitle: 'Your voice, in the app you’re already using.',
    description:
      'Press a hotkey and speak, in whatever app you’re writing in on Mac, Windows, or Linux. Dictate as you speak, ask AI to edit or write, or watch your words appear live.',
    purpose:
      'A thought often arrives faster than I can type it. Odicto is a way to get it down without opening another editor: a hotkey on the computer.',
    decision:
      'The same modes as Odicto Mobile, without the keyboard: dictation, AI mode, and live transcription. Dictation can run locally with Whisper or use an optional cloud provider. The smart polish button is on mobile only.',
    state:
      'A public repository with setup instructions for Windows, macOS, and Linux. An Android version, Odicto Mobile, has its own repository.',
    stage: 'Public repository',
    steps: ['Press the hotkey', 'Dictate', 'Ask AI', 'Transcribe live'],
    tags: ['Whisper', 'Python / Qt'],
    source: 'https://github.com/Gargeya-Grey/Odicto',
    action: 'Desktop source & setup',
    href: 'https://github.com/Gargeya-Grey/Odicto',
    missing: 'A short screen recording showing dictation inside an everyday app.',
  },
  {
    id: 'odicto-mobile',
    cover: {
      kind: 'svg',
      scene: 'voice',
      palette: 'sea',
      label: 'Voice → keyboard',
      detail: 'Android',
    },
    title: 'Odicto Mobile',
    category: 'Android keyboard',
    subtitle: 'Speak, type, or ask AI, anywhere on Android.',
    description:
      'An Android keyboard with four ways to write: type, dictate, ask AI to edit or write, or watch your speech turn into polished text live. A floating icon keeps it a tap away.',
    purpose:
      'A thought often arrives faster than I can type it, on a phone most of all. The keyboard opens collapsed, so the first instinct is to speak your mind. The full keyboard is one tap away for small edits, a crowded room, or a day you’d rather not talk.',
    decision:
      'Four modes, one keyboard. Dictation keeps your words as spoken. AI mode selects your text by default and does what you ask; with nothing selected, it writes at the cursor, and you can give it your own system prompt. Live transcription polishes as you speak. A separate smart polish button tidies whatever you are writing, most useful after typing.',
    state:
      'A public repository with setup instructions. Voice goes directly to the provider you configure, with your own keys; there is no Odicto backend. Android only; iOS is not available.',
    stage: 'Public repository',
    steps: ['Type', 'Dictate', 'Ask AI', 'Transcribe live'],
    tags: ['Android / Kotlin', 'Your provider keys'],
    source: 'https://github.com/Gargeya-Grey/Odicto-Mobile',
    action: 'Android source & setup',
    href: 'https://github.com/Gargeya-Grey/Odicto-Mobile',
    missing: 'A portrait recording showing the keyboard microphone and the final text.',
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
    stage: 'MVP in testing, pilot planned',
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
    stage: 'Public, local-first toolkit',
    steps: ['Load context', 'Have a conversation', 'Review a proposed memory', 'Carry it forward'],
    tags: ['Markdown', 'Python', 'MCP'],
    source: 'https://github.com/Gargeya-Grey/TwinAatma',
    action: 'Explore TwinAatma',
    href: 'https://github.com/Gargeya-Grey/TwinAatma',
    missing: 'A recording of a memory proposal, approval, and retrieval in a later conversation.',
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
    kind: 'Software',
    stage: 'Live, with public source',
    subtitle: 'A home for things I make and think about.',
    description:
      'Projects, research, writing, and films in one place, with a private workspace for publishing.',
    purpose:
      'My work used to be scattered across repositories, articles, and social profiles. This site gives those pieces a shared starting point.',
    decision:
      'Public pages are built around the work. Project pages explain the decisions, and editorial tools stay behind authentication.',
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
