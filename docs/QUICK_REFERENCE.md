# 🚀 Quick Reference Card

## ⚡ Start App
```bash
npm run dev
```
Open: http://localhost:5173

## 🐙 GitHub Sync Setup (5 min)

### Step 1: Create Repo
```
https://github.com/new
→ Name: finance-data
→ Private: ✅
→ Create
```

### Step 2: Get Token
```
https://github.com/settings/tokens
→ Generate new token (classic)
→ Scope: repo ✅
→ Generate
→ Copy token (ghp_...)
```

### Step 3: Configure App
```
App → Settings → GitHub Sync
→ Token: ghp_...
→ Owner: your-username
→ Repo: finance-data
→ Enable
```

### Step 4: Use on Other Devices
```
Same app URL
→ Settings → GitHub Sync
→ Same token, owner, repo
→ Enable
✅ Data synced!
```

## 📱 Deploy & Access

### Deploy to Vercel
```bash
npm run build
npm install -g vercel
vercel
```

### Access on Mobile
```
1. Open deployed URL
2. Add to home screen
3. Setup GitHub sync (same credentials)
4. Done! 🎉
```

## 💾 Backup Commands

### Export
```
Settings → Export YAML
Settings → Export JSON
```

### Import
```
Settings → Import YAML
Settings → Import JSON
```

## 🔧 Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Install dependencies
npm install
```

## 📊 Features Quick Access

| Feature | Location |
|---------|----------|
| View net worth | Dashboard |
| Add transaction | Transactions → Add |
| Add account | Accounts → Add |
| View chit fund | Chit Fund |
| See charts | Reports |
| Export data | Settings → Backup |
| GitHub sync | Settings → GitHub Sync |

## 🐛 Quick Fixes

### App won't start?
```bash
rm -rf node_modules
npm install
npm run dev
```

### GitHub sync failed?
- Check token is valid
- Verify repo exists
- Check internet connection

### Data not syncing?
- Use same token on all devices
- Check sync is enabled
- Refresh the page

## 📞 Help

- **Setup**: GITHUB_SYNC_SETUP.md
- **Deploy**: DEPLOYMENT.md
- **Full docs**: README.md

---

**That's it! Start tracking your finances! 💰**
