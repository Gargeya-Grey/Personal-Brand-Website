'use client';

import { useState, useEffect, useRef } from 'react';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Mail, 
  ArrowUpRight, 
  Flame, 
  Eye, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Share2, 
  Check, 
  Copy, 
  Sparkles, 
  FileText,
  User,
  Heart
} from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: number;
  slug: string;
  featured?: boolean;
  categories: string[];
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  takeaways: string[];
  content: React.ReactNode;
  illustrationType: 'diagram1' | 'diagram2' | 'diagram3' | 'diagram4' | 'diagram5' | 'diagram6' | 'diagram7' | 'diagram8';
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [subscribeEmail, setSubscribeEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  // Track scroll position for the interactive text-shine effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto-scroll to top when opening an article
  useEffect(() => {
    if (selectedPostId !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedPostId]);

  // Categories inspired directly by the LangChain blog
  const categoriesList = [
    "All",
    "Case Studies",
    "Deep Agents",
    "LangChain",
    "LangGraph",
    "LangSmith",
    "Newsletter",
    "Observability & Evals",
    "Open Source",
    "Tutorials & How-Tos"
  ];

  // Precise mock articles representing actual LangChain publications
  const articles: Article[] = [
    {
      id: 1,
      slug: "how-rippling-went-ai-native",
      featured: true,
      categories: ["Case Studies", "Deep Agents", "LangSmith"],
      title: "How Rippling Went AI-Native Across Every Product in 6 Months with Deep Agents and LangSmith",
      excerpt: "Analyzing the end-to-end integration of LLM-orchestrated permission handlers, multi-agent compliance pipelines, and automated shadow evaluation processes in active production.",
      author: "Sofia Sulikowski",
      authorRole: "Technical Storyteller @ LangChain",
      authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sofia",
      date: "June 1, 2026",
      readTime: "6 min read",
      illustrationType: "diagram1",
      takeaways: [
        "Rippling integrated deep agents across all payroll, compliance, and user onboarding modules within a single quarter, reducing ticket processing load by 48%.",
        "By enforcing strict typing constraints and structural agent graphs, engineers prevented cascading failures in multi-party approval sequences.",
        "Developing real-time shadow evaluation metrics on LangSmith allowed Rippling to parallel-test update prompts on representative production datasets before making revisions live."
      ],
      content: (
        <div className="space-y-8 font-body text-slate-700 leading-relaxed text-base md:text-lg">
          <p className="font-semibold text-slate-900 text-lg md:text-xl border-l-[6px] border-emerald-500 pl-4 py-1 italic bg-emerald-50/50 pr-4 rounded-r-xl">
            Today, enterprise scale requires teams to move from monolithic prompts to structured, streamable agentic graphs.
          </p>
          <p>
            Rippling specializes in processing hyper-complex administrative workflows: payroll routing, regulatory compliance checks, security policies, and employee onboarding. When their product organization decided to embed generative intelligence, they bypassed standard chatbot sandboxes and constructed a cohesive, system-wide multi-agent mesh.
          </p>
          <div className="space-y-4 pt-4">
            <h3 className="text-2xl font-headline font-extrabold text-slate-900 tracking-tight">
              1. The Multi-Agent Compliance Mesh
            </h3>
            <p>
              Autonomous loops need clear authorization boundaries. In Rippling&apos;s new design, instead of routing raw user inputs to a single all-knowing LLM, inquiries trigger specialized agents operating on restricted DAGs (Directed Acyclic Graphs).
            </p>
            <div className="bg-[#0c1017] border border-slate-800 p-6 rounded-2xl font-mono text-xs text-[#10B981] overflow-x-auto space-y-2">
              <p className="text-gray-500">{"// Initialize strict LangGraph multi-agent compliance handler"}</p>
              <p><span className="text-[#D4FF00]">const</span> complianceGraph = <span className="text-white">new</span> StateGraph(StateSchema)</p>
              <p>&nbsp;&nbsp;.addNode(<span className="text-white">&quot;payrollAgent&quot;</span>, payrollHandler)</p>
              <p>&nbsp;&nbsp;.addNode(<span className="text-white">&quot;complianceGuard&quot;</span>, regulatoryChecker)</p>
              <p>&nbsp;&nbsp;.addEdge(<span className="text-white">&quot;payrollAgent&quot;</span>, <span className="text-white">&quot;complianceGuard&quot;</span>)</p>
              <p>&nbsp;&nbsp;.compile();</p>
            </div>
            <p>
              This compartmentalization ensures that tax queries are processed by a system with strict access to local tax code rules, without exposing core personnel files.
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <h3 className="text-2xl font-headline font-extrabold text-slate-900 tracking-tight">
              2. Closing the Debug Loop with LangSmith
            </h3>
            <p>
              When a stateful connection breaks inside a multi-agent transaction, debugging is extraordinarily challenging without robust lineage tracking. Using LangSmith, Rippling maps the recursive steps taken by every node in the graph, instantly pinning down exactly where an alignment shift occurred.
            </p>
            <p>
              Through custom trace parameters, they track user intent shifts across turns, observing how the model updates memory registers dynamically.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      slug: "introducing-langsmith-engine",
      featured: false,
      categories: ["LangSmith", "Observability & Evals"],
      title: "Introducing LangSmith Engine",
      excerpt: "Replacing the manual cycle of trace analysis. Clustered error reports trace execution chains directly back to your codebase with suggested developer pull requests.",
      author: "Ben Tannyhill",
      authorRole: "Principal Engineer @ LangSmith",
      authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ben",
      date: "May 13, 2026",
      readTime: "5 min read",
      illustrationType: "diagram2",
      takeaways: [
        "LangSmith Engine continuously scans trace telemetry to cluster recurrent failures automatically.",
        "The system drafts target codebase patches based on diagnosed error causes, matching user prompt templates.",
        "Every resolved issue automatically generates custom online evaluators and updates offline evaluation datasets."
      ],
      content: (
        <div className="space-y-8 font-body text-slate-700 leading-relaxed text-base md:text-lg">
          <p className="font-semibold text-slate-800 text-lg md:text-xl border-l-[6px] border-emerald-500 pl-4 py-1 italic bg-emerald-50/50 pr-4 rounded-r-xl">
            Continuous diagnostic feedback mesh. Our new Engine analyzes trace groupings to suggest programmatic resolutions.
          </p>
          <p>
            Since launching LangSmith, our mission has been to give developers visibility into the complex chain of steps their autonomous systems take. Trace viewers let you see what happened; today, we&apos;re launching the next evolution: **LangSmith Engine**, designed to automatically understand *why* it failed and help you deploy fixes.
          </p>
          <div className="space-y-4 pt-4">
            <h3 className="text-2xl font-headline font-extrabold text-slate-900 tracking-tight">
              Automated Error Isolation
            </h3>
            <p>
              Historically, identifying a drift in performance involved parsing hundreds of raw system traces. LangSmith Engine groups these failed transactions continuously. Using advanced embeddings and clustering models, the Engine correlates traces suffering from similar underlying causes—such as context-retrieval latency, semantic hallucination, or routing syntax crashes.
            </p>
            <div className="bg-[#0c1017] border border-slate-800 p-6 rounded-2xl font-mono text-xs text-[#10B981] overflow-x-auto space-y-2">
              <p className="text-gray-500">{"// Sample metadata payload returned by LangSmith Engine diagnostics"}</p>
              <p>&#123;</p>
              <p>&nbsp;&nbsp;<span className="text-[#D4FF00]">&quot;cluster_id&quot;</span>: <span className="text-white">&quot;err_hallucination_v4&quot;</span>,</p>
              <p>&nbsp;&nbsp;<span className="text-[#D4FF00]">&quot;confidence_metric&quot;</span>: <span className="text-white">0.94</span>,</p>
              <p>&nbsp;&nbsp;<span className="text-[#D4FF00]">&quot;context_retrieval_fail&quot;</span>: <span className="text-white">true</span>,</p>
              <p>&nbsp;&nbsp;<span className="text-[#D4FF00]">&quot;suggested_remediation&quot;</span>: <span className="text-white">&quot;Update chunking overlap size in vector pipeline&quot;</span></p>
              <p>&#125;</p>
            </div>
            <p>
              This diagnostics mesh acts as a sentinel guarding production systems, guaranteeing swift alerts and insights when models deviate.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      slug: "we-built-smithdb",
      featured: false,
      categories: ["LangSmith", "Engineering"],
      title: "We built SmithDB, the data layer for agent observability",
      excerpt: "Why standard relational databases face performance bottlenecks when executing recursive analytics across billions of deep, multi-turn agent trace graphs.",
      author: "Ankush Gola",
      authorRole: "VP of Engineering @ LangChain",
      authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=ankush",
      date: "May 13, 2026",
      readTime: "11 min read",
      illustrationType: "diagram3",
      takeaways: [
        "Traditional columnar engines choke when reconstructing stateful, tree-like agent trace spans in real time.",
        "SmithDB introduces custom columnar graph encoding, minimizing JOIN overhead across multi-span turns.",
        "Specialized delta-compression strategies reduce memory footprint by 70%, with sub-100ms recursive trace lookups."
      ],
      content: (
        <div className="space-y-8 font-body text-slate-700 leading-relaxed text-base md:text-lg">
          <p className="font-semibold text-slate-800 text-lg md:text-xl border-l-[6px] border-emerald-500 pl-4 py-1 italic bg-emerald-50/50 pr-4 rounded-r-xl">
             Re-architecting database layers from scratch to support deep, stateful, open-schema telemetry loops.
          </p>
          <p>
            Tracing recursive prompts creates unique data access patterns. Traditional databases are either highly optimized for analytical aggregation (columnar) or relational transaction speeds (row-based). However, LLMs and agent chains communicate in open-ended tree hierarchy spans.
          </p>
          <div className="space-y-4 pt-4">
            <h3 className="text-2xl font-headline font-extrabold text-slate-900 tracking-tight">
              The Trace Span Problem
            </h3>
            <p>
              Every turn in an agent session contains nested child steps: tool calls, vector retrieves, sub-agent evaluations, and response formats. If you try to compile these trees across millions of concurrent users inside standard relational databases, query performance plunges due to complex network-hop JOIN calculations.
            </p>
            <p>
              By encoding trace layers as pre-indexed, continuous delta-compressed structures, SmithDB aggregates analytical metrics instantly. It allows developers to query nested sessions with instantaneous performance, empowering lightning-fast iterations.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      slug: "building-workflows-for-agents",
      featured: false,
      categories: ["Deep Agents", "Open Source", "LangChain"],
      title: "Building workflows for agents with Skills and Interpreters",
      excerpt: "Isolating execution models from raw environments. Implementing sandboxed python nodes in active agent architectures to validate outputs safely.",
      author: "Hunter Lovell",
      authorRole: "Developer Advocate @ LangChain",
      authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=hunter",
      date: "May 29, 2026",
      readTime: "13 min read",
      illustrationType: "diagram4",
      takeaways: [
        "Dynamic tool execution requires dividing planning components from code-sandbox execution containers.",
        "Isolating executing agents prevents prompt injections and server breaches through sandboxed Linux runtime protocols.",
        "Robust execution monitoring pipes stdout/onerror logs directly back to the planning transformer to trigger self-corrected prompts."
      ],
      content: (
        <div className="space-y-8 font-body text-slate-700 leading-relaxed text-base md:text-lg">
          <p className="font-semibold text-slate-800 text-lg md:text-xl border-l-[6px] border-emerald-500 pl-4 py-1 italic bg-emerald-50/50 pr-4 rounded-r-xl">
            Executing code inside secure sandboxes guarantees safe agent calculations.
          </p>
          <p>
            Giving LLMs access to code compilation is incredibly powerful. It changes machines from passive readers to active systems capable of analyzing math models, plotting arrays, and executing scripts. However, it exposes systems to extreme risks unless execution modules are completely sandboxed.
          </p>
          <div className="space-y-4 pt-4">
            <h3 className="text-2xl font-headline font-extrabold text-slate-900 tracking-tight">
              Executing Code Safely: Isolation first
            </h3>
            <p>
              In our secure architecture, runtime tasks are dispatched from the primary Orchestrator to isolated gRPC containers running stateless, read-only interpreters. High-risk actions are mapped onto secure virtual zones. If the executing script fails, stderr messages are routed directly to the transformer, empowering the agent to refactor and retry.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      slug: "may-2026-newsletter",
      featured: false,
      categories: ["Newsletter", "LangChain"],
      title: "May 2026: LangChain Newsletter",
      excerpt: "Catch up on stateful routing, human-in-the-loop triggers, dynamic checkpointer revisions, and native multi-agent system layouts inside LangGraph server.",
      author: "The LangChain Team",
      authorRole: "Community & Editorial",
      authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=newsletter",
      date: "May 27, 2026",
      readTime: "3 min read",
      illustrationType: "diagram5",
      takeaways: [
        "LangGraph Server now directly manages stateful human approval triggers without background state-loss.",
        "Integrated dynamic memory partitions allow teams to fork sessions seamlessly during complex debugging.",
        "Sub-graph execution threads can now be allocated to independent server nodes for efficient parallel scale."
      ],
      content: (
        <div className="space-y-8 font-body text-slate-700 leading-relaxed text-base md:text-lg">
          <p>
            Welcome to the May 2026 edition of the LangChain newsletter! This month, we focus heavily on **Human-In-The-Loop** patterns and **LangGraph Server** scale-revisions.
          </p>
          <p>
            As autonomous agent ecosystems mature, the need for humans to validate critical decisions becomes non-negotiable. Our team has delivered a fully dynamic state-interrupter mesh, making it seamless to halt calculations, query humans in custom UIs, and resume processes from precise state locations.
          </p>
        </div>
      )
    },
    {
      id: 6,
      slug: "how-lyft-built-an-agent-platform",
      featured: false,
      categories: ["Case Studies", "LangGraph", "LangSmith"],
      title: "How Lyft Built an Agent Platform for Customer Support with LangGraph and LangSmith",
      excerpt: "How Lyft orchestrates stateful, multi-agent frameworks to coordinate multi-turn support queries with human-level accuracy and minimal latency.",
      author: "Akshay Sharma",
      authorRole: "Staff Software Engineer @ Lyft",
      authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=akshay",
      date: "May 27, 2026",
      readTime: "10 min read",
      illustrationType: "diagram6",
      takeaways: [
        "Lyft scaled support agent routing using stateful LangGraph node patterns over multiple internal databases.",
        "Average user transaction times decreased by 35% with specialized semantic routing layers.",
        "Automated LangSmith evaluations validate safety guidelines on every model update."
      ],
      content: (
        <div className="space-y-8 font-body text-slate-700 leading-relaxed text-base md:text-lg">
          <p className="font-semibold text-slate-900 text-lg md:text-xl border-l-[6px] border-emerald-500 pl-4 py-1 italic bg-emerald-50/50 pr-4 rounded-r-xl">
            Customer support at scale requires complex state retention over long periods of conversation.
          </p>
          <p>
            Coordinating support queries for millions of active riders and drivers demands high-accuracy responses on the fly. Lyft utilized the stateful graph features of LangGraph to build specialized support sub-agents: refund processing, scheduling adjustments, and safety escalations.
          </p>
          <p>
            Using real-time telemetry from LangSmith, Lyft engineers evaluate models constantly, shielding users from unpredictable transitions or loop errors.
          </p>
        </div>
      )
    },
    {
      id: 7,
      slug: "mission-control-self-hosted",
      featured: false,
      categories: ["LangSmith", "Deployment"],
      title: "Mission Control: Operating Self-Hosted LangSmith on Kubernetes",
      excerpt: "An architectural template for enterprises requiring isolated tracing environments, custom ingress rules, and private keys behind corporate firewalls.",
      author: "Gethin Dibben",
      authorRole: "Technical Infrastructure Lead",
      authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=gethin",
      date: "May 26, 2026",
      readTime: "6 min read",
      illustrationType: "diagram7",
      takeaways: [
        "Scale-isolated Kubernetes setups allow running LangSmith behind strict data-privacy firewalls.",
        "Custom ingress parameters shield tracing keys with end-to-end cloud encryption.",
        "Direct connection templates unify ClickHouse metrics with local monitoring services."
      ],
      content: (
        <div className="space-y-8 font-body text-slate-700 leading-relaxed text-base md:text-lg">
          <p>
            For many enterprise organizations, raw request logs and trace payload data constitute highly sensitive information. In this guide, we lay out the complete production roadmap to deploy and scale self-hosted **LangSmith Engine environments on managed Kubernetes clusters**.
          </p>
          <p>
            Through isolated data architectures, enterprise security groups guarantee that critical communication parameters remain within their designated clouds.
          </p>
        </div>
      )
    },
    {
      id: 8,
      slug: "from-token-streams-to-agent-streams",
      featured: false,
      categories: ["LangChain", "Open Source", "LangGraph"],
      title: "From Token Streams to Agent Streams: Designing better UX",
      excerpt: "Analyzing user-interface paradigms for multi-agent chains. Why raw token characters degrade browser layouts and how dynamic delta event streams preserve structure.",
      author: "Christian Bromann",
      authorRole: "Frontend Lead Engineer",
      authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=christian",
      date: "May 21, 2026",
      readTime: "9 min read",
      illustrationType: "diagram8",
      takeaways: [
        "Streaming raw token streams into web layouts degrades reading stability and interaction designs.",
        "Custom structured delta events align and update nested interface blocks progressively.",
        "Specifying client projections prevents visual flickers and layout shifts as agents execute subtasks."
      ],
      content: (
        <div className="space-y-8 font-body text-slate-700 leading-relaxed text-base md:text-lg">
          <p className="font-semibold text-slate-900 text-lg md:text-xl border-l-[6px] border-emerald-500 pl-4 py-1 italic bg-emerald-50/50 pr-4 rounded-r-xl">
            Modern UI requires structured delta-packets, not character-by-character token streams.
          </p>
          <p>
            When chatbots first arrived, simple output text streaming inside inline message components was completely sufficient. But when multiple agent nodes coordinate in complex recursive loops—planning, updating schemas, calling databases—streaming raw character characters results in severe interface flickering.
          </p>
          <p>
            To provide satisfying, stable visual interactions, frontends should transition from raw token streams to **Agent State Stream structures**, updating complex layouts through modular state projections dynamically.
          </p>
        </div>
      )
    }
  ];

  // Helper to generate futuristic procedural diagrams with light backgrounds and clean layout lines
  const renderIllustration = (type: string, isBig: boolean = false) => {
    const strokeCol = "#10B981"; // Emerald
    const accentCol = "#3b82f6"; // Blue
    const borderCol = "#e2e8f0"; // Light slate border
    const textCol = "#0f172a"; // Dark text
    const bgCol = "#f8fafc"; // Soft background
    const innerCardCol = "#ffffff"; // Card filling
    
    switch (type) {
      case "diagram1":
        return (
          <svg className="w-full h-full min-h-[180px] bg-[#f8fafc] p-8" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" rx="16" fill={bgCol} stroke={borderCol} strokeWidth="1"/>
            <path d="M40 100 H360" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4"/>
            <path d="M40 100 Q 120 40, 200 100 T 360 100" stroke={strokeCol} strokeWidth="3" fill="none" />
            <path d="M40 100 Q 120 160, 200 100 T 360 100" stroke={accentCol} strokeWidth="1.5" fill="none" opacity="0.6"/>
            <circle cx="100" cy="70" r="12" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
            <circle cx="200" cy="100" r="16" fill={innerCardCol} stroke={accentCol} strokeWidth="4"/>
            <circle cx="300" cy="130" r="12" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
            <circle cx="100" cy="70" r="4" fill={strokeCol}/>
            <circle cx="200" cy="100" r="6" fill={accentCol}/>
            <circle cx="300" cy="130" r="4" fill={strokeCol}/>
          </svg>
        );
      case "diagram2":
        return (
          <svg className="w-full h-full min-h-[180px] bg-[#f8fafc] p-8" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" rx="16" fill={bgCol} stroke={borderCol} strokeWidth="1"/>
            <circle cx="200" cy="170" r="14" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
            <path d="M200 156 L100 80 M200 156 L160 80 M200 156 L240 80 M200 156 L300 80" stroke="#cbd5e1" strokeWidth="2"/>
            <circle cx="100" cy="80" r="8" fill={accentCol}/>
            <circle cx="160" cy="80" r="8" fill={strokeCol}/>
            <circle cx="240" cy="80" r="8" fill={strokeCol}/>
            <circle cx="300" cy="80" r="8" fill={accentCol}/>
            <path d="M100 80 Q 200 20, 300 80" stroke={strokeCol} strokeWidth="2" strokeDasharray="3 3" fill="none"/>
          </svg>
        );
      case "diagram3":
        return (
          <svg className="w-full h-full min-h-[180px] bg-[#f8fafc] p-8" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" rx="16" fill={bgCol} stroke={borderCol} strokeWidth="1"/>
            <g transform="translate(60, 40)">
              <rect width="80" height="120" rx="8" fill={innerCardCol} stroke="#cbd5e1" strokeWidth="2"/>
              <line x1="10" y1="30" x2="70" y2="30" stroke={strokeCol} strokeWidth="4"/>
              <line x1="10" y1="65" x2="50" y2="65" stroke="#cbd5e1" strokeWidth="4"/>
              <line x1="10" y1="90" x2="60" y2="90" stroke="#cbd5e1" strokeWidth="4"/>
            </g>
            <g transform="translate(160, 40)">
              <rect width="80" height="120" rx="8" fill={innerCardCol} stroke={strokeCol} strokeWidth="2"/>
              <line x1="10" y1="30" x2="70" y2="30" stroke={accentCol} strokeWidth="4"/>
              <line x1="10" y1="55" x2="60" y2="55" stroke={strokeCol} strokeWidth="4"/>
              <line x1="10" y1="80" x2="70" y2="80" stroke="#cbd5e1" strokeWidth="4"/>
              <line x1="10" y1="100" x2="40" y2="100" stroke="#cbd5e1" strokeWidth="4"/>
            </g>
            <g transform="translate(260, 40)">
              <rect width="80" height="120" rx="8" fill={innerCardCol} stroke="#cbd5e1" strokeWidth="2"/>
              <line x1="10" y1="30" x2="70" y2="30" stroke={strokeCol} strokeWidth="4"/>
              <line x1="10" y1="60" x2="60" y2="60" stroke="#cbd5e1" strokeWidth="4"/>
              <line x1="10" y1="85" x2="40" y2="85" stroke="#cbd5e1" strokeWidth="4"/>
            </g>
          </svg>
        );
      case "diagram4":
        return (
          <svg className="w-full h-full min-h-[180px] bg-[#f8fafc] p-8" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" rx="16" fill={bgCol} stroke={borderCol} strokeWidth="1"/>
            <line x1="50" y1="100" x2="350" y2="100" stroke="#e2e8f0" strokeWidth="2"/>
            <circle cx="90" cy="100" r="25" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
            <circle cx="200" cy="100" r="25" fill={innerCardCol} stroke={accentCol} strokeWidth="3" strokeDasharray="5 2"/>
            <circle cx="310" cy="100" r="25" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
            <path d="M200 65 L200 40 L250 40" stroke={accentCol} strokeWidth="1.5" fill="none"/>
            <text x="90" y="104" fill={textCol} fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Task</text>
            <text x="200" y="104" fill={textCol} fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Run</text>
            <text x="310" y="104" fill={textCol} fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Verify</text>
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full min-h-[180px] bg-[#f8fafc] p-8" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="200" rx="16" fill={bgCol} stroke={borderCol} strokeWidth="1"/>
            <line x1="50" y1="50" x2="350" y2="150" stroke={strokeCol} strokeWidth="2" opacity="0.3"/>
            <line x1="50" y1="150" x2="350" y2="50" stroke="#cbd5e1" strokeWidth="2" opacity="0.3"/>
            <circle cx="200" cy="100" r="30" fill={innerCardCol} stroke={accentCol} strokeWidth="4"/>
            <circle cx="200" cy="100" r="10" fill={strokeCol}/>
          </svg>
        );
    }
  };

  // Filter & Search computation
  const filteredArticles = articles.filter(post => {
    const categoryMatches = selectedCategory === "All" || post.categories.includes(selectedCategory);
    const searchMatches = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatches && searchMatches;
  });

  const featuredPost = articles.find(p => p.featured);
  const regularPosts = filteredArticles.filter(p => !p.featured);

  const activePost = selectedPostId ? articles.find(p => p.id === selectedPostId) : null;

  // Key stats overlay variables
  const insights = [
    { label: "Daily Readers", value: "14,820+" },
    { label: "Total Artifacts", value: "284 Essays" },
    { label: "Weekly Telemetry Flow", value: "1.2B Traces" }
  ];

  const handleCopyLink = () => {
    if (activePost) {
      navigator.clipboard.writeText(window.location.origin + `/blog?id=${activePost.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribeEmail("");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans antialiased relative selection:bg-[#D4FF00] selection:text-black">
      
      {/* Decorative Blueprint Light-Grid and Radial Lighting Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f050_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f050_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Global Navigation Bar */}
      <Navigation />

      {/* Main Container */}
      <div className="relative z-10 pt-36">
        
        {/* Render Single Article Detail Screen */}
        {activePost ? (
          <motion.main 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="px-6 md:px-12 max-w-screen-xl mx-auto w-full pb-32"
          >
            {/* Reading progress bar */}
            <div className="fixed top-0 left-0 right-0 h-[4px] bg-slate-100 z-50">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500" 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
              />
            </div>

            {/* Back to Blog controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-12">
              <button 
                onClick={() => setSelectedPostId(null)}
                className="group flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-800 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm text-sm font-headline tracking-tight transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
                <span>Go back to blog</span>
              </button>
              
              <div className="flex gap-2">
                {activePost.categories.map((c) => (
                  <span key={c} className="font-mono text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Article Structure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
              
              {/* Sticky Sidebar (Left Margin) */}
              <aside className="lg:col-span-3 lg:sticky lg:top-32 space-y-8 order-2 lg:order-1 pt-4">
                
                {/* Author profile card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 relative bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={activePost.authorAvatar} alt={activePost.author} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <p className="text-sm font-headline font-extrabold text-slate-900">{activePost.author}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{activePost.authorRole}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Released</span>
                      <span className="font-semibold text-slate-900">{activePost.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Duration</span>
                      <span className="font-semibold text-emerald-600">{activePost.readTime}</span>
                    </div>
                  </div>
                </div>

                {/* Left controls Table of Contents / Shares */}
                <div className="space-y-4 border-t border-slate-200 pt-6">
                  <p className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-2">QUICK CONTROLS</p>
                  
                  <button 
                    onClick={handleCopyLink}
                    className="flex items-center justify-between w-full p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-semibold text-xs shadow-sm shadow-black/[0.02] hover:shadow-md transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <Copy className="w-4 h-4 text-emerald-500" /> 
                      {copiedLink ? "Link Copied!" : "Copy URL"}
                    </span>
                    {copiedLink && <Check className="w-3.5 h-3.5 text-emerald-505" />}
                  </button>

                  <button 
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border font-semibold text-xs shadow-sm transition-all duration-200 ${
                      liked 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-500/[0.05]' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Heart className={`w-4 h-4 ${liked ? "fill-emerald-500 text-emerald-500" : "text-slate-400"}`} /> 
                      {liked ? "Liked Post" : "Like Article"}
                    </span>
                    <span className="text-slate-400">24</span>
                  </button>
                  
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(activePost.title)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-semibold text-xs shadow-sm shadow-black/[0.02] hover:shadow-md transition-all duration-200"
                  >
                    <Share2 className="w-4 h-4 text-sky-500" /> Share on Twitter
                  </a>
                </div>

              </aside>

              {/* Main Content Area */}
              <div className="lg:col-span-9 space-y-10 order-1 lg:order-2">
                <div className="space-y-6">
                  <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.1]">
                    {activePost.title}
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed font-body">
                    {activePost.excerpt}
                  </p>
                </div>

                {/* Broad visual illustration panel */}
                <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
                  {renderIllustration(activePost.illustrationType, true)}
                </div>

                {/* Key Takeaways Box (From LangChain reference Image 4) */}
                <div className="bg-emerald-50/50 border-l-[6px] border-emerald-500 p-8 sm:p-10 rounded-2xl rounded-l-none space-y-4">
                  <h3 className="font-headline font-extrabold text-emerald-950 text-lg tracking-tight flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" /> Key Takeaways
                  </h3>
                  <ul className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-body">
                    {activePost.takeaways.map((point, index) => (
                      <li key={index} className="flex gap-3 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2.5" />
                        <p>{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Article Content Render */}
                <div className="border-t border-slate-200 pt-8">
                  {activePost.content}
                </div>

                {/* Footer recommendation */}
                <div className="border-t border-slate-200 pt-12 mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                  <div className="space-y-2">
                    <p className="font-headline font-bold text-lg text-slate-900">Finished reading?</p>
                    <p className="text-xs text-slate-500 font-body">Connect with Gargeya Sharma on digital strategy and autonomous pipelines.</p>
                  </div>
                  <button 
                    onClick={() => setSelectedPostId(null)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-xs h-11 px-6 rounded-full tracking-tight transition-all active:scale-95 shadow-md shadow-emerald-600/10"
                  >
                    All Broadcast Articles
                  </button>
                </div>

              </div>
              
            </div>
          </motion.main>
        ) : (
          /* Render Blog Listings Screen */
          <div className="px-6 md:px-12 max-w-screen-2xl mx-auto w-full pb-32">
            
            {/* Header / Brand block (Vibrant design) */}
            <header className="max-w-4xl mb-16 space-y-6">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-600 font-bold block">
                The Engineering Ledger
              </span>
              <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-slate-900 leading-[0.95]">
                Engineering Insights <br/>&amp; <span className="text-emerald-600">Deep Essays</span><span className="text-emerald-500">.</span>
              </h1>
              <p className="font-body text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl pt-2">
                Technical explorations, structural guides, and telemetry dashboards curated by the architect building <span className="font-bold text-slate-900">edudojo.ai</span>.
              </p>
            </header>

            {/* Live stats highlights box */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 border-y border-slate-200/80 py-8">
              {insights.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1 items-start px-4">
                  <span className="text-3xl font-headline font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-bold">{stat.label}</span>
                </div>
              ))}
            </section>

            {/* Horizontal Categorical Navigation Bar + Search controls */}
            <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8 mb-12">
              
              <div className="space-y-4 shrink-0">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold block">FILTER BY TAXONOMY</span>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none max-w-full lg:max-w-3xl -mx-4 px-4 md:mx-0 md:px-0">
                  {categoriesList.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-headline font-semibold border transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-[#D4FF00] border-[#D4FF00] text-black font-extrabold shadow-md shadow-[#D4FF00]/10'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900 shadow-sm'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional Search Block */}
              <div className="space-y-4 lg:w-80">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-bold block">Search Ledger</span>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search articles..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-full font-body text-sm text-slate-800 focus:outline-none focus:border-emerald-500 placeholder-slate-400 transition-colors shadow-sm"
                  />
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

            </section>

            {/* Core Blog List Container */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-200 bg-white rounded-3xl space-y-4 shadow-sm">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-slate-500 font-body">No articles found matching that combination.</p>
                <button 
                  onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                  className="font-headline text-xs text-emerald-600 hover:underline"
                >
                  Reset all criteria
                </button>
              </div>
            ) : (
              <div className="space-y-20">
                
                {/* 1. FEATURED ARTICLE SECTION (Matching style in Image 1) */}
                {selectedCategory === "All" && searchQuery === "" && featuredPost && (
                  <div className="space-y-6">
                    
                    {/* Architectural section dividers containing glowing connectors */}
                    <div className="flex items-center gap-4">
                      <div className="h-[1px] bg-slate-200 flex-grow" />
                      <span className="font-mono text-xs uppercase tracking-[0.25em] text-emerald-600 font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Featured Stories
                      </span>
                      <div className="h-[1px] bg-slate-200 flex-grow" />
                    </div>

                    <div 
                      onClick={() => setSelectedPostId(featuredPost.id)}
                      className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 hover:bg-slate-50/50 hover:border-emerald-500/30 hover:shadow-xl transition-all duration-300"
                    >
                      {/* Left Column detail stack */}
                      <div className="lg:col-span-5 space-y-6">
                        <div className="flex flex-wrap gap-2">
                          {featuredPost.categories.map((c) => (
                            <span key={c} className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                              {c}
                            </span>
                          ))}
                        </div>
                        
                        <h2 className="font-headline text-2xl sm:text-3xl md:text-4.5xl font-extrabold text-slate-900 leading-[1.08] tracking-tight group-hover:text-emerald-600 transition-colors duration-300">
                          {featuredPost.title}
                        </h2>
                        
                        <p className="font-body text-sm sm:text-base text-slate-600 leading-relaxed">
                          {featuredPost.excerpt}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={featuredPost.authorAvatar} alt={featuredPost.author} className="object-cover w-full h-full" />
                            </div>
                            <span className="text-xs font-headline font-bold text-slate-800">{featuredPost.author}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                            <span>{featuredPost.date}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-emerald-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column illustration block */}
                      <div className="lg:col-span-7 h-full w-full rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                        {renderIllustration(featuredPost.illustrationType, true)}
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. RECENT STORIES RECTANGULAR GRID SECTION (Matching layout in Image 2) */}
                <div className="space-y-8">
                  
                  {/* Grid Divider line */}
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] bg-slate-200/80 flex-grow" />
                    <span className="font-mono text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">
                      Recent stories
                    </span>
                    <div className="h-[1px] bg-slate-200/80 flex-grow" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post, idx) => (
                      <article 
                        key={post.id}
                        onClick={() => setSelectedPostId(post.id)}
                        className="group flex flex-col justify-between cursor-pointer bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-emerald-500/30 hover:shadow-xl p-5 rounded-[2rem] transition-all duration-300 shadow-sm"
                      >
                        <div className="space-y-5">
                          
                          {/* Thumbnail schema */}
                          <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative">
                            {renderIllustration(post.illustrationType)}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {post.categories.map((c) => (
                              <span key={c} className="font-mono text-[8px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {c}
                              </span>
                            ))}
                          </div>

                          <h3 className="font-headline text-lg font-bold text-slate-900 leading-snug tracking-tight group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="font-body text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Footer metadata */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-250 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={post.authorAvatar} alt={post.author} className="object-cover w-full h-full" />
                            </div>
                            <span className="text-[11px] font-headline font-bold text-slate-800">{post.author}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                            <span>{post.date}</span>
                            <span className="text-emerald-600 font-semibold">{post.readTime}</span>
                          </div>
                        </div>

                      </article>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* Newsletter input card (Matching Image 3) */}
            <section className="mt-28 border border-slate-200 bg-gradient-to-b from-white to-[#f8fafc] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="max-w-2xl space-y-6">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600 font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500" /> Subscribe
                </span>
                
                <h3 className="font-headline text-2xl md:text-3.5xl font-extrabold text-slate-900 tracking-tight">
                  See what your agent is really doing
                </h3>
                
                <p className="font-body text-slate-600 text-sm md:text-base leading-relaxed">
                  Join Gargeya Sharma&apos;s weekly editorial distribution. Get raw architectural summaries, continuous system analysis, and next-generation agent telemetry updates directly.
                </p>

                {subscribed ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-700 font-headline font-bold text-sm"
                  >
                    Successfully Registered. Thank you for subscribing!
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      placeholder="john.doe@acme.com" 
                      required
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-400 flex-grow text-slate-800 shadow-inner"
                    />
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-sm h-12 px-8 rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 shrink-0 shadow-md shadow-emerald-600/10"
                    >
                      Subscribe <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 font-body">No promotion or tracking. Clear analytical distributions processed securely.</p>
                </div>
              </div>
            </section>

          </div>
        )}

      </div>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
