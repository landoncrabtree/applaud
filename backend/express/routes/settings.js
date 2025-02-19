const express = require('express');
const router = express.Router();
const { db } = require('../database');

router.patch('/update', async (req, res) => {
  const settings = req.body;
  
  if (!Array.isArray(settings)) {
    return res.status(400).json({
      error: 'Settings must be an array of key-value pairs'
    });
  }

  try {
    const stmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
    
    // Use a transaction to update all settings
    const updateSettings = db.transaction((settings) => {
      for (const { key, value } of settings) {
        if (!key || value === undefined) continue;
        stmt.run(value, key);
      }
    });

    updateSettings(settings);
    
    return res.status(200).json({
      message: 'Settings updated'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});


module.exports = router;
