# Configuration Setup

## Environment Variables Setup

This project uses environment variables for configuration (secure and deployment-friendly).

### Local Development Setup:

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and fill in your details:**
   ```env
   VITE_GITHUB_TOKEN=your_github_token_here
   VITE_GITHUB_OWNER=your_github_username
   VITE_GITHUB_REPO=your_repo_name
   VITE_GITHUB_BRANCH=main
   VITE_DEFAULT_PIN=123456
   ```

3. **The `.env` file is in `.gitignore`** - it won't be committed.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

### For Netlify Deployment:

1. **Go to your Netlify site dashboard**
2. **Navigate to:** Site settings → Environment variables
3. **Add the following variables:**
   - `VITE_GITHUB_TOKEN` - Your GitHub Personal Access Token
   - `VITE_GITHUB_OWNER` - Your GitHub username
   - `VITE_GITHUB_REPO` - Your repository name
   - `VITE_GITHUB_BRANCH` - `main`
   - `VITE_DEFAULT_PIN` - Your 6-digit PIN

4. **Redeploy your site**

### Getting GitHub Credentials:

**Create a Private Repository:**
1. Go to https://github.com/new
2. Name: `DataFinanceTracker` (or any name)
3. **Make it PRIVATE** ⚠️
4. Click "Create repository"

**Generate Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `Finance Tracker`
4. Expiration: Choose duration or "No expiration"
5. Scopes: Check **"repo"** ✓
6. Click "Generate token"
7. **Copy the token** (starts with `ghp_...` or `github_pat_...`)

### Security Notes:

✅ **Environment variables are secure:**
- Not committed to repository
- Different values for dev/production
- Easy to rotate credentials

⚠️ **NEVER commit:**
- `.env` file
- Tokens or credentials
- Personal information

### Troubleshooting:

**Variables not loading?**
- Restart dev server after changing `.env`
- Check variable names start with `VITE_`
- Verify `.env` is in project root

**Netlify build failing?**
- Ensure all environment variables are set in Netlify dashboard
- Check variable names match exactly
- Redeploy after adding variables
