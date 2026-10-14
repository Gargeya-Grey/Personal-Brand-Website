# Sign-in page

## Sub-features

- Google sign-in button (only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set).
- "Google OAuth is not configured" line when they are not.
- Dev mock login button (development only).
- Error and email messages from `?error=` and `?email=`.

## How to get to it (user POV)

Open `/login` while signed out, or open any private page while signed out (the proxy redirects with `callbackUrl`).

## Driving it with the browser pane

1. Sign out first: navigate to `/api/auth/logout`.
2. Navigate to `/login`. Expect the heading and the dev mock login button.
3. Navigate to `/login?error=access_denied&email=someone@example.test` to see the error state.
4. Press "Dev mock login". End state: the page redirects to `/editorial` and the Blog CMS heading shows.

## Gotchas

- When signed in, `/login` redirects straight to the callback URL; sign out to see the page.
- The Google button cannot be driven locally without real OAuth keys; check its layout only by reading the component.
