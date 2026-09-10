'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import {
  BookOpen,
  ArrowRight,
  Search,
  Clock,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { renderIllustration } from '@/components/render-illustration';
import { AuthorAvatar } from '@/components/author-avatar';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { Article } from '@/lib/blog-service';
import { CATEGORIES } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';

type JournalListArticle = Omit<Article, 'content' | 'takeaways'> &
  Partial<Pick<Article, 'content' | 'takeaways'>>;

interface JournalClientProps {
  initialArticles: JournalListArticle[];
}

export default function JournalClient({ initialArticles }: JournalClientProps) {
  const [articles] = useState<JournalListArticle[]>(initialArticles);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(9);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  // Handle outside click to close category dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
        dropdownRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Redirect ?id=X parameter to slug-based URLs if visited directly
  useEffect(() => {
    if (articles.length === 0) return;
    const frameId = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');
      if (!idParam) return;
      const id = parseInt(idParam, 10);
      const article = articles.find((a) => a.id === id);
      if (article) {
        window.location.href = `/journal/${article.slug}`;
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [articles]);

  const handleCategoryToggle = (category: string) => {
    setVisibleCount(9);
    if (category === "All") {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev => {
        if (prev.includes(category)) {
          return prev.filter(c => c !== category);
        } else {
          return [...prev, category];
        }
      });
    }
  };

  // Filter, Sort & Search computation (Sorted from latest to oldest date)
  const sortedArticles = useMemo(() => {
    const filtered = articles.filter(post => {
      const categoryMatches = selectedCategories.length === 0 || 
        post.categories.some(c => selectedCategories.includes(c));
      const searchMatches = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatches && searchMatches;
    });

    return [...filtered].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });
  }, [articles, selectedCategories, searchQuery]);

  // Separate featured article (marked as featured: true, or the newest one in the sorted list)
  const featuredPost = useMemo(() => {
    if (sortedArticles.length === 0) return null;
    return sortedArticles.find(a => a.featured) || sortedArticles[0];
  }, [sortedArticles]);

  // Paginated recent stories — exclude the featured hero so it is not duplicated
  const paginatedArticles = useMemo(() => {
    const rest = featuredPost
      ? sortedArticles.filter((a) => a.id !== featuredPost.id)
      : sortedArticles;
    return rest.slice(0, visibleCount);
  }, [sortedArticles, visibleCount, featuredPost]);

  // Dynamic real stats tracking
  const insights = [
    { value: `${articles.length} ${articles.length === 1 ? 'Essay' : 'Essays'}`, label: 'In the journal' },
    { value: `${CATEGORIES.length} Lanes`, label: 'Thesis to craft' },
    { value: 'Long-form', label: 'No hot takes' },
  ];
  // Hero ledger — always the three newest published essays, independent of search/filter.
  const latestThree = useMemo(
    () =>
      [...articles]
        .sort((a, b) => {
          const timeA = a.date ? new Date(a.date).getTime() : 0;
          const timeB = b.date ? new Date(b.date).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 3),
    [articles]
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-surface text-primary antialiased selection:bg-accent/30 selection:text-current">

      {/* Global Navigation Bar */}
      <Navigation />

      {/* Main Container */}
      <main id="page-main" tabIndex={-1} className="relative z-10 mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-24 pb-20 sm:px-6 sm:pt-28 lg:px-10 lg:pb-24 xl:px-12">

        {/* Hero — the journal as a desk, not a bare headline */}
        <section className="home-hero relative isolate grid min-h-[min(72svh,680px)] grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:grid-cols-12 lg:gap-12 lg:px-14 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 space-y-7 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-7"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Journal · {articles.length} {articles.length === 1 ? 'essay' : 'essays'}
            </p>

            <div className="max-w-2xl">
              <p className="mb-4 font-label text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                Essays &amp; build logs
              </p>
              <h1 className="font-display text-[clamp(2.6rem,6.5vw,4.9rem)] font-medium leading-[0.98] tracking-[-0.045em] text-primary dark:text-white">
                Longer thinking on <span className="text-accent">systems and craft.</span>
              </h1>
            </div>

            <p className="max-w-xl font-body text-[1.05rem] leading-[1.65] text-on-surface-variant dark:text-white/70 sm:text-lg">
              Some ideas need evidence and room, so I work them out here at full length —
              systems, AI, and the craft of building. If you want the short version, Notes
              lands one argument every Sunday evening.
            </p>

            <div className="grid max-w-xl grid-cols-2 gap-5 border-t border-slate-900/[0.12] pt-5 dark:border-white/15">
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Long-form
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  Essays + build logs
                </p>
              </div>
              <div>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">
                  Short-form
                </p>
                <p className="mt-1 font-headline text-sm font-bold text-primary/90 dark:text-white/90 sm:text-base">
                  Notes, every Sunday
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <a
                href="#essays"
                className="btn-accent h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-extrabold tracking-tight"
              >
                Start reading <ArrowRight className="btn-icon h-4 w-4" />
              </a>
              <Link
                href="/notes"
                className="home-hero-secondary h-12 shrink-0 whitespace-nowrap rounded-2xl px-5 font-headline text-sm font-bold tracking-tight"
              >
                Try the Sunday letter <ArrowRight className="btn-icon h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
              <a href="#essays" className="transition-colors hover:text-accent">
                Essays ↓
              </a>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60" />
              <a href="#subscribe" className="transition-colors hover:text-accent">
                Get Notes
              </a>
            </div>
          </motion.div>

          {/* Artifact — open ledger: latest entries + lane index */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none lg:col-span-5"
          >
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-900/[0.1] bg-white shadow-[0_28px_68px_-34px_rgba(0,0,0,0.4)] dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3 border-b border-slate-900/[0.08] px-5 py-3.5 dark:border-white/10">
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                  </div>
                  <p className="flex min-w-0 items-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="truncate">Journal — open ledger</span>
                  </p>
                  <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-accent">
                    {articles.length}
                  </span>
                </div>

                <div className="space-y-2.5 p-5 sm:p-6">
                  {latestThree.length > 0 ? latestThree.map((post, i) => (
                    <Link
                      key={post.id}
                      href={`/journal/${post.slug}`}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-900/[0.06] bg-slate-50/70 p-3.5 transition-colors hover:border-accent/30 hover:bg-accent/[0.05] dark:border-white/[0.07] dark:bg-white/[0.03]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-mono text-[11px] font-bold text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-headline text-sm font-bold text-primary group-hover:text-accent">
                          {post.title}
                        </span>
                        <span className="block truncate font-body text-xs text-on-surface-variant">
                          {post.date} · {post.readTime}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                    </Link>
                  )) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center font-body text-sm text-on-surface-variant dark:border-white/15">
                      First essays are on the desk — check back soon.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-slate-900/[0.08] px-5 py-4 dark:border-white/10">
                  {CATEGORIES.slice(0, 5).map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-slate-200/70 px-2.5 py-1 font-label text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant dark:border-white/10"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute -right-2 top-10 hidden rotate-2 rounded-full border border-slate-900/[0.08] bg-white px-3.5 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-primary shadow-lg sm:block dark:border-white/10 dark:bg-slate-900 dark:text-white">
                Long-form desk
              </div>
              <div className="absolute -left-2 bottom-16 hidden -rotate-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-label text-[10px] font-bold uppercase tracking-[0.14em] text-accent shadow-lg backdrop-blur-sm sm:block">
                Searchable archive
              </div>
            </div>
          </motion.div>
        </section>

        {/* Proof strip */}
        <section className="py-14 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {insights.map((stat, i) => (
              <div key={stat.label} className="board-card group flex h-32 flex-col justify-between rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <span className="text-2xl md:text-3xl font-headline font-medium text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  {i === 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                </div>
                <span className="text-[16px] font-label uppercase tracking-widest text-slate-400 group-hover:text-accent font-bold transition-colors">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

          {/* Filter & Search Bar Area — sticky instrument, not a loose row */}
          <section id="essays" className="sticky top-24 z-30 mb-12 scroll-mt-32 sm:mb-14">
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-[1.5rem] border border-white/50 bg-white/55 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl md:flex-row md:items-center dark:border-white/10 dark:bg-white/[0.04]">
            {/* Search Input Widget */}
            <div className="relative flex-grow md:max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search headlines, keywords, or topics..."
                aria-label="Search articles"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(9);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-10 text-base text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:border-accent focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setVisibleCount(9);
                  }}
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Custom Interactive Multi-Select Category Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label="Filter by categories"
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:text-white/85 md:w-64"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  {selectedCategories.length === 0
                    ? "All Categories"
                    : `${selectedCategories.length} selected`}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 space-y-1 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <button
                    role="option"
                    aria-selected={selectedCategories.length === 0}
                    onClick={() => {
                      handleCategoryToggle("All");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-headline font-bold transition-all flex items-center justify-between ${
                      selectedCategories.length === 0
                        ? 'bg-accent/10 text-accent font-extrabold'
                        : 'text-slate-600 dark:text-white/70 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <span>All Categories</span>
                    {selectedCategories.length === 0 && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </button>

                  <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

                  <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
                    {CATEGORIES.map((c) => {
                      const active = selectedCategories.includes(c);
                      return (
                        <button
                          key={c}
                          role="option"
                          aria-selected={active}
                          onClick={() => handleCategoryToggle(c)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-headline font-bold transition-all flex items-center justify-between ${
                            active
                              ? 'bg-accent/10 text-accent font-extrabold'
                              : 'text-slate-600 dark:text-white/70 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white'
                          }`}
                        >
                          <span>{c}</span>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            </div>
          </section>

          {/* Results Listings Content — single rhythm: featured, grid, closing */}
          {sortedArticles.length === 0 ? (
            <div className="board-card mx-auto max-w-xl space-y-6 rounded-[2.5rem] p-8 py-24 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-headline font-bold text-xl text-slate-800 dark:text-white">No posts match your filters</h3>
              <p className="font-body text-slate-500 dark:text-white/60 max-w-md mx-auto text-sm leading-relaxed">
                Try a different category mix or clear search to see everything again.
              </p>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSearchQuery("");
                  setVisibleCount(9);
                }}
                className="bg-accent text-primary dark:text-primary-container hover:bg-accent/90 font-headline font-bold text-xs h-10 px-6 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-16 lg:space-y-20">
              
              {/* 1. DYNAMIC FEATURED HERO SECTION */}
              {featuredPost && selectedCategories.length === 0 && searchQuery === "" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="font-label text-xs uppercase tracking-[0.25em] text-accent font-bold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      Featured Stories
                    </span>
                    <div className="h-[1px] bg-emerald-500/25 dark:bg-white/10 flex-grow" />
                  </div>

                  <Link 
                    href={`/journal/${featuredPost.slug}`}
                    aria-label={`Featured story: ${featuredPost.title}`}
                    className="board-card group grid grid-cols-1 items-center gap-8 rounded-[2.5rem] p-6 md:p-8 lg:grid-cols-12"
                  >
                    {/* Left Column detail stack */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {featuredPost.categories.map((c) => (
                          <span key={c} className="font-label text-[11px] uppercase tracking-wider font-[520] dark:font-[480] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-400/20 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)]">
                            {c}
                          </span>
                        ))}
                      </div>
                      
                      <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white leading-[1.08] tracking-tight group-hover:text-accent transition-colors duration-300">
                        {featuredPost.title}
                      </h2>
                      
                      <p className="font-body text-sm sm:text-base text-slate-600 dark:text-white/70 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>

                      <div className="flex flex-col items-start gap-3 border-t border-emerald-500/10 pt-6 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2.5">
                          <AuthorAvatar
                            src={featuredPost.authorAvatar || siteConfig.authorAvatar}
                            name={featuredPost.author || siteConfig.name}
                            size="md"
                          />
                          <span className="text-xs font-label font-bold text-slate-800 dark:text-white/80">
                            {featuredPost.author || siteConfig.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-label">
                          <span>{featuredPost.date}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <span className="text-accent flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column illustration block */}
                    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner dark:border-white/10 dark:bg-slate-900/80 lg:col-span-7 lg:h-full lg:min-h-[22rem]">
                      {featuredPost.illustrationType === 'cover' && featuredPost.coverImage ? (
                        <Image
                          src={featuredPost.coverImage}
                          alt={featuredPost.title}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 55vw"
                          className="object-cover"
                        />
                      ) : (
                        renderIllustration(featuredPost.illustrationType === 'cover' ? 'diagram1' : featuredPost.illustrationType, true)
                      )}
                    </div>

                  </Link>
                </div>
              )}

              {/* 2. RECENT STORIES RECTANGULAR GRID SECTION */}
              <div className="space-y-12">
                
                {/* Grid Divider line */}
                <div className="flex items-center gap-4">
                  <div className="h-[1px] bg-emerald-500/25 dark:bg-white/10 flex-grow" />
                  <span className="font-label text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">
                    Recent stories
                  </span>
                  <div className="h-[1px] bg-emerald-500/25 dark:bg-white/10 flex-grow" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedArticles.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full"
                    >
                      <Link 
                        href={`/journal/${post.slug}`}
                        aria-label={`Read essay: ${post.title}`}
                        className="board-card group flex h-full flex-col justify-between rounded-[2rem] p-5"
                      >
                        <div className="space-y-5">
                          
                          {/* Thumbnail schema */}
                          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner dark:border-white/10 dark:bg-slate-900/80">
                            {post.illustrationType === 'cover' && post.coverImage ? (
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover"
                              />
                            ) : (
                              renderIllustration(post.illustrationType === 'cover' ? 'diagram1' : post.illustrationType)
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {post.categories.map((c) => (
                              <span key={c} className="font-label text-[10px] uppercase tracking-wider font-[520] dark:font-[480] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-400/20 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)]">
                                {c}
                              </span>
                            ))}
                          </div>

                          <h3 className="font-headline text-xl font-semibold text-slate-900 dark:text-white leading-snug tracking-tight group-hover:text-accent transition-colors duration-300 line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="font-body text-sm text-slate-600 dark:text-white/70 leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Footer metadata */}
                        <div className="mt-6 flex flex-col items-start gap-3 border-t border-emerald-500/10 pt-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <AuthorAvatar
                              src={post.authorAvatar || siteConfig.authorAvatar}
                              name={post.author || siteConfig.name}
                              size="sm"
                            />
                            <span className="text-xs font-label font-bold text-slate-800 dark:text-white/80">
                              {post.author || siteConfig.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-label text-slate-500">
                            <span>{post.date}</span>
                            <span className="text-accent font-semibold">{post.readTime}</span>
                          </div>
                        </div>

                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls block */}
                <div className="flex flex-col items-center gap-4 border-t border-slate-200/50 pt-10 dark:border-white/10">
                  <p className="font-label text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
                    Showing {Math.min(visibleCount, sortedArticles.length)} of {sortedArticles.length} posts
                  </p>
                  
                  {sortedArticles.length > visibleCount && (
                    <button
                      onClick={handleLoadMore}
                      className="btn-accent group relative flex h-12 cursor-pointer items-center justify-center gap-2.5 px-10 font-headline text-xs font-bold rounded-2xl"
                    >
                      <span>Load More Stories</span>
                      <ArrowRight className="btn-icon w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Closing — the short version lives in Notes */}
          <section id="subscribe" className="scroll-mt-32">
            <div className="cta-card-gradient relative overflow-hidden rounded-[2rem] p-6 sm:p-10 md:rounded-[2.5rem] md:p-14">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-6">
                  <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    Sunday evening
                  </span>
                  <h2 className="cta-card-heading mt-3 font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] sm:text-4xl">
                    Prefer the short version?
                  </h2>
                  <p className="cta-card-copy mt-4 max-w-md font-body text-base leading-relaxed">
                    Notes is one argument a week on the mind, learning with AI, and what we
                    actually score. Not a recap of the journal — the desk notes, distilled.
                  </p>
                  <div className="mt-8">
                    <Link
                      href="/notes"
                      className="project-link rounded-sm font-headline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span>See how a letter looks</span>
                      <ArrowRight className="btn-icon h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="lg:col-span-6">
                  <div className="rounded-[1.5rem] border border-slate-900/[0.08] bg-white/70 p-5 backdrop-blur-sm sm:p-7 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="font-headline text-lg font-bold text-primary">Get Notes weekly</p>
                    <p className="mt-1.5 mb-5 font-body text-sm text-on-surface-variant">
                      Free · Sunday 19:00 in your timezone · unsubscribe anytime.
                    </p>
                    <NewsletterSignup source="journal-closing" variant="light" />
                  </div>
                </div>
              </div>
            </div>
          </section>

      </main>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
