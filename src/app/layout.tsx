import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ReactQueryProvider from "@/src/components/providers/react-query-provider";
import './globals.css';

const inter = Inter({
  display: 'swap',
  subsets: ['latin', 'vietnamese'],
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
    <html lang='en'>
      <body className={inter.className}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
