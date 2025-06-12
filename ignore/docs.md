# Complete server.js Explanation

## Part 1: Importing Dependencies (The Tools You Need)

```javascript
const fs = require('fs');
const XLSX = require('xlsx');
const express = require('express')
const app = express();
const port = 3000;
const multer = require('multer');
const PDFDocument = require('pdfkit');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcrypt');
```

**What each tool does:**
- `fs` = File System - lets you read/write files on your computer
- `XLSX` = Excel file reader/writer - converts Excel files to JavaScript objects
- `express` = Web server framework - handles HTTP requests (when people visit your website)
- `multer` = File upload handler - processes files that users upload
- `PDFDocument` = PDF creator - makes PDF files from data
- `sqlite3` = Database - stores user accounts, settings, etc.
- `session` = Remembers who's logged in between page visits
- `bcrypt` = Password hasher - makes passwords secure

## Part 2: File Upload Configuration

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('spreadsheet')) cb(null, true);
    else cb(new Error('Invalid file type'), false);
  }
});
```

**What this does:**
- `memoryStorage()` = Store uploaded files in RAM (temporary memory) instead of saving to disk
- `fileFilter` = Only accept Excel files (spreadsheets), reject everything else
- `cb(null, true)` = "Yes, accept this file"
- `cb(new Error(...), false)` = "No, reject this file"

## Part 3: Database Setup

```javascript
const db = new sqlite3.Database('./excel_data.db');

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS settings (
  userId INTEGER PRIMARY KEY,
  storeExcelConversions INTEGER DEFAULT 0,
  FOREIGN KEY(userId) REFERENCES users(id)
)`);
```

**Database Tables Explained:**

**Users Table:**
- `id` = Unique number for each user (1, 2, 3, etc.)
- `name` = User's full name
- `email` = Must be unique (no two users can have same email)
- `passwordHash` = Encrypted version of password (never store plain passwords!)

**Settings Table:**
- `userId` = Links to a specific user
- `storeExcelConversions` = 0 or 1 (false/true) - whether to save their Excel conversions
- `FOREIGN KEY` = Creates a connection between settings and users tables

## Part 4: Static Files

```javascript
app.use(express.static('public'));
```

**What this does:**
- Serves files from the 'public' folder directly
- If someone visits `/style.css`, it serves `public/style.css`
- Used for CSS files, images, client-side JavaScript

## Part 5: Data Cleaning Functions

```javascript
function cleanExcelData(data) {
  return data
    .filter(row => {
      // Remove empty rows
      return Object.values(row).some(val => val !== "");
    })
    .map(row => {
      const cleanRow = {};
      for (const [key, value] of Object.entries(row)) {
        // Clean keys and values
        const cleanKey = key.toString().trim();
        
        // Clean different value types
        let cleanValue;
        if (typeof value === 'string') {
          cleanValue = value.trim().replace(/\s+/g, ' ');
        } else if (value instanceof Date) {
          cleanValue = value.toISOString().split('T')[0]; // Format dates
        } else {
          cleanValue = value;
        }
        
        cleanRow[cleanKey] = cleanValue;
      }
      return cleanRow;
    });
}
```

**Step by step:**
1. `filter()` = Remove rows that are completely empty
2. `some(val => val !== "")` = Check if at least one cell has data
3. `map()` = Transform each row
4. `trim()` = Remove extra spaces from beginning/end
5. `replace(/\s+/g, ' ')` = Replace multiple spaces with single space
6. Date formatting = Convert dates to YYYY-MM-DD format

```javascript
function validateData(data) {
  const errors = [];
  data.forEach((row, i) => {
    // Add validation logic here
    if (!row.Name) errors.push({row: i+1, message: "Missing Name"});
  });
  return errors;
}
```

**What this does:**
- Checks each row for problems
- If a row is missing a "Name" field, adds an error message
- Returns list of all problems found

## Part 6: Upload Routes

### JSON Conversion Route
```javascript
app.post('/upload/json', upload.single('file'), (req, res) => {
  try {
    let workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    let sheetName = workbook.SheetNames[0];
    let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    res.json(jsonData);
  } catch(e) {
    res.send('invalid'+e)
  }
})
```

**What happens:**
1. User uploads Excel file
2. `XLSX.read()` = Convert Excel file to workbook object
3. `workbook.SheetNames[0]` = Get name of first sheet
4. `sheet_to_json()` = Convert sheet data to JavaScript array
5. `res.json()` = Send data back as JSON

### PDF Conversion Route
```javascript
app.post('/upload/pdf', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

  let workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  let sheetName = workbook.SheetNames[0];
  let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  let cleanData = cleanExcelData(jsonData);
  let errors = validateData(cleanData);

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(20).text('Excel to PDF Report', { align: 'center' });

  // Add errors section
  doc.fontSize(16).text('Data Issues:', { underline: true });
  if (errors.length === 0) {
    doc.text('No issues found.');
  } else {
    errors.forEach(err => {
      doc.text(`• Row ${err.row}: ${err.message}`);
    });
  }

  // Add data table
  doc.addPage();
  doc.fontSize(16).text('Processed Data', { align: 'center' });

  // Print table headers
  if (cleanData.length > 0) {
    const columns = Object.keys(cleanData[0]);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text(columns.join(' | '));
    doc.moveDown(0.2);
    doc.font('Helvetica');
    cleanData.forEach((row, i) => {
      if (i < 2000000) {
        const rowText = columns.map(col => row[col] !== undefined ? String(row[col]) : '').join(' | ');
        doc.text(rowText);
      }
    });
  } else {
    doc.moveDown().text('No data found.');
  }

  doc.end();
})
```

**PDF Creation Process:**
1. Set headers to tell browser this is a PDF download
2. Convert Excel to JSON (same as before)
3. Clean and validate the data
4. Create new PDF document
5. Add title "Excel to PDF Report"
6. List any data problems found
7. Add new page
8. Create table with column headers
9. Add each row of data
10. Send PDF to user

### SQL Export Route
```javascript
app.post('/upload/sql', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  let workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  let sheetName = workbook.SheetNames[0];
  let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  let cleanData = cleanExcelData(jsonData);

  if (!cleanData.length) {
    return res.status(400).send('No data found in Excel file.');
  }

  // Get columns from the first row
  const columns = Object.keys(cleanData[0]);
  const tableName = 'excel_data'; // You can change this

  // Generate CREATE TABLE statement
  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
  sql += columns.map(col => `  [${col}] TEXT`).join(',\n') + '\n);\n\n';

  // Generate INSERT statements
  cleanData.forEach(row => {
    const values = columns.map(col => {
      const val = row[col] == null ? '' : row[col].toString().replace(/'/g, "''");
      return `'${val}'`;
    });
    sql += `INSERT INTO ${tableName} (${columns.map(col => `[${col}]`).join(', ')}) VALUES (${values.join(', ')});\n`;
  });

  res.setHeader('Content-Type', 'application/sql');
  res.setHeader('Content-Disposition', 'attachment; filename="excel_data.sql"');
  res.send(sql);
});
```

**SQL Generation Process:**
1. Convert Excel to clean JSON data
2. Get column names from first row
3. Create `CREATE TABLE` statement with all columns
4. For each row, create an `INSERT` statement
5. Escape single quotes in data (`'` becomes `''`)
6. Send as downloadable .sql file

## Part 7: Session Management

```javascript
app.use(session({
  secret: 'your-secret-key', // Change this to a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**Session Configuration:**
- `secret` = Key used to encrypt session data (should be random and secret)
- `resave: false` = Don't save session if nothing changed
- `saveUninitialized: false` = Don't save empty sessions
- `cookie: { secure: false }` = Allow cookies over HTTP (for development)

**Body Parsers:**
- `express.json()` = Parse JSON data from requests
- `express.urlencoded()` = Parse form data from requests

## Part 8: User Authentication

### Registration
```javascript
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (user) return res.status(400).json({ error: 'Email already registered.' });
    const passwordHash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)', [name, email, passwordHash], function(err) {
      if (err) return res.status(500).json({ error: 'Registration failed.' });
      res.json({ success: true, message: 'Registration successful.' });
    });
  });
});
```

**Registration Process:**
1. Extract name, email, password from request
2. Validate all fields are present
3. Check password is at least 8 characters
4. Check if email is already used
5. Hash password with bcrypt (makes it unreadable)
6. Save new user to database
7. Send success response

### Login
```javascript
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields required.' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error.' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Invalid credentials.' });
    req.session.userId = user.id;
    res.json({ success: true, message: 'Login successful.', name: user.name, email: user.email });
  });
});
```

**Login Process:**
1. Get email and password from request
2. Find user in database by email
3. Compare provided password with stored hash
4. If passwords match, save user ID in session
5. Send success response with user info

### Logout
```javascript
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Logged out.' });
  });
});
```

**What this does:**
- Destroys the session (forgets who was logged in)
- Sends success message

## Part 9: Protected Routes

### Authentication Middleware
```javascript
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
```

**How middleware works:**
- Runs before protected routes
- Checks if user is logged in (has userId in session)
- If not logged in, sends error
- If logged in, calls `next()` to continue to the actual route

### Profile Route
```javascript
app.get('/profile', requireAuth, (req, res) => {
  db.get('SELECT id, name, email FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  });
});
```

**What this does:**
1. Requires authentication (using middleware)
2. Gets user info from database using session userId
3. Returns user's name and email (but not password!)

### Settings Management
```javascript
app.post('/settings', requireAuth, (req, res) => {
  const { storeExcelConversions } = req.body;
  if (typeof storeExcelConversions === 'undefined') {
    return res.status(400).json({ error: 'Missing setting.' });
  }
  db.run(
    `INSERT INTO settings (userId, storeExcelConversions) VALUES (?, ?)
     ON CONFLICT(userId) DO UPDATE SET storeExcelConversions=excluded.storeExcelConversions`,
    [req.session.userId, storeExcelConversions ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update settings.' });
      res.json({ success: true, storeExcelConversions: !!storeExcelConversions });
    }
  );
});

app.get('/settings', requireAuth, (req, res) => {
  db.get('SELECT storeExcelConversions FROM settings WHERE userId = ?', [req.session.userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch settings.' });
    res.json({ storeExcelConversions: !!(row && row.storeExcelConversions) });
  });
});
```

**Settings Routes:**
- POST: Updates user's settings (creates new record or updates existing)
- GET: Retrieves user's current settings

## Part 10: Server Startup and Error Handling

### Starting the Server
```javascript
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```

**What this does:**
- Starts the web server on port 3000
- Prints confirmation message
- Server is now ready to accept requests

### Global Error Handler
```javascript
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});
```

**Error handling:**
- Catches any unhandled errors
- Logs error to console
- Sends generic error message to user

### 404 Handler (Page Not Found)
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Type',"text/html");
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head><title>404 Not Found</title>
      <link rel = 'stylesheet' href = '/style.css'>
      </head>
      <body>
        <h1>Sorry, can't find that!</h1>
        <p>The page you requested does not exist.</p>
      </body>
    </html>
  `);
})
```

**Security Headers:**
- `X-Content-Type-Options: nosniff` = Prevents browser from guessing file types
- `X-Frame-Options: DENY` = Prevents page from being embedded in frames
- `X-XSS-Protection` = Enables browser's XSS protection
- `Referrer-Policy` = Controls what referrer info is sent
- `Permissions-Policy` = Restricts access to browser features
- `Strict-Transport-Security` = Forces HTTPS connections

**404 Page:**
- Shows custom error page when user visits non-existent URL
- Includes CSS styling
- User-friendly error message

## Summary

Your server.js creates a full-featured web application that:

1. **Handles file uploads** - Users can upload Excel files
2. **Converts data** - Excel → JSON, PDF, or SQL
3. **Manages users** - Registration, login, logout
4. **Stores data** - SQLite database for users and settings
5. **Provides security** - Password hashing, sessions, security headers
6. **Handles errors** - Graceful error handling and 404 pages

The application follows good practices like input validation, error handling, and security measures. It's a solid foundation that could be extended with more features!