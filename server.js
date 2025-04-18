require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host:process.env.DB_HOST,
  port: process.env.DB_PORT,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Google Sheets Setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Form submission endpoint
app.post('/submit', async (req, res) => {
  const formData = req.body;
  console.log('Received form data:', formData); // Debug log
  
  try {
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'company', 'industry', 'employees', 'message', 'preferredDate', 'preferredTime'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Insert into MySQL
    const query = `
      INSERT INTO form_submissions 
      (name, email, phone, company, industry, employees, message, preferred_date, preferred_time, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    // Convert MySQL query to Promise
    await new Promise((resolve, reject) => {
      db.query(
        query, 
        [
          formData.name,
          formData.email,
          formData.phone,
          formData.company,
          formData.industry,
          formData.employees,
          formData.message,
          formData.preferredDate,
          formData.preferredTime
        ],
        (err, result) => {
          if (err) {
            console.error('Error inserting into MySQL:', err);
            reject(err);
          } else {
            console.log('Successfully inserted into database:', result);
            resolve(result);
          }
        }
      );
    });

    // Only proceed to Google Sheets if MySQL was successful
    const values = [[
      new Date().toISOString(),
      formData.name,
      formData.email,
      formData.phone,
      formData.company,
      formData.industry,
      formData.employees,
      formData.message,
      formData.preferredDate,
      formData.preferredTime
    ]];

    // Skip Google Sheets for now since credentials aren't set
    // await sheets.spreadsheets.values.append({
    //   spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    //   range: 'Sheet1!A:I',
    //   valueInputOption: 'RAW',
    //   requestBody: {
    //     values,
    //   },
    // });

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 