# 🏗️ Workspace Context - Personal Finance Tracker

## 📋 Project Overview

**Project Name**: Personal Finance Tracker  
**Version**: 2.0.0  
**Type**: React Web Application  
**Backend**: GitHub API  
**Status**: Production Ready  

---

## 🎯 Purpose

A comprehensive personal finance management application that uses GitHub as a backend for secure, private, and free data storage. Designed for individuals who want complete control over their financial data without relying on third-party services.

---

## 🏛️ Architecture

### Frontend Architecture
```
React (UI) → Vite (Build) → Tailwind (Styles) → GitHub API (Backend)
```

### Data Flow
```
User Input → Local State → LocalStorage Cache → GitHub Sync → Private Repo
```

### Component Hierarchy
```
App.jsx
├── PINSetup/PINLogin (Authentication)
├── Sidebar (Navigation)
├── Dashboard (Overview)
├── Transactions (CRUD)
├── Accounts (Management)
├── ChitFund (Tracking)
├── Budget (Limits)
├── Loans (EMI)
├── Reports (Analytics)
└── Settings (Configuration)
```

---

## 📦 Dependencies

### Core
- `react@18.3.1` - UI framework
- `react-dom@18.3.1` - DOM rendering
- `vite@5.4.11` - Build tool

### UI & Styling
- `tailwindcss@3.4.1` - CSS framework
- `lucide-react@0.462.0` - Icons
- `recharts@2.14.1` - Charts

### Data & API
- `axios@1.7.9` - HTTP client
- `js-yaml@4.1.0` - YAML parsing

### Security
- `crypto-js@4.2.0` - Encryption

### PDF Generation
- `jspdf@2.5.2` - PDF creation
- `jspdf-autotable@3.8.4` - Tables

---

## 🗂️ File Structure

### Source Code (`src/`)

#### API Layer (`src/api/`)
- **dataService.js** (1000+ lines)
  - GitHub API integration
  - Data CRUD operations
  - Sync management
  - Backup & restore
  - Attachment handling
  - Conflict resolution

#### Components (`src/components/`)
- **PINSetup.jsx** - Initial PIN configuration
- **PINLogin.jsx** - Authentication screen
- **Sidebar.jsx** - Navigation with sync controls
- **Toast.jsx** - Notification system
- **SyncIndicator.jsx** - Sync status display
- **RateLimitBadge.jsx** - API usage tracker

#### Pages (`src/pages/`)
- **Dashboard.jsx** - Financial overview
- **Transactions.jsx** - Transaction management with tags & attachments
- **Accounts.jsx** - Account management
- **ChitFund.jsx** - Variable chit fund tracking
- **Budget.jsx** - Budget limits & alerts
- **Loans.jsx** - Loan & EMI tracker
- **Reports.jsx** - Analytics with 4 PDF export types
- **Settings.jsx** - App configuration & backup

#### Utilities (`src/utils/`)
- **helpers.js** - Formatting & export functions
- **balanceEngine.js** - Balance calculations
- **loanCalculator.js** - EMI & amortization

#### Configuration
- **config.js** - User configuration (gitignored)
- **config.example.js** - Configuration template

---

## 🔐 Security Implementation

### Authentication
- **PIN Storage**: SHA-256 hashed
- **Encryption**: AES-256 for sensitive data
- **Session**: Browser session-based
- **Lockout**: 4 attempts = 1 hour

### Data Protection
- **Private Repo**: GitHub private repository
- **Token Security**: Personal Access Token
- **Local Encryption**: Encrypted localStorage
- **No Third-party**: Direct GitHub API only

---

## 💾 Data Storage

### GitHub Files (JSON)
1. **accounts.json** - Account data
2. **transactions.json** - Transaction data with tags & attachments
3. **categories.json** - Income/expense categories
4. **auth.json** - Authentication data
5. **settings.json** - App settings, budgets, loans

### GitHub Folders
1. **backups/** - Timestamped backup files
2. **receipts/** - Uploaded attachments (images & PDFs)

### LocalStorage
- Cached data for offline access
- Authentication state
- Unsaved changes counter
- Changed files tracker
- Rate limit information

---

## 🔄 Sync Strategy

### Offline-first Approach
1. Load data from GitHub on login
2. Work with local state
3. Track unsaved changes
4. Manual sync to GitHub
5. Auto-sync on logout

### Smart Sync
- Only syncs changed files (not all 5 files)
- Tracks which files have changes
- Updates SHA after sync
- Automatic 409 conflict resolution

### Conflict Resolution
```javascript
Try save with current SHA
  ↓
409 Conflict?
  ↓
Fetch latest SHA
  ↓
Retry with new SHA
  ↓
Success!
```

---

## 🎨 UI/UX Design

### Design System
- **Colors**: Green primary, Gray neutral
- **Typography**: System fonts
- **Spacing**: Tailwind scale
- **Breakpoints**: Mobile-first responsive

### Dark Mode
- Toggle in sidebar
- Persistent preference
- Synced to GitHub
- All components supported

### Mobile Responsive
- Hamburger menu
- Touch-friendly buttons
- Responsive tables
- Swipe gestures

---

## 📊 Features Implementation

### Core Features (19+)
1. ✅ Transaction Management (Income, Expense, Transfer)
2. ✅ Account Management (4 types)
3. ✅ Category Management (Customizable)
4. ✅ Tags System (Multiple per transaction)
5. ✅ Attachments (Images & PDFs, 5MB max)
6. ✅ Dashboard (Real-time overview)
7. ✅ Reports (6 chart types)
8. ✅ PDF Export (4 report types)
9. ✅ CSV Export (Transaction data)
10. ✅ Budget Tracking (Per category)
11. ✅ Loan & EMI Tracker (Amortization)
12. ✅ Chit Fund Tracking (Variable payments)
13. ✅ Dark Mode (Toggle & persistent)
14. ✅ Backup & Restore (GitHub)
15. ✅ PIN Authentication (6-digit)
16. ✅ Smart Sync (Changed files only)
17. ✅ Conflict Resolution (Automatic)
18. ✅ Rate Limit Tracking (5000/hour)
19. ✅ Mobile Responsive (All pages)

---

## 🔧 Development Workflow

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Git Workflow
```bash
git add .
git commit -m "feat: description"
git push origin main
```

### Configuration
1. Copy `src/config.example.js` to `src/config.js`
2. Add GitHub token, owner, repo
3. Set 6-digit PIN
4. Start app

---

## 📈 Performance

### Optimization
- Lazy loading for images
- Efficient state management
- Minimal API calls
- LocalStorage caching
- Smart sync (changed files only)

### Metrics
- **Load Time**: < 2 seconds
- **Sync Time**: 2-5 seconds (typical)
- **PDF Generation**: 1-2 seconds
- **File Upload**: 2-5 seconds (1MB)

---

## 🧪 Testing

### Manual Testing
- ✅ All features tested
- ✅ Mobile responsive verified
- ✅ Dark mode working
- ✅ PDF export functional
- ✅ Sync working correctly
- ✅ Conflict resolution tested

### Browser Support
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 📝 Code Standards

### JavaScript/React
- ES6+ syntax
- Functional components
- React Hooks
- PropTypes (optional)
- Clean code principles

### CSS/Tailwind
- Utility-first approach
- Responsive design
- Dark mode support
- Consistent spacing

### File Naming
- PascalCase for components
- camelCase for utilities
- kebab-case for CSS

---

## 🚨 Known Issues & Limitations

### Current Limitations
1. **File Size**: 5MB max per attachment
2. **File Types**: Images & PDFs only
3. **Rate Limit**: 5000 API calls/hour
4. **Single User**: No multi-user support
5. **No Real-time**: Manual sync required

### Future Improvements
- Recurring transactions
- Multi-currency support
- Bill reminders
- Investment tracking
- Mobile app

---

## 🔍 Debugging

### Console Logs
```javascript
📥 Loading all data from GitHub...
✅ All data loaded from GitHub
📤 Syncing data to GitHub...
  → Syncing transactions.json
✅ 1 file(s) synced to GitHub
```

### Common Issues
1. **409 Conflict**: Auto-resolved
2. **Rate Limit**: Wait 1 hour
3. **Upload Fail**: Check file size/type
4. **Sync Fail**: Check GitHub token

---

## 📚 Documentation Structure

### User Guides (`docs/`)
- Quick Start Guide
- GitHub Setup
- Feature Guides
- Troubleshooting

### Technical Docs
- API Documentation
- Component Documentation
- Data Flow Diagrams
- Security Guidelines

---

## 🎯 Project Goals

### Achieved
- ✅ Complete financial management
- ✅ Secure & private
- ✅ No server costs
- ✅ Professional reports
- ✅ Mobile responsive
- ✅ Production ready

### Future Goals
- [ ] Mobile app
- [ ] Recurring transactions
- [ ] Multi-currency
- [ ] Investment tracking
- [ ] Bill reminders

---

## 🤝 Team & Roles

### Development
- **Frontend**: React + Vite + Tailwind
- **Backend**: GitHub API integration
- **Security**: PIN + Encryption
- **PDF**: jsPDF implementation

### Maintenance
- Regular dependency updates
- Bug fixes
- Feature enhancements
- Documentation updates

---

## 📊 Project Statistics

### Code Metrics
- **Total Files**: 50+
- **Source Files**: 25+
- **Components**: 15+
- **Pages**: 8
- **Utilities**: 3
- **Lines of Code**: 5000+

### Features
- **19+ Features** implemented
- **4 PDF Report Types**
- **6 Chart Types**
- **5 GitHub Files**
- **2 Storage Folders**

---

## 🔐 Environment Variables

### Required (in config.js)
```javascript
github.token        // GitHub Personal Access Token
github.owner        // GitHub username
github.repo         // Repository name
github.branch       // Branch name (default: main)
security.pin        // 6-digit PIN
```

### Optional
```javascript
github.autoSetup    // Auto-configure on first load
security.autoSetup  // Auto-setup PIN
```

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Update version number
- [ ] Test all features
- [ ] Check mobile responsive
- [ ] Verify PDF export
- [ ] Test sync functionality
- [ ] Review security

### Deployment
- [ ] Build production (`npm run build`)
- [ ] Test production build
- [ ] Deploy to hosting
- [ ] Verify live site
- [ ] Test on mobile
- [ ] Monitor errors

### Post-deployment
- [ ] Update documentation
- [ ] Create release notes
- [ ] Tag version in Git
- [ ] Backup data
- [ ] Monitor usage

---

## 📞 Support & Resources

### Documentation
- README.md - Main documentation
- docs/ - Detailed guides
- Code comments - Inline documentation

### External Resources
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Tailwind Docs: https://tailwindcss.com
- GitHub API: https://docs.github.com/en/rest

---

## 🎉 Success Metrics

### User Experience
- ✅ Easy to use
- ✅ Fast performance
- ✅ Mobile friendly
- ✅ Professional output

### Technical
- ✅ No errors
- ✅ Clean code
- ✅ Well documented
- ✅ Maintainable

### Business
- ✅ No costs (GitHub free)
- ✅ Unlimited storage
- ✅ Complete privacy
- ✅ Full control

---

**Last Updated**: May 10, 2026  
**Status**: Production Ready  
**Version**: 2.0.0  

---

*This workspace context provides a complete overview of the Personal Finance Tracker project for developers, maintainers, and contributors.*
