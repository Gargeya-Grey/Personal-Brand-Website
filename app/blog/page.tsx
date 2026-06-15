'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useTheme } from '@/components/theme-provider';
import { 
  BookOpen, 
  ArrowRight, 
  Search, 
  Mail, 
  Clock, 
  ChevronDown, 
  Filter, 
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { renderIllustration } from '@/components/render-illustration';
import { Article } from '@/lib/blog-service';
import { CATEGORIES } from '@/lib/categories';

export default function BlogPage() {
  const { theme } = useTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [subscribeEmail, setSubscribeEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [isExpanding, setIsExpanding] = useState<boolean>(false);

  // Reset pagination on category or search filter change
  useEffect(() => {
    setVisibleCount(9);
  }, [selectedCategories, searchQuery]);

  const handleLoadMore = () => {
    setIsExpanding(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 15);
      setIsExpanding(false);
    }, 450); // Premium interactive pacing delay
  };

  // Handle outside click to close category dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch articles on mount
  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        // Public page only shows published articles
        const publishedOnly = data.filter((a: Article) => a.status === 'published' || !a.status);
        setArticles(publishedOnly);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blog articles:', err);
        setLoading(false);
      });
  }, []);

  // Redirect ?id=X parameter to slug-based URLs if visited directly
  useEffect(() => {
    if (typeof window !== 'undefined' && articles.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');
      if (idParam) {
        const id = parseInt(idParam, 10);
        const article = articles.find(a => a.id === id);
        if (article) {
          window.location.href = `/blog/${article.slug}`;
        }
      }
    }
  }, [articles]);

  const handleCategoryToggle = (category: string) => {
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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribeEmail("");
      }, 3000);
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

  // Paginated articles list for the recent stories grid (featured post is included)
  const paginatedArticles = useMemo(() => {
    return sortedArticles.slice(0, visibleCount);
  }, [sortedArticles, visibleCount]);

  // Dynamic real stats tracking (resolves M1)
  const insights = [
    { value: "Enterprise", label: "Readership Target" },
    { value: `${articles.length}`, label: "Essays Published" },
    { value: "100%", label: "Open Access" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-primary antialiased relative flex flex-col justify-between selection:bg-accent/30 selection:text-current">
        <Navigation />
        <div className="flex-grow flex flex-col items-center justify-center pt-52">
          <div className="flex flex-col items-center gap-3 relative z-10">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Loading ledger logs...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-primary antialiased relative selection:bg-accent/30 selection:text-current">

      {/* Global Navigation Bar */}
      <Navigation />

      {/* Main Container */}
      <div className="relative z-10 pt-52">
        
        {/* Render Blog Listings Screen */}
        <div className="px-6 md:px-12 max-w-screen-2xl mx-auto w-full pb-32">
          
          {/* Header / Brand block (Vibrant design) */}
          <header className="max-w-4xl mb-16 space-y-6">
            <span className="font-label text-xs uppercase tracking-[0.25em] text-accent font-bold block">
              The Engineering Ledger
            </span>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-white leading-[0.95]">
              Engineering Insights <br/>&amp; <span className="text-emerald-600 dark:text-accent">Deep Essays</span><span className="text-emerald-500">.</span>
            </h1>
            <p className="font-body text-lg md:text-xl text-slate-600 dark:text-white/70 leading-relaxed max-w-2xl pt-2">
              Technical explorations, structural guides, and telemetry dashboards curated by the architect building <span className="font-bold text-slate-900 dark:text-white">edudojo.ai</span>.
            </p>
          </header>

          {/* Live stats highlights box */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 border-y border-slate-200/80 dark:border-white/10 py-8">
            {insights.map((stat, i) => (
              <div key={i} className="flex flex-col gap-1 items-start px-4">
                <span className="text-3xl font-headline font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</span>
                <span className="text-xs font-label uppercase tracking-widest text-accent font-bold">{stat.label}</span>
              </div>
            ))}
          </section>

          {/* Filter & Search Bar Area */}
          <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-16 relative z-30">
            {/* Search Input Widget */}
            <div className="relative flex-grow max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search headlines, keywords, or topics..." 
                aria-label="Search articles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.02] border border-emerald-500/20 dark:border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-sm focus:outline-none focus:border-accent placeholder-slate-400 text-slate-800 dark:text-white shadow-sm transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
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
                className="flex items-center justify-between gap-3 px-5 py-3.5 bg-white dark:bg-white/[0.02] border border-emerald-500/20 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-700 dark:text-white/85 shadow-sm hover:shadow-md transition-all w-full md:w-64"
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
            <div className="text-center py-24 bg-white/72 dark:bg-white/[0.02] border border-emerald-500/20 dark:border-white/10 rounded-[2.5rem] p-8 backdrop-blur-[28px] max-w-xl mx-auto space-y-6">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-headline font-bold text-xl text-slate-800 dark:text-white">No ledger archives match your query</h3>
              <p className="font-body text-slate-500 dark:text-white/60 max-w-md mx-auto text-sm leading-relaxed">
                Try revising your filter categories or clearing the search query to reload Gargeya&apos;s essays.
              </p>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSearchQuery("");
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
                    role="button"
                    aria-label={`Featured story: ${featuredPost.title}`}
                    className="group block grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-[2.5rem] p-6 md:p-8 bg-white/72 dark:bg-white/[0.02] backdrop-blur-[28px] border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_10px_30px_rgba(16,185,129,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out"
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
                      
                      <h2 className="font-headline text-2xl sm:text-3xl md:text-4.5xl font-semibold text-slate-900 dark:text-white leading-[1.08] tracking-tight group-hover:text-accent transition-colors duration-300">
                        {featuredPost.title}
                      </h2>
                      
                      <p className="font-body text-sm sm:text-base text-slate-600 dark:text-white/70 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-emerald-500/10 dark:border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/20 dark:border-white/10 relative">
                            <img src={featuredPost.authorAvatar} alt={featuredPost.author} className="object-cover w-full h-full" />
                          </div>
                          <span className="text-xs font-label font-bold text-slate-800 dark:text-white/80">{featuredPost.author}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-label">
                          <span>{featuredPost.date}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <span className="text-accent flex items-center gap-1"><Clock className="w-3 h-3" /> {featuredPost.readTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column illustration block */}
                    <div className="lg:col-span-7 h-64 lg:h-full w-full rounded-2xl overflow-hidden border border-emerald-500/20 dark:border-white/10 relative shadow-inner bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center">
                      {featuredPost.illustrationType === 'cover' && featuredPost.coverImage ? (
                        <img src={featuredPost.coverImage} alt={featuredPost.title} className="w-full h-full object-cover" />
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
                        role="button"
                        aria-label={`Read essay: ${post.title}`}
                        className="group flex flex-col justify-between p-5 h-full rounded-[2rem] bg-white/72 dark:bg-white/[0.02] backdrop-blur-[28px] border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_10px_30px_rgba(16,185,129,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out"
                      >
                        <div className="space-y-5">
                          
                          {/* Thumbnail schema */}
                          <div className="w-full h-48 rounded-2xl overflow-hidden border border-emerald-500/10 dark:border-white/5 shadow-inner relative bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center">
                            {post.illustrationType === 'cover' && post.coverImage ? (
                              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
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
                        <div className="flex items-center justify-between border-t border-emerald-500/10 dark:border-white/5 pt-4 mt-6">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/20 dark:border-white/10 relative">
                              <img src={post.authorAvatar} alt={post.author} className="object-cover w-full h-full" />
                            </div>
                            <span className="text-xs font-label font-bold text-slate-800 dark:text-white/80">{post.author}</span>
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
                    Showing {Math.min(visibleCount, sortedArticles.length)} of {sortedArticles.length} essays
                  </p>
                  
                  {sortedArticles.length > visibleCount && (
                    <button
                      onClick={handleLoadMore}
                      disabled={isExpanding}
                      className="group relative flex items-center justify-center gap-2.5 bg-white/40 dark:bg-white/[0.02] hover:bg-accent text-slate-800 dark:text-white hover:text-slate-900 dark:hover:text-slate-900 border border-emerald-500/20 dark:border-white/10 hover:border-accent font-headline font-bold text-xs h-12 px-10 rounded-2xl transition-all duration-300 active:scale-95 shadow-sm hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                    >
                      {isExpanding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-500 group-hover:text-slate-900" />
                          <span>Syncing logs...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More Stories</span>
                          <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Newsletter input card */}
          <section className="mt-28 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden bg-white/72 dark:bg-white/[0.02] backdrop-blur-[28px] border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)]">
            <div className="max-w-2xl space-y-6">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-accent font-bold flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" /> Subscribe
              </span>
              
              <h3 className="font-headline text-2xl md:text-3.5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                See what your agent is really doing
              </h3>
              
              <p className="font-body text-slate-600 dark:text-white/70 text-sm md:text-base leading-relaxed">
                Join Gargeya Sharma&apos;s weekly editorial distribution. Get raw architectural summaries, continuous system analysis, and next-generation agent telemetry updates directly.
              </p>

              {subscribed ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-center text-accent font-headline font-bold text-sm"
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
                    className="bg-slate-50 dark:bg-white/[0.02] border border-emerald-500/20 dark:border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-accent placeholder-slate-400 flex-grow text-slate-800 dark:text-white shadow-inner"
                  />
                  <button 
                    type="submit" 
                    className="bg-accent text-primary dark:text-primary-container hover:bg-accent/90 font-headline font-bold text-sm h-12 px-8 rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 shrink-0 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
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

      </div>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
