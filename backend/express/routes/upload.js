const express = require('express');
const router = express.Router();
const multer = require('multer');
const { db } = require('../database');
const zlib = require('zlib');
const util = require('util');
const gunzip = util.promisify(zlib.gunzip);
const path = require('path');
const fs = require('fs');

// Add supported audio formats
const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',        // .mp3
  'audio/wav',         // .wav
  'audio/ogg',         // .ogg
  'audio/webm',        // .webm
  'audio/aac',         // .aac
  'audio/x-m4a'        // .m4a
];

// Create uploads directory if it doesn't exist
const uploadsDir = path.join('/app/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('/app/uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (SUPPORTED_AUDIO_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported audio format. Supported formats: mp3, wav, ogg, webm, aac, m4a'));
    }
  },
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit (assume ~ 1-3 hours of audio)
  }
});

router.post('/', async (req, res) => {
  const { transcript, audio, compressed } = req.body;

  if (!transcript || !audio) {
    return res.status(400).json({
      error: 'Both transcript and audio are required'
    });
  }

  try {
    // Decode base64 data
    const transcriptBuffer = Buffer.from(transcript, 'base64');
    const audioBuffer = Buffer.from(audio, 'base64');

    // Decompress if content is gzipped
    let transcriptData, audioData;
    if (compressed) {
      const unzippedTranscript = await gunzip(transcriptBuffer);
      transcriptData = JSON.parse(unzippedTranscript.toString('utf-8'));
      // audioData = await gunzip(audioBuffer);
      audioData = audioBuffer; // keep it gzipped
    } else {
      transcriptData = JSON.parse(transcriptBuffer.toString('utf-8'));
      audioData = audioBuffer;
    }

    // Insert into database
    const stmt = db.prepare(`INSERT INTO transcripts (transcript, audio) VALUES (?, ?)`);
    const result = stmt.run(JSON.stringify(transcriptData), audioData);

    // Return success response
    res.status(200).json({
      message: 'Files uploaded and processed successfully',
      id: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Processing error:', error);

    if (error instanceof SyntaxError) {
      return res.status(400).json({
        error: 'Invalid transcript JSON format'
      });
    }

    return res.status(400).json({
      error: 'Invalid file format or content'
    });
  }
});

router.post('/recording', upload.single('audio_file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  res.status(200).json({
    message: 'Audio file uploaded successfully'
  });
});

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  // Otherwise, pass the error to main error handler
  next();
});

module.exports = router;
