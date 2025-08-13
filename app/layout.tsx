import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

const themeScript = `
    (function() {
      try {
        const theme = localStorage.getItem('theme') || 'dark';
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;

export const metadata: Metadata = {
  title: 'Oracle Utilities Assistant',
  description: 'Your AI partner for OUAF documentation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable} h-full overflow-hidden`} suppressHydrationWarning>
      <body className="h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#272525',
              color: '#FAFAF8',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}

