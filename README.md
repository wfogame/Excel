This is vibe codeed soo yeah
# Excel-Hell-s-FIX

## Overview
The Excel App is a web application designed to facilitate the upload, processing, and conversion of Excel files into various formats, including PDF and SQL. Users can upload their Excel files, and the application will generate reports and export data as needed.

## Features
- Upload Excel files for processing.
- Generate PDF reports from Excel data.
- Export processed data to SQL format.
- User-friendly interface with SVG icons for actions.

## Project Structure
```
Excel
├── public
│   ├── index.html        # Main HTML document
│   ├── cheatsheet.html   # Cheatsheet page
│   ├── login.html        # Login page
│   ├── sql.html          # SQL export page
│   └── svg               # Directory containing SVG icons and images
│       ├── download-btn.svg   # SVG for the download button
│       ├── pdf-btn.svg        # SVG for the PDF button
│       ├── sql-btn.svg        # SVG for the SQL button
│       ├── upload-btn.svg     # SVG for the upload button
│       ├── upload-sql.svg     # SVG for SQL upload
│       ├── sd.svg             # Additional SVG icon
│       └── JustAProgram.jpg   # Image asset
├── server.js             # Server-side code for handling requests
├── package.json          # NPM configuration file
├── excel_data.db         # SQLite database file for storing user data ENCODED in top grade HASH ( Will be made once use )
├── LICENSE.md            # License file
└── README.md             # Documentation for the project
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/wfogame/Excel-Hell-s-FIX
   ```
2. Navigate to the project directory:
   ```
   cd Excel-Hell-s-FIX
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the server:
   ```
   node server.js
   ```
2. Open your web browser and navigate to `http://localhost:3000` to access the application.
3. Use the upload button to select and upload your Excel files.
4. Choose the desired output format (PDF or SQL) to generate reports or export data.
5. Remeber delete the following folders: ignore, public/learning public/deprecated public/new



