export const CATEGORIES = [
  'Education',
  'AI Architecture',
  'Product',
  'Engineering',
  'Design',
  'Founder Notes',
  'Community',
  'Tutorials & How-Tos',
  'Case Studies',
  'Open Source',
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isValidCategory(category: string): category is Category {
  return (CATEGORIES as readonly string[]).includes(category);
}
