// ===== START DIAGNOSTIC CODE =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (err, origin) => {
  console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
});
// ===== END DIAGNOSTIC CODE =====


const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { translateJson, setOllamaApiBaseUrl } = require('./utils/translator'); // Import setOllamaApiBaseUrl

const app = express();
const port = 3000;

// Create 'uploads' directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Upload files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Add timestamp to filename
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

app.use(express.json({ limit: '50mb' }));

// Enable CORS for frontend to access backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins for now
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

app.post('/upload', upload.single('jsonFile'), async (req, res) => {
  console.log('Received upload request.');
  if (!req.file) {
    console.error('No file uploaded.');
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  console.log('File received:', req.file.originalname, 'Path:', req.file.path);
  const filePath = req.file.path;
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    console.log('JSON parsed successfully.');
    res.status(200).json({ message: 'File uploaded and parsed successfully!', data: jsonData });
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(500).json({ message: `Error processing file: ${error.message}` });
  } finally {
    // Always try to delete the temporary file
    fs.promises.unlink(filePath).catch(err => console.error('Error deleting temp file:', err));
  }
});

app.post('/ollama/models', async (req, res) => {
  console.log('Received request for Ollama models.');
  const { ollamaApiUrl } = req.body;

  if (!ollamaApiUrl) {
    return res.status(400).json({ message: 'Ollama API URL not provided.' });
  }

  try {
    const response = await fetch(`${ollamaApiUrl}/api/tags`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch Ollama models: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    const models = data.models.map(m => m.name); // Extract model names
    res.status(200).json({ models });
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    res.status(500).json({ message: `Failed to connect to Ollama or fetch models: ${error.message}` });
  }
});

// Endpoint to set Ollama API URL and handle translation
app.post('/translate', async (req, res) => {
  console.log('Received translate request.');
  const { jsonData, model, ollamaApiUrl, sourceLanguage, targetLanguage, keysToExclude } = req.body; // Added keysToExclude

  if (!jsonData) {
    return res.status(400).json({ message: 'No JSON data provided for translation.' });
  }
  if (!model) {
    return res.status(400).json({ message: 'No Ollama model provided for translation.' });
  }
  if (!ollamaApiUrl) {
    return res.status(400).json({ message: 'No Ollama API URL provided for translation.' });
  }
  if (!sourceLanguage) {
    return res.status(400).json({ message: 'No source language provided for translation.' });
  }
  if (!targetLanguage) {
    return res.status(400).json({ message: 'No target language provided for translation.' });
  }
  // No check for keysToExclude, as it can be empty


  try {
    setOllamaApiBaseUrl(ollamaApiUrl); // Set the dynamic Ollama API URL
    console.log(`Translating from ${sourceLanguage} to ${targetLanguage} with model: ${model} using Ollama API: ${ollamaApiUrl}`);
    const translatedData = await translateJson(jsonData, model, sourceLanguage, targetLanguage, keysToExclude); // Pass languages and keysToExclude
    res.status(200).json({ message: 'Translation successful!', data: translatedData });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ message: `Translation failed: ${error.message || 'An unknown error occurred.'}` });
  }
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Express Error:', err.stack);
  res.status(500).send('Something broke!');
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server listening at http://0.0.0.0:${port}`);
});

// Increase server timeout to 30 minutes to verify large file translations
server.setTimeout(1800000);