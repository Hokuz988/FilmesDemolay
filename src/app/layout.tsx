import type { Metadata, Viewport } from 'next';
import { Cinzel, Cinzel_Decorative, EB_Garamond } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });
const cinzelDecorativa = Cinzel_Decorative({ subsets: ['latin'], weight: ['700'], variable: '--font-cinzel-decorativa' });
const garamond = EB_Garamond({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-garamond' });

export const metadata: Metadata = {
  title: { default: 'Filminhos DeMolay', template: '%s · Filminhos DeMolay' },
  description: 'Votação da noite de filmes do capítulo.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#05061a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${cinzelDecorativa.variable} ${garamond.variable}`}>
      <body className="font-texto antialiased">{children}</body>
    </html>
  );
}
