const fs = require('fs');
const XLSX = require('xlsx');
const express = require('express')
const app = express();
const port = 3000;


app.use(express.static('public'));

app.post('/upload/import', (req, res) => {
    let file = req.body
    let workbook = XLSX.read(file);
    console.log(workbook);
    res.send(workbook);

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



    