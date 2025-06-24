const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, 'user-service-secret');
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.on('join', (userId) => {
    if (userId === socket.userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    } else {
      socket.emit('error', { message: 'Unauthorized room access' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });

  socket.on('error', (err) => {
    console.error(`Socket error for user ${socket.userId}: ${err.message}`);
  });
});

app.post('/api/notify', async (req, res) => {
  try {
    const { userId, articleId, comment } = req.body;
    if (!userId || !articleId || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    io.to(userId).emit('newComment', { articleId, comment });
    console.log(`Notification sent to user ${userId} for article ${articleId}`);
    res.json({ message: 'Notification sent' });
  } catch (err) {
    console.error(`Error in /api/notify: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use((err, req, res, next) => {
  console.error(`Express error: ${err.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

server.listen(3003, () => {
  console.log('NotificationService running on port 3003');
});