/** Curated from the owner's public repositories. Evidence links belong with the work. */
export const selectedWork = [
  {
    id: 'odicto',
    title: 'Odicto',
    category: 'Desktop app',
    subtitle: 'Speak a thought. Keep your cursor where it is.',
    description:
      'Dictation that pastes into the app you’re already using. Local Whisper transcription, with optional cloud providers and AI replies.',
    purpose:
      'Writing by voice should not require moving your thoughts into a separate application. Odicto listens through a hotkey and puts the transcript into the focused field.',
    decision:
      'Keep transcription and AI replies separate. Whisper can run locally; cloud transcription and model replies are optional choices. That makes the privacy tradeoff a decision the person using it can make.',
    state:
      'Public source and installation instructions for Windows, macOS, and Linux. Platform permissions and setup requirements are documented in the repository.',
    steps: ['Use a hotkey', 'Speak', 'Transcribe', 'Paste at the cursor'],
    tags: ['Python', 'Whisper', 'PySide6'],
    source: 'https://github.com/Gargeya-Grey/Odicto',
    action: 'Installation & source',
    href: 'https://github.com/Gargeya-Grey/Odicto#quick-start',
    missing: 'A short screen recording showing dictation inside an everyday app.',
  },
  {
    id: 'edudojo',
    title: 'Edudojo.ai',
    category: 'Startup',
    subtitle: 'The answer is only part of the work.',
    description:
      'Student-centred learning with questions, revisions, and process journals. AI that challenges students to think.',
    purpose:
      'A finished assignment can hide how much a student understands. Edudojo brings questions, reasoning, and revision into the learning process so teachers can respond to more than the final output.',
    decision:
      'Make the process visible. Questions and process journals give students a way to explain how they arrived at an answer and give teachers context for feedback.',
    state:
      'I’m building Edudojo as its founder. The public site is the place to explore the product and get in touch.',
    steps: ['Ask a question', 'Make an attempt', 'Explain the reasoning', 'Reflect & revise'],
    tags: ['Education', 'Socratic AI', 'Process journals'],
    source: undefined,
    action: 'Visit Edudojo',
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
] as const;
