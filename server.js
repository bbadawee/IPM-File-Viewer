const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Unique filename to avoid collision
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API route to upload and parse IPM clearing file
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const exePath = path.join(__dirname, 'ipm2json.exe');

  console.log(`[Server] Parsing file: ${filePath} using ${exePath}`);

  // Execute ipm2json.exe with -u flag for UTF-8
  execFile(exePath, ['-u', filePath], { maxBuffer: 100 * 1024 * 1024 }, (error, stdout, stderr) => {
    // Clean up uploaded file immediately
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error(`[Server] Error deleting temp file: ${unlinkErr}`);
    });

    if (error) {
      console.error('[Server] Execution error:', error);
      console.error('[Server] stderr:', stderr);
      return res.status(500).json({
        error: 'Failed to parse IPM file',
        details: stderr || error.message
      });
    }

    try {
      // Parse the JSON output from stdout
      const jsonData = JSON.parse(stdout);
      console.log(`[Server] Successfully parsed ${jsonData.length} transactions`);
      res.json({
        filename: req.file.originalname,
        transactionsCount: jsonData.length,
        data: jsonData
      });
    } catch (parseError) {
      console.error('[Server] JSON parse error:', parseError);
      res.status(500).json({
        error: 'Failed to parse the conversion tool output as JSON',
        details: parseError.message
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  IPM Clearing File Viewer server running at:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`==================================================`);
});
