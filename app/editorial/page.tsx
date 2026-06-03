import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth';
import { getArticles } from '@/lib/blog-service';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { EditorialClient } from './editorial-client';

export default async function EditorialPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');

  if (!sessionCookie) {
    redirect('/login?callbackUrl=/editorial');
  }

  const user = await verifyJWT(sessionCookie.value);
  if (!user) {
    redirect('/login?callbackUrl=/editorial');
  }

  // Load articles on server
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-surface text-primary antialiased relative selection:bg-[#D4FF00] selection:text-black flex flex-col justify-between">
      {/* Decorative Blueprint Light-Grid and Radial Lighting Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-outline-variant)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-30" />

      {/* Global Navigation Bar */}
      <Navigation />

      {/* Main Container */}
      <main className="relative z-10 pt-36 pb-32 flex-grow">
        <EditorialClient initialArticles={articles} user={user} />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
