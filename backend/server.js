const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'spoofer4you-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
fs.ensureDirSync(path.join(__dirname, 'uploads'));

// Database setup
const db = new sqlite3.Database('spoofer4you.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Subscriptions table
  db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Files table
  db.run(`CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    category_id TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  // Create default admin user
  const adminId = uuidv4();
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (id, username, password, role) VALUES (?, ?, ?, ?)`,
    [adminId, 'admin', adminPassword, 'admin']);

  // Create default SPOOFER4YOU category
  const categoryId = uuidv4();
  db.run(`INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)`,
    [categoryId, 'SPOOFER4YOU']);

  // Initialize default settings
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    ['siteName', 'SPOOFER4YOU']);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    ['siteIcon', '']);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
    ['headerImage', '']);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 * 5 // 5GB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.zip', '.rar', '.exe', '.dll', '.data', '.7z'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .zip, .rar, .exe, .dll, .data, .7z files are allowed.'));
    }
  }
});

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get user with subscription
const getUserWithSubscription = (userId, callback) => {
  db.get(`
    SELECT u.*, s.id as sub_id, s.type, s.expires_at, s.is_active
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.user_id AND s.is_active = 1
    WHERE u.id = ?
  `, [userId], (err, row) => {
    if (err) return callback(err, null);
    
    if (row) {
      const user = {
        id: row.id,
        username: row.username,
        role: row.role
      };
      
      if (row.sub_id) {
        user.subscription = {
          type: row.type,
          expiresAt: row.expires_at,
          isActive: row.is_active === 1 && new Date(row.expires_at) > new Date()
        };
      }
      
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};

// Routes

// Auth routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  if (username.length > 6) {
    return res.status(400).json({ success: false, message: 'Username must be 6 characters or less' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    getUserWithSubscription(user.id, (err, userWithSub) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      const token = jwt.sign({ 
        id: user.id, 
        username: user.username, 
        role: user.role 
      }, JWT_SECRET);

      res.json({
        success: true,
        token,
        user: userWithSub
      });
    });
  });
});

app.post('/api/verify-token', authenticateToken, (req, res) => {
  getUserWithSubscription(req.user.id, (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({ success: true, user });
  });
});

// User routes
app.get('/api/categories', authenticateToken, (req, res) => {
  db.all(`
    SELECT c.id, c.name,
           f.id as file_id, f.original_name as filename, f.file_size, f.uploaded_at
    FROM categories c
    LEFT JOIN files f ON c.id = f.category_id
    ORDER BY c.name, f.uploaded_at DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const categories = {};
    rows.forEach(row => {
      if (!categories[row.id]) {
        categories[row.id] = {
          id: row.id,
          name: row.name,
          files: []
        };
      }
      
      if (row.file_id) {
        categories[row.id].files.push({
          id: row.file_id,
          filename: row.filename,
          size: formatFileSize(row.file_size),
          uploadedAt: row.uploaded_at
        });
      }
    });

    res.json({
      success: true,
      categories: Object.values(categories)
    });
  });
});

app.get('/api/download/:fileId', authenticateToken, (req, res) => {
  const { fileId } = req.params;

  // Check if user has active subscription
  getUserWithSubscription(req.user.id, (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!user.subscription || !user.subscription.isActive) {
      return res.status(403).json({ success: false, message: 'Active subscription required' });
    }

    db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, file) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      const filePath = path.join(__dirname, file.file_path);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found on disk' });
      }

      res.download(filePath, file.original_name);
    });
  });
});

// Admin routes
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT u.id, u.username, u.role, u.created_at,
           s.id as sub_id, s.type, s.expires_at, s.is_active
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.user_id AND s.is_active = 1
    ORDER BY u.created_at DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const users = rows.map(row => {
      const user = {
        id: row.id,
        username: row.username,
        role: row.role
      };
      
      if (row.sub_id) {
        user.subscription = {
          type: row.type,
          expiresAt: row.expires_at,
          isActive: row.is_active === 1 && new Date(row.expires_at) > new Date()
        };
      }
      
      return user;
    });

    res.json({ success: true, users });
  });
});

app.get('/api/admin/categories', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT c.id, c.name,
           f.id as file_id, f.original_name as filename, f.file_size, f.uploaded_at
    FROM categories c
    LEFT JOIN files f ON c.id = f.category_id
    ORDER BY c.name, f.uploaded_at DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const categories = {};
    rows.forEach(row => {
      if (!categories[row.id]) {
        categories[row.id] = {
          id: row.id,
          name: row.name,
          files: []
        };
      }
      
      if (row.file_id) {
        categories[row.id].files.push({
          id: row.file_id,
          filename: row.filename,
          size: formatFileSize(row.file_size),
          uploadedAt: row.uploaded_at
        });
      }
    });

    res.json({
      success: true,
      categories: Object.values(categories)
    });
  });
});

app.post('/api/admin/categories', authenticateToken, requireAdmin, (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name required' });
  }

  const categoryId = uuidv4();
  db.run('INSERT INTO categories (id, name) VALUES (?, ?)', [categoryId, name.trim()], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({ success: true, message: 'Category created successfully' });
  });
});

app.post('/api/admin/upload', authenticateToken, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const { categoryId } = req.body;
  
  if (!categoryId) {
    fs.removeSync(req.file.path);
    return res.status(400).json({ success: false, message: 'Category ID required' });
  }

  const fileId = uuidv4();
  const relativePath = `uploads/${req.file.filename}`;

  db.run(`
    INSERT INTO files (id, filename, original_name, file_path, file_size, category_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [fileId, req.file.filename, req.file.originalname, relativePath, req.file.size, categoryId], (err) => {
    if (err) {
      fs.removeSync(req.file.path);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({ success: true, message: 'File uploaded successfully' });
  });
});

app.put('/api/admin/users/:userId/subscription', authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.params;
  const { type, days } = req.body;

  if (!type || !days) {
    return res.status(400).json({ success: false, message: 'Type and days required' });
  }

  // Deactivate existing subscriptions
  db.run('UPDATE subscriptions SET is_active = 0 WHERE user_id = ?', [userId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Create new subscription
    const subscriptionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(days));

    db.run(`
      INSERT INTO subscriptions (id, user_id, type, expires_at, is_active)
      VALUES (?, ?, ?, ?, 1)
    `, [subscriptionId, userId, type, expiresAt.toISOString()], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({ success: true, message: 'Subscription updated successfully' });
    });
  });
});

app.delete('/api/admin/files/:fileId', authenticateToken, requireAdmin, (req, res) => {
  const { fileId } = req.params;

  db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, file) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, file.file_path);
    if (fs.existsSync(filePath)) {
      fs.removeSync(filePath);
    }

    // Delete from database
    db.run('DELETE FROM files WHERE id = ?', [fileId], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({ success: true, message: 'File deleted successfully' });
    });
  });
});

app.get('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT key, value FROM settings', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({ success: true, settings });
  });
});

app.put('/api/admin/settings', authenticateToken, requireAdmin, (req, res) => {
  const { siteName, siteIcon, headerImage } = req.body;

  const updates = [
    { key: 'siteName', value: siteName || 'SPOOFER4YOU' },
    { key: 'siteIcon', value: siteIcon || '' },
    { key: 'headerImage', value: headerImage || '' }
  ];

  let completed = 0;
  let hasError = false;

  updates.forEach(update => {
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 
      [update.key, update.value], (err) => {
        if (err && !hasError) {
          hasError = true;
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        completed++;
        if (completed === updates.length && !hasError) {
          res.json({ success: true, message: 'Settings updated successfully' });
        }
      });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 5GB.' 
      });
    }
  }
  
  res.status(500).json({ 
    success: false, 
    message: error.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`SPOOFER4YOU Backend running on port ${PORT}`);
});