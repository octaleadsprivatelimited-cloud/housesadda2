import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure React is available globally for error boundaries
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

// Error handling for root render
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure index.html has a div with id='root'");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #f3f4f6;">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
          <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">Application Error</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">Failed to load the application.</p>
          <p style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 1.5rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}
