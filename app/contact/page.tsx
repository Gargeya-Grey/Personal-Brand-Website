import { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Mail, MapPin, Globe } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Discuss technical strategy, AI implementation roadmap, or venture partnership with Gargeya Sharma.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navigation />
      
      <main className="flex-grow pt-32 px-6 md:px-12 max-w-screen-2xl mx-auto w-full">
        <section className="py-20 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Header & Info */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <span className="font-label text-accent tracking-[0.2em] font-bold uppercase text-xs block">
                Initiate Connection
              </span>
              <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.04em] text-primary leading-[0.95]">
                Let&apos;s build something <span className="text-[#10B981]">meaningful</span><span className="text-accent">.</span>
              </h1>
              <p className="font-body text-lg text-on-surface-variant leading-relaxed pt-2">
                Have an ambitious project, venture partnership, or technical challenge to discuss? Reach out and let&apos;s architect the solution.
              </p>
            </div>

            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-4 bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-5 border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] rounded-2xl hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out">
                <div className="w-12 h-12 bg-surface-container-low dark:bg-white/5 rounded-xl flex items-center justify-center text-accent">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-extrabold">Direct Email</p>
                  <a href="mailto:gargeya.sharma@gmail.com" className="text-sm font-headline font-bold text-primary hover:text-[#10B981] transition-colors">
                    gargeya.sharma@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-5 border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] rounded-2xl hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out">
                <div className="w-12 h-12 bg-surface-container-low dark:bg-white/5 rounded-xl flex items-center justify-center text-accent">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-extrabold">Location</p>
                  <p className="text-sm font-headline font-bold text-primary">
                    Singapore &amp; Global
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/65 dark:bg-white/[0.02] backdrop-blur-xl p-5 border border-accent/20 dark:border-white/10 shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15),_inset_0_2px_1px_rgba(255,255,255,0.15)] rounded-2xl hover:border-accent/50 dark:hover:border-white/20 hover:shadow-[0_16px_32px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_2px_1px_rgba(255,255,255,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out">
                <div className="w-12 h-12 bg-surface-container-low dark:bg-white/5 rounded-xl flex items-center justify-center text-accent">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant font-extrabold">Digital Presence</p>
                  <a href="https://edudojo.ai" target="_blank" rel="noopener noreferrer" className="text-sm font-headline font-bold text-[#10B981] hover:underline">
                    edudojo.ai
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form component */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
