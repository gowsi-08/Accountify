# 💰 Personal Finance Tracker

A comprehensive, secure, and feature-rich personal finance management application built with React, Vite, and GitHub as a backend.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff)

---

## 🌟 Features

### 💸 Core Financial Management
- **Transactions**: Income, Expense, Transfer tracking
- **Accounts**: Bank, Investment, Wallet, Chit Fund management
- **Categories**: Customizable income and expense categories
- **Tags**: Flexible transaction organization with multiple tags
- **Attachments**: Upload receipts and documents (images & PDFs)

### 📊 Advanced Analytics
- **Dashboard**: Real-time financial overview
- **Reports**: Comprehensive analytics with charts
  - Year-to-Date Summary
  - Month-over-Month Comparison
  - Net Worth Trend (12 months)
  - Category Breakdown
  - Tag-based Analytics
- **Budget Tracking**: Set limits and track spending
- **Loan & EMI Tracker**: Manage loans with amortization schedules

### 📄 Export Options
- **PDF Reports**: 4 types of professional reports
  - Complete Financial Report
  - Monthly Report
  - Transaction History
  - Tax Report
- **CSV Export**: For data analysis in Excel

### 🔐 Security & Privacy
- **PIN Authentication**: 6-digit PIN with AES-256 encryption
- **Auto-lockout**: After 4 failed attempts (1 hour)
- **Session-based**: PIN required once per session
- **GitHub Storage**: Private repository, your data stays yours

### 🔄 Smart Sync
- **GitHub Backend**: No server costs, unlimited storage
- **Smart Sync**: Only syncs changed files
- **Conflict Resolution**: Automatic 409 conflict handling
- **Offline-first**: Work locally, sync when ready
- **Backup & Restore**: One-click backup to GitHub

### 🎨 User Experience
- **Dark Mode**: Eye-friendly theme with toggle
- **Mobile Responsive**: Works on all devices
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Real-time Updates**: Instant balance calculations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- GitHub account
- GitHub Personal Access Token

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure GitHub (Environment Variables)**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your details
```

```env
VITE_GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=DataFinanceTracker
VITE_GITHUB_BRANCH=main
VITE_DEFAULT_PIN=123456
```

4. **Start the app**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

---

## 📖 Documentation

### Quick Guides
- [Quick Start Guide](docs/QUICK_START.md) - Get started in 5 minutes
- [Configuration Setup](CONFIG_SETUP.md) - Environment variables setup
- [GitHub Setup](docs/GITHUB_API_SETUP.md) - Configure GitHub backend

### Feature Guides
- [Complete Features List](docs/COMPLETE_FEATURES_LIST.md) - All 19+ features
- [Attachments & Receipts](docs/ATTACHMENTS_RECEIPTS.md) - Upload documents
- [PDF Export Guide](docs/PDF_EXPORT_GUIDE.md) - Generate reports
- [Loan & EMI Tracker](docs/LOAN_EMI_TRACKER.md) - Manage loans
- [Budget Management](docs/COMPLETE_FEATURES_LIST.md#budget-management) - Track spending
- [Dark Mode](docs/DARK_MODE_AND_BACKUP.md) - Theme customization

### Technical Guides
- [GitHub Conflict Handling](docs/GITHUB_CONFLICT_HANDLING.md) - 409 error resolution
- [Security Features](docs/SECURITY_FEATURES.md) - PIN & encryption
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues

---

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend & Storage
- **GitHub API** - Data storage
- **LocalStorage** - Local caching
- **Axios** - HTTP client

### Security
- **CryptoJS** - AES-256 encryption
- **SHA-256** - PIN hashing

### PDF Generation
- **jsPDF** - PDF creation
- **jsPDF-AutoTable** - Table formatting

---

## 📁 Project Structure

```
finance-tracker/
├── src/
│   ├── api/
│   │   ├── dataService.js      # GitHub API & data management
│   │   └── cloudStorage.js     # Storage utilities
│   ├── components/
│   │   ├── PINLogin.jsx        # Authentication
│   │   ├── PINSetup.jsx        # PIN setup
│   │   ├── Sidebar.jsx         # Navigation
│   │   ├── Toast.jsx           # Notifications
│   │   ├── SyncIndicator.jsx   # Sync status
│   │   └── RateLimitBadge.jsx  # API usage
│   ├── pages/
│   │   ├── Dashboard.jsx       # Overview
│   │   ├── Transactions.jsx    # Transaction management
│   │   ├── Accounts.jsx        # Account management
│   │   ├── ChitFund.jsx        # Chit fund tracking
│   │   ├── Budget.jsx          # Budget management
│   │   ├── Loans.jsx           # Loan & EMI tracker
│   │   ├── Reports.jsx         # Analytics & reports
│   │   └── Settings.jsx        # App settings
│   ├── utils/
│   │   ├── helpers.js          # Utility functions
│   │   ├── balanceEngine.js    # Balance calculations
│   │   └── loanCalculator.js   # EMI calculations
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   ├── config.js               # Configuration (gitignored)
│   └── config.example.js       # Config template
├── docs/                       # Documentation
├── public/                     # Static assets
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

---

## 🎯 Key Features Explained

### 1. GitHub as Backend
- **No Server Costs**: Uses GitHub as free backend
- **Unlimited Storage**: Store as much data as you need
- **Version Control**: Every change is tracked
- **Private**: Your data in your private repository
- **Accessible**: Access from anywhere with internet

### 2. Smart Sync System
- **Offline-first**: Work without internet
- **Manual Sync**: Sync when you're ready
- **Smart Updates**: Only syncs changed files
- **Conflict Resolution**: Automatic 409 error handling
- **Unsaved Changes**: Track what needs syncing

### 3. Attachments & Receipts
- **Upload Files**: Images (JPG, PNG, GIF) and PDFs
- **Max Size**: 5MB per file
- **Storage**: GitHub `/receipts` folder
- **View & Download**: Access anytime
- **Tax Ready**: Keep all receipts organized

### 4. Multiple PDF Reports
- **Complete Report**: Full financial overview
- **Monthly Report**: Current month summary
- **Transaction History**: Last 100 transactions
- **Tax Report**: Tax-deductible expenses

### 5. Loan & EMI Tracker
- **Add Loans**: Principal, rate, tenure
- **Auto EMI**: Automatic calculation
- **Amortization**: Complete payment schedule
- **Track Payments**: Mark EMIs as paid
- **Analytics**: Principal vs interest breakdown

---

## 🔒 Security

### Data Security
- ✅ **PIN Protected**: 6-digit PIN with AES-256 encryption
- ✅ **Auto-lockout**: 4 failed attempts = 1 hour lockout
- ✅ **Session-based**: PIN once per browser session
- ✅ **Private GitHub**: Data in your private repository
- ✅ **No Third-party**: No external services

### Best Practices
- Use a strong 6-digit PIN
- Don't share your GitHub token
- Keep `.env` file secure (already in `.gitignore`)
- Regular backups to GitHub
- Use private repository only
- Use environment variables for deployment

---

## 📊 Data Storage

### GitHub Files
```
your-repo/
├── accounts.json           # Account data
├── transactions.json       # Transaction data
├── categories.json         # Category data
├── auth.json              # Authentication data
├── settings.json          # App settings
├── backups/               # Backup files
│   ├── backup-2024-01-15.json
│   └── backup-2024-01-31.json
└── receipts/              # Uploaded files
    ├── txn_001_1234567890_invoice.pdf
    └── txn_002_1234567891_receipt.jpg
```

### Local Storage
- Cached data for offline access
- PIN and authentication state
- Unsaved changes tracking
- Rate limit information

---

## 🎨 Customization

### Dark Mode
- Toggle in sidebar
- Persistent preference
- Synced to GitHub
- All pages supported

### Categories
- Add custom income categories
- Add custom expense categories
- Delete unused categories
- Organize your way

### Tags
- Create unlimited tags
- Multiple tags per transaction
- Filter by tags
- Tag-based analytics

---

## 📱 Mobile Support

- ✅ Responsive design
- ✅ Touch-friendly interface
- ✅ Mobile navigation
- ✅ Works on all screen sizes
- ✅ Upload from camera
- ✅ Swipe gestures

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build
npm run build

# Deploy dist folder to Netlify
```

### GitHub Pages
```bash
# Build
npm run build

# Deploy dist folder to gh-pages branch
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Charts
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [Lucide](https://lucide.dev/) - Icons
- [GitHub](https://github.com/) - Backend storage

---

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/yourusername/finance-tracker/issues)
- 💬 [Discussions](https://github.com/yourusername/finance-tracker/discussions)

---

## 🗺️ Roadmap

### Planned Features
- [ ] Recurring transactions
- [ ] Financial goals tracker
- [ ] Multi-currency support
- [ ] Bill reminders
- [ ] Investment portfolio tracker
- [ ] Expense splitting
- [ ] Cash flow forecast
- [ ] Mobile app (React Native)

---

## 📈 Statistics

- **19+ Features** implemented
- **8 Pages** with full functionality
- **4 PDF Report Types**
- **5 GitHub Files** for data storage
- **2 Storage Folders** (backups + receipts)
- **100% Private** - Your data, your control

---

## 🎉 Getting Started

1. **Install**: `npm install`
2. **Configure**: Edit `src/config.js`
3. **Run**: `npm run dev`
4. **Enjoy**: Manage your finances! 💰

---

**Made with ❤️ for better financial management**

*Keep your finances organized, secure, and accessible!*
