/* eslint-disable import/no-unassigned-import */
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Wrapper, WrapperWithQuery } from '@/components/wrapper';
import { createMetadata } from '@/lib/metadata';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

export const metadata = createMetadata({
  description: 'The most comprehensive authentication library for typescript',
  metadataBase: new URL('https://demo.better-auth.com'),
  title: {
    default: 'Better Auth',
    template: '%s | Better Auth',
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link
          href="/favicon/favicon.ico"
          rel="icon"
          sizes="any"
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans w-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          <Wrapper>
            <WrapperWithQuery>{children}</WrapperWithQuery>
          </Wrapper>
          <Toaster
            closeButton
            richColors
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
