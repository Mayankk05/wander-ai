import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import prisma from './prisma.js';
import { checkTripAccess } from './checkTripAccess.js';
import { recalculateItinerary } from './math.js';
import appLogger from './logger.js';

const tripUpdateQueues = new Map();

const presenceMap = new Map();
const socketToTripMap = new Map();
const editDebounceMap = new Map();

function getCurrentUsersInRoom(tripId) {
  return presenceMap.get(tripId) || [];
}

function addUserToRoom(tripId, socketId, userInfo) {
  const current = getCurrentUsersInRoom(tripId);
  const exists = current.find(u => u.socketId === socketId);
  if (!exists) {
    presenceMap.set(tripId, [...current, { ...userInfo, socketId }]);
    socketToTripMap.set(socketId, tripId);
  }
}

function removeUserFromRoom(socketId) {
  const tripId = socketToTripMap.get(socketId);
  if (!tripId) return [];

  const current = getCurrentUsersInRoom(tripId);
  const filtered = current.filter(u => u.socketId !== socketId);
  
  if (filtered.length === 0) {
    presenceMap.delete(tripId);
  } else {
    presenceMap.set(tripId, filtered);
  }
  
  socketToTripMap.delete(socketId);
  return [tripId];
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.accessToken;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid session'));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:trip", async ({ tripId }) => {
      const userId = socket.userId;
      const userName = "Collaborator";
      try {
        const access = await checkTripAccess(tripId, userId);
        if (!access.authorized) {
          return socket.emit("trip:error", { message: "Unauthorized to join this trip" });
        }

        socket.userId = userId;
        socket.join("trip:" + tripId);
        addUserToRoom(tripId, socket.id, { userId, userName });
        
        socket.to("trip:" + tripId).emit("presence:update", {
          users: getCurrentUsersInRoom(tripId)
        });
        
        socket.emit("presence:current", {
          users: getCurrentUsersInRoom(tripId)
        });
      } catch (err) {
        appLogger.error({ err, tripId }, "Socket join failed");
      }
    });
    
    socket.on("trip:update", async ({ tripId, change }) => {
      const userId = socket.userId;
      const debounceKey = `${tripId}:${userId}:${change.field || change.type}`;
      if (editDebounceMap.has(debounceKey)) {
        clearTimeout(editDebounceMap.get(debounceKey));
      }
      
      const timeout = setTimeout(async () => {
        const currentQueue = tripUpdateQueues.get(tripId) || Promise.resolve();
        
        const nextInQueue = currentQueue.then(async () => {
          try {
            const updatedTrip = await prisma.$transaction(async (tx) => {
              const trip = await tx.trip.findUnique({
                where: { id: tripId },
                include: { collaborators: true }
              });

              if (!trip) throw new Error("Trip not found");

              const isOwner = trip.userId === userId;
              const isCollaborator = trip.collaborators?.some(c => c.userId === userId);
              if (!isOwner && !isCollaborator) throw new Error("Unauthorized");

              let it = trip.itinerary || { days: [] };
              
              if (change.type === "day" && Array.isArray(it.days) && it.days[change.dayIndex]) {
                 it.days[change.dayIndex][change.field] = change.value;
              } else if (change.type === "reorder" && Array.isArray(it.days)) {
                 const [removed] = it.days.splice(change.sourceIndex, 1);
                 it.days.splice(change.destinationIndex, 0, removed);
                 it.days = it.days.map((d, i) => ({ ...d, day: i + 1 }));
              }

              const newItinerary = recalculateItinerary(it);
              const newOverBudget = newItinerary.totalCost > trip.budget;
              
              return tx.trip.update({
                 where: { id: tripId },
                 data: { 
                   itinerary: newItinerary, 
                   overBudget: newOverBudget,
                   updatedAt: new Date()
                 }
              });
            });

            io.to("trip:" + tripId).emit("trip:updated", {
              dayIndex: change.dayIndex,
              field: change.field,
              value: change.value,
              change: change,
              updatedBy: userId,
              timestamp: change.timestamp || Date.now()
            });
          } catch(e) {
            socket.emit("trip:error", { message: e.message === "Unauthorized" ? "Access denied" : "Update failed" });
          }
        });

        tripUpdateQueues.set(tripId, nextInQueue);
        
        nextInQueue.finally(() => {
           if (tripUpdateQueues.get(tripId) === nextInQueue) {
             tripUpdateQueues.delete(tripId);
           }
        });

        editDebounceMap.delete(debounceKey);
      }, 500);

      editDebounceMap.set(debounceKey, timeout);
    });

    socket.on("trip:typing", async ({ tripId, field }) => {
      const userId = socket.userId;
      const userName = "Collaborator"; 
      // Verify user is in trip room
      const tripIdInMap = socketToTripMap.get(socket.id);
      if (tripIdInMap !== tripId) {
        console.warn(`[Socket] Unauthorized typing attempt from ${socket.id} for trip ${tripId}`);
        return;
      }

      socket.to("trip:" + tripId).emit("trip:typing", {
        userId, userName, field
      });
    });

    socket.on("leave:trip", ({ tripId }) => {
      socket.leave("trip:" + tripId);
      const rooms = removeUserFromRoom(socket.id);
      for (const tid of rooms) {
        io.to("trip:" + tid).emit("presence:update", {
          users: getCurrentUsersInRoom(tid)
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        for (const [key, timeoutId] of editDebounceMap.entries()) {
          if (key.includes(`:${socket.userId}:`)) {
            clearTimeout(timeoutId);
            editDebounceMap.delete(key);
          }
        }
      }

      const rooms = removeUserFromRoom(socket.id);
      for (const tripId of rooms) {
        io.to("trip:" + tripId).emit("presence:update", {
          users: getCurrentUsersInRoom(tripId)
        });
      }
    });
  });

  // Cleanup stale rooms every 30 minutes
  const CLEANUP_INTERVAL = 30 * 60 * 1000;
  setInterval(() => {
    const activeSocketIds = new Set(io.sockets.sockets.keys());
    
    for (const [tripId, users] of presenceMap.entries()) {
      const filteredUsers = users.filter(u => activeSocketIds.has(u.socketId));
      if (filteredUsers.length === 0) {
        presenceMap.delete(tripId);
        appLogger.info({ tripId }, "[Socket] Pruned empty stale presence room");
      } else if (filteredUsers.length !== users.length) {
        presenceMap.set(tripId, filteredUsers);
        // Sync the room with the corrected count
        io.to("trip:" + tripId).emit("presence:update", { users: filteredUsers });
        appLogger.info({ tripId, removed: users.length - filteredUsers.length }, "[Socket] Pruned shadow users from room");
      }
    }
  }, CLEANUP_INTERVAL);

  return io;
}
