import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { type NextRequest } from 'next/server';

export const { GET } = toNextJsHandler(auth);

export const POST = async (request: NextRequest) => {
  const res = await auth.handler(request);
  return res;
};
