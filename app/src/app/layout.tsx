import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a common sans-serif font
import './globals.css';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/context/AppContext';
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'SQL Parser',
  description: 'Parse SQL and analyze CSV data',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
