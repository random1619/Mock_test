const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PROGRESS_FILE = path.join(__dirname, 'progress-db.json');

app.use(express.json());

// In-memory cache for dynamic mocks scanner
let cachedMocks = null;
let lastScanTime = 0;
const CACHE_TTL = 10000; // 10 seconds TTL


// Recursive function to dynamically scan the workspace for mocks (.html and .pdf files)
function scanMocks(dir, baseDir) {
  let list = [];
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      // Skip hidden/system directories, node_modules, and scratch folders
      if (file.startsWith('.') || file === 'node_modules' || file === 'scratch') {
        continue;
      }
      
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        list = list.concat(scanMocks(fullPath, baseDir));
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.html' || ext === '.pdf') {
          // Exclude dashboard template and backup files
          if (file !== 'index.html' && file !== 'index.bak.html' && file !== 'index.old.html') {
            const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            list.push(relativePath);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dir}:`, err);
  }
  return list;
}

// GET mocks catalog dynamically served from mocks-manifest.json or scanned from filesystem as fallback
app.get('/api/mocks', (req, res) => {
  try {
    const manifestPath = path.join(__dirname, 'mocks-manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const manifestData = fs.readFileSync(manifestPath, 'utf8');
        return res.json(JSON.parse(manifestData));
      } catch (err) {
        console.warn('Failed to parse mocks-manifest.json, falling back to dynamic scan:', err.message);
      }
    }

    const now = Date.now();
    if (cachedMocks && (now - lastScanTime < CACHE_TTL)) {
      return res.json(cachedMocks);
    }

    const filesList = scanMocks(__dirname, __dirname);
    filesList.sort();

    cachedMocks = {
      generatedAt: new Date().toISOString(),
      files: filesList
    };
    lastScanTime = now;

    return res.json(cachedMocks);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to serve mocks catalog' });
  }
});

// GET progress (solved state, bookmarks, and recents)
app.get('/api/progress', (req, res) => {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
      return res.json(JSON.parse(data));
    } catch (err) {
      // Fallback on read error
    }
  }
  return res.json({ solved: [], starred: [], recent: [] });
});

// POST save progress
app.post('/api/progress', (req, res) => {
  const { solved, starred, recent, scores } = req.body;
  const progressData = {
    solved: Array.isArray(solved) ? solved : [],
    starred: Array.isArray(starred) ? starred : [],
    recent: Array.isArray(recent) ? recent : [],
    scores: Array.isArray(scores) ? scores : []
  };

  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progressData, null, 2), 'utf8');
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write progress database file.' });
  }
});

// Serve everything statically (including mocks and pdfs)
app.use(express.static(__dirname));

// Single Page Portal fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  CBT Mock Test Portal Backend active at:`);
  console.log(`  👉 http://localhost:${PORT}`);
  console.log(`==================================================`);
});
