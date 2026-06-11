const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PROGRESS_FILE = path.join(__dirname, 'progress-db.json');

app.use(express.json());

// Load mocks-manifest.json if it exists, otherwise return a scan-failed message
app.get('/api/mocks', (req, res) => {
  const manifestPath = path.join(__dirname, 'mocks-manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const data = fs.readFileSync(manifestPath, 'utf8');
      return res.json(JSON.parse(data));
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse mocks-manifest.json' });
    }
  }
  return res.status(404).json({ error: 'mocks-manifest.json not found. Run rich_manifest.js to generate it.' });
});

// GET progress (solved state and bookmarks)
app.get('/api/progress', (req, res) => {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
      return res.json(JSON.parse(data));
    } catch (err) {
      // Fallback
    }
  }
  return res.json({ solved: [], starred: [], recent: [] });
});

// POST save progress
app.post('/api/progress', (req, res) => {
  const { solved, starred, recent } = req.body;
  const progressData = {
    solved: Array.isArray(solved) ? solved : [],
    starred: Array.isArray(starred) ? starred : [],
    recent: Array.isArray(recent) ? recent : []
  };

  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progressData, null, 2), 'utf8');
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write progress database file.' });
  }
});

// Serve everything statically
app.use(express.static(__dirname));

// Single Page Portal fallbacks
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  CBT Mock Test Portal Backend active at:`);
  console.log(`  👉 http://localhost:${PORT}`);
  console.log(`==================================================`);
});
