const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const redis = new Redis(); // Make sure Redis is running locally (localhost:6379)

// Serve the HTML UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redis Real-Time Notifications</title>
  <style>
    body { font-family: sans-serif; margin: 40px; background: #f5f6fa; color: #333; }
    h1 { color: #2f3640; }
    input, button { padding: 8px; margin: 5px; }
    #log { margin-top: 20px; padding: 10px; background: #fff; border: 1px solid #ccc; height: 250px; overflow-y: scroll; }
    .msg { border-bottom: 1px solid #eee; padding: 4px 0; }
  </style>
</head>
<body>
  <h1>📢 Redis Real-Time Notifications Demo</h1>

  <div>
    <label>User ID:</label>
    <input id="userId" placeholder="e.g. 1" />
    <button onclick="connectSocket()">Connect</button>
  </div>

  <div>
    <h3>Send Notification</h3>
    <input id="targetId" placeholder="Target user ID" />
    <input id="message" placeholder="Message text" />
    <button onclick="sendNotif()">Send</button>
  </div>

  <h3>Incoming Notifications:</h3>
  <div id="log"></div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    let socket;

    function connectSocket() {
      const userId = document.getElementById('userId').value.trim();
      if (!userId) return alert('Enter user ID');

      socket = io('/', { query: { userId } });

      socket.on('connect', () => {
        logMsg('✅ Connected as user ' + userId);
      });

      socket.on('notification', (data) => {
        logMsg('🔔 ' + data.message);
      });

      socket.on('disconnect', () => {
        logMsg('❌ Disconnected');
      });
    }

    async function sendNotif() {
      const targetId = document.getElementById('targetId').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!targetId || !message) return alert('Fill all fields');

      await fetch('/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: targetId, message })
      });
      logMsg('📤 Sent message to user ' + targetId);
    }

    function logMsg(text) {
      const div = document.createElement('div');
      div.className = 'msg';
      div.textContent = text;
      document.getElementById('log').appendChild(div);
    }
  </script>
</body>
</html>
  `);
});

app.use(express.json());

// Store who is online (userId → socketId)
const onlineUsers = new Map();

// Socket.IO handling
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) {
    socket.disconnect();
    return;
  }

  onlineUsers.set(userId, socket.id);
  console.log(`User ${userId} connected`);

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    console.log(`User ${userId} disconnected`);
  });
});

// Simple /notify endpoint to trigger notifications
app.post('/notify', async (req, res) => {
  const { targetUserId, message } = req.body;
  if (!targetUserId || !message) return res.status(400).send('Missing fields');

  const payload = { userId: targetUserId, message, createdAt: Date.now() };

  // Save to Redis (for history)
  await redis.lpush(`user:${targetUserId}:notifications`, JSON.stringify(payload));
  await redis.ltrim(`user:${targetUserId}:notifications`, 0, 49); // keep last 50

  // Publish to Redis channel
  await redis.publish('notifications', JSON.stringify(payload));

  res.json({ status: 'queued' });
});

// Redis subscriber to forward events
const sub = new Redis();
sub.subscribe('notifications');
sub.on('message', (channel, msg) => {
  const notif = JSON.parse(msg);
  const socketId = onlineUsers.get(notif.userId);
  if (socketId) {
    io.to(socketId).emit('notification', notif);
  }
});

// Start server
server.listen(3001, () => {
  console.log('✅ Server running at http://localhost:3001');
});
