const Database = require('better-sqlite3');
const db = new Database('transcripts.db');

function init() {

    // Create transcripts table
    db.exec(`
        CREATE TABLE IF NOT EXISTS transcripts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            name TEXT NOT NULL DEFAULT 'Untitled',
            description TEXT NOT NULL DEFAULT (strftime('%m/%d/%Y %H:%M:%S', 'now')),
            transcript JSON NOT NULL,
            audio BLOB NOT NULL
        )
    `);

    // Settings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            value TEXT NOT NULL
        )
    `);

    // Insert default settings
    db.exec(`
        INSERT INTO settings (key, value) VALUES 
            ('provider', 'openai'),
            ('model', 'gpt-4o-mini')
    `);

    // Create content table
    db.exec(`
        CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transcript_id INTEGER NOT NULL,
            content_type TEXT NOT NULL,
            content_response JSON NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transcript_id) REFERENCES transcripts(id)
        )
    `);
}

module.exports = {
    init,
    db
};
