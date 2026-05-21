# 🐙 GitHub Sync Setup Guide

## 🎯 What is GitHub Sync?

GitHub sync stores your finance data as a **JSON file** in your private GitHub repository. This allows you to:
- ✅ Access same data from mobile, PC, tablet
- ✅ Version control (see history of all changes)
- ✅ Free forever (no limits)
- ✅ Full control over your data
- ✅ View/edit data directly on GitHub

## 📋 Setup Steps (5 minutes)

### Step 1: Create a Private GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `finance-data` (or any name you like)
3. **Important:** Select **"Private"** (keep your data secure!)
4. Click **"Create repository"**

### Step 2: Generate Personal Access Token

1. Go to **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Finance Tracker`
4. Select expiration: **"No expiration"** (or choose a duration)
5. **Important:** Check the **"repo"** scope (full control of private repositories)
6. Scroll down and click **"Generate token"**
7. **Copy the token** (starts with `ghp_...`) - you won't see it again!

### Step 3: Configure in App

1. Open your Finance Tracker app
2. Go to **Settings** page
3. Find **"GitHub Sync"** section
4. Click **"Setup GitHub Sync"**
5. Fill in the details:
   - **GitHub Token**: Paste the token you copied
   - **Owner**: Your GitHub username
   - **Repository Name**: `finance-data` (or whatever you named it)
   - **Branch**: `main` (default)
6. Click **"Enable GitHub Sync"**

### Step 4: Done! 🎉

You'll see:
- ✓ Green success message
- ✓ "GitHub sync is configured!" banner
- ✓ Link to view your data on GitHub

## 📱 Using on Multiple Devices

### On Your Second Device (Mobile/PC):

1. Open the Finance Tracker app
2. Go to **Settings**
3. Click **"Setup GitHub Sync"**
4. Enter the **same details**:
   - Same GitHub token
   - Same owner/username
   - Same repository name
5. Click **"Enable GitHub Sync"**

**Result:** Both devices now share the same data! 🎊

## 🔄 How Sync Works

### Automatic Sync
- **On app load**: Fetches latest data from GitHub
- **On every save**: Pushes changes to GitHub
- **Commit message**: Includes timestamp for tracking

### View Your Data
Visit: `https://github.com/YOUR-USERNAME/finance-data/blob/main/finance-data.json`

You'll see your finance data in JSON format with full version history!

### Version History
- Click **"History"** button on GitHub
- See all changes with timestamps
- Revert to any previous version if needed

## 🔧 Managing GitHub Sync

### Disable Sync
1. Go to Settings
2. Click **"Enabled"** button (turns to "Disabled")
3. Data stays in localStorage only

### Enable Sync Again
1. Click **"Disabled"** button
2. Syncing resumes

### View on GitHub
Click the GitHub link in Settings to open your repository

## 💾 Data Storage

### Where is Your Data?
1. **Primary**: Browser localStorage (instant access)
2. **Backup**: GitHub repository (synced automatically)
3. **File**: `finance-data.json` in your repo

### File Structure
```json
{
  "accounts": [...],
  "transactions": [...],
  "categories": {...}
}
```

## 🔒 Security & Privacy

### Is it Safe?
- ✅ **Private repository** - only you can access
- ✅ **Personal access token** - stored only in your browser
- ✅ **HTTPS encryption** - all data encrypted in transit
- ✅ **GitHub security** - enterprise-grade protection

### Best Practices
1. **Use private repository** (never public!)
2. **Keep token secure** (don't share it)
3. **Use strong GitHub password**
4. **Enable 2FA on GitHub** (recommended)
5. **Regenerate token if compromised**

## 🆓 GitHub Free Tier

### Limits
- ✅ **Unlimited private repositories**
- ✅ **Unlimited commits**
- ✅ **Unlimited API requests** (with token)
- ✅ **Free forever**

### Perfect for Personal Use!
Your finance data is tiny (few KB), so you'll never hit any limits.

## ❓ Troubleshooting

### "Invalid GitHub token"
- Token might be expired
- Generate a new token with "repo" scope
- Make sure you copied the entire token

### "Repository not found"
- Check owner/username is correct
- Check repository name is correct
- Make sure repository exists
- Verify it's not a typo

### "Failed to sync to GitHub"
- Check internet connection
- Verify token hasn't expired
- Check GitHub status: https://www.githubstatus.com
- Data is still saved locally

### Data not syncing between devices
- Use **same token** on all devices
- Use **same owner/repo** on all devices
- Check sync is **enabled** on both
- Try refreshing the page

### Lost token?
1. Go to https://github.com/settings/tokens
2. Delete old token
3. Generate new token
4. Update in Settings on all devices

## 🎯 Advanced Features

### Manual Sync
- Data syncs automatically
- No manual action needed!

### View Commit History
```bash
# Clone your repo
git clone https://github.com/YOUR-USERNAME/finance-data.git
cd finance-data

# View history
git log --oneline

# View specific change
git show COMMIT_HASH
```

### Restore Previous Version
1. Go to GitHub repository
2. Click on `finance-data.json`
3. Click **"History"**
4. Find the version you want
5. Click **"View"**
6. Copy the JSON content
7. In app: Settings → Import JSON
8. Paste and import

### Backup Strategy
1. **GitHub** (automatic) - primary backup
2. **Export JSON** (weekly) - local backup
3. **Export YAML** (monthly) - human-readable backup

## 📊 What Gets Synced?

Everything:
- ✅ All accounts
- ✅ All transactions
- ✅ All categories
- ✅ Account balances
- ✅ Chit fund details

## 🌐 Access Anywhere

### Supported Devices
- 💻 Desktop (Windows, Mac, Linux)
- 📱 Mobile (iOS, Android)
- 📱 Tablet (iPad, Android tablets)

### Supported Browsers
- Chrome / Edge
- Firefox
- Safari
- Opera

## 🎉 Benefits of GitHub Sync

1. **Version Control** - See history of all changes
2. **Free Forever** - No subscription fees
3. **Reliable** - GitHub's 99.9% uptime
4. **Portable** - Export data anytime
5. **Transparent** - View raw JSON on GitHub
6. **Secure** - Private repository
7. **No Limits** - Unlimited syncs

## 📞 Support

- **GitHub Issues**: https://github.com/YOUR-USERNAME/finance-data/issues
- **GitHub Docs**: https://docs.github.com
- **Token Help**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

---

**Enjoy seamless cross-device finance tracking with GitHub! 💰🐙**
