export const metadata = { title: 'Confirm subscription', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };

export default async function ConfirmSubscription({ searchParams }: {
  searchParams: Promise<{ token?: string; success?: string }>
}) {
  const params = await searchParams;
  return <main className="mx-auto max-w-xl px-6 py-24">
    <h1 className="text-3xl mb-4">{params.success === '1' ? 'Subscription confirmed' : 'Confirm your subscription'}</h1>
    {params.success === '1' ? <p>You are on the list. One letter on Sunday. Unsubscribe anytime.</p> :
      params.token ? <form method="post" action="/api/subscribe/confirm">
        <p className="mb-6">Confirm that you want to receive the Sunday letter. This also reactivates a subscription you previously stopped.</p>
        <input type="hidden" name="token" value={params.token} />
        <button className="rounded-full border px-6 py-3" type="submit">Confirm subscription</button>
      </form> : <p>This link is missing or expired. Request a new confirmation from the Notes page.</p>}
  </main>;
}
