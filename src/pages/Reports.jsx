import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { formatCurrency, exportToCSV } from '../utils/helpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = ({ data }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dateRangeFrom, setDateRangeFrom] = useState('');
  const [dateRangeTo, setDateRangeTo] = useState('');
  const [reportType, setReportType] = useState('monthly'); // monthly, ytd, custom

  // Account-wise balance data
  const accountBalanceData = data.accounts.map(acc => ({
    name: acc.name,
    balance: acc.balance
  }));

  // Net worth trend over time (last 12 months)
  const getNetWorthTrend = () => {
    const trends = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      
      // Calculate net worth at end of that month
      const monthTransactions = data.transactions.filter(txn => txn.date <= monthKey + '-31');
      
      let netWorth = 0;
      data.accounts.forEach(acc => {
        let accBalance = 0;
        monthTransactions.forEach(txn => {
          if (txn.to_account === acc.id) accBalance += txn.amount;
          if (txn.from_account === acc.id) accBalance -= txn.amount;
        });
        netWorth += accBalance;
      });
      
      trends.push({ month: monthName, netWorth });
    }
    
    return trends;
  };

  // Monthly income vs expense (last 12 months)
  const getMonthlyData = () => {
    const monthlyData = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

      const monthTransactions = data.transactions.filter(txn => txn.date.startsWith(monthKey));

      const income = monthTransactions
        .filter(txn => txn.type === 'income')
        .reduce((sum, txn) => sum + txn.amount, 0);

      const expense = monthTransactions
        .filter(txn => txn.type === 'expense')
        .reduce((sum, txn) => sum + txn.amount, 0);

      const savings = income - expense;

      monthlyData.push({ month: monthName, income, expense, savings });
    }

    return monthlyData;
  };

  // Category-wise expense breakdown for selected period
  const getCategoryData = () => {
    let filteredTransactions = data.transactions;
    
    if (reportType === 'monthly') {
      filteredTransactions = data.transactions.filter(txn => txn.date.startsWith(selectedMonth));
    } else if (reportType === 'ytd') {
      const yearStart = new Date().getFullYear() + '-01-01';
      filteredTransactions = data.transactions.filter(txn => txn.date >= yearStart);
    } else if (reportType === 'custom' && dateRangeFrom && dateRangeTo) {
      filteredTransactions = data.transactions.filter(
        txn => txn.date >= dateRangeFrom && txn.date <= dateRangeTo
      );
    }

    const expenseTransactions = filteredTransactions.filter(txn => txn.type === 'expense');

    const categoryTotals = {};
    expenseTransactions.forEach(txn => {
      const category = txn.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + txn.amount;
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  // Month-over-month comparison
  const getMonthOverMonthComparison = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    const getCurrentMonthData = (monthKey) => {
      const monthTxns = data.transactions.filter(txn => txn.date.startsWith(monthKey));
      return {
        income: monthTxns.filter(txn => txn.type === 'income').reduce((sum, txn) => sum + txn.amount, 0),
        expense: monthTxns.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0)
      };
    };

    const current = getCurrentMonthData(currentMonth);
    const previous = getCurrentMonthData(lastMonth);

    return {
      income: {
        current: current.income,
        previous: previous.income,
        change: previous.income > 0 ? ((current.income - previous.income) / previous.income) * 100 : 0
      },
      expense: {
        current: current.expense,
        previous: previous.expense,
        change: previous.expense > 0 ? ((current.expense - previous.expense) / previous.expense) * 100 : 0
      },
      savings: {
        current: current.income - current.expense,
        previous: previous.income - previous.expense,
        change: (previous.income - previous.expense) > 0 
          ? (((current.income - current.expense) - (previous.income - previous.expense)) / (previous.income - previous.expense)) * 100 
          : 0
      }
    };
  };

  // Year-to-date summary
  const getYTDSummary = () => {
    const yearStart = new Date().getFullYear() + '-01-01';
    const ytdTransactions = data.transactions.filter(txn => txn.date >= yearStart);

    const income = ytdTransactions.filter(txn => txn.type === 'income').reduce((sum, txn) => sum + txn.amount, 0);
    const expense = ytdTransactions.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0);
    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return { income, expense, savings, savingsRate };
  };

  // Tag-based analytics
  const getTagAnalytics = () => {
    const tagTotals = {};
    data.transactions.forEach(txn => {
      if (txn.tags && txn.tags.length > 0) {
        txn.tags.forEach(tag => {
          if (!tagTotals[tag]) {
            tagTotals[tag] = { count: 0, totalAmount: 0 };
          }
          tagTotals[tag].count++;
          tagTotals[tag].totalAmount += txn.amount;
        });
      }
    });

    return Object.entries(tagTotals)
      .map(([tag, data]) => ({ tag, ...data }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const netWorthTrend = getNetWorthTrend();
  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const momComparison = getMonthOverMonthComparison();
  const ytdSummary = getYTDSummary();
  const tagAnalytics = getTagAnalytics();

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const handleExportCSV = () => {
    const exportData = data.transactions.map(txn => {
      const fromAccount = data.accounts.find(acc => acc.id === txn.from_account);
      const toAccount = data.accounts.find(acc => acc.id === txn.to_account);

      return {
        Date: txn.date,
        Type: txn.type,
        Amount: txn.amount,
        'From Account': fromAccount?.name || '-',
        'To Account': toAccount?.name || '-',
        Category: txn.category || '-',
        Description: txn.description || '-',
        Tags: txn.tags?.join(', ') || '-'
      };
    });

    exportToCSV(exportData, `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Year-to-Date Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Year-to-Date Summary', 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Amount']],
        body: [
          ['Total Income', formatCurrency(ytdSummary.income)],
          ['Total Expense', formatCurrency(ytdSummary.expense)],
          ['Net Savings', formatCurrency(ytdSummary.savings)],
          ['Savings Rate', `${ytdSummary.savingsRate.toFixed(1)}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Month-over-Month Comparison
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Month-over-Month Comparison', 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Current Month', 'Previous Month', 'Change']],
        body: [
          [
            'Income',
            formatCurrency(momComparison.income.current),
            formatCurrency(momComparison.income.previous),
            `${momComparison.income.change >= 0 ? '+' : ''}${momComparison.income.change.toFixed(1)}%`
          ],
          [
            'Expense',
            formatCurrency(momComparison.expense.current),
            formatCurrency(momComparison.expense.previous),
            `${momComparison.expense.change >= 0 ? '+' : ''}${momComparison.expense.change.toFixed(1)}%`
          ],
          [
            'Savings',
            formatCurrency(momComparison.savings.current),
            formatCurrency(momComparison.savings.previous),
            `${momComparison.savings.change >= 0 ? '+' : ''}${momComparison.savings.change.toFixed(1)}%`
          ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Category-wise Expense Breakdown
      if (categoryData.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Category-wise Expense Breakdown', 14, yPosition);
        yPosition += 8;

        const categoryTableData = categoryData.map(item => [
          item.name,
          formatCurrency(item.value),
          `${((item.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Category', 'Amount', 'Percentage']],
          body: categoryTableData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          margin: { left: 14, right: 14 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      // Tag-based Analytics
      if (tagAnalytics.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Tag-based Analytics', 14, yPosition);
        yPosition += 8;

        const tagTableData = tagAnalytics.slice(0, 10).map(item => [
          item.tag,
          item.count.toString(),
          formatCurrency(item.totalAmount)
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Tag', 'Transactions', 'Total Amount']],
          body: tagTableData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          margin: { left: 14, right: 14 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      // Account Balances
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Account Balances', 14, yPosition);
      yPosition += 8;

      const accountTableData = data.accounts.map(acc => [
        acc.name,
        acc.type.replace('_', ' ').toUpperCase(),
        formatCurrency(acc.balance)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Account', 'Type', 'Balance']],
        body: accountTableData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
      });

      // Footer on last page
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          'Track your Finance',
          14,
          pageHeight - 10
        );
      }

      // Save PDF
      doc.save(`financial_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };

  const handleExportTransactionsPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction History', pageWidth / 2, 20, { align: 'center' });

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 30, { align: 'center' });

      // Transactions table
      const transactionData = data.transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 100) // Last 100 transactions
        .map(txn => [
          new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          txn.type.charAt(0).toUpperCase() + txn.type.slice(1),
          txn.description || '-',
          txn.category || '-',
          formatCurrency(txn.amount)
        ]);

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Type', 'Description', 'Category', 'Amount']],
        body: transactionData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 20 },
          2: { cellWidth: 60 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30, halign: 'right' }
        }
      });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };

  const handleExportTaxReportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Tax Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Financial Year: ${new Date().getFullYear()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Income Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Income Summary', 14, yPosition);
      yPosition += 8;

      const incomeByCategory = {};
      data.transactions
        .filter(txn => txn.type === 'income')
        .forEach(txn => {
          const cat = txn.category || 'Other';
          incomeByCategory[cat] = (incomeByCategory[cat] || 0) + txn.amount;
        });

      const incomeData = Object.entries(incomeByCategory).map(([cat, amount]) => [
        cat,
        formatCurrency(amount)
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Amount']],
        body: incomeData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Tax Deductible Expenses
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tax Deductible Expenses', 14, yPosition);
      yPosition += 8;

      const taxDeductible = data.transactions
        .filter(txn => txn.tags && txn.tags.includes('tax-deductible'))
        .map(txn => [
          new Date(txn.date).toLocaleDateString('en-IN'),
          txn.description || '-',
          txn.category || '-',
          formatCurrency(txn.amount)
        ]);

      if (taxDeductible.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Description', 'Category', 'Amount']],
          body: taxDeductible,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          margin: { left: 14, right: 14 }
        });

        yPosition = doc.lastAutoTable.finalY + 10;

        // Total
        const totalDeductible = taxDeductible.reduce((sum, row) => {
          const amount = parseFloat(row[3].replace(/[₹,]/g, ''));
          return sum + amount;
        }, 0);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Tax Deductible: ${formatCurrency(totalDeductible)}`, 14, yPosition);
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No tax-deductible expenses found. Tag transactions with "tax-deductible" to track them.', 14, yPosition);
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`tax_report_${new Date().getFullYear()}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };

  const handleExportMonthlyPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(currentMonth, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Monthly Summary
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const monthTxns = data.transactions.filter(txn => txn.date.startsWith(currentMonthKey));
      
      const monthIncome = monthTxns.filter(txn => txn.type === 'income').reduce((sum, txn) => sum + txn.amount, 0);
      const monthExpense = monthTxns.filter(txn => txn.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0);
      const monthSavings = monthIncome - monthExpense;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Monthly Summary', 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [['Metric', 'Amount']],
        body: [
          ['Income', formatCurrency(monthIncome)],
          ['Expense', formatCurrency(monthExpense)],
          ['Savings', formatCurrency(monthSavings)],
          ['Savings Rate', `${monthIncome > 0 ? ((monthSavings / monthIncome) * 100).toFixed(1) : 0}%`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Category Breakdown
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Expense by Category', 14, yPosition);
      yPosition += 8;

      const categoryBreakdown = {};
      monthTxns.filter(txn => txn.type === 'expense').forEach(txn => {
        const cat = txn.category || 'Uncategorized';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + txn.amount;
      });

      const categoryData = Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => [
          cat,
          formatCurrency(amount),
          `${((amount / monthExpense) * 100).toFixed(1)}%`
        ]);

      if (categoryData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Category', 'Amount', 'Percentage']],
          body: categoryData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          margin: { left: 14, right: 14 }
        });
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save(`monthly_report_${currentMonthKey}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Advanced Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Comprehensive financial insights and analytics</p>
        </div>
        <div className="flex gap-2">
          {/* PDF Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
              <FileText className="w-5 h-5" />
              Export PDF
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Complete Report
                </button>
                <button
                  onClick={handleExportMonthlyPDF}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Monthly Report
                </button>
                <button
                  onClick={handleExportTransactionsPDF}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Transaction History
                </button>
                <button
                  onClick={handleExportTaxReportPDF}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Tax Report
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Year-to-Date Summary */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Year-to-Date Summary {new Date().getFullYear()}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-purple-100 text-xs sm:text-sm">Total Income</p>
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(ytdSummary.income)}</p>
          </div>
          <div>
            <p className="text-purple-100 text-xs sm:text-sm">Total Expense</p>
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(ytdSummary.expense)}</p>
          </div>
          <div>
            <p className="text-purple-100 text-xs sm:text-sm">Net Savings</p>
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(ytdSummary.savings)}</p>
          </div>
          <div>
            <p className="text-purple-100 text-xs sm:text-sm">Savings Rate</p>
            <p className="text-xl sm:text-2xl font-bold">{ytdSummary.savingsRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Month-over-Month Comparison */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Month-over-Month Comparison</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Income</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(momComparison.income.current)}</p>
            <div className="flex items-center gap-1 mt-2">
              {momComparison.income.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${momComparison.income.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(momComparison.income.change).toFixed(1)}% vs last month
              </span>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Expense</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(momComparison.expense.current)}</p>
            <div className="flex items-center gap-1 mt-2">
              {momComparison.expense.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600" />
              )}
              <span className={`text-sm font-semibold ${momComparison.expense.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {Math.abs(momComparison.expense.change).toFixed(1)}% vs last month
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Savings</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(momComparison.savings.current)}</p>
            <div className="flex items-center gap-1 mt-2">
              {momComparison.savings.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${momComparison.savings.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(momComparison.savings.change).toFixed(1)}% vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Worth Trend */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Net Worth Trend (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={netWorthTrend}>
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Area type="monotone" dataKey="netWorth" stroke="#10b981" fillOpacity={1} fill="url(#colorNetWorth)" name="Net Worth" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Account Balance Chart */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Account-wise Balance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={accountBalanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="balance" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Income vs Expense Trend */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Income vs Expense Trend (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
            <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category-wise Expense Breakdown */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Category-wise Expense Breakdown</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'monthly' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setReportType('ytd')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'ytd' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              YTD
            </button>
            <button
              onClick={() => setReportType('custom')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'custom' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {reportType === 'monthly' && (
          <div className="mb-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        )}

        {reportType === 'custom' && (
          <div className="mb-4 flex gap-2">
            <input
              type="date"
              value={dateRangeFrom}
              onChange={(e) => setDateRangeFrom(e.target.value)}
              placeholder="From"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
            <input
              type="date"
              value={dateRangeTo}
              onChange={(e) => setDateRangeTo(e.target.value)}
              placeholder="To"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        )}

        {categoryData.length === 0 ? (
          <p className="text-gray-500 text-center py-8 sm:py-12 text-sm sm:text-base">No expenses for selected period</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tag-based Analytics */}
      {tagAnalytics.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Tag-based Analytics</h2>
          <div className="space-y-2">
            {tagAnalytics.map((item, index) => (
              <div key={item.tag} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-purple-600 text-white">
                    {item.tag}
                  </span>
                  <span className="text-sm text-gray-600">{item.count} transaction{item.count > 1 ? 's' : ''}</span>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(item.totalAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
