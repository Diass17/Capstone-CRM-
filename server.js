
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// --- Parse JSON bodies ---
app.use(express.json());

// --- API Routes (backend only) ---
app.get('/api/schedule', (req, res) => {
  const scheduleData = [
    { employee: 'Иванов Иван', role: 'Менеджер', date: '2025-10-30', shift: '9:00 - 18:00', status: 'Рабочий' },
    { employee: 'Петрова Мария', role: 'Дизайнер', date: '2025-10-30', shift: 'Выходной', status: 'Выходной' },
  ];
  res.json(scheduleData);
});

app.get('/api/clients/payments', (req, res) => {
  const paymentData = {
    totalRevenue: 450000,
    pendingInvoices: 5,
  };
  res.json(paymentData);
});

// --- Serve the built frontend (Vue production build) ---
// Points to: CRM-System/dist
const frontendDistPath = path.resolve(__dirname, '../CRM-System/dist');
app.use(express.static(frontendDistPath));

// All non-API routes should return index.html (SPA fallback)
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// --- Start server ---
app.listen(port, () => {
  console.log(`✅ CRM Pro backend + frontend running at http://localhost:${port}`);
});