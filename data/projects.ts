export interface Project {
  id: string;
  title: string;
  description: string;
  image: string; // URL or static path (configured in next.config.ts)
  tags: string[];
  link?: string;
  github?: string;
  category: string;
  role?: string;
}

export const projects: Project[] = [
  {
    id: "edudojo",
    title: "Edudojo.ai",
    description: "AI-driven redesign for evaluation, assessment, and education. Architecting intelligence in learning paradigms from zero to one, scaling to support continuous capability audits.",
    image: "https://picsum.photos/seed/edudojo/800/600",
    tags: ["Next.js", "TypeScript", "AI/LLMs", "Vector Search"],
    link: "https://edudojo.ai",
    category: "Live Venture",
    role: "Founder & Lead Architect"
  },
  {
    id: "smithdb",
    title: "SmithDB Store",
    description: "A lightweight, vector-enabled document store optimized for multi-agent synchronization and extreme low-latency local evaluations. Engineered with localized vector databases.",
    image: "https://picsum.photos/seed/smithdb/800/600",
    tags: ["Rust", "WASM", "SQLite", "Vector Indexing"],
    github: "https://github.com",
    category: "Open Source",
    role: "Creator"
  },
  {
    id: "langsmith-engine",
    title: "Langsmith Execution Engine",
    description: "A high-performance execution engine designed to orchestrate stateful multi-agent communication networks under rigorous latency constraints with distributed state logs.",
    image: "https://picsum.photos/seed/langsmith/800/600",
    tags: ["Go", "gRPC", "Protobuf", "Distributed Systems"],
    link: "#",
    github: "https://github.com",
    category: "AI Infrastructure",
    role: "Lead Systems Engineer"
  }
];
