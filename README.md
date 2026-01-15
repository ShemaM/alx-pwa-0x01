ProWeb Pulse: Mastering PWA Fundamentals
A Cine Seek Progressive Web App (PWA) built with Next.js and next-pwa. Features offline support, installability, and improved performance via a service worker and a web app manifest.

What we're building
Cine Seek PWA built with Next.js and the next-pwa plugin
Offline capability through service workers
Installable web app via a web app manifest
Fast, responsive UI for movie discovery and browsing
Quick start
Prerequisites:

Node.js v14+
Git
Clone the repository
git clone https://github.com/YOUR_USER_NAME/alx-project-0x14.git
cd alx-movie-app
Install dependencies
npm install
Install PWA-related packages
npm i @ducanh2912/next-pwa
npm i -D webpack
Verify package.json (snippets)
"webpack": "^5.*"
"@ducanh2912/next-pwa": "^10.2.9"
Enable PWA in Next.js
Edit next.config.mjs and configure withPWA:
js
import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const withPWA = withPWAInit({
  dest: 'public'
})

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['m.media-amazon.com'],
  },
};

export default withPWA({
  ...nextConfig
})
Create Web App Manifest
Create public/manifest.json with the provided content (name, icons, colors, start_url, display, orientation).
Icon paths:
public/icons/android-chrome-192x192.png
public/icons/apple-icon-152x152.png
public/icons/ms-icon-310x310.png
Link manifest in _document
Create or update pages/_document.tsx:
tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0070f3" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
Run locally
npm run dev
Open http://localhost:3000
Validate PWA features
In Chrome: DevTools > Application
Service Worker is registered
Manifest is loaded
Test offline mode by disconnecting network and reloading
Optional: Deploy to Vercel
npm i -g vercel
vercel
Follow prompts and test on mobile
Validation checklist
 Next.js config includes next-pwa integration
 manifest.json exists and is valid
 Icons exist at the specified paths
 _document.tsx links the manifest correctly
 Service worker and caching behavior tested locally
 Deployment verified on staging/production
