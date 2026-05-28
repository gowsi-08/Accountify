// ============================================
// FINANCE TRACKER - CONFIGURATION
// ============================================
// 
// This file reads from environment variables (.env file)
// Copy .env.example to .env and fill in your details
// 
// ⚠️ NEVER commit .env to public repositories!
// ============================================

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

// ============================================
// QUICK SETUP INSTRUCTIONS
// ============================================
/*

STEP 1: CREATE GITHUB REPOSITORY
--------------------------------
1. Go to: https://github.com/new
2. Repository name: finance-data
3. Visibility: PRIVATE ⚠️
4. Click "Create repository"


STEP 2: GENERATE GITHUB TOKEN
------------------------------
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: Finance Tracker
4. Expiration: No expiration (or choose duration)
5. Scopes: Check "repo" ✓
6. Click "Generate token"
7. COPY THE TOKEN (starts with ghp_...)


STEP 3: FILL IN THIS FILE
--------------------------
Replace:
- 'ghp_YOUR_GITHUB_TOKEN_HERE' → Your actual token
- 'YOUR_GITHUB_USERNAME' → Your GitHub username
- 'YOUR_REPO_NAME' → Your repository name
- '123456' → Your desired 6-digit PIN


STEP 4: SAVE AS src/config.js
------------------------------
1. Save this file as: src/config.js
2. Make sure it's in .gitignore
3. Run: npm run dev
4. Done! Everything auto-configured!


EXAMPLE CONFIGURATION
---------------------

export const config = {
  github: {
    token: 'ghp_abc123xyz789def456ghi012jkl345mno678',
    owner: 'john-doe',
    repo: 'my-finance-data',
    branch: 'main',
    autoSetup: true
  },
  security: {
    pin: '987654',
    autoSetup: true
  }
};


SECURITY NOTES
--------------
⚠️ Keep this file secure!
⚠️ Never commit to public repositories!
⚠️ Already added to .gitignore
⚠️ Use a strong PIN (not 123456!)

*/
