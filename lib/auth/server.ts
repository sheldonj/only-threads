import { db as database } from '@/lib/database/client';
import { resend } from '@/lib/email/resend';
import { reactResetPasswordEmail } from '@/lib/email/rest-password';
import { zenstackAdapter } from '@zenstackhq/better-auth';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { admin, bearer } from 'better-auth/plugins';

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev';
const to = process.env.TEST_EMAIL || '';

export const auth = betterAuth({
  appName: 'Learn Something',
  database: zenstackAdapter(database, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ url, user }) {
      await resend.emails.send({
        from,
        react: reactResetPasswordEmail({
          resetLink: url,
          username: user.email,
        }),
        subject: 'Reset your password',
        to: user.email,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({ url, user }) {
      // eslint-disable-next-line no-console
      console.log('Sending verification email to', user.email);
      const response = await resend.emails.send({
        from,
        html: `<a href="${url}">Verify your email address</a>`,
        subject: 'Verify your email address',
        to: to || user.email,
      });
      // eslint-disable-next-line no-console
      console.log(response, user.email);
    },
  },
  plugins: [bearer(), admin(), nextCookies()],
});
