// const express = require('express');
// const socketIo = require('socket.io');
// const http = require('http');
// const cors = require('cors');
// const { v4: uuidV4 } = require('uuid');

// const app = express();
// app.use(cors());
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["*"],
//     credentials: true
//   }
// });

// // Room storage
// const rooms = {};

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // Create or join room
//   socket.on('join-room', (roomId, userId) => {
//     if (!rooms[roomId]) rooms[roomId] = { users: {} };
    
//     rooms[roomId].users[userId] = socket.id;
//     socket.join(roomId);
    
//     // Notify existing users
//     socket.to(roomId).emit('user-connected', userId);
    
//     // Send existing users to new user
//     const users = Object.keys(rooms[roomId].users);
//     socket.emit('existing-users', users.filter(id => id !== userId));
//   });

//   // WebRTC signaling
//   socket.on('signal', ({ to, from, signal }) => {
//     io.to(rooms[to.roomId].users[to.userId]).emit('signal', { from, signal });
//   });

//   // Handle disconnect
//   socket.on('disconnect', () => {
//     Object.keys(rooms).forEach(roomId => {
//       if (rooms[roomId].users) {
//         Object.keys(rooms[roomId].users).forEach(userId => {
//           if (rooms[roomId].users[userId] === socket.id) {
//             delete rooms[roomId].users[userId];
//             socket.to(roomId).emit('user-disconnected', userId);
//           }
//         });
//       }
//     });
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

















// const express = require('express');
// const socketIo = require('socket.io');
// const http = require('http');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// const server = http.createServer(app);

// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   connectionStateRecovery: {
//     maxDisconnectionDuration: 120000, // 2 minutes
//     skipMiddlewares: true
//   }
// });

// // Using Map for better performance in frequent additions/deletions
// const rooms = new Map(); // roomId -> Map(userId -> socketId)
// const userRooms = new Map(); // socketId -> Set(roomIds)

// // Heartbeat interval to clean up dead connections
// const HEARTBEAT_INTERVAL = 30000; // 30 seconds
// const heartbeat = setInterval(() => {
//   io.of('/').sockets.forEach(socket => {
//     if (socket.recovered) return;
    
//     socket.emit('ping', () => {
//       // Healthy connection
//     });
//   });
// }, HEARTBEAT_INTERVAL);

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);
//   userRooms.set(socket.id, new Set());

//   // Handle joining a room
//   socket.on('join-room', (roomId, userId, callback) => {
//     try {
//       // Validate input
//       if (!roomId || !userId) {
//         console.error('Invalid join-room parameters:', {roomId, userId});
//         callback?.({
//           success: false,
//           error: 'Room ID and User ID are required'
//         });
//         return;
//       }

//       // Initialize room if needed
//       if (!rooms.has(roomId)) {
//         rooms.set(roomId, new Map());
//         console.log(`New room created: ${roomId}`);
//       }

//       const room = rooms.get(roomId);
      
//       // Remove from previous rooms
//       const previousRooms = userRooms.get(socket.id);
//       previousRooms?.forEach(rId => {
//         if (rooms.has(rId)) {
//           rooms.get(rId).delete(userId);
//           socket.leave(rId);
//         }
//       });
//       previousRooms.clear();

//       // Check if user already exists in this room
//       if (room.has(userId)) {
//         console.log(`User ${userId} already in room ${roomId}`);
//         callback?.({
//           success: false,
//           error: 'User already in this room'
//         });
//         return;
//       }

//       // Add to new room
//       room.set(userId, socket.id);
//       previousRooms.add(roomId);
//       socket.join(roomId);

//       console.log(`User ${userId} joined room ${roomId}`);
      
//       // Notify others in room
//       socket.to(roomId).emit('user-connected', userId);
      
//       // Send existing users to new user
//       const users = Array.from(room.keys()).filter(id => id !== userId);
//       socket.emit('existing-users', users);

//       callback?.({
//         success: true,
//         roomId,
//         userId,
//         participants: users.length
//       });

//     } catch (error) {
//       console.error('Join-room error:', error);
//       callback?.({
//         success: false,
//         error: error.message
//       });
//     }
//   });

//   // Handle signaling between peers
//   socket.on('signal', ({ to, from, signal }, callback) => {
//     try {
//       // Validate signal data
//       if (!to?.roomId || !to?.userId || !from || !signal) {
//         console.error('Invalid signal data:', {to, from, signal});
//         callback?.({
//           success: false,
//           error: 'Invalid signal data'
//         });
//         return;
//       }

//       const room = rooms.get(to.roomId);
//       if (!room) {
//         console.error(`Room ${to.roomId} not found`);
//         callback?.({
//           success: false,
//           error: 'Room not found'
//         });
//         return;
//       }

//       const targetSocketId = room.get(to.userId);
//       if (!targetSocketId) {
//         console.error(`User ${to.userId} not found in room ${to.roomId}`);
//         callback?.({
//           success: false,
//           error: 'Target user not found'
//         });
//         return;
//       }

//       io.to(targetSocketId).emit('signal', { from, signal });
//       callback?.({ success: true });

//     } catch (error) {
//       console.error('Signal error:', error);
//       callback?.({
//         success: false,
//         error: error.message
//       });
//     }
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log(`User disconnected: ${socket.id}`);
//     const roomsForUser = userRooms.get(socket.id);
    
//     if (roomsForUser) {
//       roomsForUser.forEach(roomId => {
//         const room = rooms.get(roomId);
//         if (room) {
//           // Find and remove this user
//           for (const [userId, sockId] of room.entries()) {
//             if (sockId === socket.id) {
//               room.delete(userId);
//               io.to(roomId).emit('user-disconnected', userId);
//               console.log(`User ${userId} disconnected from room ${roomId}`);
              
//               // Cleanup empty rooms
//               if (room.size === 0) {
//                 rooms.delete(roomId);
//                 console.log(`Room ${roomId} cleaned up`);
//               }
//               break;
//             }
//           }
//         }
//       });
//       userRooms.delete(socket.id);
//     }
//   });

//   // Handle connection errors
//   socket.on('error', (error) => {
//     console.error(`Socket error (${socket.id}):`, error);
//   });

//   // Heartbeat response
//   socket.on('pong', () => {
//     // Connection is healthy
//   });
// });

// // Clean up on server shutdown
// process.on('SIGTERM', () => {
//   clearInterval(heartbeat);
//   server.close();
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = { server, io }; // For testing







// const express = require('express');
// const socketIo = require('socket.io');
// const http = require('http');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// const server = http.createServer(app);

// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   connectionStateRecovery: {
//     maxDisconnectionDuration: 30000,
//     skipMiddlewares: true
//   }
// });

// // Enhanced room management
// const rooms = new Map(); // roomId -> { users: Map(userId->socketId), createdAt }
// const socketRooms = new Map(); // socketId -> Set(roomIds)

// // Connection heartbeat
// const HEARTBEAT_INTERVAL = 15000;
// const heartbeat = setInterval(checkConnections, HEARTBEAT_INTERVAL);

// function checkConnections() {
//   const now = Date.now();
//   rooms.forEach((room, roomId) => {
//     room.users.forEach((socketId, userId) => {
//       if (!io.sockets.sockets.has(socketId)) {
//         room.users.delete(userId);
//         io.to(roomId).emit('user-disconnected', userId);
//         console.log(`Cleaned up stale user ${userId} in room ${roomId}`);
//       }
//     });
    
//     if (room.users.size === 0 && (now - room.createdAt > 60000)) {
//       rooms.delete(roomId);
//       console.log(`Cleaned up empty room ${roomId}`);
//     }
//   });
// }

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);
//   socketRooms.set(socket.id, new Set());

//   // Enhanced join-room with validation
//   socket.on('join-room', (roomId, userId, callback) => {
//     try {
//       if (!roomId || !userId) {
//         throw new Error('Room ID and User ID are required');
//       }

//       // Cleanup previous rooms
//       const previousRooms = socketRooms.get(socket.id);
//       previousRooms.forEach(rId => leaveRoom(socket, rId, userId));
//       previousRooms.clear();

//       // Initialize new room
//       if (!rooms.has(roomId)) {
//         rooms.set(roomId, {
//           users: new Map(),
//           createdAt: Date.now()
//         });
//         console.log(`New room created: ${roomId}`);
//       }

//       const room = rooms.get(roomId);

//       // Check for duplicate user
//       if (room.users.has(userId)) {
//         throw new Error('User already exists in this room');
//       }

//       // Join new room
//       room.users.set(userId, socket.id);
//       previousRooms.add(roomId);
//       socket.join(roomId);

//       console.log(`User ${userId} joined room ${roomId}`);
      
//       // Notify others
//       socket.to(roomId).emit('user-connected', userId);
      
//       // Send existing users
//       const users = Array.from(room.users.keys()).filter(id => id !== userId);
//       socket.emit('existing-users', users);

//       callback?.({
//         success: true,
//         roomId,
//         userId,
//         participants: room.users.size
//       });

//     } catch (error) {
//       console.error('Join-room error:', error.message);
//       callback?.({
//         success: false,
//         error: error.message
//       });
//     }
//   });

//   // Robust signaling
//   socket.on('signal', ({ to, from, signal }, callback) => {
//     try {
//       if (!to?.roomId || !to?.userId || !from || !signal) {
//         throw new Error('Invalid signaling data');
//       }

//       const room = rooms.get(to.roomId);
//       if (!room) throw new Error('Room not found');

//       const targetSocketId = room.users.get(to.userId);
//       if (!targetSocketId) throw new Error('Target user not found');

//       io.to(targetSocketId).emit('signal', { from, signal });
//       callback?.({ success: true });

//     } catch (error) {
//       console.error('Signal error:', error.message);
//       callback?.({ success: false, error: error.message });
//     }
//   });

//   // Proper disconnection handling
//   socket.on('disconnect', () => {
//     console.log(`User disconnected: ${socket.id}`);
//     const userRooms = socketRooms.get(socket.id);
//     if (userRooms) {
//       userRooms.forEach(roomId => leaveRoom(socket, roomId));
//       socketRooms.delete(socket.id);
//     }
//   });

//   // Heartbeat response
//   socket.on('pong', () => {
//     // Connection is healthy
//   });
// });

// function leaveRoom(socket, roomId, userId) {
//   const room = rooms.get(roomId);
//   if (!room) return;

//   // Find user by socket ID if userId not provided
//   if (!userId) {
//     for (const [uid, sid] of room.users.entries()) {
//       if (sid === socket.id) {
//         userId = uid;
//         break;
//       }
//     }
//   }

//   if (userId && room.users.has(userId)) {
//     room.users.delete(userId);
//     io.to(roomId).emit('user-disconnected', userId);
//     console.log(`User ${userId} left room ${roomId}`);

//     // Cleanup empty rooms after 1 minute
//     if (room.users.size === 0) {
//       setTimeout(() => {
//         if (rooms.get(roomId)?.users.size === 0) {
//           rooms.delete(roomId);
//           console.log(`Room ${roomId} cleaned up`);
//         }
//       }, 60000);
//     }
//   }
//   socket.leave(roomId);
// }

// // Clean shutdown
// process.on('SIGTERM', () => {
//   clearInterval(heartbeat);
//   server.close(() => {
//     console.log('Server gracefully terminated');
//     process.exit(0);
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });








const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 30000,
    skipMiddlewares: true
  }
});

const rooms = new Map(); // roomId -> { users: Map(userId->socketId), createdAt }
const socketToUser = new Map(); // socketId -> { userId, roomId }

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomId) => {
    // Remove disconnected users
    Array.from(room.users.entries()).forEach(([userId, socketId]) => {
      if (!io.sockets.sockets.has(socketId)) {
        room.users.delete(userId);
        socketToUser.delete(socketId);
        io.to(roomId).emit('user-disconnected', userId);
        console.log(`Cleaned up disconnected user ${userId} from room ${roomId}`);
      }
    });

    // Cleanup empty rooms after 5 minutes
    if (room.users.size === 0 && (now - room.createdAt > 300000)) {
      rooms.delete(roomId);
      console.log(`Cleaned up empty room ${roomId}`);
    }
  });
}, 30000); // Run every 30 seconds

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('join-room', (roomId, userId, callback) => {
    try {
      if (!roomId || !userId) {
        throw new Error('Missing roomId or userId');
      }

      // Leave any previous room
      if (socketToUser.has(socket.id)) {
        const prevData = socketToUser.get(socket.id);
        leaveRoom(socket, prevData.roomId, prevData.userId);
      }

      // Create room if doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          users: new Map(),
          createdAt: Date.now()
        });
        console.log(`Created new room ${roomId}`);
      }

      const room = rooms.get(roomId);

      // Add user to room
      room.users.set(userId, socket.id);
      socketToUser.set(socket.id, { userId, roomId });
      socket.join(roomId);

      console.log(`User ${userId} joined room ${roomId}`);

      // Notify others in room
      socket.to(roomId).emit('user-connected', userId);

      // Send existing users to new user
      const otherUsers = Array.from(room.users.keys()).filter(id => id !== userId);
      socket.emit('existing-users', otherUsers);

      callback({
        success: true,
        participants: room.users.size
      });
    } catch (error) {
      console.error('Join-room error:', error.message);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  socket.on('signal', ({ to, from, signal }, callback) => {
    try {
      if (!to?.roomId || !to?.userId || !from || !signal) {
        throw new Error('Invalid signaling data');
      }

      const room = rooms.get(to.roomId);
      if (!room) throw new Error('Room not found');

      const targetSocketId = room.users.get(to.userId);
      if (!targetSocketId) throw new Error('User not found in room');

      io.to(targetSocketId).emit('signal', { from, signal });
      callback({ success: true });
    } catch (error) {
      console.error('Signal error:', error.message);
      callback({ success: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    if (socketToUser.has(socket.id)) {
      const { userId, roomId } = socketToUser.get(socket.id);
      leaveRoom(socket, roomId, userId);
    }
    console.log(`Disconnected: ${socket.id}`);
  });

  socket.on('ping', (callback) => callback());
});

function leaveRoom(socket, roomId, userId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.users.delete(userId);
  socketToUser.delete(socket.id);
  socket.leave(roomId);

  io.to(roomId).emit('user-disconnected', userId);
  console.log(`User ${userId} left room ${roomId}`);

  // Schedule room cleanup if empty
  if (room.users.size === 0) {
    setTimeout(() => {
      if (rooms.get(roomId)?.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} cleaned up`);
      }
    }, 300000); // 5 minute delay
  }
}

process.on('SIGTERM', () => {
  clearInterval(cleanupInterval);
  server.close();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});