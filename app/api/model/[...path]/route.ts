import { auth } from '@/lib/auth/server';
import { authDb } from '@/lib/database/client';
import { schema } from '@/lib/zenstack/generated/schema';
import { RPCApiHandler } from '@zenstackhq/server/api';
import { NextRequestHandler } from '@zenstackhq/server/next';
import { headers } from 'next/headers';

async function getClient() {
  const requestHeaders = await headers();
  const sessionResult = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!sessionResult) {
    // anonymous user, create enhanced client without user context
    return authDb;
  }

  const { session, user } = sessionResult;

  // create enhanced client with user context
  const userContext = {
    role: user.role ?? undefined,
    userId: session.userId,
  };

  return authDb.$setAuth(userContext);
}

const handler = NextRequestHandler({
  apiHandler: new RPCApiHandler({ schema }),
  getClient,
  useAppDir: true,
});

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
