const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS) from /public
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from API', timestamp: Date.now() });
});

app.get('/api/slow', (req, res) => {
  // Simulate a slow operation (2 seconds)
  setTimeout(() => {
    res.json({ message: 'Slow response', delay: '2000ms' });
  }, 2000);
});

app.get('/api/cpu', (req, res) => {
  // CPU intensive: compute sum of large array
  let sum = 0;
  for (let i = 0; i < 1e7; i++) {
    sum += i;
  }
  res.json({ message: 'CPU work done', result: sum });
});

// Catch-all to serve index.html for client-side routing (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Demo app running at http://localhost:${PORT}`);
});