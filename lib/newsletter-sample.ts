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

That is not a parable. It is what a large study of secondary students in central China found when homework sped up and closed-book exams did not. The kids who used the tool and still sat with the work as long as their classmates did not pay that price. The leak was not "AI in the building." The leak was finishing the easy version of the hour.

I keep seeing the same split in smaller rooms. A 2026 experiment with 1,222 people found that a short stretch of AI help made people more able in the moment, then worse and quicker to quit once the help was gone. Ten minutes was enough. RAND's youth surveys found homework AI use climbing from 48 percent to 62 percent in 2025, and two thirds of students now say that kind of use will harm critical thinking. They can feel the trade. They still take it, because the assignment rewards the finish.

If you are trying to learn with the tool, that is the whole problem in one picture. The interface is built to complete. Learning is built to persist.

So the technique is rude on purpose.

Do the first pass without the model. Write the ugly paragraph, fail the proof, sit in the confusion for a timed stretch you chose in advance. Then open the tool and ask it to interrogate that draft: where is the hole, what would a skeptical reader say, what should I try next. Then close it and do the next pass yourself. End with an unassisted check, even if it is only five minutes, so you find out whether you can still do the thing.

That is not anti-AI. It is how you keep the human part in the loop. Feedback can help self-regulation when it is a conversation and then a fade, not a servant that never leaves. Stanford's tutoring trials are a reminder in the other direction too: handing someone an AI tutor is not the same as them using it. Access is cheap. Engagement still needs a person in the room.

If you teach, or you hire, or you are just trying not to hollow out your own skill, grade the process you can see. Time on the hard part. A short defense of the work. A version done without the model. A correct answer tells you what got produced. It does not tell you what someone understood.

The tool will keep getting better at the assignment. That can be hopeful, if you protect the hour nobody else can do for you. Working on yourself is not an obligation. You can choose not to. But it is a necessity for climbing higher.`,
};
