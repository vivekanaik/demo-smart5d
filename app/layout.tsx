import type { Metadata } from 'next';
import { Rum_Raisin, Anton } from 'next/font/google';
import './globals.css';

const rumRaisin = Rum_Raisin({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-rum-raisin',
});

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
});

export const metadata: Metadata = {
  title: '5D MENU | Smart Menu',
  description: 'Smart 5D Restaurant Menu featuring Augmented Reality',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Inline script to prevent hydration flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`antialiased min-h-screen text-black dark:text-white bg-satin transition-colors duration-500 font-sans ${rumRaisin.variable} ${anton.variable}`}>
        {children}
      </body>
    </html>
  );
}

