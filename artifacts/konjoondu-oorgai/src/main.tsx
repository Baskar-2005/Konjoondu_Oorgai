import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

// When Google redirects back after signInWithRedirect, the browser may restore
// the page from Back-Forward Cache instead of doing a fresh load. BFCache skips
// useEffect re-runs, so getRedirectResult never fires and the login silently fails.
// Force a full reload whenever the page is restored from BFCache.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
