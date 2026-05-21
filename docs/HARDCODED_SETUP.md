# 🔧 Hardcoded Configuration Setup

## Quick Setup (5 Minutes)

Instead of setting up GitHub and PIN through the UI, you can hardcode everything in a config file for instant setup!

---

## 📋 Step-by-Step Instructions

### Step 1: Get Your GitHub Credentials

1. **Create Private Repository:**
   - Go to https://github.com/new
   - Name: `finance-data` (or any name)
   - **Important:** Select **Private**
   - Click "Create repository"

2. **Generate Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: `Finance Tracker`
   - Scope: Check **"repo"** (full control)
   - Click "Generate token"
   - **Copy the token** (starts with `ghp_...`)

3. **Note Your Details:**
   ```
   Token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Owner: your-github-username
   Repo: finance-data
   ```

---

### Step 2: Configure the App

1. **Open the config file:**
   ```
   src/config.js
   ```

2. **Replace the placeholders:**

   ```javascript
   export const config = {
     github: {
       token: 'ghp_YOUR_ACTUAL_TOKEN_HERE',    // ← Paste your token
       owner: 'your-username',                  // ← Your GitHub username
       repo: 'finance-data',                    // ← Your repo name
       branch: 'main',                          // ← Usually 'main'
       autoSetup: true                          // ← Keep as true
     },
     security: {
       pin: '123456',                           // ← Change to your 6-digit PIN
       autoSetup: true                          // ← Keep as true
     }
   };
   ```

3. **Example (with real values):**

   ```javascript
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
   ```

4. **Save the file**

---

### Step 3: Start the App

```bash
npm run dev
```

**That's it!** The app will:
- ✅ Auto-configure GitHub connection
- ✅ Auto-setup your PIN
- ✅ Create initial data file on GitHub
- ✅ Ready to use!

---

## 🎯 What Happens on First Load

1. **App checks config file**
2. **Finds GitHub credentials** → Auto-configures
3. **Finds PIN** → Auto-setups
4. **Creates `finance-data.json` on GitHub**
5. **Shows PIN login screen**
6. **Enter your PIN** (the one you set in config)
7. **You're in!** 🎉

---

## 🔐 Security Notes

### ⚠️ IMPORTANT:

1. **Never commit `src/config.js` to public repositories!**
   - Already added to `.gitignore`
   - Contains sensitive credentials

2. **Keep your token secure:**
   - Don't share it
   - Don't post in screenshots
   - Regenerate if compromised

3. **Use a strong PIN:**
   - Not 123456 (too obvious!)
   - Not your birthday
   - Something you'll remember

---

## 📝 Configuration Options

### GitHub Settings

```javascript
github: {
  token: 'ghp_...',        // Your GitHub token (required)
  owner: 'username',       // Your GitHub username (required)
  repo: 'repo-name',       // Repository name (required)
  branch: 'main',          // Branch name (default: 'main')
  autoSetup: true          // Auto-configure on load (default: true)
}
```

### Security Settings

```javascript
security: {
  pin: '123456',           // Your 6-digit PIN (required)
  autoSetup: true          // Auto-configure on load (default: true)
}
```

### Cache Settings

```javascript
cache: {
  duration: 5 * 60 * 1000  // 5 minutes in milliseconds
}
```

### Lockout Settings

```javascript
lockout: {
  maxAttempts: 4,          // Failed attempts before lockout
  duration: 60 * 60 * 1000 // Lockout duration (1 hour)
}
```

---

## 🔄 Updating Configuration

### Change GitHub Credentials

1. Open `src/config.js`
2. Update token/owner/repo
3. Save file
4. Clear browser data:
   ```javascript
   // Browser console (F12)
   localStorage.clear();
   location.reload();
   ```

### Change PIN

1. Open `src/config.js`
2. Update `pin: '123456'` to new PIN
3. Save file
4. Clear auth data:
   ```javascript
   // Browser console (F12)
   localStorage.removeItem('finance_tracker_auth');
   location.reload();
   ```

---

## 🐛 Troubleshooting

### "Invalid GitHub token"

**Problem:** Token is wrong or expired

**Solution:**
1. Generate new token on GitHub
2. Update `src/config.js`
3. Clear localStorage and reload

### "Repository not found"

**Problem:** Wrong owner/repo name

**Solution:**
1. Check repository exists on GitHub
2. Verify owner and repo names in config
3. Make sure repository is private (token needs repo scope)

### PIN not working

**Problem:** Wrong PIN or not auto-configured

**Solution:**
1. Check PIN in `src/config.js`
2. Make sure `autoSetup: true`
3. Clear auth data:
   ```javascript
   localStorage.removeItem('finance_tracker_auth');
   location.reload();
   ```

### Auto-setup not working

**Problem:** Config not being read

**Solution:**
1. Check `src/config.js` exists
2. Verify syntax (no typos)
3. Check browser console for errors
4. Make sure `autoSetup: true` for both

---

## 📊 Verification

### Check if Auto-Setup Worked

**Open browser console (F12):**

```javascript
// Check GitHub config
const github = JSON.parse(localStorage.getItem('finance_tracker_github_config'));
console.log('GitHub configured:', !!github);
console.log('Owner:', github?.owner);
console.log('Repo:', github?.repo);

// Check PIN setup
const auth = localStorage.getItem('finance_tracker_auth');
console.log('PIN configured:', !!auth);

// Check GitHub file
// Visit: https://github.com/YOUR-USERNAME/YOUR-REPO
// You should see: finance-data.json
```

---

## 🎯 Quick Reference

### Full Example Config

```javascript
export const config = {
  // Your actual credentials
  github: {
    token: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz',
    owner: 'john-doe',
    repo: 'my-finance-tracker',
    branch: 'main',
    autoSetup: true
  },
  
  // Your PIN
  security: {
    pin: '987654',
    autoSetup: true
  },
  
  // Optional: Customize cache
  cache: {
    duration: 10 * 60 * 1000  // 10 minutes
  },
  
  // Optional: Customize lockout
  lockout: {
    maxAttempts: 3,           // 3 attempts
    duration: 30 * 60 * 1000  // 30 minutes
  }
};
```

---

## 🚀 Benefits of Hardcoded Setup

✅ **No manual setup** - Everything auto-configured
✅ **Faster deployment** - Just edit one file
✅ **Consistent** - Same config across devices
✅ **Easy backup** - Just save config file
✅ **Quick reset** - Clear localStorage, reload

---

## ⚠️ Security Checklist

- [ ] Config file has real credentials
- [ ] Repository is **private** (not public!)
- [ ] Token has **repo** scope
- [ ] PIN is **6 digits**
- [ ] Config file in `.gitignore`
- [ ] Never commit config to public repo
- [ ] Keep token secure

---

## 🎉 You're Done!

1. ✅ Edit `src/config.js`
2. ✅ Add your credentials
3. ✅ Save file
4. ✅ Run `npm run dev`
5. ✅ Enter your PIN
6. ✅ Start tracking finances!

**Everything is auto-configured! No manual setup needed! 🚀**

---

## 📞 Need Help?

**Common Issues:**
- Token invalid → Regenerate on GitHub
- Repo not found → Check owner/repo names
- PIN not working → Check config.js syntax
- Auto-setup failed → Check browser console

**All issues can be resolved by checking the config file and browser console!**
