const fs = require('fs');
const XLSX = require('xlsx');
const express = require('express')
const app = express();
const port = 3000;
const multer = require('multer');
const PDFDocument = require('pdfkit');
const sqlite3 = require('sqlite3').verbose();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('spreadsheet')) cb(null, true);
    else cb(new Error('Invalid file type'), false);
  }
});

const db = new sqlite3.Database('./excel_data.db');

// Create table if not exists (adjust columns as needed)
db.run(`CREATE TABLE IF NOT EXISTS data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT,
  /* Add other columns as needed */
  RawData TEXT
)`);

app.use(express.static('public'));

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

function validateData(data) {
  const errors = [];
  data.forEach((row, i) => {
    // Add validation logic here
    if (!row.Name) errors.push({row: i+1, message: "Missing Name"});
  });
  return errors;
}




app.post('/upload/json', upload.single('file'), (req, res) => {

    try {
     let workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    let sheetName = workbook.SheetNames[0];
    let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);


    res.json(jsonData);
    }catch(e){


res.send('invalid'+e)

    }


})

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});


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
