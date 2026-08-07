import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAllowedSession } from '@/lib/auth';
import { getEditorialArticlesLite } from '@/lib/blog-service';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { EditorialClient } from './editorial-client';

export const metadata: Metadata = {
  title: 'Editorial Workspace',
  robots: { index: false, follow: false },
};

export default async function EditorialPage({
  searchParams,
}: {
  searchParams: Promise<{ workspace?: string }>;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  const user = await requireAllowedSession(sessionCookie?.value);
  if (!user) {
    redirect('/login?callbackUrl=/editorial');
  }

  const params = await searchParams;
  const ws = params.workspace;
  const initialWorkspace: 'blog' | 'x' =
    ws === 'x' || ws === 'todo' || ws === 'x-todo' ? 'x' : 'blog';

  // Skip blog list I/O when opening X To-Do — major latency win for hourly scout workflow
  const articles =
    initialWorkspace === 'blog' ? await getEditorialArticlesLite() : [];

  return (
    <div className="atelier-root min-h-screen relative flex flex-col justify-between antialiased">
      <div className="atelier-glow pointer-events-none absolute inset-0 z-0" aria-hidden />
      <Navigation />
      <main id="page-main" tabIndex={-1} className="relative z-10 pt-24 sm:pt-28 pb-12 sm:pb-16 flex-grow">
        <EditorialClient
          initialArticles={articles}
          user={user}
          initialWorkspace={initialWorkspace}
        />
      </main>
      <Footer />
    </div>
  );
}

export const dynamic = 'force-dynamic';
