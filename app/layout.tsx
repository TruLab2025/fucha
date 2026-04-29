// app/layout.tsx
import './globals.css';
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Fucha24',
  description: 'Platforma do krótkich zleceń',
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
      <body className="bg-neutral text-text">
        <Navbar />
        <main className="container mx-auto mt-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
