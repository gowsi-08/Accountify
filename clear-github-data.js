import axios from 'axios';

// Load config from .env or use defaults
const config = {
  token: process.env.VITE_GITHUB_TOKEN || 'your_github_token',
  owner: process.env.VITE_GITHUB_OWNER || 'gowsi-08',
  repo: process.env.VITE_GITHUB_REPO || 'DataFinanceTracker',
  branch: process.env.VITE_GITHUB_BRANCH || 'main'
};

// GitHub API helper
async function createOrUpdateFile(fileName, data) {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fileName}`;
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  
  try {
    // Try to get existing file
    const existing = await axios.get(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: { ref: config.branch }
    });
    
    // Update existing file
    await axios.put(url, {
      message: `Clear ${fileName} - start fresh`,
      content: content,
      branch: config.branch,
      sha: existing.data.sha
    }, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    console.log(`✅ Cleared ${fileName}`);
  } catch (error) {
    if (error.response?.status === 404) {
      // Create new file with empty data
      await axios.put(url, {
        message: `Create ${fileName} - empty data`,
        content: content,
        branch: config.branch
      }, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      console.log(`✅ Created empty ${fileName}`);
    } else {
      throw error;
    }
  }
}

// Clear all data
async function clearGitHubData() {
  console.log('🧹 Clearing GitHub repository data...\n');
  
  try {
    // Clear accounts
    await createOrUpdateFile('accounts.json', []);
    
    // Clear transactions
    await createOrUpdateFile('transactions.json', []);
    
    // Create default categories
    await createOrUpdateFile('categories.json', {
      income: ['Salary', 'Freelance', 'Investment Returns', 'Other Income'],
      expense: ['Groceries', 'Utilities', 'Transport', 'Entertainment', 'Shopping', 'Healthcare', 'Other Expense']
    });
    
    // Create default settings
    const settings = {
      currency: 'INR',
      theme: 'light',
      lastSync: new Date().toISOString(),
      budgetAlerts: true,
      darkMode: false,
      budgets: {},
      loans: [],
      chitFundEnabled: false
    };
    await createOrUpdateFile('settings.json', settings);
    
    console.log('\n✅ GitHub repository cleared successfully!');
    console.log('\n📊 Fresh start with:');
    console.log('   - 0 accounts');
    console.log('   - 0 transactions');
    console.log('   - Default categories');
    console.log('   - Default settings');
    console.log('\n💡 Refresh your app to see the clean slate!');
    
  } catch (error) {
    console.error('\n❌ Failed to clear GitHub data:', error.message);
    if (error.response?.status === 401) {
      console.error('   → Invalid GitHub token');
    } else if (error.response?.status === 404) {
      console.error('   → Repository not found');
    }
    process.exit(1);
  }
}

// Run clear
clearGitHubData();
