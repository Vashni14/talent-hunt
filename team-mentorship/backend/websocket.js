// server/websocket.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5001 }); // Changed to port 5000 to match frontend
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'register') {
        // Register user with their WebSocket connection
        if (data.userId) {
          clients.set(data.userId, ws);
          console.log(`User ${data.userId} registered`);
          
          // Send confirmation back to client
          ws.send(JSON.stringify({
            type: 'connection_status',
            status: 'connected',
            message: 'Successfully registered with WebSocket server'
          }));
        }
      } else if (data.type === 'chat') {
        // Validate chat message structure
        if (!data.from || !data.to || !data.text) {
          console.warn('Invalid chat message format:', data);
          return;
        }

        // Route message to recipient
        const recipientWs = clients.get(data.to);
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify(data));
        } else {
          console.warn(`Recipient ${data.to} not found or not connected`);
        }

        // Also send back to sender for their own UI
        const senderWs = clients.get(data.from);
        if (senderWs && senderWs !== recipientWs && senderWs.readyState === WebSocket.OPEN) {
          senderWs.send(JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    }
  });

  ws.on('close', () => {
    // Remove client from map when they disconnect
    for (let [userId, clientWs] of clients.entries()) {
      if (clientWs === ws) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server running on ws://localhost:5001');