const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const rooms = {};

function broadcastRoom(roomId) {
  const room = rooms[roomId];
  if (room) io.to(roomId).emit('room-update', room);
}

function getRoom(socket) {
  const roomId = socket.data.currentRoomId;
  return roomId && rooms[roomId] ? rooms[roomId] : null;
}

function guardHost(socket, room, action) {
  if (socket.id !== room.hostId) {
    console.log(`${action} rejected (not host):`, socket.id);
    return false;
  }
  return true;
}

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, username }) => {
    if (!roomId || !username) return;

    socket.join(roomId);
    socket.data.currentRoomId = roomId;

    if (!rooms[roomId]) {

      rooms[roomId] = {
        roomId,
        hostId: socket.id,
        videoId: '',
        currentTime: 0,
        isPlaying: false,
        participants: [{ id: socket.id, username, role: 'host' }],
      };
      console.log('room created:', roomId);
    } else {
      rooms[roomId].participants.push({
        id: socket.id,
        username,
        role: 'participant',
      });
      console.log('user joined:', username, '→', roomId);
    }

    broadcastRoom(roomId);
  });

  socket.on('get-room', ({ roomId }) => {
    if (!roomId) return;
    socket.emit('room-update', rooms[roomId] ?? null);
  });

  socket.on('play', ({ time } = {}) => {
    const room = getRoom(socket);
    if (!room || !guardHost(socket, room, 'play')) return;

    if (typeof time === 'number' && Number.isFinite(time) && time >= 0) {
      room.currentTime = time;
    }
    room.isPlaying = true;
    console.log('play:', room.roomId, room.currentTime);
    io.to(room.roomId).emit('video-play', {
      videoId: room.videoId,
      currentTime: room.currentTime,
      isPlaying: room.isPlaying,
    });
  });

  socket.on('pause', ({ time } = {}) => {
    const room = getRoom(socket);
    if (!room || !guardHost(socket, room, 'pause')) return;

    if (typeof time === 'number' && Number.isFinite(time) && time >= 0) {
      room.currentTime = time;
    }
    room.isPlaying = false;
    console.log('pause:', room.roomId, room.currentTime);
    io.to(room.roomId).emit('video-pause', {
      videoId: room.videoId,
      currentTime: room.currentTime,
      isPlaying: room.isPlaying,
    });
  });

  socket.on('seek', ({ time }) => {
    const room = getRoom(socket);
    if (!room || !guardHost(socket, room, 'seek')) return;

    if (typeof time !== 'number' || !Number.isFinite(time) || time < 0) return;
    room.currentTime = time;
    console.log('seek:', room.roomId, room.currentTime);
    io.to(room.roomId).emit('video-seek', {
      videoId: room.videoId,
      currentTime: room.currentTime,
      isPlaying: room.isPlaying,
    });
  });

  

  socket.on('change-video', ({ videoId }) => {
    const room = getRoom(socket);
    if (!room || !guardHost(socket, room, 'change-video')) return;
    if (typeof videoId !== 'string') return;
    room.videoId = videoId;
    room.currentTime = 0;
    room.isPlaying = false;
    console.log('change-video:', room.roomId, videoId);
    io.to(room.roomId).emit('video-change', {
      videoId: room.videoId,
      currentTime: room.currentTime,
      isPlaying: room.isPlaying,
    });
  });

  socket.on('sync-request', () => {
    const room = getRoom(socket);
    if (!room) return;
    socket.emit('room-update', room);
  });


  socket.on('disconnect', () => {
    const roomId = socket.data.currentRoomId;
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    const participant = room.participants.find((p) => p.id === socket.id);
    room.participants = room.participants.filter((p) => p.id !== socket.id);

    console.log(
      'user left:',
      participant?.username ?? socket.id,
      '←',
      roomId
    );

    if (room.participants.length === 0) {
      delete rooms[roomId];
      return;
    }

    const wasHost = room.hostId === socket.id;
    if (wasHost) {
      room.hostId = room.participants[0].id;
      room.participants.forEach((p, i) => {
        p.role = i === 0 ? 'host' : 'participant';
      });
      console.log('host changed:', room.hostId, 'in', roomId);
    }

    broadcastRoom(roomId);
  });
});

httpServer.listen(5000, () => {
  console.log("PORT 5000 READY");
});
