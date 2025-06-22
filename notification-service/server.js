const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });
});

app.post('/api/notify', (req, res) => {
  const { userId, articleId, comment } = req.body;
  io.to(userId).emit('newComment', { articleId, comment });
  res.send({ message: 'Notification sent' });
});

server.listen(3003, () => console.log('NotificationService running on port 3003'));