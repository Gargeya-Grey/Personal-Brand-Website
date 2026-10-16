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
  /** A second place worth a visit: the sibling app, a hosted Space. Shown under the actions. */
  related?: { href: string; label: string };
  /** What the project holds, as a short table of contents. Read from the project's repository. */
  facets?: WorkFacets;
  /** Search title and snippet for this page, when the on-page wording is not the best search wording. */
  seo?: { title: string; description: string };
  /** Marks the page up as downloadable software for search engines. Only set where the facts are on the page. */
  software?: { operatingSystem: string; version: string; license: string };
}

export interface WorkFacets {
  /** A heading in two tones: `title`, then `tone` in the second ink. */
  title: string;
  tone: string;
  aside: string;
  /** How the first column reads: keys on a keyboard, or a plain label. */
  keyStyle: 'keyboard' | 'label';
  items: readonly { key: string; title: string; note: string }[];
}

const APACHE_2 = 'https://www.apache.org/licenses/LICENSE-2.0';

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
    category: 'Windows, macOS, Linux',
    subtitle: 'Your voice, in the app you’re already using.',
    description:
      'Tap a hotkey, speak, tap again. The text appears where your cursor is, in any app on Windows, macOS, or Linux. Ask AI for an answer, or watch live captions while you talk.',
    purpose:
      'A thought often arrives faster than I can type it. Odicto is a way to get it down without opening another editor: a hotkey on the computer.',
    decision:
      'Private by default. Dictation can run entirely on your computer with local Whisper; Gemini Transcribe is an option. AI is optional too: a local Ollama model, or OpenRouter, Gemini, or Groq with your own key. In a terminal, Odicto types the text instead of pasting it, so a paste shortcut never interrupts what is running.',
    state:
      'Version 1.0.1 is a public, open-source release under Apache 2.0, with one-command installers for Windows, macOS, and Linux (X11) and a setup page for providers and keys. No telemetry. Odicto Mobile, for Android, has its own repository.',
    stage: 'v1.0.1, public release',
    seo: {
      title: 'Odicto: voice typing for any app',
      description:
        'Hold a hotkey, speak, and text appears at your cursor on Windows, macOS and Linux. Local Whisper, private by default, free and open source.',
    },
    software: {
      operatingSystem: 'Windows, macOS, Linux',
      version: '1.0.1',
      license: APACHE_2,
    },
    steps: ['Tap the hotkey', 'Speak', 'Tap again', 'Text at your cursor'],
    tags: ['Python', 'PySide6', 'Whisper', 'Ollama · OpenRouter · Gemini · Groq'],
    source: 'https://github.com/Gargeya-Grey/Odicto',
    action: 'Desktop source & setup',
    href: 'https://github.com/Gargeya-Grey/Odicto',
    film: {
      youtubeId: 'mbXbTn3tXTo',
      title: 'Don’t be frustrated at your keyboard, Just talk to your PC now!',
      duration: '1:08',
      uploadDate: '2026-10-14',
      caption:
        'A one-minute demo on the desktop: tap, speak, tap again, and the text appears where the cursor is.',
    },
    related: { href: '/playground/odicto-mobile', label: 'Odicto Mobile, for Android' },
    facets: {
      title: 'Five keys.',
      tone: 'Everything it does.',
      aside:
        'The defaults. You can change the dictation and AI hotkeys in the settings file.',
      keyStyle: 'keyboard',
      items: [
        {
          key: 'Ctrl+`',
          title: 'Dictate',
          note: 'Your words, pasted at the cursor. Optional polish fixes grammar and punctuation first.',
        },
        {
          key: 'Ctrl+Shift+`',
          title: 'Ask AI',
          note: 'Speak a question or an instruction. A short answer is pasted, from a fresh start each time.',
        },
        {
          key: 'F7',
          title: 'Live captions',
          note: 'Your words show in a small bar while you talk. Tap again to insert the final text once.',
        },
        {
          key: 'F6',
          title: 'Keep the thread',
          note: 'Hold F6 with a dictation or AI hotkey to continue the same conversation with the AI.',
        },
        {
          key: 'F5',
          title: 'Start over',
          note: 'Clears the conversation memory. Saying “reset chat” does the same.',
        },
      ],
    },
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
      'An Android keyboard that opens as a voice bar. Hold the microphone and speak: keep your words as spoken, ask AI to edit your text, or watch words appear while you talk. The full keyboard is one tap away.',
    purpose:
      'A thought often arrives faster than I can type it, on a phone most of all. The keyboard opens collapsed, so the first instinct is to speak your mind. The full keyboard is one tap away for small edits, a crowded room, or a day you’d rather not talk.',
    decision:
      'There is no Odicto server. Voice goes straight from the phone to the provider you choose, with your own keys kept in Android Keystore, and the audio is not kept. Password, payment, and other protected fields block voice. Before it inserts anything, Odicto checks that the same field still has focus; if it changed, the text waits in history for you to copy.',
    state:
      'Version 1.1.1 is a beta APK for Android 6.0 and newer, on the GitHub releases page. You need a Groq key; Gemini and OpenRouter keys add AI, Live, and Polish. Physical testing so far covers a Samsung Galaxy S24 Ultra and one Samsung tablet. iOS is not available.',
    stage: 'Beta APK, v1.1.1',
    seo: {
      title: 'Odicto Mobile: a voice keyboard for Android',
      description:
        'An Android voice keyboard. Speak, ask AI to edit your text, or watch words appear live. Your own keys, no Odicto server, free and open source.',
    },
    software: { operatingSystem: 'Android 6.0+', version: '1.1.1', license: APACHE_2 },
    steps: ['Type', 'Dictate', 'Ask AI', 'Transcribe live'],
    tags: ['Kotlin', 'React · Capacitor', 'Groq · Gemini · OpenRouter'],
    source: 'https://github.com/Gargeya-Grey/Odicto-Mobile',
    action: 'Download the beta APK',
    href: 'https://github.com/Gargeya-Grey/Odicto-Mobile/releases',
    film: {
      youtubeId: 'i32JaWYKEFU',
      title:
        'Introducing Odicto-Mobile (How I made my first demo video with Claude Opus 5.5 agents)',
      duration: '1:15',
      uploadDate: '2026-10-13',
      caption: 'Odicto Mobile, introduced on an Android phone in a little over a minute.',
    },
    related: { href: '/playground/odicto', label: 'Odicto, for the desktop' },
    facets: {
      title: 'Three modes and a polish.',
      tone: 'One keyboard.',
      aside: 'Hold the microphone, speak, release. Slide up to lock it for a longer thought.',
      keyStyle: 'label',
      items: [
        {
          key: 'Raw',
          title: 'Your words, as spoken',
          note: 'Groq Whisper transcribes after you release the microphone.',
        },
        {
          key: 'AI',
          title: 'Ask for an edit',
          note: 'Speak an instruction. AI mode selects the whole field by default; with nothing selected, it writes at the cursor. Gemini or OpenRouter answers, with your own system prompt if you set one.',
        },
        {
          key: 'Live',
          title: 'Words while you talk',
          note: 'Gemini Live writes into the field as you speak, without a second copy at the end.',
        },
        {
          key: 'Polish',
          title: 'Tidy what you typed',
          note: 'One tap sends the selection, or the whole field, for a cleaner version. Typing alone sends nothing.',
        },
        {
          key: 'Float',
          title: 'Outside the keyboard',
          note: 'An optional floating microphone works while another keyboard is active.',
        },
      ],
    },
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
      'A reinforcement-learning environment from the OpenEnv hackathon. Agents change a live SQLite database to clean data and protect privacy, from date formats to a compliance audit.',
    purpose:
      'Reading a database is different from safely changing one. This environment gives agents tasks such as normalising dates, masking sensitive text, and resolving duplicate entities.',
    decision:
      'Grade the database, not the explanation. Every action gets feedback from SQLite. An action that runs earns a small reward, progress on the grader earns more, and a destructive action such as an unauthorised DROP TABLE ends the episode with a penalty.',
    state:
      'A public hackathon submission (OpenEnv, by Scaler School of Technology, Meta, and Hugging Face) with four tasks, a grader, tests, and a baseline runner. It also runs as a Hugging Face Space. It is an experimental environment, not a production compliance guarantee.',
    stage: 'Hackathon submission',
    steps: ['Inspect the schema', 'Choose an action', 'Change the data', 'Check the result'],
    tags: ['OpenEnv', 'Python', 'SQLite', 'Docker'],
    source: 'https://github.com/Gargeya-Grey/DataCleanOpenEnv',
    action: 'Explore the repository',
    href: 'https://github.com/Gargeya-Grey/DataCleanOpenEnv',
    missing: 'One recorded task run, including a failed attempt and what changed on the next try.',
    related: {
      href: 'https://huggingface.co/spaces/grey8magic/DataCleanOpenEnv',
      label: 'The Hugging Face Space',
    },
    facets: {
      title: 'Four tasks.',
      tone: 'Easy to expert.',
      aside:
        'Baseline scores run from 0 to 1, for GPT-4o-mini with the included script, as the repository reports them.',
      keyStyle: 'label',
      items: [
        {
          key: 'Easy',
          title: 'Date standardization',
          note: 'Convert mixed date strings to ISO 8601. Baseline 1.0.',
        },
        {
          key: 'Medium',
          title: 'PII redaction',
          note: 'Mask credit card numbers inside free-text message logs. Baseline 1.0.',
        },
        {
          key: 'Hard',
          title: 'Entity resolution',
          note: 'Merge two sales tables into one and remove duplicates by email. Baseline 0.8 or more, depending on the merge strategy.',
        },
        {
          key: 'Expert',
          title: 'Compliance audit',
          note: 'Across tables: redact emails in the logs and drop the ssn column. Baseline 1.0.',
        },
      ],
    },
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
      'A private memory any AI tool can load: notes, decisions, and preferences in Markdown you own. Your assistant proposes changes; you approve them.',
    purpose:
      'A new AI conversation often starts with explaining yourself again. TwinAatma gives an assistant relevant context from a collection of notes you can read and keep.',
    decision:
      'Memory should be inspectable. Notes live in Markdown, and changes to the model of your preferences are proposed for approval. A lesson from one conversation can inform the next without silently rewriting who you are.',
    state:
      'A public, local-first toolkit. One MCP server gives a compatible AI host, such as Cursor, your memory, and one command writes the host’s configuration. The core needs only Python 3.9 and its standard library. Obsidian is recommended for reading; Notion is optional. It is a developer tool, not a hosted chat service.',
    stage: 'Public, local-first toolkit',
    steps: ['Load context', 'Have a conversation', 'Review a proposed memory', 'Carry it forward'],
    tags: ['Markdown', 'Python', 'MCP', 'SQLite search'],
    source: 'https://github.com/Gargeya-Grey/TwinAatma',
    action: 'Explore TwinAatma',
    href: 'https://github.com/Gargeya-Grey/TwinAatma',
    missing: 'A recording of a memory proposal, approval, and retrieval in a later conversation.',
    facets: {
      title: 'Set it up once.',
      tone: 'Then just talk.',
      aside:
        'What the assistant does by itself after the one-time setup. Your Self changes only when you say yes.',
      keyStyle: 'label',
      items: [
        {
          key: 'Chat starts',
          title: 'Your context loads',
          note: 'The search index refreshes if it is stale, then your Self and relevant memory load.',
        },
        {
          key: 'During chat',
          title: 'Search and capture',
          note: 'The assistant searches memory and keeps what matters, without you managing folders.',
        },
        {
          key: 'A preference',
          title: 'One question',
          note: '“Want me to remember that?” Nothing changes without a yes.',
        },
        {
          key: 'Chat ends',
          title: 'A summary is saved',
          note: 'A useful session leaves a short summary for next time.',
        },
        {
          key: 'About weekly',
          title: 'A drift proposal',
          note: 'An update to your Self, drafted from how your work has changed, for your yes or no.',
        },
      ],
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
    kind: 'Software',
    stage: 'Live, with public source',
    subtitle: 'A home for things I make and think about.',
    description:
      'Projects, essays, a weekly letter, and films in one place, with a private workspace behind it.',
    purpose:
      'My work used to be scattered across repositories, articles, and social profiles. This site gives those pieces a shared starting point.',
    decision:
      'Public pages are built around the work. The site shares Edudojo’s design language (warm paper, one sans, dots that move) in its own papaya colour, so the person and the company read as one family. Editorial tools stay behind sign-in.',
    state:
      'You are using the public site. The source is available; the publishing workspace and personal tools are private.',
    steps: [],
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Editorial CMS'],
    source: 'https://github.com/Gargeya-Grey/Personal-Brand-Website',
    action: 'Read the source',
    href: 'https://github.com/Gargeya-Grey/Personal-Brand-Website',
    facets: {
      title: 'What lives here.',
      tone: 'One place for the work.',
      aside: 'The public rooms. The workspace that feeds them is private.',
      keyStyle: 'label',
      items: [
        {
          key: 'Journal',
          title: 'Essays',
          note: 'Long writing on learning, AI, and building. Some essays have interactive blocks.',
        },
        {
          key: 'Notes',
          title: 'A weekly letter',
          note: 'One letter each Sunday, at 19:00 in your own time zone.',
        },
        {
          key: 'Playground',
          title: 'The projects',
          note: 'Every tool, with the question it answers and how it works.',
        },
        {
          key: 'Research',
          title: 'Research and publications',
          note: 'Academic papers, with the background behind each one.',
        },
        {
          key: 'Videos',
          title: 'Travel films',
          note: 'A series from Japan, playable on the page.',
        },
      ],
    },
  },
];

/** The homepage's Selected work, in this order. Every project, these included, has a page at /playground/[id]. */
export const selectedWork = ['edudojo', 'odicto', 'personal-brand'].map((id) =>
  allWork.find((work) => work.id === id)!,
);
