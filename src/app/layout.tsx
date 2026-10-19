import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import ReactQueryProvider from "@/src/components/providers/react-query-provider";
import { appPath } from '@/src/lib/app-path';
import './globals.css';

const appFont = Be_Vietnam_Pro({
  display: 'swap',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Sheet2Web',
  description: 'Ứng dụng Sheet2Web',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='vi'>
      <body className={appFont.className}>
        <SessionProvider basePath={appPath('/api/auth')}>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
