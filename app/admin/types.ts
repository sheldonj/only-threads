import { type client } from '@/lib/auth/client';

/**
 * User type inferred from better-auth's admin.listUsers response.
 * This avoids conflicts with ZenStack's User type.
 */
export type AdminUser = NonNullable<
  Awaited<ReturnType<typeof client.admin.listUsers>>['data']
>['users'][number];

export type BanFormState = {
  expirationDate: Date | undefined;
  reason: string;
  userId: string;
};

export type NewUserFormState = {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
};

