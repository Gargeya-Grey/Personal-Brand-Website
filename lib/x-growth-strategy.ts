/**
 * Dashboard copy for /editorial?workspace=strategy.
 * The scout does not read this file.
 * Owner edits data/gargeya-voice.md (single brief).
 */

export const GROWTH_STRATEGY_UPDATED = '19 Aug 2026';

export const GROWTH_HONEST = {
  title: 'Lock this for 90 days.',
  body: 'Replies carry the thesis in other people\'s rooms. Own tweets show the rest of you. Sit twice, pick, stop. 10k is stretch. Views and people who come back are what you control. Do not change the niche because a week felt quiet.',
};

export const PROFILE_POSITION = {
  line: 'How people think, learn, and decide when AI can already produce the answer.',
  split: 'Replies = process, offloading, assessment, judgment. Own tweets = the rest of you.',
  bio: `Building Edudojo — AI that grades how you think, not what you submit.
How humans learn and decide when answers are already cheap.`,
  name: 'Gargeya - Edudojo.ai',
  link: 'edudojo.ai',
  pin: 'One belief post about process vs output. Never a connect post.',
  photo:
    'Keep the face. Drop the painted filter, AirPods, and busy overshirt. Solid dark tee, even light, head and shoulders. Banner: Grade the process, not the submission.',
};

export const DAILY_COUNTS = [
  { n: '3', label: 'Small tweets', hint: 'The rest of you. Profile they land on.' },
  { n: '4', label: 'Replies', hint: 'Think / learn / judge / offload rooms only. Not 15–25.' },
  { n: '0', label: 'Connect-farm', hint: 'No like-to-connect. No generic AI news quotes.' },
  { n: '7', label: 'Posts total', hint: 'Not 20. Sit twice. Then stop.' },
] as const;

export const SITTINGS = [
  {
    id: 'morning',
    name: 'Morning sitting',
    time: '11:30–12:30 IST',
    why: 'India late morning. Europe waking up.',
    do: ['2 replies in think / learn / judge / offload rooms', '1 small tweet from the rest of you'],
    minutes: 15,
  },
  {
    id: 'evening',
    name: 'Evening sitting',
    time: '19:00–20:30 IST',
    why: 'Your best window. India evening. US morning starting.',
    do: ['2 replies, biggest on-thesis rooms first', '2 small tweets from two different non-school parts of you'],
    minutes: 20,
  },
] as const;

export const MORNING_CARD = [
  'Did I use the sitting (or skip on purpose)?',
  'Were replies about thinking / learning / judgment, not news or connect-farm?',
  'Were own tweets a person, not a second lecture?',
  'Did the first line work alone?',
  'Did I stop after the sitting?',
] as const;

export const PERSONALITY = [
  {
    id: 'self-awareness',
    name: 'Self-awareness',
    feel: 'A quiet mirror',
    believe: 'Notice yourself before you perform.',
    example: 'You can be tired and still be honest with yourself. Those are not opposites.',
  },
  {
    id: 'psychology',
    name: 'Psychology',
    feel: 'Oh. That is me.',
    believe: 'Why we flinch, freeze, copy, people-please. Plain words. Not a textbook.',
    example: 'Most of us are not lazy. We are scared of looking stupid.',
  },
  {
    id: 'care',
    name: 'Sales and care',
    feel: 'Warm. Practical.',
    believe: 'You served people in London. Selling is taking care of someone, not tricking them.',
    example: 'The guest does not remember your script. They remember if you wanted them to be okay.',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    feel: 'They exhale.',
    believe: 'Tomorrow can be better without lying about today.',
    example: 'You do not have to be certain to take the next kind step.',
  },
  {
    id: 'positivity',
    name: 'Positivity',
    feel: 'They want more of this person.',
    believe: 'People should feel a bit better about themselves after reading you. Not fake sunshine. Real warmth.',
    example: 'You are allowed to be proud of a quiet win. The world will not clap. You still get to feel it.',
  },
  {
    id: 'ethics',
    name: 'Ethics and values',
    feel: 'Spine, not sermon.',
    believe: 'Do not fake it. Do not crush people to win. Keep promises.',
    example: 'Winning is cheap if you have to dislike yourself after.',
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    feel: 'One thought they keep.',
    believe: 'What a good life and good work look like when machines are fast.',
    example: 'Speed is easy to buy. Judgment still has to be practiced.',
  },
  {
    id: 'empathy',
    name: 'Empathy',
    feel: 'Soft. Not soggy.',
    believe: 'See the person in front of you.',
    example: 'If they are scared, start there. Do not start with a lesson.',
  },
  {
    id: 'ai-comfort',
    name: 'AI comfort',
    feel: 'A hand on the shoulder.',
    believe: 'Fear of jobs and of the world flipping is real. You do not mock it. The easy part of the job may move. Judgment, care, and taste are still yours to practice.',
    example: 'If a tool can do the easy version of your job, the human part is still the human part.',
  },
  {
    id: 'access',
    name: 'Access',
    feel: 'Glad. Inclusive. Brave.',
    believe: 'You love open models. People should take the same weights and improve them. Cyber defense on an open model helps people safeguard themselves, instead of relying on closed labs that slip their sandboxes. Open + cyber is good, never scary.',
    example: 'If cyber defense lives in an open model, more of us can actually protect ourselves.',
  },
  {
    id: 'education',
    name: 'Education',
    feel: 'Rare. Sharp.',
    believe: 'How people think, not only the last page. Banner lives here. Cap: 2 a day, and only as replies unless a sitting is short.',
    example: 'I still want the messy draft someone was brave enough to keep.',
  },
] as const;

export const WEEK_OWN = [
  { day: 'Mon', parts: ['Self-awareness', 'Care', 'Philosophy'] },
  { day: 'Tue', parts: ['Psychology', 'Positivity', 'AI comfort'] },
  { day: 'Wed', parts: ['Empathy', 'Ethics', 'Access'] },
  { day: 'Thu', parts: ['Care', 'Optimism', 'Philosophy'] },
  { day: 'Fri', parts: ['AI comfort', 'Psychology', 'Positivity'] },
  { day: 'Sat', parts: ['Optimism', 'Empathy', 'Access'] },
  { day: 'Sun', parts: ['Rest or self-quote', 'Ethics', 'Self-awareness'] },
] as const;

export const WEEKLY_CHECK = [
  { item: 'Sittings used', done: 'To-Do posted or skipped on purpose. Not ignored.' },
  { item: 'Own-tweet mix', done: 'Not three school posts in a row.' },
  { item: 'Thread', done: 'Optional. Only if one idea already wants 8 lines. Never force it.' },
  { item: 'Sunday 15 min', done: 'Views over 1k and 5k. Off-thesis posts to never repeat. Followers last.' },
] as const;

export const MONTHLY_CHECK = [
  { week: 'Week 1', do: 'Repeat the shape that got views. Not a new topic.' },
  { week: 'Week 2', do: 'Optional: one “this is what I believe” post.' },
  { week: 'Week 3', do: 'One specific Edudojo / process moment. No hard sell.' },
  { week: 'End', do: 'Score views and quotes. Do not redesign the niche.' },
] as const;

export const NINETY_DAYS = [
  { range: 'Days 1–30', job: 'Same position every day. Recognition, not 10k.' },
  { range: 'Days 31–60', job: 'Hope for one take people quote. Still the same position.' },
  { range: 'Days 61–90', job: 'Stay put so new people can binge.' },
] as const;

export const WRITE_RULES = [
  { good: 'First line works alone.', bad: 'A throat-clear, then the idea on line three.' },
  { good: 'One feeling, sentences that hold together.', bad: 'Three tiny full stops. No current.' },
  { good: 'Easy, a little earnest, they want to stay.', bad: 'The insult is the loud part. Fine.' },
  { good: 'They think: I believe this / he is right / I do not like this.', bad: 'Okay, next.' },
  { good: 'A take they did not already say.', bad: 'Retell their numbers. Then a slogan. Or “interesting.”' },
  { good: 'Different part of you than the last tweet.', bad: 'Grade the process, again, as an original.' },
] as const;

export const REPLY_OR_QUOTE = {
  default: 'Just reply. Most people never open Quotes. They read the thread.',
  once: 'Quote only if you add a take they cannot get from the original, and it is still on thinking / learning / judgment.',
  never: 'Never paste the same paragraph twice. Never quote generic AI news with almost no take.',
};

export const ENTER_ROOMS = [
  'How people think, learn, judge, work, and live with cheap intelligence',
  'Cognitive offloading: AI doing the homework, the deck, the first thought',
  'Assessment, teaching, and whether they sat with the work',
  'Founders, agency, AI anxiety, open tools, when they change how people decide',
];

export const SKIP_ROOMS = [
  'Tiny or dead threads',
  'Politics, stocks, sports-admin, evening-shift honesty',
  'Empty hype, follow-begs, like-to-connect',
  'Generic model/pricing news with no cognition angle',
  'Anything you would not say out loud',
];

export const STOP_FOR_NINETY = [
  'Quote-tweeting news with “interesting”',
  'Like / comment to connect',
  'Follower-count updates',
  'Switching topics every few days',
  'More than the sitting, unless every extra post is strong',
  '15–25 replies a day as a grind',
];

export const HOW_TO_FOLLOW = [
  { step: '1', title: 'Open To-Do', text: 'The morning or evening pack. Replies first while the room is still moving.' },
  { step: '2', title: 'Skip leftovers', text: 'If a draft feels cold or late, mark Skip. Do not post into a dead thread.' },
  { step: '3', title: 'Then your small tweets', text: 'Two or three from different parts of you. Not three school posts.' },
  { step: '4', title: 'Leave', text: 'Fifteen to twenty minutes. Then close the tab.' },
];
