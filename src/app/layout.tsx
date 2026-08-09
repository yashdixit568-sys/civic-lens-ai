import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Civic Lens AI — Smart City Civic Intelligence Platform',
  description: 'AI-powered civic intelligence platform for citizens, municipal authorities, and city administrators.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="darkreader-lock" />
      </head>
      <body className="bg-white text-slate-900 min-h-screen antialiased" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
        {children}
      </body>
    </html>
  );
}
