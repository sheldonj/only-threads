import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { type NextRequest } from 'next/server';

export const { GET } = toNextJsHandler(auth);

export const POST = async (request: NextRequest) => {
  const response = await auth.handler(request);
  return response;
};
