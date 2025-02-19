const express = require('express');
const router = express.Router();
const { db } = require('../database');
const zlib = require('zlib');
const util = require('util');
const gunzip = util.promisify(zlib.gunzip);

router.post('/', async (req, res) => {
  try {
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

  } catch (error) {
    console.error('Upload error:', error);

    return res.status(500).json({
      error: 'Internal server error during upload'
    });
  }
});

module.exports = router;
