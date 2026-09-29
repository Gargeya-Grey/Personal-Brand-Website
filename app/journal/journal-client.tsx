'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { PageIntro } from '@/components/page-intro';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookOpen, ArrowRight, Search, Clock, ChevronDown, Filter, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(9);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 15);
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
    if (category === 'All') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((prev) => {
        if (prev.includes(category)) {
          return prev.filter((c) => c !== category);
        } else {
          return [...prev, category];
        }
      });
    }
  };

  // Filter, Sort & Search computation (Sorted from latest to oldest date)
  const sortedArticles = useMemo(() => {
    const filtered = articles.filter((post) => {
      const categoryMatches =
        selectedCategories.length === 0 ||
        post.categories.some((c) => selectedCategories.includes(c));
      const searchMatches =
        searchQuery === '' ||
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
    return sortedArticles.find((a) => a.featured) || sortedArticles[0];
  }, [sortedArticles]);

  const shouldShowFeatured =
    featuredPost !== null && selectedCategories.length === 0 && searchQuery === '';

  // Paginated recent stories — exclude the featured hero so it is not duplicated
  const paginatedArticles = useMemo(() => {
    const rest =
      shouldShowFeatured && featuredPost
        ? sortedArticles.filter((a) => a.id !== featuredPost.id)
        : sortedArticles;
    return rest.slice(0, visibleCount);
  }, [sortedArticles, visibleCount, featuredPost, shouldShowFeatured]);

  return (
    <div className="relative flex min-h-screen flex-col bg-surface text-primary antialiased selection:bg-accent/30 selection:text-current">
      {/* Global Navigation Bar */}
      <Navigation />

      {/* Main Container */}
      <main
        id="page-main"
        tabIndex={-1}
        className="field-main reading-index relative z-10 w-full flex-grow pb-20"
      >
        <PageIntro title="The journal.">
          <p>
            Essays on systems, AI, learning, and the craft of building. Some ideas need more than a
            post, so I work them out here.
          </p>
        </PageIntro>

        {/* Filter & Search Bar Area — sticky instrument, not a loose row */}
        <section id="essays" className="sticky top-24 z-30 mb-12 scroll-mt-32 sm:mb-14">
          <div className="flex flex-col items-stretch justify-between gap-2 rounded-[1.5rem] border border-white/50 bg-white/55 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl md:flex-row md:items-center md:gap-3 md:p-3 dark:border-white/10 dark:bg-white/[0.04]">
            {/* Search Input Widget */}
            <div className="relative flex-grow md:max-w-lg">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search essays..."
                aria-label="Search articles"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(9);
                }}
                className="journal-control h-11 w-full rounded-lg border pl-11 pr-12 text-base md:h-14 md:rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setVisibleCount(9);
                  }}
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary"
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
                className="journal-control flex h-11 w-full items-center justify-between gap-3 rounded-lg border px-4 text-sm font-semibold md:h-14 md:w-64 md:rounded-xl md:px-5 md:text-base"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-on-surface-variant" />
                  {selectedCategories.length === 0
                    ? 'All Categories'
                    : `${selectedCategories.length} selected`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-on-surface-variant transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Article categories"
                  aria-multiselectable="true"
                  className="journal-category-menu absolute right-0 mt-2 rounded-xl border p-3 space-y-1 z-50"
                >
                  <button
                    role="option"
                    aria-selected={selectedCategories.length === 0}
                    onClick={() => {
                      handleCategoryToggle('All');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-headline font-semibold transition-colors flex items-center justify-between ${
                      selectedCategories.length === 0
                        ? 'bg-accent/10 text-accent font-extrabold'
                        : 'text-on-surface-variant hover:bg-accent/5 hover:text-primary'
                    }`}
                  >
                    <span>All Categories</span>
                    {selectedCategories.length === 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </button>

                  <div className="h-px bg-outline-variant my-1" />

                  <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
                    {CATEGORIES.map((c) => {
                      const active = selectedCategories.includes(c);
                      return (
                        <button
                          key={c}
                          role="option"
                          aria-selected={active}
                          onClick={() => handleCategoryToggle(c)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-headline font-semibold transition-colors flex items-center justify-between ${
                            active
                              ? 'bg-accent/10 text-accent font-extrabold'
                              : 'text-on-surface-variant hover:bg-accent/5 hover:text-primary'
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
            <BookOpen className="w-12 h-12 text-on-surface-variant mx-auto" />
            <h3 className="font-headline font-bold text-xl text-primary">
              No posts match your filters
            </h3>
            <p className="font-body text-on-surface-variant max-w-md mx-auto text-sm leading-relaxed">
              Try a different category mix or clear search to see everything again.
            </p>
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSearchQuery('');
                setVisibleCount(9);
              }}
              className="btn-accent font-headline font-semibold text-sm min-h-11 px-6 rounded-xl"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16 lg:space-y-20">
            {/* 1. DYNAMIC FEATURED HERO SECTION */}
            {shouldShowFeatured && featuredPost && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="font-label text-xs uppercase tracking-[0.25em] text-accent font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    Featured Stories
                  </span>
                  <div className="h-[1px] bg-outline-variant dark:bg-white/10 flex-grow" />
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
                        <span
                          key={c}
                          className="font-label text-xs font-[520] dark:font-[480] text-accent bg-accent/5 px-3 py-1 rounded-full border border-accent/20"
                        >
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

                    <div className="flex flex-col items-start gap-3 border-t border-outline-variant pt-6 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
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

                      <div className="flex items-center gap-3 text-xs text-on-surface-variant font-label">
                        <span>{featuredPost.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <span className="text-accent flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {featuredPost.readTime}
                        </span>
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
                      renderIllustration(
                        featuredPost.illustrationType === 'cover'
                          ? 'diagram1'
                          : featuredPost.illustrationType,
                        true,
                      )
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* 2. RECENT STORIES RECTANGULAR GRID SECTION */}
            <div className="space-y-12">
              {/* Grid Divider line */}
              <div className="flex items-center gap-4">
                <div className="h-[1px] bg-outline-variant dark:bg-white/10 flex-grow" />
                <span className="font-label text-xs uppercase tracking-[0.25em] text-on-surface-variant font-bold">
                  Recent stories
                </span>
                <div className="h-[1px] bg-outline-variant dark:bg-white/10 flex-grow" />
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
                            renderIllustration(
                              post.illustrationType === 'cover'
                                ? 'diagram1'
                                : post.illustrationType,
                            )
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {post.categories.map((c) => (
                            <span
                              key={c}
                              className="font-label text-xs font-[520] dark:font-[480] text-accent bg-accent/5 px-2.5 py-1 rounded-full border border-accent/20"
                            >
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
                      <div className="mt-6 flex flex-col items-start gap-3 border-t border-outline-variant pt-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
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

                        <div className="flex items-center gap-2 text-xs font-label text-on-surface-variant">
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
                <p className="font-label text-xs text-on-surface-variant dark:text-on-surface-variant uppercase tracking-widest font-semibold">
                  Showing{' '}
                  {Math.min(visibleCount + (shouldShowFeatured ? 1 : 0), sortedArticles.length)} of{' '}
                  {sortedArticles.length} posts
                </p>

                {sortedArticles.length > visibleCount + (shouldShowFeatured ? 1 : 0) && (
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
        <section id="subscribe" className="mt-16 scroll-mt-32 lg:mt-20">
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
                  Notes is one argument a week on the mind, learning with AI, and what we actually
                  score. Not a recap of the journal — the desk notes, distilled.
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
                <div className="rounded-2xl border border-outline-variant bg-canvas p-5 sm:p-7">
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
