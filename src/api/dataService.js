import yaml from 'js-yaml';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const GITHUB_CONFIG_KEY = 'finance_tracker_github_config';
const AUTH_KEY = 'finance_tracker_auth';
const RATE_LIMIT_KEY = 'finance_tracker_rate_limit';
const ENCRYPTION_KEY = 'finance_tracker_secret_key_2024';

// File names on GitHub
const FILES = {
  ACCOUNTS: 'accounts.json',
  TRANSACTIONS: 'transactions.json',
  CATEGORIES: 'categories.json',
  AUTH: 'auth.json',
  SETTINGS: 'settings.json'
};

export const dataService = {
  // ============ RATE LIMIT TRACKING (Optional - Not displayed) ============
  
  getRateLimit() {
    return { remaining: 5000, total: 5000, resetTime: Date.now() + 3600000 };
  },

  updateRateLimit(remaining, total) {
    // No-op - rate limit tracking disabled in UI
  },

  // ============ AUTHENTICATION ============

  encryptData(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  },

  decryptData(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  },

  getAuthData() {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      return this.decryptData(stored);
    }
    return null;
  },

  saveAuthData(authData) {
    const encrypted = this.encryptData(authData);
    localStorage.setItem(AUTH_KEY, encrypted);
  },

  setupPIN(pin) {
    const authData = {
      pin: CryptoJS.SHA256(pin).toString(),
      setupDate: Date.now(),
      failedAttempts: 0,
      lockedUntil: null
    };
    this.saveAuthData(authData);
  },

  verifyPIN(pin) {
    const authData = this.getAuthData();
    if (!authData) return { success: false, error: 'PIN not setup' };

    if (authData.lockedUntil && Date.now() < authData.lockedUntil) {
      const remainingTime = Math.ceil((authData.lockedUntil - Date.now()) / 60000);
      return { success: false, error: `Locked for ${remainingTime} more minutes`, locked: true };
    }

    const hashedPin = CryptoJS.SHA256(pin).toString();
    if (hashedPin === authData.pin) {
      authData.failedAttempts = 0;
      authData.lockedUntil = null;
      this.saveAuthData(authData);
      return { success: true };
    } else {
      authData.failedAttempts = (authData.failedAttempts || 0) + 1;
      
      if (authData.failedAttempts >= 4) {
        authData.lockedUntil = Date.now() + 3600000;
        this.saveAuthData(authData);
        return { success: false, error: 'Too many failed attempts. Locked for 1 hour.', locked: true };
      }
      
      this.saveAuthData(authData);
      return { success: false, error: `Wrong PIN. ${4 - authData.failedAttempts} attempts remaining.` };
    }
  },

  isAuthenticated() {
    return sessionStorage.getItem('authenticated') === 'true';
  },

  setAuthenticated() {
    sessionStorage.setItem('authenticated', 'true');
  },

  logout() {
    sessionStorage.removeItem('authenticated');
  },

  // ============ GITHUB CONFIGURATION ============

  getGitHubConfig() {
    const config = localStorage.getItem(GITHUB_CONFIG_KEY);
    return config ? JSON.parse(config) : null;
  },

  saveGitHubConfig(token, owner, repo, branch = 'main') {
    const config = { token, owner, repo, branch, enabled: true };
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  },

  // ============ GITHUB FILE OPERATIONS ============

  async fetchFileFromGitHub(fileName) {
    const config = this.getGitHubConfig();
    if (!config || !config.enabled) throw new Error('GitHub not configured');

    try {
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fileName}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: { 
          ref: config.branch,
          _: Date.now() // Cache buster
        }
      });

      if (response.headers['x-ratelimit-remaining']) {
        this.updateRateLimit(
          parseInt(response.headers['x-ratelimit-remaining']),
          parseInt(response.headers['x-ratelimit-limit'])
        );
      }

      const content = atob(response.data.content);
      return { data: JSON.parse(content), sha: response.data.sha };
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: null, sha: null };
      }
      throw error;
    }
  },

  async saveFileToGitHub(fileName, data, sha = null, retryCount = 0) {
    const config = this.getGitHubConfig();
    if (!config || !config.enabled) throw new Error('GitHub not configured');

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fileName}`;
    const content = btoa(JSON.stringify(data, null, 2));
    const maxRetries = 3;

    try {
      // FORCE PUSH: Always fetch latest SHA to overwrite any conflicts
      let currentSha = sha;
      
      try {
        const fileInfo = await this.fetchFileFromGitHub(fileName);
        currentSha = fileInfo.sha;
      } catch (error) {
        // File doesn't exist yet, that's okay
        currentSha = null;
      }

      const response = await axios.put(
        url,
        {
          message: `Update ${fileName} - ${new Date().toISOString()}`,
          content: content,
          branch: config.branch,
          ...(currentSha && { sha: currentSha })
        },
        {
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (response.headers['x-ratelimit-remaining']) {
        this.updateRateLimit(
          parseInt(response.headers['x-ratelimit-remaining']),
          parseInt(response.headers['x-ratelimit-limit'])
        );
      }

      return response.data;
    } catch (error) {
      // Handle 409 Conflict - retry with exponential backoff
      if (error.response?.status === 409 && retryCount < maxRetries) {
        console.warn(`⚠️ 409 Conflict detected for ${fileName}, retrying (${retryCount + 1}/${maxRetries})...`);
        
        // Wait with exponential backoff
        const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry recursively
        return this.saveFileToGitHub(fileName, data, null, retryCount + 1);
      }
      
      // If max retries exceeded or other error
      if (error.response?.status === 409) {
        console.error(`❌ Failed to save ${fileName} after ${maxRetries} retries`);
      }
      
      throw error;
    }
  },

  // ============ DATA OPERATIONS - DIRECT GITHUB ACCESS ============

  async getAccounts() {
    const result = await this.fetchFileFromGitHub(FILES.ACCOUNTS);
    return result.data || [];
  },

  async saveAccounts(accounts) {
    await this.saveFileToGitHub(FILES.ACCOUNTS, accounts);
    return { success: true };
  },

  async getTransactions() {
    const result = await this.fetchFileFromGitHub(FILES.TRANSACTIONS);
    return result.data || [];
  },

  async saveTransactions(transactions) {
    await this.saveFileToGitHub(FILES.TRANSACTIONS, transactions);
    return { success: true };
  },

  async getCategories() {
    const result = await this.fetchFileFromGitHub(FILES.CATEGORIES);
    return result.data || {
      income: ['Salary', 'Freelance', 'Interest', 'Dividend', 'Rental', 'Other Income'],
      expense: ['Food', 'Transport', 'Bills & Utilities', 'Shopping', 'Medical', 'Entertainment', 'Investment', 'Other Expense']
    };
  },

  async saveCategories(categories) {
    await this.saveFileToGitHub(FILES.CATEGORIES, categories);
    return { success: true };
  },

  async getSettings() {
    const result = await this.fetchFileFromGitHub(FILES.SETTINGS);
    return result.data || {
      currency: 'INR',
      theme: 'light',
      lastSync: null,
      budgetAlerts: true,
      darkMode: false,
      chitFundEnabled: false,
      budgets: {},
      loans: []
    };
  },

  async saveSettings(settings) {
    settings.lastSync = new Date().toISOString();
    await this.saveFileToGitHub(FILES.SETTINGS, settings);
    return { success: true };
  },

  // ============ LOAD ALL DATA FROM GITHUB ============

  async loadAllDataFromGitHub() {
    console.log('📥 Loading all data from GitHub...');
    
    try {
      // Fetch all files in parallel
      const [accounts, transactions, categories, settings] = await Promise.all([
        this.getAccounts(),
        this.getTransactions(),
        this.getCategories(),
        this.getSettings()
      ]);

      console.log('✅ All data loaded from GitHub');
      
      return {
        accounts,
        transactions,
        categories,
        settings
      };
    } catch (error) {
      console.error('❌ Failed to load from GitHub:', error);
      throw error;
    }
  },

  // ============ SETUP GITHUB ============

  async setupGitHub(token, owner, repo, branch = 'main') {
    try {
      // Save config first
      const config = { token, owner, repo, branch, enabled: true };
      localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));

      // Check if files already exist
      const accountsResult = await this.fetchFileFromGitHub(FILES.ACCOUNTS);
      
      if (accountsResult.data) {
        // Files exist, don't reinitialize
        console.log('✅ GitHub configured - using existing data');
        return { success: true, message: 'GitHub configured - using existing data' };
      }

      // Files don't exist, create initial structure sequentially
      const defaultData = {
        accounts: [],
        transactions: [],
        categories: {
          income: ['Salary', 'Freelance', 'Interest', 'Dividend', 'Rental', 'Other Income'],
          expense: ['Food', 'Transport', 'Bills & Utilities', 'Shopping', 'Medical', 'Entertainment', 'Investment', 'Other Expense']
        },
        settings: {
          currency: 'INR',
          theme: 'light',
          lastSync: new Date().toISOString(),
          budgetAlerts: true,
          darkMode: false,
          chitFundEnabled: false,
          budgets: {},
          loans: []
        }
      };

      // Create files sequentially to avoid conflicts
      await this.saveFileToGitHub(FILES.ACCOUNTS, defaultData.accounts);
      await this.saveFileToGitHub(FILES.TRANSACTIONS, defaultData.transactions);
      await this.saveFileToGitHub(FILES.CATEGORIES, defaultData.categories);
      await this.saveFileToGitHub(FILES.SETTINGS, defaultData.settings);

      console.log('✅ GitHub configured - initial files created');
      return { success: true, message: 'GitHub configured successfully' };
    } catch (error) {
      console.error('Failed to setup GitHub:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid GitHub token');
      } else if (error.response?.status === 404) {
        throw new Error('Repository not found');
      } else {
        throw new Error('Failed to setup GitHub: ' + error.message);
      }
    }
  },

  // ============ EXPORT ============

  async exportYAML() {
    try {
      const data = await this.loadAllDataFromGitHub();
      const exportData = {
        accounts: data.accounts,
        transactions: data.transactions,
        categories: data.categories,
        budgets: data.settings.budgets || {}
      };
      const yamlStr = yaml.dump(exportData);
      const blob = new Blob([yamlStr], { type: 'text/yaml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-data-${new Date().toISOString().slice(0, 10)}.yaml`;
      a.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to export YAML:', error);
      return false;
    }
  },

  async exportJSON() {
    try {
      const data = await this.loadAllDataFromGitHub();
      const exportData = {
        accounts: data.accounts,
        transactions: data.transactions,
        categories: data.categories,
        budgets: data.settings.budgets || {},
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to export JSON:', error);
      return false;
    }
  },

  // ============ BACKUP TO GITHUB ============

  async createBackup() {
    try {
      const config = this.getGitHubConfig();
      if (!config || !config.enabled) {
        throw new Error('GitHub not configured');
      }

      const data = await this.loadAllDataFromGitHub();
      const timestamp = new Date().toISOString();
      const backupFileName = `backups/backup-${timestamp.slice(0, 10)}.json`;

      const backupData = {
        accounts: data.accounts,
        transactions: data.transactions,
        categories: data.categories,
        budgets: data.settings.budgets || {},
        settings: data.settings,
        backupDate: timestamp,
        version: '1.0'
      };

      await this.saveFileToGitHub(backupFileName, backupData);
      console.log('✅ Backup created:', backupFileName);
      return { success: true, fileName: backupFileName };
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      throw error;
    }
  },

  async listBackups() {
    try {
      const config = this.getGitHubConfig();
      if (!config || !config.enabled) {
        throw new Error('GitHub not configured');
      }

      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/backups`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: { ref: config.branch }
      });

      if (response.headers['x-ratelimit-remaining']) {
        this.updateRateLimit(
          parseInt(response.headers['x-ratelimit-remaining']),
          parseInt(response.headers['x-ratelimit-limit'])
        );
      }

      // Sort by date, newest first
      const backups = response.data
        .filter(file => file.name.startsWith('backup-') && file.name.endsWith('.json'))
        .map(file => ({
          name: file.name,
          date: file.name.replace('backup-', '').replace('.json', ''),
          sha: file.sha,
          size: file.size
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      return backups;
    } catch (error) {
      if (error.response?.status === 404) {
        return []; // No backups folder yet
      }
      throw error;
    }
  },

  async restoreFromBackup(backupFileName) {
    try {
      const config = this.getGitHubConfig();
      if (!config || !config.enabled) {
        throw new Error('GitHub not configured');
      }

      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/backups/${backupFileName}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: { ref: config.branch }
      });

      if (response.headers['x-ratelimit-remaining']) {
        this.updateRateLimit(
          parseInt(response.headers['x-ratelimit-remaining']),
          parseInt(response.headers['x-ratelimit-limit'])
        );
      }

      const content = atob(response.data.content);
      const backupData = JSON.parse(content);

      // Restore data to GitHub sequentially to avoid conflicts
      await this.saveFileToGitHub(FILES.ACCOUNTS, backupData.accounts);
      await this.saveFileToGitHub(FILES.TRANSACTIONS, backupData.transactions);
      await this.saveFileToGitHub(FILES.CATEGORIES, backupData.categories);
      await this.saveFileToGitHub(FILES.SETTINGS, backupData.settings);

      console.log('✅ Data restored from backup:', backupFileName);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
      throw error;
    }
  },

  async deleteOldBackups(keepDays = 30) {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);
      const cutoffStr = cutoffDate.toISOString().slice(0, 10);

      const oldBackups = backups.filter(backup => backup.date < cutoffStr);

      for (const backup of oldBackups) {
        await this.deleteBackup(backup.name);
      }

      console.log(`✅ Deleted ${oldBackups.length} old backups`);
      return oldBackups.length;
    } catch (error) {
      console.error('❌ Failed to delete old backups:', error);
      throw error;
    }
  },

  async deleteBackup(backupFileName) {
    try {
      const config = this.getGitHubConfig();
      if (!config || !config.enabled) {
        throw new Error('GitHub not configured');
      }

      // Get file SHA first
      const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/backups/${backupFileName}`;
      const getResponse = await axios.get(getUrl, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: { ref: config.branch }
      });

      // Delete file
      const deleteUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/backups/${backupFileName}`;
      await axios.delete(deleteUrl, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        data: {
          message: `Delete old backup ${backupFileName}`,
          sha: getResponse.data.sha,
          branch: config.branch
        }
      });

      console.log('✅ Backup deleted:', backupFileName);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete backup:', error);
      throw error;
    }
  },

  // ============ ATTACHMENTS & RECEIPTS ============

  async uploadAttachment(file, transactionId) {
    try {
      const config = this.getGitHubConfig();
      if (!config || !config.enabled) {
        throw new Error('GitHub not configured');
      }

      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only images (JPG, PNG, GIF) and PDF files are allowed');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `receipts/${transactionId}_${timestamp}_${sanitizedName}`;

      // Convert file to base64
      const base64Content = await this.fileToBase64(file);

      // Upload to GitHub
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fileName}`;
      const response = await axios.put(
        url,
        {
          message: `Upload receipt for transaction ${transactionId}`,
          content: base64Content,
          branch: config.branch
        },
        {
          headers: {
            'Authorization': `token ${config.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (response.headers['x-ratelimit-remaining']) {
        this.updateRateLimit(
          parseInt(response.headers['x-ratelimit-remaining']),
          parseInt(response.headers['x-ratelimit-limit'])
        );
      }

      console.log('✅ Attachment uploaded:', fileName);
      
      return {
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        sha: response.data.content.sha,
        downloadUrl: response.data.content.download_url
      };
    } catch (error) {
      console.error('❌ Failed to upload attachment:', error);
      throw error;
    }
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  },

  async downloadAttachment(fileName) {
    try {
      const config = this.getGitHubConfig();
      if (!config || !config.enabled) {
        throw new Error('GitHub not configured');
      }

      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fileName}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: { ref: config.branch }
      });

      if (response.headers['x-ratelimit-remaining']) {
        this.updateRateLimit(
          parseInt(response.headers['x-ratelimit-remaining']),
          parseInt(response.headers['x-ratelimit-limit'])
        );
      }

      return response.data.download_url;
    } catch (error) {
      console.error('❌ Failed to download attachment:', error);
      throw error;
    }
  },

  async deleteAttachment(fileName, sha) {
    try {
      const config = this.getGitHubConfig();
      if (!config || !config.enabled) {
        throw new Error('GitHub not configured');
      }

      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fileName}`;
      await axios.delete(url, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        data: {
          message: `Delete attachment ${fileName}`,
          sha: sha,
          branch: config.branch
        }
      });

      console.log('✅ Attachment deleted:', fileName);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete attachment:', error);
      throw error;
    }
  },

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
};
