import React from 'react';

export type IconName =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'bell'
  | 'briefcase'
  | 'calendar'
  | 'check'
  | 'clock'
  | 'copy'
  | 'file'
  | 'filter'
  | 'hammer'
  | 'leaf'
  | 'lock'
  | 'map-pin'
  | 'menu'
  | 'package'
  | 'phone'
  | 'plus'
  | 'quote'
  | 'search'
  | 'shield'
  | 'sparkles'
  | 'transport'
  | 'users'
  | 'wallet'
  | 'x'
  | 'zap';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 20, className = '', ...props }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    'arrow-right': <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    'arrow-up-right': <><path d="M7 17 17 7"/><path d="M7 7h10v10"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/><path d="M10 12v2h4v-2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    hammer: <><path d="m14 5 5 5"/><path d="m12 7 5-5 5 5-5 5z"/><path d="M14 10 5 19l-2 2"/></>,
    leaf: <><path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z"/><path d="M4 21c3-6 7-9 13-12"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    'map-pin': <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    package: <><path d="m4 7 8-4 8 4-8 4z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    quote: <><path d="M9 11H5a4 4 0 0 0 4 4v4H5a8 8 0 0 1 0-16h4z"/><path d="M21 11h-4a4 4 0 0 0 4 4v4h-4a8 8 0 0 1 0-16h4z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z"/><path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z"/><path d="m5 15 .7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7z"/></>,
    transport: <><path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14"/><path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z"/></>,
    x: <><path d="m6 6 12 12M18 6 6 18"/></>,
    zap: <path d="m13 2-9 12h8l-1 8 9-12h-8z"/>,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
