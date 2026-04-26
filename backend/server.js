const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, 'master-data.json');

app.use(cors());
app.use(express.json());

// Read all data
app.get('/api/data', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read data file.' });
    }
    res.json(JSON.parse(data));
  });
});

// Write all data
app.post('/api/data', (req, res) => {
  fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8', err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to write data file.' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
