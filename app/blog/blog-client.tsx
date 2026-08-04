'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { 
  BookOpen, 
  ArrowRight, 
  Search, 
  Mail, 
  Clock, 
  ChevronDown, 
  Filter, 
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { renderIllustration } from '@/components/render-illustration';
import { AuthorAvatar } from '@/components/author-avatar';
import { Article } from '@/lib/blog-service';
import { CATEGORIES } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';

type BlogListArticle = Omit<Article, 'content' | 'takeaways'> &
  Partial<Pick<Article, 'content' | 'takeaways'>>;

interface BlogClientProps {
  initialArticles: BlogListArticle[];
}

export default function BlogClient({ initialArticles }: BlogClientProps) {
  const [articles] = useState<BlogListArticle[]>(initialArticles);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [subscribeEmail, setSubscribeEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [subscribeError, setSubscribeError] = useState('');
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
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (!idParam) return;
    const id = parseInt(idParam, 10);
    const article = articles.find((a) => a.id === id);
    if (article) {
      window.location.href = `/blog/${article.slug}`;
    }
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setSubscribeError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail.trim(), source: 'blog' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubscribeError(data.error || 'Subscribe failed. Please try again.');
        return;
      }
      if (data.delivery === 'local') {
        setSubscribeError(
          data.message ||
            'Saved only locally. Set a valid RESEND_API_KEY to sync to Resend.'
        );
        return;
      }
      setSubscribed(true);
      setTimeout(() => {
        setSubscribeEmail('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setSubscribeError('Network error. Please try again.');
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

    return filtered.sort((a, b) => {
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
    { value: "Deep Dives", label: "On Curious Themes" },
    { value: "Unfiltered", label: "Personal Vantage" },
    { value: `${articles.length} Musings`, label: "And Counting" },
  ];

  return (
    <div className="min-h-screen bg-surface text-primary antialiased relative selection:bg-accent/30 selection:text-current">

      {/* Global Navigation Bar */}
      <Navigation />

      {/* Main Container */}
      <main id="page-main" tabIndex={-1} className="relative z-10 pt-28 sm:pt-36 lg:pt-44">
        
        {/* Render Blog Listings Screen */}
        <div className="mx-auto w-full max-w-screen-2xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-10 lg:pb-32 xl:px-12">
          
          {/* Hero Layout Grid */}
          <div className="mb-12 grid grid-cols-1 items-center gap-10 sm:mb-16 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            
            {/* Left Column: Brand & Copy */}
            <div className="space-y-6">
              <span className="font-label text-xs uppercase tracking-[0.25em] text-accent font-bold block">
                Personal writing
              </span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-slate-900 dark:text-white">
                Notes, opinions <br/>&amp; <span className="text-emerald-600 dark:text-accent">useful finds</span><span className="text-emerald-500">.</span>
              </h1>
              <p className="font-body text-lg md:text-xl text-slate-600 dark:text-white/70 leading-relaxed max-w-xl">
                This is my personal blog — whatever I want to write. Systems and AI when they matter, but also opinions, travel notes, craft, and anything else I find useful. Use the filters below if you&apos;re hunting a specific lane.
              </p>
            </div>

            {/* Right Column: Interactive Telemetry Visualizer */}
            <div className="relative flex h-[210px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-xl backdrop-blur-xl dark:border-white/[0.05] dark:bg-slate-900/40 sm:h-[240px] sm:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)] blur-2xl" />
              <div className="w-full h-full max-w-sm flex items-center justify-center">
                {(() => {
                  try {
                    return renderIllustration("digital-ledger", true);
                  } catch (e) {
                    return (
                      <div className="text-xs text-slate-400 font-mono">
                        Illustration failed to load
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

          </div>

          {/* Metrics Tiles Grid */}
          <section className="mb-12 grid grid-cols-1 gap-4 sm:mb-16 sm:grid-cols-3 sm:gap-6">
            {insights.map((stat, i) => (
              <div key={i} className="board-card group flex h-32 flex-col justify-between rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-2xl md:text-3xl font-headline font-medium text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </span>
                  {i === 2 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                </div>
                <span className="text-[16px] font-label uppercase tracking-widest text-slate-400 group-hover:text-accent font-bold transition-colors">
                  {stat.label}
                </span>
              </div>
            ))}
          </section>

          {/* Filter & Search Bar Area */}
          <section className="relative z-30 mb-12 flex flex-col items-stretch justify-between gap-4 sm:mb-16 md:flex-row md:items-center">
            {/* Search Input Widget */}
            <div className="relative flex-grow max-w-lg">
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
            <div className="relative" ref={dropdownRef}>
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
          </section>

          {/* Results Listings Content */}
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
            <div className="space-y-24">
              
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
                    href={`/blog/${featuredPost.slug}`}
                    aria-label={`Featured story: ${featuredPost.title}`}
                    className="board-card group grid grid-cols-1 items-center gap-8 rounded-[2.5rem] p-6 transition-transform duration-300 ease-out hover:-translate-y-1 md:p-8 lg:grid-cols-12"
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
                        href={`/blog/${post.slug}`}
                        aria-label={`Read essay: ${post.title}`}
                        className="board-card group flex h-full flex-col justify-between rounded-[2rem] p-5 transition-transform duration-300 ease-out hover:-translate-y-1"
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
                <div className="flex flex-col items-center gap-4 pt-12 border-t border-slate-200/50 dark:border-white/10">
                  <p className="font-label text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
                    Showing {Math.min(visibleCount, sortedArticles.length)} of {sortedArticles.length} posts
                  </p>
                  
                  {sortedArticles.length > visibleCount && (
                    <button
                      onClick={handleLoadMore}
                      className="board-card group relative flex h-12 cursor-pointer items-center justify-center gap-2.5 px-10 font-headline text-xs font-bold text-slate-800 transition-all duration-300 hover:border-accent hover:bg-accent hover:text-slate-900 active:scale-95 dark:text-white dark:hover:text-slate-900 rounded-2xl"
                    >
                      <span>Load More Stories</span>
                      <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Newsletter input card */}
          <section className="board-card relative mt-20 overflow-hidden rounded-[2rem] p-5 sm:mt-28 sm:rounded-[2.5rem] sm:p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
              {/* Left Side: Editorial Content */}
              <div className="space-y-4 lg:w-[48%] lg:max-w-xl">
                <span className="font-label text-xs uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" /> Subscribe
                </span>
                
                <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Get new posts when they go up
                </h3>
                
                <p className="font-body text-slate-600 dark:text-white/70 text-sm md:text-base leading-relaxed">
                  Occasional notes from Gargeya — whatever made the cut that week. No product pitch, no spam.
                </p>
              </div>

              {/* Right Side: Form & Trust Caption */}
              <div className="w-full lg:w-[45%] lg:max-w-md space-y-4">
                {subscribed ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-center text-accent font-headline font-bold text-sm"
                  >
                    Successfully Registered. Thank you for subscribing!
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="email" 
                        placeholder="john.doe@acme.com" 
                        aria-label="Email address for newsletter"
                        required
                        value={subscribeEmail}
                        onChange={(e) => setSubscribeEmail(e.target.value)}
                        className="flex-grow rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-800 shadow-inner placeholder:text-slate-400 focus:border-accent focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                      />
                      <button 
                        type="submit" 
                        className="bg-accent text-primary dark:text-primary-container hover:bg-accent/90 font-headline font-bold text-sm h-12 px-8 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      >
                        Subscribe <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {subscribeError && (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                        {subscribeError}
                      </p>
                    )}
                  </form>
                )}

                <div className="pt-1">
                  <p className="text-[10px] text-slate-400 font-body">No spam. Unsubscribe anytime via Resend broadcasts.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

      </main>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
