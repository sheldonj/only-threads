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
      href={session?.session ? '/library' : '/sign-in'}
    >
      <Button
        className="gap-2 justify-between"
        variant="secondary"
      >
        <span>{session?.session ? 'My Library' : 'Get Started'}</span>
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
      href={guessIsSignIn ? '/library' : '/sign-in'}
    >
      <Button
        className="gap-2 justify-between"
        variant="secondary"
      >
        <span>{guessIsSignIn ? 'My Library' : 'Get Started'}</span>
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
