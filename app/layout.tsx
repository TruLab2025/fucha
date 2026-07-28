// app/layout.tsx
import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Fucha24 — lokalne zlecenia bez formalności',
  description: 'Znajdź lokalną fuchę albo ludzi gotowych do pracy. Szybko, konkretnie i bez zakładania konta.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-canvas text-ink antialiased">
        <a href="#main-content" className="sr-only z-[100] rounded-lg bg-ink px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Przejdź do treści
        </a>
        <Navbar />
        <main id="main-content" className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
