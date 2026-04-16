// Vercel Web Analytics Integration
// This script initializes Web Analytics for the application
// Using ES module import from CDN

// Import and initialize Web Analytics
import { inject } from 'https://cdn.jsdelivr.net/npm/@vercel/analytics@1.3.1/+esm';

// Initialize Web Analytics
// This will automatically track page views and custom events
// Data is only collected in production (when deployed to Vercel)
inject({
  // Debug mode is automatically enabled in development
  // Set to false to disable debug logging even in development
  debug: false
});

console.log('Vercel Web Analytics initialized');
