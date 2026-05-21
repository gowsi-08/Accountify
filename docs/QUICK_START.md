# ⚡ Quick Start - Hardcoded Setup

## 🎯 Setup in 3 Steps (5 Minutes)

### Step 1: Create GitHub Repository

```
1. Go to: https://github.com/new
2. Name: finance-data
3. Visibility: PRIVATE ⚠️
4. Click "Create repository"
```

---

### Step 2: Get GitHub Token

```
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: Finance Tracker
4. Scope: ✓ repo
5. Generate and COPY token (ghp_...)
```

---

### Step 3: Configure App

**Edit `src/config.js`:**

```javascript
export const config = {
  github: {
    token: 'ghp_YOUR_TOKEN_HERE',    // ← Paste your token
    owner: 'your-username',          // ← Your GitHub username
    repo: 'finance-data',            // ← Your repo name
    branch: 'main',
    autoSetup: true
  },
  security: {
    pin: '123456',                   // ← Your 6-digit PIN
    autoSetup: true
  }
};
```

**Save and run:**

```bash
npm run dev
```

---

## ✅ Done!

Open http://localhost:5173

1. Enter your PIN (the one you set in config)
2. Start tracking finances!

Everything is auto-configured! 🎉

---

## 📝 Example Config

```javascript
export const config = {
  github: {
    token: 'ghp_abc123xyz789...',
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
```

---

## 🔒 Security

- ✅ Config file in `.gitignore`
- ✅ Never commit to public repo
- ✅ Use private GitHub repository
- ✅ Use strong PIN

---

## 📚 Full Documentation

- **HARDCODED_SETUP.md** - Detailed setup guide
- **SECURITY_FEATURES.md** - Security features
- **GITHUB_API_SETUP.md** - Manual GitHub setup
- **NEW_FEATURES_SUMMARY.md** - All features

---

**Need help?** Check HARDCODED_SETUP.md for troubleshooting!
