const express = require('express');
const router = express.Router();
const { db } = require('../database');
const zlib = require('zlib');

router.get('/all', async (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT id, name, description, created_at 
      FROM transcripts 
      ORDER BY created_at DESC
    `);
    const result = stmt.all();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching all transcripts:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

router.get('/transcription/:id', async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      error: 'ID is required'
    });
  }

  try {
    const stmt = db.prepare('SELECT transcript, name, description FROM transcripts WHERE id = ?');
    const result = stmt.get(id);
    return res.status(200).json({
      transcript: JSON.parse(result.transcript),
      name: result.name,
      description: result.description
    });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

router.get('/transcription/:id/audio', async (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare('SELECT audio FROM transcripts WHERE id = ?');
    const result = stmt.get(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Transcript not found' });
    }

    // Decode base64 and decompress
    const compressedBuffer = Buffer.from(result.audio, 'base64');
    const audioBuffer = zlib.gunzipSync(compressedBuffer);

    // Set headers for file download
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="transcript-${id}.mp3"`);
    res.setHeader('Content-Length', audioBuffer.length);

    // Send the file
    res.send(audioBuffer);
  } catch (error) {
    console.error('Error downloading audio:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/transcription/:id/transcript', async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      error: 'ID is required'
    });
  }

  try {
    const stmt = db.prepare('SELECT transcript FROM transcripts WHERE id = ?');
    const result = stmt.get(id);
    return res.status(200).json(JSON.parse(result.transcript));
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

router.patch('/transcription/:id/name', async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  if (!id || !name) {
    return res.status(400).json({
      error: 'ID and name are required'
    });
  }

  try {
    const stmt = db.prepare('UPDATE transcripts SET name = ? WHERE id = ?');
    const result = stmt.run(name, id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating name:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/transcription/:id/description', async (req, res) => {
  const id = req.params.id;
  const description = req.body.description;

  if (!id || !description) {
    return res.status(400).json({
      error: 'ID and description are required'
    });
  }

  try {
    const stmt = db.prepare('UPDATE transcripts SET description = ? WHERE id = ?');
    const result = stmt.run(description, id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating description:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/transcription/:id', async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      error: 'ID is required'
    });
  }

  try {
    const stmt = db.prepare('DELETE FROM transcripts WHERE id = ?');
    const result = stmt.run(id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting transcription:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/transcription/:id/speakers', async (req, res) => {
  const id = req.params.id;
  const {oldSpeaker, newSpeaker} = req.body;

  if (!id || !oldSpeaker || !newSpeaker) {
    return res.status(400).json({
      error: 'ID, oldSpeaker, and newSpeaker are required'
    });
  }

  try {
    const transcript = await db.prepare('SELECT transcript FROM transcripts WHERE id = ?').get(id);
    const transcriptReplaced = transcript.transcript.replaceAll(oldSpeaker, newSpeaker);
    const stmt = db.prepare('UPDATE transcripts SET transcript = ? WHERE id = ?');
    const result = stmt.run(transcriptReplaced, id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating speakers:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

