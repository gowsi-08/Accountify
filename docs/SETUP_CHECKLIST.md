# ✅ Setup Checklist

## Quick Setup (5 Minutes)

### 1. GitHub Repository
- [ ] Go to https://github.com/new
- [ ] Name: `finance-data`
- [ ] Visibility: **PRIVATE** ⚠️
- [ ] Click "Create repository"

### 2. GitHub Token
- [ ] Go to https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Name: `Finance Tracker`
- [ ] Scope: ✓ **repo**
- [ ] Click "Generate token"
- [ ] Copy token (starts with `ghp_...`)

### 3. Configure App
- [ ] Open `src/config.js`
- [ ] Paste GitHub token
- [ ] Add GitHub username
- [ ] Add repository name
- [ ] Set your 6-digit PIN
- [ ] Save file

### 4. Run App
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:5173
- [ ] Enter your PIN
- [ ] ✅ Done!

---

## Verification

### Check Auto-Setup Worked

**Browser Console (F12):**

```javascript
// Check GitHub
const github = JSON.parse(localStorage.getItem('finance_tracker_github_config'));
console.log('✓ GitHub:', github?.owner + '/' + github?.repo);

// Check PIN
const auth = localStorage.getItem('finance_tracker_auth');
console.log('✓ PIN setup:', !!auth);

// Check GitHub file
console.log('✓ Visit: https://github.com/' + github?.owner + '/' + github?.repo);
```

---

## Security Checklist

- [ ] Repository is **PRIVATE**
- [ ] Token has **repo** scope
- [ ] PIN is **6 digits**
- [ ] `src/config.js` in `.gitignore`
- [ ] Never commit config to public repo
- [ ] Token is secure (not shared)

---

## Features Working?

- [ ] PIN login works
- [ ] Dashboard loads
- [ ] Can add transactions
- [ ] Data saves instantly
- [ ] Rate limit badge shows in sidebar
- [ ] GitHub file created (check on GitHub)

---

## Next Steps

- [ ] Add your real accounts
- [ ] Add some transactions
- [ ] Check GitHub sync (visit repo)
- [ ] Export a backup
- [ ] Deploy to Vercel/Netlify
- [ ] Access from mobile

---

## 🎉 All Done!

Your finance tracker is fully configured and ready to use!

**Start tracking your finances! 💰**
