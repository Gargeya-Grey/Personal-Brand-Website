export const GROWTH_STRATEGY_UPDATED = '29 Sep 2026';

export const THESIS = {
  title: 'How do we become more capable with AI?',
  statement:
    'AI should expand what people can understand, choose, and do. I write about learning, human judgment, and building tools that make that growth real.',
  grounding:
    'Your material is already there: teaching yourself AI, research, learning to work with people, and building Edudojo. Start with learning and building; bring psychology, care, and ethics in through a real situation.',
  audience: 'Write for curious builders and educators who care about what people actually learn.',
} as const;

export const WRITING_LENSES = [
  {
    id: 'learning',
    label: 'Learning',
    question: 'What helped me understand something I could only repeat before?',
    nudge: 'Try a moment from self-teaching, getting stuck, or using AI. What could you explain or do afterwards?',
  },
  {
    id: 'judgment',
    label: 'Judgment',
    question: 'Where did I have to make a choice the tool could not make for me?',
    nudge: 'Name the tradeoff, who it affected, and what changed your mind. A small, honest revision is worth sharing.',
  },
  {
    id: 'building',
    label: 'Building',
    question: 'Which decision in Edudojo could help a learner or teacher become more capable?',
    nudge: 'Show one real screen, experiment, or decision. Explain the reasoning and what remains untested.',
  },
] as const;

export const WRITING_EXERCISE = [
  'What did I actually notice, try, or change?',
  'What does this reveal about learning, judgment, or capability?',
  'Which concrete detail supports my view? What am I still unsure about?',
  'What could someone understand or try because I shared this?',
] as const;

export const POST_CHECK =
  'Read it aloud. Keep the detail that only you could bring. Label opinions and uncertainty honestly. End when the thought is complete; ask a question when you want an answer.';

export const DAILY_PRACTICE =
  'Aim for one useful original and 3–5 thoughtful replies a day. Twice a week, make the original an Edudojo or build note. Hold a weak post.';

export const SITTINGS = [
  { id: 'morning', label: '11:30 IST', minutes: 20, action: 'Choose one real observation. Draft the original and leave 1–2 useful replies.' },
  { id: 'evening', label: '19:00 IST', minutes: 25, action: 'Publish if ready, leave 2–3 replies, and continue worthwhile conversations. Then leave.' },
] as const;

export const REPLY_PRACTICE =
  'Join live conversations with educators and AI builders where you can add an example, a reason, or a useful disagreement. Read the source and respond to their point. Skip applause, pasted takes, and follow-for-follow.';

export const WEEKLY_REVIEW =
  'On Sunday, spend 10 minutes reviewing new followers and substantive replies. Pick two posts worth following up with fresh evidence. Keep the thesis for 90 days; adjust one example, opening, or format at a time.';

export const RESEARCH_NOTES = [
  {
    title: 'Relevance is personal.',
    evidence: 'X’s published feed system predicts each viewer’s response to a post, including attention, replies, follows, and negative feedback.',
    implication: 'Our choice: keep a recognisable question and give the people you want to reach something specific and useful.',
    source: 'Published For You algorithm',
    url: 'https://github.com/xai-org/x-algorithm#scoring-and-ranking',
  },
  {
    title: 'Replies are conversations.',
    evidence: 'X describes reply ranking as dependent on factors such as who the viewer follows and whether the original author has replied.',
    implication: 'Our choice: contribute where you have something to add and return to the conversation. A reply can reach its readers; it does not guarantee wider feed distribution.',
    source: 'X timeline and reply guidance',
    url: 'https://help.x.com/en/using-x/x-timeline',
  },
] as const;

export const RESEARCH_LIMIT =
  'This schedule is a sustainable habit, not an algorithm requirement. Published weights apply to predictions, not raw engagement counts. These sources do not establish a guaranteed growth rate or a universal best posting time. Account analytics have not been audited for this revision.';
