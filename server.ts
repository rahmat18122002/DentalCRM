import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import Database from 'better-sqlite3';

const db = new Database('clinic.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    dob TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    date TEXT,
    time TEXT,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(doctor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL
  );

  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    appointment_id INTEGER,
    tooth_number INTEGER,
    service_id INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(appointment_id) REFERENCES appointments(id),
    FOREIGN KEY(service_id) REFERENCES services(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    amount REAL,
    method TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT,
    problem TEXT,
    doctor_id INTEGER,
    status TEXT DEFAULT 'waiting',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES users(id)
  );
`);

// Seed initial data
const checkAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!checkAdmin) {
  db.prepare('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)').run('admin', 'admin123', 'admin', 'Главный Администратор');
  db.prepare('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)').run('doctor', 'doc123', 'doctor', 'Врач Стоматолог');
  db.prepare('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)').run('reception', 'rec123', 'receptionist', 'Регистратура');
  
  const insertService = db.prepare('INSERT INTO services (name, price) VALUES (?, ?)');
  insertService.run('Консультация', 1000);
  insertService.run('Лечение кариеса', 3500);
  insertService.run('Удаление зуба', 2500);
  insertService.run('Профессиональная чистка', 4000);
  insertService.run('Установка пломбы', 2000);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Auth
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT id, username, role, name FROM users WHERE username = ? AND password = ?').get(username, password);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
    }
  });

  // Users (Doctors)
  app.get('/api/doctors', (req, res) => {
    const doctors = db.prepare('SELECT id, name FROM users WHERE role = "doctor"').all();
    res.json(doctors);
  });

  // Patients
  app.get('/api/patients', (req, res) => {
    const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
    res.json(patients);
  });

  app.get('/api/patients/:id', (req, res) => {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: 'Пациент не найден' });
    }
  });

  app.post('/api/patients', (req, res) => {
    const { name, phone, dob } = req.body;
    const result = db.prepare('INSERT INTO patients (name, phone, dob) VALUES (?, ?, ?)').run(name, phone, dob);
    res.json({ id: result.lastInsertRowid });
  });

  // Appointments
  app.get('/api/appointments', (req, res) => {
    const { date } = req.query;
    let query = `
      SELECT a.*, p.name as patient_name, u.name as doctor_name 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.doctor_id = u.id
    `;
    let params: any[] = [];
    
    if (date) {
      query += ' WHERE a.date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY a.date, a.time';
    
    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  });

  app.post('/api/appointments', (req, res) => {
    const { patient_id, doctor_id, date, time, notes } = req.body;
    
    // Check for overlap
    const existing = db.prepare('SELECT * FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status != "cancelled"').get(doctor_id, date, time);
    if (existing) {
      return res.status(400).json({ error: 'Это время уже занято у данного врача' });
    }
    
    const result = db.prepare('INSERT INTO appointments (patient_id, doctor_id, date, time, notes) VALUES (?, ?, ?, ?, ?)').run(patient_id, doctor_id, date, time, notes || '');
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/appointments/:id/status', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  // Services
  app.get('/api/services', (req, res) => {
    const services = db.prepare('SELECT * FROM services').all();
    res.json(services);
  });

  app.post('/api/services', (req, res) => {
    const { name, price } = req.body;
    const result = db.prepare('INSERT INTO services (name, price) VALUES (?, ?)').run(name, price);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/services/:id', (req, res) => {
    const { name, price } = req.body;
    db.prepare('UPDATE services SET name = ?, price = ? WHERE id = ?').run(name, price, req.params.id);
    res.json({ success: true });
  });

  // Treatments
  app.get('/api/patients/:id/treatments', (req, res) => {
    const treatments = db.prepare(`
      SELECT t.*, s.name as service_name, s.price 
      FROM treatments t
      JOIN services s ON t.service_id = s.id
      WHERE t.patient_id = ?
      ORDER BY t.created_at DESC
    `).all(req.params.id);
    res.json(treatments);
  });

  app.post('/api/treatments', (req, res) => {
    const { patient_id, appointment_id, tooth_number, service_id, notes } = req.body;
    const result = db.prepare('INSERT INTO treatments (patient_id, appointment_id, tooth_number, service_id, notes) VALUES (?, ?, ?, ?, ?)').run(patient_id, appointment_id || null, tooth_number, service_id, notes || '');
    res.json({ id: result.lastInsertRowid });
  });

  // Payments & Finances
  app.get('/api/payments', (req, res) => {
    const payments = db.prepare(`
      SELECT p.*, pat.name as patient_name 
      FROM payments p
      JOIN patients pat ON p.patient_id = pat.id
      ORDER BY p.date DESC
    `).all();
    res.json(payments);
  });

  app.post('/api/payments', (req, res) => {
    const { patient_id, amount, method } = req.body;
    const result = db.prepare('INSERT INTO payments (patient_id, amount, method) VALUES (?, ?, ?)').run(patient_id, amount, method);
    res.json({ id: result.lastInsertRowid });
  });

  app.get('/api/finances/summary', (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const month = today.substring(0, 7);
      
      const todayTotal = db.prepare('SELECT SUM(amount) as total FROM payments WHERE date(date) = ?').get(today) as {total: number};
      const monthTotal = db.prepare("SELECT SUM(amount) as total FROM payments WHERE strftime('%Y-%m', date) = ?").get(month) as {total: number};
      
      res.json({
        today: todayTotal.total || 0,
        month: monthTotal.total || 0
      });
    } catch (error) {
      console.error('Error fetching finances summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/patients/:id/balance', (req, res) => {
    const patientId = req.params.id;
    const treatmentsTotal = db.prepare(`
      SELECT SUM(s.price) as total 
      FROM treatments t
      JOIN services s ON t.service_id = s.id
      WHERE t.patient_id = ?
    `).get(patientId) as {total: number};
    
    const paymentsTotal = db.prepare('SELECT SUM(amount) as total FROM payments WHERE patient_id = ?').get(patientId) as {total: number};
    
    const debt = (treatmentsTotal.total || 0) - (paymentsTotal.total || 0);
    res.json({ debt });
  });

  // Queue
  app.get('/api/queue', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const queue = db.prepare(`
      SELECT q.*, u.name as doctor_name 
      FROM queue q
      JOIN users u ON q.doctor_id = u.id
      WHERE date(q.created_at) = ?
      ORDER BY q.created_at ASC
    `).all(today);
    res.json(queue);
  });

  app.post('/api/queue', (req, res) => {
    const { patient_name, problem, doctor_id } = req.body;
    const result = db.prepare('INSERT INTO queue (patient_name, problem, doctor_id) VALUES (?, ?, ?)').run(patient_name, problem, doctor_id);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/queue/:id/status', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE queue SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
