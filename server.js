const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Ensure uploads folder exists for mock TTS files
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));
// Serve generated/mock TTS files
app.use('/tts', express.static(uploadsDir));

// Mock translation endpoint
app.post('/api/translate', upload.single('audio'), async (req, res) => {
  try {
    const source = req.body.sourceLang || 'auto';
    const target = req.body.targetLang || 'en';
    const audio = req.file; // buffer

    // Simulate processing time
    await new Promise(r => setTimeout(r, 1200));

    // Create mock transcribed text and translated text
    const transcribedText = `Mock transcription: [speech detected]`;
    const translatedText = `Mock translation (${target}): This is a simulated translated text.`;

    // Save the uploaded audio as a mock TTS file to play back (in a real app, this would be synthesized)
    let ttsUrl = null;
    if (audio && audio.buffer) {
      const fileName = `tts-${Date.now()}-${Math.random().toString(36).slice(2,8)}.wav`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, audio.buffer);
      ttsUrl = `/tts/${fileName}`;
    }

    // Return JSON
    res.json({ ok: true, translatedText, transcribedText, ttsUrl });
  } catch (err) {
    console.error('Translate error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Simple mock text translation endpoint
app.post('/api/translate-text', express.json(), async (req, res) => {
  try {
    const { sourceLang = 'auto', targetLang = 'en', text = '' } = req.body || {};
    // simulate processing
    await new Promise(r => setTimeout(r, 700));
    // mock translated text
    const translatedText = `Mock text translation (${targetLang}): ${text ? text : '[no input]'} `;
    res.json({ ok: true, translatedText });
  } catch (err) {
    console.error('Translate-text error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mock server running on http://localhost:${PORT}`));
