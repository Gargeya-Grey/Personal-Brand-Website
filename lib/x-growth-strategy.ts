export const GROWTH_STRATEGY_UPDATED = '21 Aug 2026';

export const THESIS = {
  eyebrow: 'The territory',
  title: 'Make human capability visible.',
  statement:
    'Output is cheap. The mind takes work. As AI makes output easier to produce, assessment must get better at seeing reasoning, effort, growth, and judgment.',
  mission:
    'Edudojo exists to make human capability more visible and honestly represented wherever people are judged.',
  principle: 'Broad thesis. Narrow wedge. Specific proof.',
  wedge:
    'For the next 90 days, use education and learning as the primary beachhead. Hiring, work, and other systems are comparisons, not separate niches.',
};

export const GROWTH_HONEST = {
  title: 'Lock this for 90 days.',
  body:
    'Keep the thesis fixed. Change the hooks, examples, formats, and audiences you test. Virality may happen, but the operating plan is becoming known for one important question, not chasing a lucky week.',
};

export const PROFILE_POSITION = {
  line: 'How do we represent human capability honestly when systems increasingly judge us through output?',
  split: 'Replies carry the thesis in useful conversations. Own posts show the beliefs, examples, frameworks, and build evidence that make the thesis memorable.',
  bio: ['Output is cheap. The mind takes work.', 'Writing about thinking, learning & judgment in the AI age.', 'Building Edudojo.'].join('\n'),
  name: 'Gargeya - Edudojo.ai',
  link: 'edudojo.ai',
  pin: 'A belief post or practical framework about process, capability, and assessment. Not a connect post.',
  photo:
    'Keep the face. Drop the painted filter, AirPods, and busy overshirt. Solid dark tee, even light, head and shoulders. Banner: Grade the process, not the submission.',
};

export const AUDIENCE = [
  'Educators and education founders',
  'People designing assessment or learning systems',
  'AI builders concerned with human capability',
  'Thoughtful professionals being judged by automated systems',
] as const;

export const DAILY_COUNTS = [
  { n: '1', label: 'Original post', hint: 'One strong belief, example, framework, or build note.' },
  { n: '3–5', label: 'Thoughtful replies', hint: 'Useful distinctions in relevant conversations. Not approval.' },
  { n: '2 / week', label: 'Edudojo / build posts', hint: 'Specific proof, decisions, experiments, and what you are learning.' },
  { n: '0', label: 'Connect-farm', hint: 'No like-to-connect, generic AI news, or reply grinding.' },
] as const;

export const SITTINGS = [
  {
    id: 'morning',
    name: 'Morning sitting',
    time: '11:30–12:15 IST',
    why: 'Find the live conversations and choose the day’s strongest angle.',
    do: ['1–2 useful replies in the right rooms', 'Draft or publish one original if the idea is ready'],
    minutes: 20,
  },
  {
    id: 'evening',
    name: 'Evening sitting',
    time: '19:00–20:00 IST',
    why: 'India evening and US morning give the second room to contribute.',
    do: ['2–3 replies, each grounded in the real post', 'Publish the original or leave it for tomorrow if it is weak'],
    minutes: 25,
  },
] as const;

export const MORNING_CARD = [
  'Did I publish or deliberately hold one strong original?',
  'Did my replies add a distinction, example, disagreement, or implication?',
  'Was at least one post useful to an educator, builder, or evaluator?',
  'Did the first line work alone?',
  'Did I stop after the sitting?',
] as const;

export const CONTENT_MIX = [
  { id: 'beliefs', name: 'Beliefs', feel: 'Repostable', believe: 'What current assessment gets wrong about people, proxies, output, and capability.', example: 'A correct answer tells you what someone produced. It does not necessarily tell you what they understood.' },
  { id: 'examples', name: 'Examples', feel: 'Recognizable', believe: 'A student, worker, founder, or system being misrepresented makes the abstract problem human.', example: 'A student can submit work they cannot explain. That is a failure of evidence, not only a failure of honesty.' },
  { id: 'frameworks', name: 'Frameworks', feel: 'Saveable', believe: 'Give people practical ways to see reasoning, process, growth, or judgment.', example: 'Ask for drafts, decisions, revisions, and a short defense. Grade the reasoning, not just the polish.' },
  { id: 'build-notes', name: 'Build notes', feel: 'Followable', believe: 'Show what Edudojo is teaching you through product decisions, experiments, and evidence.', example: 'I am testing whether a process record helps a reviewer see capability more clearly than a final submission.' },
] as const;

export const POST_SHAPE = [
  { step: '1', title: 'Observation', text: 'Name something real that people recognize.' },
  { step: '2', title: 'Consequence', text: 'Show what gets misunderstood, lost, or rewarded because of it.' },
  { step: '3', title: 'Response', text: 'Offer a practical move, distinction, or experiment.' },
  { step: '4', title: 'Specific question', text: 'Invite a real experience, disagreement, or addition.' },
] as const;

export const POST_ACTIONS = [
  { action: 'Repost', reason: 'The post expresses a belief people already feel.' },
  { action: 'Save', reason: 'The post gives a useful framework or method.' },
  { action: 'Reply', reason: 'The post opens a dilemma or asks for a real experience.' },
  { action: 'Follow', reason: 'The post shows an ongoing perspective or build journey.' },
] as const;

export const WEEKLY_CADENCE = [
  { label: 'Every day', text: 'One strong original and 3–5 thoughtful replies in relevant rooms.' },
  { label: 'Twice a week', text: 'An Edudojo or building post with specific proof, not a hard sell.' },
  { label: 'Once a week', text: 'One deeper thread only when the idea deserves more room.' },
  { label: 'Once a week', text: 'Review qualified replies, profile visits, link clicks, conversations, and early users.' },
] as const;

export const WEEKLY_CHECK = [
  { item: 'Qualified response', done: 'Which posts earned replies from educators, builders, or evaluators?' },
  { item: 'Follow quality', done: 'Track qualified follows per 1,000 impressions, not follower count alone.' },
  { item: 'Proof', done: 'Did an example, framework, or build note make the thesis concrete?' },
  { item: 'Next test', done: 'Change the hook, example, format, or audience. Keep the mission fixed.' },
] as const;

export const MONTHLY_CHECK = [
  { week: 'Days 1–30', do: 'Establish recognizable language and recurring ideas.' },
  { week: 'Days 31–60', do: 'Identify the two or three angles producing the strongest qualified response.' },
  { week: 'Days 61–90', do: 'Repeat those angles with more concrete Edudojo evidence and early-user conversations.' },
  { week: 'Every Sunday', do: 'Record impressions, qualified follows, profile visits, link clicks, inbound conversations, and early users.' },
] as const;

export const NINETY_DAYS = [
  { range: 'Days 1–30', job: 'Recognition: make the language and question familiar.' },
  { range: 'Days 31–60', job: 'Learning: keep the thesis, narrow into the angles people remember.' },
  { range: 'Days 61–90', job: 'Proof: repeat the best angles and show more of Edudojo in the world.' },
] as const;

export const WRITE_RULES = [
  { good: 'Observation → consequence → response → question.', bad: 'A statement that ends before the reader can do anything with it.' },
  { good: 'One clear action: repost, save, reply, or follow.', bad: 'A vague “what do you think?” after a polished lecture.' },
  { good: 'Concrete people and situations.', bad: '“Everyone” and “the future” with no human evidence.' },
  { good: 'A take that sounds like you.', bad: 'A generic AI-news summary or a second-hand slogan.' },
  { good: 'Specific proof from learning or building.', bad: 'Changing the mission because one week was quiet.' },
  { good: 'Replies talk to the person under their roof.', bad: 'Approval, retelling, or pasting the same assessment sermon everywhere.' },
] as const;

export const REPLY_OR_QUOTE = {
  default: 'Reply when you can add a useful distinction, example, disagreement, or implication. Ground every reply in the real post.',
  once: 'Quote only when your take adds something people cannot get from the original and it still belongs to your territory.',
  never: 'Never use replies as a connect-farm. Never invent a claim, ranking, debate, or source.',
};

export const ENTER_ROOMS = [
  'Educators, education founders, and assessment designers',
  'AI builders thinking about cognition, capability, and human judgment',
  'Conversations about students passing without becoming capable',
  'Professionals being judged by automated systems or compressed proxies',
] as const;

export const SKIP_ROOMS = [
  'Politics, celebrity, stocks, and generic AI news with no capability angle',
  'Tiny or dead threads where you have nothing real to add',
  'Empty hype, follow-begs, and like-to-connect loops',
  'Any room where you would only say “exactly”',
] as const;

export const STOP_FOR_NINETY = [
  'Changing the thesis every time a week is quiet',
  'Trying to speak to everyone interested in AI',
  'Publishing several weak originals instead of one strong one',
  'Turning every post into a lecture about student assessment',
  'Follower-count updates as the main measure of progress',
  'Reply grinding after the two daily sittings',
] as const;

export const HOW_TO_FOLLOW = [
  { step: '1', title: 'Open To-Do', text: 'Choose the morning or evening pack. Use the real source post before replying.' },
  { step: '2', title: 'Find the angle', text: 'Pick one belief, example, framework, or build note that deserves to exist today.' },
  { step: '3', title: 'Make it useful', text: 'Use observation, consequence, response, and a specific question when the format calls for it.' },
  { step: '4', title: 'Review and leave', text: 'Log qualified signals once a week. Do not chase the feed after the sitting.' },
] as const;
