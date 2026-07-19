import { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Mail, MapPin, Globe, ArrowUpRight } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Discuss technical strategy, AI implementation, or venture partnership with Gargeya Sharma.',
};

const infoCards = [
  {
    icon: Mail,
    label: 'Email',
    content: (
      <a
        href={`mailto:${siteConfig.email}`}
        className="text-sm sm:text-base font-headline font-bold text-primary hover:text-accent transition-colors break-all"
      >
        {siteConfig.email}
      </a>
    ),
  },
  {
    icon: MapPin,
    label: 'Based',
    content: (
      <p className="text-sm sm:text-base font-headline font-bold text-primary">
        {siteConfig.locationLabel}
      </p>
    ),
  },
  {
    icon: Globe,
    label: 'Venture',
    content: (
      <a
        href={siteConfig.links.edudojo}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm sm:text-base font-headline font-bold text-accent hover:underline inline-flex items-center gap-1.5"
      >
        edudojo.ai
        <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
      </a>
    ),
  },
] as const;

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navigation />

      <main id="page-main" tabIndex={-1} className="mx-auto w-full max-w-screen-2xl flex-grow px-4 pt-28 sm:px-6 sm:pt-32 lg:px-10 xl:px-12">
        <section className="grid grid-cols-1 items-start gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
                Contact
              </span>
              <h1 className="font-headline text-[clamp(2.5rem,8vw,3.75rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-primary">
                Let&apos;s build something{' '}
                <span className="text-accent">meaningful</span>
                <span className="text-accent">.</span>
              </h1>
              <p className="font-body text-lg text-on-surface-variant leading-relaxed max-w-md">
                Ambitious projects, AI implementation, or venture collaboration — send a note and
                I&apos;ll get back within a day or two.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {infoCards.map(({ icon: Icon, label, content }) => (
                <div
                  key={label}
                  className="board-card flex items-center gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-label uppercase tracking-[0.18em] text-on-surface-variant font-bold mb-0.5">
                      {label}
                    </p>
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
