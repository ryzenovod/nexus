import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Purge legacy local storage keys so real sync data initializes immediately
try {
  ['nexus-storage', 'nexus-os-2026-v10', 'nexus-couple-os-v2'].forEach((k) => {
    localStorage.removeItem(k);
  });
} catch (e) {
  // Ignore storage access errors if in restricted mode
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
