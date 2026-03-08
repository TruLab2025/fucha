// components/Footer.tsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white mt-16 py-8">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text">
        <div>
          <img src="/fucha24.png" alt="Fucha24 logo" width={180} height={48} className="mb-2" />
          <ul className="space-y-1">
            <li><a href="#">Jak działa</a></li>
            <li><a href="#">Cennik</a></li>
            <li><a href="#">Kontakt</a></li>
            <li><a href="#">Regulamin</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Pomoc</h4>
          <ul className="space-y-1">
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Wsparcie</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Kontakt</h4>
          <p>support@fucha24.com</p>
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
