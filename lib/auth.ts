import { db as database } from './db';
import { reactInvitationEmail } from './email/invitation';
import { resend } from './email/resend';
import { reactResetPasswordEmail } from './email/rest-password';
import { zenstackAdapter } from '@zenstackhq/better-auth';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { admin, bearer, organization } from 'better-auth/plugins';

const from = process.env.BETTER_AUTH_EMAIL || 'delivered@resend.dev';
const to = process.env.TEST_EMAIL || '';

export const auth = betterAuth({
  appName: 'Better Auth Demo',
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
      console.log('Sending verification email to', user.email);
      const res = await resend.emails.send({
        from,
        html: `<a href="${url}">Verify your email address</a>`,
        subject: 'Verify your email address',
        to: to || user.email,
      });
      console.log(res, user.email);
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const res = await resend.emails.send({
          from,
          react: reactInvitationEmail({
            invitedByEmail: data.inviter.user.email,
            invitedByUsername: data.inviter.user.name,
            inviteLink:
              process.env.NODE_ENV === 'development'
                ? `http://localhost:3000/accept-invitation/${data.id}`
                : `${
                    process.env.BETTER_AUTH_URL ||
                    'https://demo.better-auth.com'
                  }/accept-invitation/${data.id}`,
            teamName: data.organization.name,
            username: data.email,
          }),
          subject: "You've been invited to join an organization",
          to: data.email,
        });
        console.log(res, data.email);
      },
    }),
    bearer(),
    admin(),
    nextCookies(),
  ],
});
