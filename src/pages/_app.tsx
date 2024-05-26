// pages/_app.tsx
import '../styles/globals.css'; // This is where you import Tailwind CSS
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
