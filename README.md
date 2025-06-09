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
excel-app
├── public
│   ├── index.html        # Main HTML document
│   ├── style.css         # Styles for the application
│   └── svg               # Directory containing SVG icons
│       ├── plus-fancy.svg # Fancy "+" symbol for the title
│       ├── upload-btn.svg # SVG for the upload button
│       ├── download-btn.svg # SVG for the download button
│       ├── pdf-btn.svg   # SVG for the PDF button
│       └── sql-btn.svg   # SVG for the SQL button
├── server.js             # Server-side code for handling requests
├── package.json          # NPM configuration file
└── README.md             # Documentation for the project
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd excel-app
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

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.