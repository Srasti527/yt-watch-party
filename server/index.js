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

function canControl(room, socket) {
  const user = room.participants.find((p) => p.id === socket.id);
  return user && (user.role === 'host' || user.role === 'moderator');
}

function getCurrentRoomTime(room) {
  if (room.isPlaying && room.lastPlayTimestamp) {
    const elapsed = (Date.now() - room.lastPlayTimestamp) / 1000;
    return room.currentTime + elapsed;
  }
  return room.currentTime;
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
        lastPlayTimestamp: null,
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
    const room = rooms[roomId];
    if (!room) {
      socket.emit('room-update', null);
      return;
    }
    socket.emit('room-update', { ...room, currentTime: getCurrentRoomTime(room) });
  });

  socket.on('assign-role', ({ userId, role }) => {
    const room = getRoom(socket);
    if (!room || !guardHost(socket, room, 'assign-role')) return;
    if (!userId || !['host', 'moderator', 'participant'].includes(role)) return;

    const user = room.participants.find((p) => p.id === userId);
    if (!user) return;
    user.role = role;

    io.to(room.roomId).emit('role-assigned', {
      userId,
      role,
      participants: room.participants,
    });
  });

  socket.on('remove-participant', ({ userId }) => {
    const room = getRoom(socket);
    if (!room) return;
    if (socket.id !== room.hostId) return;

    room.participants = room.participants.filter((p) => p.id !== userId);

    io.to(userId).emit('kicked');
    io.to(room.roomId).emit('participant-removed', {
      userId,
      participants: room.participants,
    });
  });

  socket.on('play', ({ time } = {}) => {
    const room = getRoom(socket);
    if (!room) return;
    if (!canControl(room, socket)) {
      console.log('blocked: no permission');
      return;
    }

    if (typeof time === 'number' && Number.isFinite(time) && time >= 0) {
      room.currentTime = time;
    }
    room.isPlaying = true;
    room.lastPlayTimestamp = Date.now();
    console.log('play:', room.roomId, room.currentTime);
    broadcastRoom(room.roomId);
  });

  socket.on('pause', ({ time } = {}) => {
    const room = getRoom(socket);
    if (!room) return;
    if (!canControl(room, socket)) {
      console.log('blocked: no permission');
      return;
    }

    if (room.isPlaying && room.lastPlayTimestamp) {
      room.currentTime += (Date.now() - room.lastPlayTimestamp) / 1000;
    } else if (typeof time === 'number' && Number.isFinite(time) && time >= 0) {
      room.currentTime = time;
    }
    room.isPlaying = false;
    room.lastPlayTimestamp = null;
    console.log('pause:', room.roomId, room.currentTime);
    broadcastRoom(room.roomId);
  });

  socket.on('seek', ({ time }) => {
    const room = getRoom(socket);
    if (!room) return;
    if (!canControl(room, socket)) {
      console.log('blocked: no permission');
      return;
    }

    if (typeof time !== 'number' || !Number.isFinite(time) || time < 0) return;
    room.currentTime = time;
    room.lastPlayTimestamp = Date.now();
    console.log('seek:', room.roomId, room.currentTime);
    broadcastRoom(room.roomId);
  });

  

  socket.on('change-video', ({ videoId }) => {
    const room = getRoom(socket);
    if (!room) return;
    if (!canControl(room, socket)) {
      console.log('blocked: no permission');
      return;
    }
    if (typeof videoId !== 'string') return;
    const nextVideoId = videoId.trim();
    if (!nextVideoId) return;
    room.videoId = nextVideoId;
    room.currentTime = 0;
    room.isPlaying = false;
    room.lastPlayTimestamp = null;
    console.log('change-video:', room.roomId, videoId);
    broadcastRoom(room.roomId);
  });

  socket.on('sync-request', () => {
    const room = getRoom(socket);
    if (!room) return;
    let actualTime = room.currentTime;

    if (room.isPlaying && room.lastPlayTimestamp) {
      const elapsed = (Date.now() - room.lastPlayTimestamp) / 1000;
      actualTime += elapsed;
    }

    socket.emit('room-update', {
      ...room,
      currentTime: actualTime,
    });
  });

  socket.on('transfer-host', ({ userId }) => {
    const room = getRoom(socket);
    if (!room) return;
    if (socket.id !== room.hostId) return;

    const target = room.participants.find((p) => p.id === userId);
    if (!target) return;

    room.hostId = userId;
    room.participants.forEach((p) => {
      if (p.id === userId) p.role = 'host';
      else if (p.role === 'host') p.role = 'participant';
    });

    io.to(room.roomId).emit('host-transferred', {
      hostId: userId,
      participants: room.participants,
    });
  });

  socket.on('send-message', ({ message }) => {
    const room = getRoom(socket);
    if (!room) return;
    if (typeof message !== 'string' || !message.trim()) return;

    const user = room.participants.find((p) => p.id === socket.id);
    if (!user) return;

    io.to(room.roomId).emit('new-message', {
      username: user.username,
      message: message.trim(),
      time: Date.now(),
    });
  });

  socket.on('send-reaction', ({ emoji }) => {
    const room = getRoom(socket);
    if (!room) return;
    if (typeof emoji !== 'string' || !emoji.trim()) return;

    io.to(room.roomId).emit('new-reaction', { emoji });
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
        p.role = i === 0 ? 'host' : p.role === 'moderator' ? 'moderator' : 'participant';
      });
      console.log('host changed:', room.hostId, 'in', roomId);
    }

    broadcastRoom(roomId);
  });
});

httpServer.listen(5000, () => {
  console.log("PORT 5000 READY");
});
