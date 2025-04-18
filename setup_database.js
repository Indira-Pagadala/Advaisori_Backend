require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host:process.env.DB_HOST,
  port: process.env.DB_PORT,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  console.log('Connected to MySQL server');
  
  // Create database
  connection.query('CREATE DATABASE IF NOT EXISTS advaisori_db', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    
    console.log('Database created or already exists');
    
    // Switch to the database
    connection.query('USE railway', (err) => {
      if (err) {
        console.error('Error switching to database:', err);
        return;
      }
      
      // Create table with modified preferred_time column
      const createTable = `
        CREATE TABLE IF NOT EXISTS form_submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          company VARCHAR(255) NOT NULL,
          industry VARCHAR(255) NOT NULL,
          employees VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          preferred_date DATE NOT NULL,
          preferred_time VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      connection.query(createTable, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        } else {
          console.log('Table created or already exists');
        }
        
        // Alter existing table if it exists
        const alterTable = `
          ALTER TABLE form_submissions 
          MODIFY COLUMN preferred_time VARCHAR(100) NOT NULL
        `;
        
        connection.query(alterTable, (err) => {
          if (err) {
            console.error('Error altering table:', err);
          } else {
            console.log('Table column modified successfully');
          }
          connection.end();
        });
      });
    });
  });
}); 