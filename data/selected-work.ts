/** Curated from the owner's public repositories. Evidence links belong with the work. */
export const allWork = [
  {
    id: 'odicto',
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
] as const;

/** Homepage order is intentional; other experiments keep their existing routes. */
export const selectedWork = ['edudojo', 'odicto', 'twinaatma'].map((id) =>
  allWork.find((work) => work.id === id)!,
);
