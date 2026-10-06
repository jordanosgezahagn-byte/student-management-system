const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves frontend static files automatically

// Database Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Default XAMPP MySQL password is empty
    database: 'student_management_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection On Startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ XAMPP Database Connection Failed:', err.message);
    } else {
        console.log('✅ Successfully connected to XAMPP MySQL Database!');
        connection.release();
    }
});

const db = pool.promise();

// --- REST API ENDPOINTS ---

// 1. GET ALL STUDENTS
app.get('/api/students', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SINGLE STUDENT BY ID (For Edit Form)
app.get('/api/students/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ADD NEW STUDENT
app.post('/api/students', async (req, res) => {
    const { first_name, last_name, email, phone, department, enrollment_date } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO students (first_name, last_name, email, phone, department, enrollment_date) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, department, enrollment_date]
        );
        res.status(201).json({ id: result.insertId, message: 'Student added successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE STUDENT
app.put('/api/students/:id', async (req, res) => {
    const { first_name, last_name, email, phone, department, enrollment_date } = req.body;
    try {
        await db.query(
            'UPDATE students SET first_name = ?, last_name = ?, email = ?, phone = ?, department = ?, enrollment_date = ? WHERE id = ?',
            [first_name, last_name, email, phone, department, enrollment_date, req.params.id]
        );
        res.json({ message: 'Student updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE STUDENT
app.delete('/api/students/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ message: 'Student deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});