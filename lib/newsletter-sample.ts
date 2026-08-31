import type { NewsletterWeek } from './newsletter-model';

/** Public landing example when nothing has been sent yet. */
export const SAMPLE_NOTE: Pick<
  NewsletterWeek,
  'weekOf' | 'title' | 'dek' | 'bodyMd' | 'links' | 'slug'
> = {
  weekOf: 'example',
  slug: 'example',
  title: 'Keep the hour the model cannot do',
  dek: 'Homework can look better while the person gets worse at the work. Here is how to use the tool without handing it your mind.',
  links: [
    {
      label: 'AI assistance and persistence (arXiv)',
      url: 'https://arxiv.org/html/2604.04721',
      kind: 'source',
    },
    {
      label: 'RAND: more homework AI, more worry about thinking',
      url: 'https://www.rand.org/pubs/research_reports/RRA4742-1.html',
      kind: 'source',
    },
  ],
  bodyMd: `A student finishes the problem set in twenty minutes. The write-up is clean. The teacher is pleased. Two years later the entrance exam is eighteen to twenty-four percent worse, and nobody is surprised except the gradebook.

> The leak was not "AI in the building." The leak was finishing the easy version of the hour.

## What the numbers actually say

That is not a parable. A large study of secondary students in central China found homework sped up while closed-book exams did not. The kids who used the tool and still sat with the work as long as their classmates did not pay that price.

A 2026 experiment with 1,222 people found that a short stretch of AI help made people more able in the moment, then worse and quicker to quit once the help was gone. Ten minutes was enough.

RAND's youth surveys found homework AI use climbing from 48 percent to 62 percent in 2025. Two thirds of students now say that kind of use will harm critical thinking. They can feel the trade. They still take it, because the assignment rewards the finish.

The interface is built to complete. Learning is built to persist.

## Keep the hour

The technique is rude on purpose.

1. **First pass without the model.** Write the ugly paragraph. Fail the proof. Sit in the confusion for a timed stretch you chose in advance.
2. **Then open the tool.** Ask it to interrogate that draft: where is the hole, what would a skeptical reader say, what should I try next.
3. **Close it.** Do the next pass yourself.
4. **Unassisted check.** Five minutes is enough to find out whether you can still do the thing.

That is not anti-AI. It is how you keep the human part in the loop. Feedback helps when it is a conversation and then a fade, not a servant that never leaves. Stanford's tutoring trials say the same thing from the other side: handing someone an AI tutor is not the same as them using it. Access is cheap. Engagement still needs a person in the room.

## If you teach, hire, or work on yourself

Grade the process you can see. Time on the hard part. A short defense of the work. A version done without the model. A correct answer tells you what got produced. It does not tell you what someone understood.

---

The tool will keep getting better at the assignment. That can be hopeful, if you protect the hour nobody else can do for you. Working on yourself is not an obligation. You can choose not to. But it is a necessity for climbing higher.`,
};
