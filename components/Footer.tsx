// components/Footer.tsx
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contact" className="bg-white mt-16 py-8">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text">
        <div>
          <img src="/fucha24.png" alt="Fucha24 logo" width={180} height={48} className="mb-2" />
        </div>
        <div>
          <h4 className="font-semibold mb-2">Pomoc</h4>
          <ul className="space-y-1">
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/regulamin">Regulamin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Kontakt</h4>
          <ul className="space-y-1">
            <li><a href="#">Wsparcie</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Social</h4>
          <ul className="space-y-1">
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Instagram</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
