import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('main.jsx executing');

// Add error boundary
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found!');
  } else {
    console.log('Root element found, rendering app');
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
} catch (error) {
  console.error('Error rendering application:', error);
}
