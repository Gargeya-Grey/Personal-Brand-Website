import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PageIntro } from '@/components/page-intro';
import { ContactForm } from '@/components/contact-form';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Say hello',
  description:
    'Talk with Gargeya about Edudojo, AI systems, a collaboration, or an interesting question.',
  alternates: { canonical: '/contact' },
};
export default function ContactPage() {
  return (
    <div className="field-site">
      <Navigation />
      <main id="page-main" tabIndex={-1} className="field-main">
        <PageIntro
          title={
            <>
              Something on
              <br />
              <em>your mind?</em>
            </>
          }
        >
          <p>
            A project, a question, a shared curiosity. Tell me a little about it, and let’s see
            where the conversation goes.
          </p>
        </PageIntro>
        <section className="contact-layout">
          <div className="contact-details">
            <div>
              <p className="field-label">The direct route</p>
              <a href={'mailto:' + siteConfig.email} className="field-text-link">
                {siteConfig.email} ↗
              </a>
            </div>
            <div>
              <p className="field-label">Where I work</p>
              <span>{siteConfig.locationLabel}</span>
            </div>
            <div>
              <p className="field-label">What I’m building</p>
              <a
                href={siteConfig.links.edudojo}
                target="_blank"
                rel="noopener noreferrer"
                className="field-text-link"
              >
                Edudojo.ai ↗
              </a>
            </div>
            <p className="field-copy">
              For collaborations, a little context goes a long way: what you’re making, what you’re
              exploring, and how I might help.
            </p>
          </div>
          <ContactForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}
