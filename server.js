const fs = require('fs');
const XLSX = require('xlsx');
const express = require('express')
const app = express();
const port = 3000;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });



app.use(express.static('public'));

app.post('/upload/json', upload.single('file'), (req, res) => {
     let workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    let sheetName = workbook.SheetNames[0];
    let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);


    res.json(jsonData);

})

app.post('/upload/pdf',upload.single('file',(req,res)=>{


         let workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    let sheetName = workbook.SheetNames[0];
    let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
     let cleanData = cleanExcelData(jsonData);
    let errors = validateData(cleanData);

    res.send(
        cleanData,
        errors
    );
}))




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



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
