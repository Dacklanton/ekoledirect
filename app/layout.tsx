import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EkoleDirect — Soutien scolaire en ligne au Bénin',
  description: 'Plateforme de soutien scolaire avec tuteur IA, suivant le programme béninois officiel. CEP, BEPC, BAC.',
  manifest: '/manifest.json',
  themeColor: '#1a5c2a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
