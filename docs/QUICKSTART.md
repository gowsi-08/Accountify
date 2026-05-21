# 🚀 Quick Start Guide

## Your Finance Tracker is Ready!

This is a **pure client-side application** - no backend server required! All data is stored in your browser's localStorage.

## 🎯 Start the App

```bash
npm run dev
```

Then open: **http://localhost:5173**

## 📋 What's Already Set Up

### Default Accounts (Total: ₹4,24,000)
1. **SBI** (Bank) - ₹45,000
2. **HDFC** (Bank) - ₹1,20,000
3. **Zerodha Wallet** (Wallet) - ₹5,000
4. **Stocks (Zerodha)** (Investment) - ₹80,000
5. **Mutual Funds (INDMoney)** (Investment) - ₹1,50,000
6. **My Chit Fund** (Chit Fund) - ₹24,000
   - Monthly contribution: ₹2,000
   - Duration: 20 months
   - Started: Jan 1, 2024

### Pre-configured Categories
**Income**: Salary, Freelance, Interest, Dividend, Rental, Other Income
**Expense**: Food, Transport, Bills & Utilities, Shopping, Medical, Entertainment, Investment, Other Expense

## 💾 How Data Storage Works

### Browser localStorage
- All your financial data is stored in your browser's localStorage
- Data persists even after closing the browser
- No internet connection required after initial load
- Private and secure (stored only on your device)

### Auto-backup
- Every time you save a transaction, account, or setting
- YAML backup is automatically created in localStorage
- You can download it anytime from Settings

### Manual Backup
1. Go to **Settings** page
2. Click **Export Backup** button
3. YAML file downloads to your computer
4. Store it safely!

### Restore from Backup
1. Go to **Settings** page
2. Click **Import Backup** button
3. Select your YAML file
4. All data is restored instantly

## 🎯 First Steps

### 1. Open the App
Navigate to: **http://localhost:5173**

### 2. Explore the Dashboard
- View your total net worth
- See all account balances
- Check chit fund progress

### 3. Add Your First Transaction
1. Click **Transactions** in the sidebar
2. Click **Add Transaction** button
3. Choose type (Income/Expense/Transfer)
4. Fill in the details
5. Watch balances update automatically!

### 4. Try These Features

#### Add a New Account
- Go to **Accounts** page
- Click **Add Account**
- Choose type and enter details

#### Track Chit Fund
- Go to **Chit Fund** page
- See monthly contribution log
- View progress and next due date

#### View Reports
- Go to **Reports** page
- See charts and visualizations
- Export transactions to CSV

#### Manage Settings
- Go to **Settings** page
- Add custom categories
- Export/Import YAML backups

## 💡 Pro Tips

1. **Regular Backups**: Export YAML backup weekly to your computer
2. **Use Categories**: Categorize transactions for better reports
3. **Check Reports**: Monthly income vs expense helps track spending
4. **Browser Data**: Don't clear browser data or you'll lose your financial data
5. **Multiple Devices**: Export from one device, import to another to sync

## 🔄 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📁 Data Location

Your financial data is stored in:
- **Browser localStorage**: `finance_tracker_data` (JSON format)
- **Auto-backup**: `finance_tracker_data_yaml` (YAML format)

To view in browser:
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Click localStorage
4. Find `finance_tracker_data`

## 🎨 Color Coding

- 🟢 **Green** = Income transactions
- 🔴 **Red** = Expense transactions
- 🔵 **Blue** = Transfer transactions

## ⚠️ Important Notes

1. **Balance Updates**: All transaction operations automatically update account balances
2. **Delete Warning**: Deleting accounts with transactions will show a warning
3. **Data Safety**: Always export backups before clearing browser data
4. **Browser Storage**: Data is stored locally - clearing browser data will delete everything
5. **No Server**: This is a pure client-side app - no backend server needed!

## 🆘 Troubleshooting

### Data Not Loading?
- Check if localStorage is enabled in your browser
- Try refreshing the page
- Check browser console for errors

### Lost Data?
- If you have a YAML backup, import it from Settings
- Otherwise, the app will start with default accounts

### Browser Compatibility?
- Use modern browsers (Chrome, Firefox, Safari, Edge)
- Ensure localStorage is not disabled
- Check if you're in private/incognito mode (data won't persist)

## 🔒 Privacy & Security

- ✅ All data stored locally in your browser
- ✅ No data sent to any server
- ✅ No internet required (after initial load)
- ✅ Complete privacy - only you can access your data
- ⚠️ Backup regularly - browser data can be cleared accidentally

## 🎉 You're All Set!

Start managing your finances with ease. The app is fully functional with:
- ✅ Full CRUD operations
- ✅ Automatic balance calculations
- ✅ Rich visualizations
- ✅ Browser-based persistence
- ✅ YAML export/import
- ✅ No backend required!

Happy tracking! 💰
