const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Indira@dbms2',
  database: 'advaisori_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  console.log('Successfully connected to MySQL database');
  
  // Test query to check table structure
  connection.query('DESCRIBE form_submissions', (err, results) => {
    if (err) {
      console.error('Error checking table structure:', err);
    } else {
      console.log('\nTable structure:');
      console.log(results);
    }
    
    // Check if there are any existing submissions
    connection.query('SELECT * FROM form_submissions', (err, results) => {
      if (err) {
        console.error('Error checking submissions:', err);
      } else {
        console.log('\nExisting submissions:');
        console.log(results);
      }
      
      connection.end();
    });
  });
}); 