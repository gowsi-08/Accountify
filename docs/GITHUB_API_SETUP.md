# 🐙 GitHub API Setup Guide - Complete Walkthrough

## 📋 What You'll Need
- A GitHub account (free)
- 5 minutes of your time

---

## 🎯 Step-by-Step Setup

### Step 1: Create a Private GitHub Repository

This repository will store your finance data as a JSON file.

1. **Go to GitHub**
   - Open: https://github.com/new
   - Or click the **"+"** icon in top-right → **"New repository"**

2. **Configure Repository**
   ```
   Repository name: finance-data
   Description: My personal finance data (optional)
   Visibility: ⚠️ PRIVATE (very important!)
   ✅ Add a README file (optional)
   ```

3. **Click "Create repository"**

4. **Note Your Details**
   ```
   Owner: your-github-username
   Repository: finance-data
   ```

---

### Step 2: Generate Personal Access Token (Classic)

This token allows the app to read/write to your repository.

#### 2.1 Navigate to Token Settings

**Option A - Direct Link:**
- Go to: https://github.com/settings/tokens

**Option B - Manual Navigation:**
1. Click your profile picture (top-right)
2. Click **"Settings"**
3. Scroll down to **"Developer settings"** (bottom of left sidebar)
4. Click **"Personal access tokens"**
5. Click **"Tokens (classic)"**

#### 2.2 Generate New Token

1. Click **"Generate new token"** dropdown
2. Select **"Generate new token (classic)"**

#### 2.3 Configure Token

Fill in the form:

```
Note: Finance Tracker App
(This helps you remember what this token is for)

Expiration: No expiration
(Or choose a duration - you'll need to regenerate when it expires)

Select scopes:
✅ repo (Full control of private repositories)
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events
```

**Important:** Only check the **"repo"** checkbox at the top level. This automatically selects all sub-items.

#### 2.4 Generate and Copy Token

1. Scroll down and click **"Generate token"**
2. **IMPORTANT:** Copy the token immediately!
   ```
   It looks like: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. **Save it somewhere safe** - you won't be able to see it again!

---

### Step 3: Configure in Finance Tracker App

Now let's connect your app to GitHub.

#### 3.1 Open Your App

- Local: http://localhost:5173
- Deployed: Your Vercel/Netlify URL

#### 3.2 Navigate to Settings

1. Click **"Settings"** in the sidebar (bottom)
2. Find the **"GitHub Sync"** section

#### 3.3 Click "Setup GitHub Sync"

You'll see a form with these fields:

#### 3.4 Fill in the Details

```
GitHub Token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
(Paste the token you copied in Step 2)

Owner (Username): your-github-username
(Your GitHub username, e.g., "john-doe")

Repository Name: finance-data
(The repo name you created in Step 1)

Branch: main
(Default branch - usually "main" or "master")
```

#### 3.5 Enable Sync

1. Click **"Enable GitHub Sync"**
2. Wait for confirmation message
3. You should see: **"✓ GitHub sync is configured!"**

---

### Step 4: Verify Setup

#### 4.1 Check Success Message

You should see a green banner:
```
✓ GitHub sync is configured!
Your data automatically syncs to GitHub on every change.

Repository: your-username/finance-data
Branch: main
File: finance-data.json
```

#### 4.2 View Your Data on GitHub

1. Click the GitHub link in the success message, or
2. Go to: `https://github.com/your-username/finance-data`
3. You should see a file: **`finance-data.json`**
4. Click on it to view your finance data!

#### 4.3 Test Sync

1. Go to **"Transactions"** page
2. Add a test transaction
3. Go back to GitHub and refresh
4. Click on `finance-data.json`
5. You should see your new transaction in the JSON!

---

## 📱 Setup on Additional Devices (Mobile/PC)

### Same Data on All Devices

To access your data on another device:

#### On Your Second Device:

1. **Open the app** (same URL)
2. **Go to Settings** → GitHub Sync
3. **Click "Setup GitHub Sync"**
4. **Enter the SAME details:**
   ```
   Token: (same token from Step 2)
   Owner: (same username)
   Repository: (same repo name)
   Branch: main
   ```
5. **Click "Enable GitHub Sync"**

**Result:** Both devices now share the same data! 🎉

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use a **private** repository
- ✅ Keep your token **secret**
- ✅ Use **strong GitHub password**
- ✅ Enable **2FA** on GitHub (recommended)
- ✅ Regenerate token if compromised

### ❌ DON'T:
- ❌ Share your token with anyone
- ❌ Commit token to code
- ❌ Use public repository
- ❌ Post token in screenshots
- ❌ Store token in plain text files

---

## 🔧 Troubleshooting

### Error: "Invalid GitHub token"

**Cause:** Token is wrong or expired

**Fix:**
1. Go to https://github.com/settings/tokens
2. Check if token exists and is active
3. If expired, generate a new token
4. Update in app Settings

---

### Error: "Repository not found"

**Cause:** Wrong owner/repo name or repo doesn't exist

**Fix:**
1. Check repository exists: `https://github.com/your-username/finance-data`
2. Verify owner name (your GitHub username)
3. Verify repository name (exact match, case-sensitive)
4. Make sure token has "repo" scope

---

### Error: "Failed to sync to GitHub"

**Cause:** Network issue or permission problem

**Fix:**
1. Check internet connection
2. Verify token has "repo" scope
3. Check repository is private (token needs repo scope for private repos)
4. Try disabling and re-enabling sync

---

### Data not syncing between devices

**Cause:** Different tokens or repos on different devices

**Fix:**
1. Use **same token** on all devices
2. Use **same owner/repo** on all devices
3. Check sync is **enabled** on both devices
4. Refresh the page

---

### Lost your token?

**No problem!**

1. Go to https://github.com/settings/tokens
2. Find your old token
3. Click **"Delete"** (if you want)
4. Generate a new token (follow Step 2 again)
5. Update in app Settings on all devices

---

## 📊 Understanding the Data File

### What's in `finance-data.json`?

Your file contains:

```json
{
  "accounts": [
    {
      "id": "acc_001",
      "name": "SBI",
      "type": "bank",
      "balance": 45000,
      "notes": ""
    }
  ],
  "transactions": [
    {
      "id": "txn_001",
      "date": "2025-05-09",
      "type": "income",
      "amount": 5000,
      "to_account": "acc_001",
      "category": "Salary",
      "description": "Monthly salary"
    }
  ],
  "categories": {
    "income": ["Salary", "Freelance", ...],
    "expense": ["Food", "Transport", ...]
  }
}
```

### View Version History

1. Go to your repo on GitHub
2. Click on `finance-data.json`
3. Click **"History"** button
4. See all changes with timestamps!

---

## 🎯 Quick Reference

### Token Scopes Needed
```
✅ repo (Full control of private repositories)
```

### Repository Settings
```
Visibility: Private ⚠️
Name: finance-data (or any name)
Branch: main (default)
```

### App Configuration
```
Settings → GitHub Sync → Setup
→ Token: ghp_...
→ Owner: your-username
→ Repo: finance-data
→ Branch: main
→ Enable
```

### View Data on GitHub
```
https://github.com/YOUR-USERNAME/finance-data/blob/main/finance-data.json
```

---

## 💡 Pro Tips

### Tip 1: Bookmark Your Repo
Save this link for quick access:
```
https://github.com/your-username/finance-data
```

### Tip 2: Regular Backups
Even with GitHub sync, export backups monthly:
```
Settings → Export JSON
```

### Tip 3: Check Sync Status
After adding transactions, check the toast message:
- ✅ "Data saved and synced to GitHub" = Success!
- ⚠️ "Data saved locally (GitHub sync failed)" = Check connection

### Tip 4: Token Expiration
Set a calendar reminder before token expires to regenerate it.

### Tip 5: Multiple Repos
You can create different repos for different purposes:
- `finance-data-personal`
- `finance-data-business`

---

## 🆘 Need More Help?

### GitHub Documentation
- Tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- Repositories: https://docs.github.com/en/repositories

### Check GitHub Status
If sync is failing: https://www.githubstatus.com

---

## ✅ Setup Checklist

- [ ] Created private GitHub repository
- [ ] Generated Personal Access Token with "repo" scope
- [ ] Copied and saved token securely
- [ ] Configured app with token, owner, repo
- [ ] Enabled GitHub sync
- [ ] Verified `finance-data.json` exists on GitHub
- [ ] Tested by adding a transaction
- [ ] Setup on additional devices (if needed)

---

## 🎉 You're Done!

Your Finance Tracker is now synced with GitHub!

**What happens now:**
- ✅ Every transaction automatically saves to GitHub
- ✅ Data syncs across all your devices
- ✅ Full version history of all changes
- ✅ Free forever, no limits

**Start tracking your finances! 💰🐙**
