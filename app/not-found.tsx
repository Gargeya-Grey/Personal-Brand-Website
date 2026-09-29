import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navigation />
      <main
        id="page-main"
        tabIndex={-1}
        className="flex-grow flex items-center justify-center px-6 pt-32 pb-24"
      >
        <div className="max-w-lg text-center space-y-8 liquid-glass rounded-[2rem] p-10 md:p-14">
          <p className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs">404</p>
          <h1 className="font-display text-4xl font-medium tracking-[-0.02em] text-primary md:text-5xl">
            Page not found
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            This page may have moved. Head home or browse the journal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="btn-accent inline-flex items-center justify-center h-12 px-8 rounded-xl font-headline font-bold text-sm"
            >
              Back home
            </Link>
            <Link
              href="/journal"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-outline-variant/40 text-primary font-headline font-bold text-sm hover:border-accent/40 transition-colors"
            >
              Read the journal
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
