import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';

export const client = createAuthClient({
  fetchOptions: {
    onError(event) {
      if (event.error.status === 429) {
        toast.error('Too many requests. Please try again later.');
      }
    },
  },
  plugins: [adminClient()],
});

export const { signIn, signOut, signUp, useSession } = client;
