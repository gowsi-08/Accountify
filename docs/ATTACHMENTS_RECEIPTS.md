# 📎 Attachments & Receipts Feature

## Overview

The Attachments & Receipts feature allows you to upload and attach images and PDF documents to your transactions. This is perfect for keeping receipts, invoices, and other financial documents organized alongside your transaction records.

---

## ✨ Features

### 1. **File Upload**
- Upload images (JPG, PNG, GIF)
- Upload PDF documents
- Maximum file size: 5MB per file
- Multiple attachments per transaction
- Files stored securely in GitHub

### 2. **File Management**
- View all attachments for a transaction
- Download attachments anytime
- Delete attachments when no longer needed
- Preview images directly in the app

### 3. **Visual Indicators**
- Attachment count badge in transactions table
- File type icons (🖼️ for images, 📄 for PDFs)
- File size display
- Upload date tracking

---

## 🚀 How to Use

### Adding Attachments to a Transaction

#### Step 1: Create or Edit Transaction
1. Go to **Transactions** page
2. Click **"Add Transaction"** or edit an existing transaction
3. Fill in transaction details (amount, date, category, etc.)

#### Step 2: Upload Files
1. Scroll to the **"Attachments"** section
2. Click the **"Upload Receipt/Document"** button
3. Select an image or PDF file (max 5MB)
4. Wait for upload to complete (you'll see a success message)
5. Repeat to add more files

#### Step 3: Manage Attachments
- **Download**: Click the download icon to view/save the file
- **Delete**: Click the X icon to remove an attachment
- **Preview**: Uploaded files show with name and size

#### Step 4: Save Transaction
- Click **"Add"** or **"Update"** to save the transaction with attachments

---

### Viewing Attachments

#### From Transactions Table
1. Look for the **"Files"** column
2. Transactions with attachments show a blue badge with count (e.g., "📎 2")
3. Click the badge to open the attachment viewer

#### In Attachment Viewer
- See all attachments for that transaction
- View file names, sizes, and upload dates
- Download any attachment
- Preview images directly
- Close when done

---

## 📋 Use Cases

### 1. **Tax Records**
```
Transaction: "Office Supplies"
Amount: ₹5,000
Tags: ["business", "tax-deductible"]
Attachments: [invoice.pdf, receipt.jpg]
```
**Benefit**: Keep all tax-deductible receipts in one place for easy filing

### 2. **Warranty & Returns**
```
Transaction: "Laptop Purchase"
Amount: ₹50,000
Attachments: [warranty_card.pdf, purchase_receipt.jpg]
```
**Benefit**: Quick access to warranty info when needed

### 3. **Expense Claims**
```
Transaction: "Client Dinner"
Amount: ₹3,500
Tags: ["business", "reimbursable"]
Attachments: [restaurant_bill.jpg]
```
**Benefit**: Submit expense claims with proof

### 4. **Medical Records**
```
Transaction: "Doctor Visit"
Amount: ₹1,200
Category: "Medical"
Attachments: [prescription.pdf, lab_report.pdf]
```
**Benefit**: Track medical expenses with documentation

### 5. **Travel Expenses**
```
Transaction: "Flight Booking"
Amount: ₹8,500
Tags: ["vacation-2024", "travel"]
Attachments: [flight_ticket.pdf, booking_confirmation.jpg]
```
**Benefit**: Keep all travel documents organized

---

## 🔒 Security & Storage

### GitHub Storage
- All attachments are stored in your private GitHub repository
- Files are uploaded to `/receipts` folder
- Each file has a unique name with transaction ID and timestamp
- Example: `receipts/txn_123_1234567890_invoice.pdf`

### File Naming
- Format: `{transactionId}_{timestamp}_{originalName}`
- Prevents naming conflicts
- Easy to identify which transaction a file belongs to

### Privacy
- Files are only accessible with your GitHub token
- Stored in your private repository
- Not shared with any third party
- You have full control over your data

---

## 📊 Technical Details

### Supported File Types
- **Images**: JPEG, JPG, PNG, GIF
- **Documents**: PDF

### File Size Limits
- Maximum: 5MB per file
- Recommended: Keep files under 2MB for faster uploads

### Storage Location
- GitHub Repository: Your configured repo
- Folder: `/receipts`
- File naming: `{transactionId}_{timestamp}_{filename}`

### API Usage
- Each upload uses 1 GitHub API call
- Each download uses 1 GitHub API call
- Each delete uses 2 GitHub API calls (get SHA + delete)
- Rate limit: 5000 calls/hour with token

---

## 💡 Tips & Best Practices

### 1. **Optimize File Sizes**
- Compress images before uploading
- Use PDF for multi-page documents
- Keep files under 2MB when possible

### 2. **Naming Convention**
- Use descriptive transaction descriptions
- Add relevant tags for easy searching
- Original filename is preserved

### 3. **Organization**
- Upload receipts immediately after transactions
- Use tags to categorize (e.g., "tax-deductible")
- Review attachments periodically

### 4. **Backup**
- Attachments are backed up with GitHub
- Download important files locally as extra backup
- Use the backup feature to save all data

### 5. **Mobile Usage**
- Take photos of receipts with your phone
- Upload directly from mobile browser
- Files sync across all devices

---

## 🎯 Common Workflows

### Workflow 1: Receipt Capture
1. Make a purchase
2. Take photo of receipt
3. Add transaction in app
4. Upload receipt photo
5. Add tags (e.g., "tax-deductible")
6. Save transaction

### Workflow 2: Invoice Management
1. Receive invoice via email
2. Download PDF
3. Create transaction
4. Upload invoice PDF
5. Add relevant tags
6. Save for records

### Workflow 3: Expense Claim
1. Incur business expense
2. Get receipt
3. Add transaction with "reimbursable" tag
4. Upload receipt
5. Later: View all "reimbursable" transactions
6. Download receipts for claim submission

### Workflow 4: Tax Preparation
1. Filter transactions by "tax-deductible" tag
2. Review each transaction
3. Click attachment badge to view receipts
4. Download all receipts for tax filing
5. Submit to accountant

---

## 🔧 Troubleshooting

### Upload Fails
**Problem**: File won't upload
**Solutions**:
- Check file size (must be < 5MB)
- Verify file type (images or PDF only)
- Check internet connection
- Ensure GitHub token is valid
- Check rate limit (5000/hour)

### Can't View Attachment
**Problem**: Attachment won't open
**Solutions**:
- Click download button to open in new tab
- Check if file still exists in GitHub
- Verify GitHub token permissions
- Try refreshing the page

### Slow Upload
**Problem**: Upload takes too long
**Solutions**:
- Compress image before uploading
- Use smaller file sizes
- Check internet speed
- Upload during off-peak hours

### File Not Found
**Problem**: Attachment shows but won't download
**Solutions**:
- File may have been deleted from GitHub
- Check GitHub repository manually
- Restore from backup if needed

---

## 📈 Feature Statistics

### What You Can Do:
- ✅ Upload images (JPG, PNG, GIF)
- ✅ Upload PDF documents
- ✅ Multiple attachments per transaction
- ✅ View attachment count in table
- ✅ Download attachments anytime
- ✅ Delete attachments
- ✅ Preview images
- ✅ Track file sizes
- ✅ See upload dates
- ✅ Secure GitHub storage

### Limitations:
- ❌ Max 5MB per file
- ❌ Only images and PDFs
- ❌ No video files
- ❌ No audio files
- ❌ Subject to GitHub rate limits

---

## 🎉 Benefits

### 1. **Complete Records**
- All financial documents in one place
- No more lost receipts
- Easy to find when needed

### 2. **Tax Compliance**
- Keep proof for deductions
- Organized for tax season
- Easy to share with accountant

### 3. **Expense Claims**
- Submit claims with proof
- Track reimbursements
- Professional documentation

### 4. **Warranty Management**
- Store warranty cards
- Keep purchase receipts
- Easy returns and claims

### 5. **Audit Trail**
- Complete transaction history
- Proof of payment
- Dispute resolution

---

## 🔄 Integration with Other Features

### Works With Tags
- Tag transactions as "tax-deductible"
- Filter by tag to see all receipts
- Export tagged transactions with attachments

### Works With Reports
- View transactions with attachments
- Export data includes attachment info
- Analyze spending with proof

### Works With Backup
- Attachments stored in GitHub
- Included in repository backup
- Restore with all files intact

### Works With Search
- Search transactions by description
- View attachments for results
- Download relevant receipts

---

## 📚 Examples

### Example 1: Business Expense
```
Date: 2024-01-15
Type: Expense
Amount: ₹2,500
Category: Transport
Description: Uber to client meeting
Tags: ["business", "reimbursable"]
Attachments: [uber_receipt.jpg]
```

### Example 2: Medical Bill
```
Date: 2024-01-20
Type: Expense
Amount: ₹5,000
Category: Medical
Description: Dental checkup
Tags: ["medical", "insurance-claim"]
Attachments: [dental_bill.pdf, prescription.jpg]
```

### Example 3: Equipment Purchase
```
Date: 2024-01-25
Type: Expense
Amount: ₹45,000
Category: Shopping
Description: New laptop
Tags: ["business", "tax-deductible", "equipment"]
Attachments: [invoice.pdf, warranty.pdf, receipt.jpg]
```

---

## 🚀 Future Enhancements (Potential)

- OCR to extract data from receipts
- Automatic categorization from receipts
- Bulk upload multiple files
- Attachment search by content
- Email receipts directly to app
- Mobile app for easier photo capture
- Cloud storage integration (Dropbox, Google Drive)
- Receipt templates
- Expense report generation with attachments

---

## 📞 Support

### Need Help?
- Check this documentation
- Review transaction examples
- Test with small files first
- Verify GitHub configuration

### Common Questions

**Q: How many files can I attach?**
A: No limit, but each file must be under 5MB

**Q: Can I attach videos?**
A: No, only images and PDFs are supported

**Q: Where are files stored?**
A: In your private GitHub repository under `/receipts` folder

**Q: Can I access files offline?**
A: No, files are stored in GitHub and require internet access

**Q: Are attachments included in backups?**
A: Yes, they're stored in your GitHub repository

**Q: Can I share attachments?**
A: You can download and share files manually

---

## ✅ Quick Checklist

Before uploading:
- [ ] File is image (JPG/PNG/GIF) or PDF
- [ ] File size is under 5MB
- [ ] Transaction details are filled
- [ ] GitHub is configured
- [ ] Internet connection is stable

After uploading:
- [ ] File appears in attachments list
- [ ] File name and size are correct
- [ ] Can download file successfully
- [ ] Transaction is saved
- [ ] Attachment badge shows in table

---

**Enjoy organized financial record-keeping with Attachments & Receipts!** 📎✨
