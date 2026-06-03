export const CATEGORIES = [
  "Case Studies",
  "Deep Agents",
  "LangChain",
  "LangGraph",
  "LangSmith",
  "Newsletter",
  "Observability & Evals",
  "Open Source",
  "Tutorials & How-Tos",
  "Engineering",
  "Deployment"
] as const;

export type Category = typeof CATEGORIES[number];

export function isValidCategory(category: string): category is Category {
  return CATEGORIES.includes(category as any);
}
