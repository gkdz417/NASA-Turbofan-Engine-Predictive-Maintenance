import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NASA RUL Predictor | AI Dashboard',
  description: 'Predictive Maintenance interface for NASA Jet Engines using Deep Learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-between p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
