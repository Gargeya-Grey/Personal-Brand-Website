// Personal account supplied by Gargeya; publication links retain their verified sources.
export const journeyChapters = [
  {
    era: 'School → university · 2018',
    title: 'I wanted to do theatre.',
    paragraphs: [
      'Theatre was what I loved at school. My parents encouraged a more secure path, and I already liked science, so I enrolled in computer science, specialising in cybersecurity and forensics. It wasn’t my first choice. But I decided that if I was going to spend years on it, I owed it my best.',
    ],
    label: 'The stage',
    scene: 'stage',
  },
  {
    era: 'The pandemic · A campus in the mountains',
    title: 'An empty campus changed the direction.',
    paragraphs: [
      'Most students had gone home. I stayed near a campus surrounded by mountains, with very few people around and time to explore. I worked through more than a hundred online courses, doing the exercises as well as watching the lectures. Learning became something I chose every day.',
      'Reinforcement learning caught me because I’d always been curious about psychology: here were machines learning from actions and feedback. I watched one course three times before Q-learning began to make sense. I wanted to keep going.',
    ],
    label: 'The mountains',
    scene: 'mountains',
  },
  {
    era: 'By graduation · 2022',
    title: 'Learning turned into work I could share.',
    paragraphs: [
      'Alongside my degree, I taught myself machine learning and deep learning, interned at a startup, and helped my professors with their research. That work led to a computer vision paper and a coauthored book chapter. I also wrote technical articles to help support myself. The subject I hadn’t chosen had become the thing I wanted to spend my days doing.',
    ],
    label: 'First research',
    scene: 'research',
    link: {
      href: '/research',
      label: 'Read the publications',
    },
  },
  {
    era: 'Queen Mary University of London',
    title: 'I wanted to find the gaps.',
    paragraphs: [
      'Self-teaching had taken me a long way. For my MSc in Artificial Intelligence at Queen Mary, I wanted to find what I’d missed and learn alongside people who would challenge me. Moving from a cybersecurity degree into AI wasn’t a straightforward admissions path, but I got there. The coursework and dissertation gave me both a deeper foundation and more confidence in my research.',
    ],
    label: 'London, studying',
    scene: 'study',
    link: {
      href: 'https://github.com/Gargeya-Grey/MSc-Artificial-Intelligence',
      label: 'Explore the academic work',
    },
  },
  {
    era: 'London · Beyond the screen',
    title: 'The other education happened across a bar.',
    paragraphs: [
      'Finding an AI role was harder than I’d hoped. Alongside the search, I worked in hospitality, from VIP lounges at The O2 to running a busy bar in Leicester Square. I learned to approach strangers, listen, manage a team, and stay composed when everything was happening at once.',
      'Those conversations didn’t turn into the job I was looking for. They did change how I relate to people. After years of learning behind a screen, that mattered.',
    ],
    label: 'London, people',
    scene: 'people',
  },
  {
    era: 'Now · Building',
    title: 'Now I’m building around how people learn.',
    paragraphs: [
      'My own path involved choosing a subject, getting stuck, trying again, and finding people who could push me further. Those experiences shape the questions I bring to Edudojo: how can AI help someone develop understanding, and how can a teacher see that progress? I’m building it to make room for questions, revision, and the work behind an answer.',
    ],
    label: 'Building now',
    scene: 'building',
    link: {
      href: '/#currently',
      label: 'See what I’m building',
    },
  },
] as const;
