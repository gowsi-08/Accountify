# 🔧 Troubleshooting Guide

## White Screen / Nothing Showing

### Step 1: Check Browser Console

1. Open your browser (Chrome/Edge/Firefox)
2. Press **F12** (or Right-click → Inspect)
3. Click on **"Console"** tab
4. Look for red error messages

**Common errors and fixes:**

---

### Error: "Failed to fetch" or Network errors

**Cause:** Vite dev server not running

**Fix:**
```bash
# Make sure server is running
npm run dev
```

---

### Error: Module not found or Import errors

**Cause:** Missing dependencies or corrupted node_modules

**Fix:**
```bash
# Clean install
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

---

### Error: Tailwind CSS not working

**Cause:** PostCSS configuration issue

**Fix:**
```bash
# Reinstall Tailwind
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17
npm run dev
```

---

### Error: "Cannot read property of undefined"

**Cause:** Data loading issue

**Fix:**

1. Open browser console (F12)
2. Go to **Application** tab → **Local Storage**
3. Find `http://localhost:5173`
4. Delete `finance_tracker_data` key
5. Refresh page

---

## Step 2: Test with Simple Component

If still not working, test if React is loading:

1. Open `src/main.jsx`
2. Find this line:
   ```javascript
   import App from './App.jsx'
   ```
3. Change to:
   ```javascript
   import App from './App.test.jsx'
   ```
4. Save and check browser

If you see "Finance Tracker Test", React is working but there's an issue with the main App.

---

## Step 3: Clear All Caches

```bash
# Stop the server (Ctrl+C)

# Clear Vite cache
Remove-Item -Recurse -Force node_modules\.vite

# Clear browser cache
# In browser: Ctrl+Shift+Delete → Clear cache

# Restart
npm run dev
```

---

## Step 4: Check Port

Make sure you're accessing the correct URL:

```
http://localhost:5173
```

NOT:
- ~~http://localhost:5174~~
- ~~http://localhost:3000~~

---

## Step 5: Fresh Start

If nothing works, start fresh:

```bash
# Stop server (Ctrl+C)

# Remove everything
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force dist
Remove-Item package-lock.json

# Reinstall
npm install

# Start
npm run dev
```

---

## Common Issues

### Issue: Port already in use

**Error:** `Port 5173 is in use`

**Fix:**
```bash
# Kill the process using the port
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Or use a different port
npm run dev -- --port 3000
```

---

### Issue: Blank page but no errors

**Possible causes:**
1. CSS not loading
2. JavaScript disabled
3. Browser compatibility

**Fix:**
1. Check if CSS file exists: `src/index.css`
2. Enable JavaScript in browser
3. Try different browser (Chrome recommended)
4. Hard refresh: **Ctrl+Shift+R**

---

### Issue: "Module not found: js-yaml"

**Fix:**
```bash
npm install js-yaml axios
npm run dev
```

---

### Issue: GitHub sync not working

See **GITHUB_API_SETUP.md** for detailed troubleshooting.

---

## Debug Mode

### Enable Verbose Logging

Add this to `src/App.jsx` at the top of the `loadData` function:

```javascript
const loadData = async () => {
  console.log('Loading data...');
  try {
    const fetchedData = await dataService.getData();
    console.log('Data loaded:', fetchedData);
    setData(fetchedData);
  } catch (error) {
    console.error('Failed to load data:', error);
    console.error('Error details:', error.message, error.stack);
    showToast('Failed to load data', 'error');
  } finally {
    setLoading(false);
  }
};
```

Check console for detailed logs.

---

## Still Not Working?

### Collect Information

1. **Browser Console Errors** (F12 → Console tab)
2. **Network Tab** (F12 → Network tab)
3. **Node Version:** `node --version`
4. **NPM Version:** `npm --version`
5. **Operating System:** Windows/Mac/Linux

### Check These Files Exist

```
src/
├── App.jsx ✓
├── main.jsx ✓
├── index.css ✓
├── api/
│   └── dataService.js ✓
├── components/
│   ├── Sidebar.jsx ✓
│   └── Toast.jsx ✓
└── pages/
    ├── Dashboard.jsx ✓
    ├── Transactions.jsx ✓
    ├── Accounts.jsx ✓
    ├── ChitFund.jsx ✓
    ├── Reports.jsx ✓
    └── Settings.jsx ✓
```

---

## Quick Fixes Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Correct URL (http://localhost:5173)
- [ ] Browser console checked (F12)
- [ ] No red errors in console
- [ ] Node modules installed (`npm install`)
- [ ] Cache cleared (Ctrl+Shift+R)
- [ ] JavaScript enabled in browser
- [ ] Using modern browser (Chrome/Edge/Firefox)

---

## Contact

If you've tried everything and it still doesn't work, please provide:
1. Screenshot of browser console (F12)
2. Screenshot of terminal/command prompt
3. Your Node version (`node --version`)
4. Your OS (Windows/Mac/Linux)

---

**Most issues are solved by:**
```bash
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

**Then hard refresh browser: Ctrl+Shift+R**
