import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { MobileNavbar } from '@/components/navigation/MobileNavbar';
import { AnimatedBackground } from '@/components/background/AnimatedBackground';
import './globals.css';

export const metadata: Metadata = {
  title: 'LateTable Hou je vrienden scherp!',
  description:
    'Een gedeelde web-app voor je vriendengroep om bij te houden wie het vaakst te laat komt. Met milestones, straffen en realtime updates.',
  keywords: ['te laat', 'vrienden', 'tracker', 'app', 'milestones', 'straffen'],
  authors: [{ name: 'LateTable' }],
  openGraph: {
    title: 'LateTable Hou je vrienden scherp!',
    description:
      'Hou bij wie het vaakst te laat komt in je vriendengroep. Met milestones en straffen!',
    type: 'website',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LateTable Hou je vrienden scherp!',
    description:
      'Hou bij wie het vaakst te laat komt in je vriendengroep. Met milestones en straffen!',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className="h-full"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Animated gradient background */}
        <AnimatedBackground />

        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 theme-bg focus:text-white focus:rounded-lg"
        >
          Spring naar inhoud
        </a>

        <Providers>
          <div id="main-content" className="pb-20 md:pb-0">{children}</div>
          <MobileNavbar />
        </Providers>
      </body>
    </html>
  );
}
