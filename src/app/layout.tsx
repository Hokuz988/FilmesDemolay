import type { Metadata, Viewport } from 'next';
import { Courier_Prime, Inter, Oswald, Playfair_Display } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'], style: ['normal', 'italic'], variable: '--font-playfair' });
const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-oswald' });
const courier = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-courier' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Filminhos DeMoleycos', template: '%s · Filminhos DeMoleycos' },
  description: 'Votação da noite de filmes do capítulo.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5a0e13',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${oswald.variable} ${courier.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
