import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'BlogVerse - Modern Publishing & Article Platform',
  description: 'A modern, full-stack blogging platform where readers create, read, like, comment, share, save, and subscribe to blog authors.',
  keywords: 'blog, articles, technology, nextjs, react, express, mysql, blogverse',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white min-h-screen flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
