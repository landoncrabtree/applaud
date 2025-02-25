const WebSocket = require('ws');
const { db } = require('./database');

// Create WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Store active connections with their initial counts
const clients = new Map();

// Handle WebSocket connection
wss.on('connection', (ws) => {
  // Get initial count
  const stmt = db.prepare('SELECT COUNT(*) as count FROM transcripts');
  const initialCount = stmt.get().count;
  clients.set(ws, initialCount);

  // Start polling for this client
  const pollInterval = setInterval(() => {
    const currentCount = stmt.get().count;
    if (currentCount > clients.get(ws)) {
      ws.send(JSON.stringify({ status: 'complete' }));
      clearInterval(pollInterval);
      clients.delete(ws);
      ws.close();
    }
  }, 2000); // Poll every 2 seconds

  ws.on('close', () => {
    clearInterval(pollInterval);
    clients.delete(ws);
  });
});

// WebSocket attachment handler
const attachWebSocket = (server) => {
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws);
    });
  });
};

module.exports = { attachWebSocket }; 