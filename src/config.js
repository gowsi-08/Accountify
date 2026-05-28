// ⚠️ IMPORTANT: This file now reads from environment variables
// Create a .env file in the root directory with your credentials
// See .env.example for the required variables

export const config = {
  // ============ GITHUB CREDENTIALS ============
  github: {
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    owner: import.meta.env.VITE_GITHUB_OWNER || '',
    repo: import.meta.env.VITE_GITHUB_REPO || '',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
    autoSetup: true
  },

  // ============ PIN CONFIGURATION ============
  security: {
    pin: import.meta.env.VITE_DEFAULT_PIN || '2026',
    autoSetup: true
  },

  // ============ CACHE SETTINGS ============
  cache: {
    duration: parseInt(import.meta.env.VITE_CACHE_DURATION) || 15 * 60 * 1000,
  },

  // ============ LOCKOUT SETTINGS ============
  lockout: {
    maxAttempts: parseInt(import.meta.env.VITE_LOCKOUT_MAX_ATTEMPTS) || 3,
    duration: parseInt(import.meta.env.VITE_LOCKOUT_DURATION) || 60 * 60 * 1000,
  }
};

// ============ INSTRUCTIONS ============
/*

1. SETUP ENVIRONMENT VARIABLES:
   - Copy .env.example to .env
   - Fill in your GitHub credentials
   - Set your PIN

2. FOR NETLIFY DEPLOYMENT:
   - Go to Site settings → Environment variables
   - Add all VITE_* variables from .env.example
   - Deploy!

3. SECURITY:
   - .env file is in .gitignore
   - Never commit credentials
   - Use Netlify environment variables for production

*/
