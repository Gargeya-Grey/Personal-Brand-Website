/** Publisher metadata checked against Crossref on 29 September 2026. */
export const publications = [
  {
    id: 'surface-cracks',
    type: 'Journal paper',
    year: '2022',
    title: 'Automatic surface crack detection using segmentation-based deep-learning approach',
    authors: 'Deepa Joshi, Thipendra P. Singh & Gargeya Sharma',
    venue: 'Engineering Fracture Mechanics · Volume 268',
    description:
      'Using image segmentation to trace surface cracks, rather than only enclosing them in a box. The study works with a manually annotated dataset of 3,000 images.',
    doi: '10.1016/j.engfracmech.2022.108467',
    href: 'https://doi.org/10.1016/j.engfracmech.2022.108467',
  },
  {
    id: 'object-detection',
    type: 'Book chapter',
    year: '2022',
    title: 'Object Detection Frameworks and Services in Computer Vision',
    authors: 'Sachi Choudhary, Rashmi Sharma & Gargeya Sharma',
    venue: 'Object Detection with Deep Learning Models · Chapter 2, pp. 23–47 · Chapman & Hall/CRC',
    description:
      'A coauthored chapter in Object Detection with Deep Learning Models: Principles and Applications, focused on frameworks and services for object detection.',
    doi: '10.1201/9781003206736-2',
    href: 'https://doi.org/10.1201/9781003206736-2',
  },
] as const;
