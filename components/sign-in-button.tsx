import { Button } from './ui/button';
import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';

export const SignInButton = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Link
      className="flex justify-center"
      href={session?.session ? '/dashboard' : '/sign-in'}
    >
      <Button
        className="gap-2  justify-between"
        variant="default"
      >
        {session?.session ? (
          <svg
            height="1.2em"
            viewBox="0 0 24 24"
            width="1.2em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 3h20v18H2zm18 16V7H4v12z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            height="1.2em"
            viewBox="0 0 24 24"
            width="1.2em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 3H3v4h2V5h14v14H5v-2H3v4h18V3zm12 8h-2V9h-2V7h-2v2h2v2H3v2h10v2h-2v2h2v-2h2v-2h2z"
              fill="currentColor"
            />
          </svg>
        )}
        <span>{session?.session ? 'Dashboard' : 'Sign In'}</span>
      </Button>
    </Link>
  );
};

export const SignInFallback = async () => {
  // to avoid flash of unauthenticated state
  const guessIsSignIn = checkOptimisticSession(await headers());
  return (
    <Link
      className="flex justify-center"
      href={guessIsSignIn ? '/dashboard' : '/sign-in'}
    >
      <Button
        className="gap-2  justify-between"
        variant="default"
      >
        {guessIsSignIn ? (
          <svg
            height="1.2em"
            viewBox="0 0 24 24"
            width="1.2em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 3h20v18H2zm18 16V7H4v12z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            height="1.2em"
            viewBox="0 0 24 24"
            width="1.2em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 3H3v4h2V5h14v14H5v-2H3v4h18V3zm12 8h-2V9h-2V7h-2v2h2v2H3v2h10v2h-2v2h2v-2h2v-2h2z"
              fill="currentColor"
            />
          </svg>
        )}
        <span>{guessIsSignIn ? 'Dashboard' : 'Sign In'}</span>
      </Button>
    </Link>
  );
};

function checkOptimisticSession(requestHeaders: Headers) {
  const guessIsSignIn =
    requestHeaders.get('cookie')?.includes('better-auth.session') ||
    requestHeaders
      .get('cookie')
      ?.includes('__Secure-better-auth.session-token');
  return Boolean(guessIsSignIn);
}
