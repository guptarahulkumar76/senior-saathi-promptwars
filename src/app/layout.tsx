import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SeniorProvider } from '@/context/SeniorContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#d97706',
};

export const metadata: Metadata = {
  title: 'Senior Saathi | AI Companion for Senior Citizens (वरिष्ठ साथी)',
  description:
    'An intelligent, accessible, and trustworthy digital companion for senior citizens. Simplifies difficult information, detects fraud & scams, tracks daily medicine reminders, and provides one-tap emergency help.',
  keywords: [
    'Senior Citizen AI',
    'Elderly Tech Companion',
    'Scam Detection for Seniors',
    'Medicine Reminders',
    'Emergency Help',
    'Accessible AI',
    'Hindi English AI',
  ],
  authors: [{ name: 'Senior Saathi Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#d97706" />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
        <SeniorProvider>{children}</SeniorProvider>
      </body>
    </html>
  );
}
