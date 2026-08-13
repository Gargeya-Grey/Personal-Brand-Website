/** Live growth plan shown at /editorial?workspace=strategy. Edit here as the week changes. */

export const GROWTH_STRATEGY_UPDATED = '13 Aug 2026';

export const GROWTH_HONEST = {
  title: 'Yes. With three watches.',
  body: 'Two sittings, reply first, education as a slice, and writing like a creative writer: one feeling, sentences that hold together, easy enough that people stay and click (I believe this / he is right / I do not like this). Watch leftovers, and review on Sunday.',
};

export const DAILY_COUNTS = [
  { n: '3', label: 'Small tweets', hint: 'Your profile. Make people feel something true.' },
  { n: '4', label: 'Replies', hint: 'Big rooms only. This is how strangers find you.' },
  { n: '2', label: 'Education max', hint: 'School talk is a slice. Not the whole plate.' },
  { n: '7', label: 'Posts total', hint: 'Not 20. Sit twice. Then stop.' },
] as const;

export const SITTINGS = [
  {
    id: 'morning',
    name: 'Morning sitting',
    time: '11:30–12:30 IST',
    why: 'India late morning. Europe waking up.',
    do: ['2 replies on the newest big rooms', '1 small tweet (not education if you already used it)'],
    minutes: 15,
  },
  {
    id: 'evening',
    name: 'Evening sitting',
    time: '19:00–20:30 IST',
    why: 'Your best window. India evening. US morning starting.',
    do: ['2 replies, biggest rooms first', '2 small tweets from two different parts of you'],
    minutes: 20,
  },
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
    id: 'education',
    name: 'Education',
    feel: 'Rare. Sharp.',
    believe: 'How people think, not only the last page. Banner lives here. Cap: 2 a day.',
    example: 'I still want the messy draft someone was brave enough to keep.',
  },
] as const;

export const WEEK_OWN = [
  { day: 'Fri 14', parts: ['AI comfort', 'Care', 'Positivity'] },
  { day: 'Sat 15', parts: ['Optimism', 'Psychology', 'Empathy'] },
  { day: 'Sun 16', parts: ['Rest or self-quote', 'Ethics', 'Self-awareness'] },
  { day: 'Mon 17', parts: ['Self-awareness', 'Care', 'Philosophy'] },
  { day: 'Tue 18', parts: ['Psychology', 'Positivity', 'AI comfort'] },
  { day: 'Wed 19', parts: ['Empathy', 'Ethics', 'One education'] },
] as const;

export const WRITE_RULES = [
  { good: 'One feeling, sentences that hold together.', bad: 'Three tiny full stops. No current.' },
  { good: 'Easy, a little fun, they want to stay.', bad: 'The insult is the loud part. Fine.' },
  { good: 'They think: I believe this / he is right / I do not like this.', bad: 'Okay, next.' },
  { good: 'A take they did not already say.', bad: 'Retell their post. Then lecture.' },
  { good: 'Different part of you than the last tweet.', bad: 'Grade the process, again.' },
] as const;

export const REPLY_OR_QUOTE = {
  default: 'Just reply. Most people never open Quotes. They read the thread.',
  once: 'Once a day, only on a huge still-hot post, you may quote AND reply.',
  never: 'Never paste the same paragraph twice. The reply must be shorter and different.',
};

export const ENTER_ROOMS = [
  'Big, fresh posts still getting likes',
  'AI jobs and fear threads',
  'Psychology, work, customer stories, kindness',
  'Builder rooms where a human take fits',
];

export const SKIP_ROOMS = [
  'Tiny or dead threads',
  'Politics and stocks',
  'Empty hype and follow-begs',
  'Anything you would not say out loud',
];

export const HOW_TO_FOLLOW = [
  { step: '1', title: 'Open To-Do', text: 'The morning or evening pack. Replies first while the room is still moving.' },
  { step: '2', title: 'Skip leftovers', text: 'If a draft feels cold or late, mark Skip. Do not post into a dead thread.' },
  { step: '3', title: 'Then your small tweets', text: 'Two or three from different parts of you. Not three school posts.' },
  { step: '4', title: 'Leave', text: 'Fifteen to twenty minutes. Then close the tab.' },
];
