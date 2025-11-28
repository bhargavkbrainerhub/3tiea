const express = require('express');
const mysql = require('mysql2/promise'); // Async/await support
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from Docker Compose or local file
dotenv.config({ path: './test-env' });

const app = express();
app.use(express.json());
app.use(cors());

let db;

// Function to connect to MySQL and retry if not ready
const connectToDatabase = async () => {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      db = await mysql.createPool({
        host: process.env.MYSQL_HOST || 'db',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'mysql123',
        database: process.env.MYSQL_DATABASE || 'school',
        waitForConnections: true,
        connectionLimit: 10,
      });

      // Test connection
      await db.query('SELECT 1');
      console.log('Connected to MySQL database');
      break;
    } catch (err) {
      retries++;
      console.log(`MySQL not ready, retrying (${retries}/${maxRetries})...`);
      await new Promise(res => setTimeout(res, 3000)); // wait 3 sec before retry
    }
  }

  if (!db) {
    console.error('Failed to connect to MySQL after multiple attempts.');
    process.exit(1);
  }
};

// Helper functions to get last IDs
const getLastStudentID = async () => {
  const [result] = await db.query('SELECT MAX(id) AS lastID FROM student');
  return result[0].lastID || 0;
};

const getLastTeacherID = async () => {
  const [result] = await db.query('SELECT MAX(id) AS lastID FROM teacher');
  return result[0].lastID || 0;
};

// Routes
app.get('/', async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM student');
    res.json({ message: 'From Backend!!!', studentData: data });
  } catch (err) {
    console.error('Error fetching student data:', err);
    res.status(500).json({ error: 'Error fetching student data' });
  }
});

app.get('/student', async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM student');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching student data' });
  }
});

app.get('/teacher', async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM teacher');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching teacher data' });
  }
});

app.post('/addstudent', async (req, res) => {
  try {
    const nextID = (await getLastStudentID()) + 1;
    const { name, rollNo, class: className } = req.body;

    await db.query(
      'INSERT INTO student (id, name, roll_number, class) VALUES (?, ?, ?, ?)',
      [nextID, name, rollNo, className]
    );
    res.json({ message: 'Student added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding student' });
  }
});

app.post('/addteacher', async (req, res) => {
  try {
    const nextID = (await getLastTeacherID()) + 1;
    const { name, subject, class: className } = req.body;

    await db.query(
      'INSERT INTO teacher (id, name, subject, class) VALUES (?, ?, ?, ?)',
      [nextID, name, subject, className]
    );
    res.json({ message: 'Teacher added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding teacher' });
  }
});

app.delete('/student/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    await db.query('DELETE FROM student WHERE id = ?', [studentId]);

    // Reorder IDs
    const [rows] = await db.query('SELECT id FROM student ORDER BY id');
    await Promise.all(
      rows.map((row, index) => db.query('UPDATE student SET id = ? WHERE id = ?', [index + 1, row.id]))
    );

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting student' });
  }
});

app.delete('/teacher/:id', async (req, res) => {
  try {
    const teacherId = req.params.id;
    await db.query('DELETE FROM teacher WHERE id = ?', [teacherId]);

    // Reorder IDs
    const [rows] = await db.query('SELECT id FROM teacher ORDER BY id');
    await Promise.all(
      rows.map((row, index) => db.query('UPDATE teacher SET id = ? WHERE id = ?', [index + 1, row.id]))
    );

    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting teacher' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (db) await db.end();
  process.exit();
});

// Start server after DB connection
connectToDatabase().then(() => {
  app.listen(3500, () => {
    console.log('Backend listening on port 3500');
  });
});
