import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LateTable - Hou je vrienden scherp!',
  description:
    'Een gedeelde web-app voor je vriendengroep om bij te houden wie het vaakst te laat komt. Met milestones, straffen en realtime updates.',
  keywords: ['te laat', 'vrienden', 'tracker', 'app', 'milestones', 'straffen'],
  authors: [{ name: 'LateTable' }],
  openGraph: {
    title: 'LateTable - Hou je vrienden scherp!',
    description:
      'Hou bij wie het vaakst te laat komt in je vriendengroep. Met milestones en straffen!',
    type: 'website',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LateTable - Hou je vrienden scherp!',
    description:
      'Hou bij wie het vaakst te laat komt in je vriendengroep. Met milestones en straffen!',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1625',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Noise texture overlay for futuristic effect */}
        <div className="noise-overlay" aria-hidden="true" />

        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg"
        >
          Spring naar inhoud
        </a>

        <Providers>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
