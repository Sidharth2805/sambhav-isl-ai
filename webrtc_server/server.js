const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 8080);
const wss = new WebSocketServer({ port: PORT });

// roomId -> Set<WebSocket>
const rooms = new Map();

function send(ws, message) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(message));
  }
}

function leaveRoom(ws) {
  const roomId = ws.roomId;
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (room) {
    room.delete(ws);

    for (const peer of room) {
      send(peer, { type: "peer-left" });
    }

    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }

  ws.roomId = null;
  ws.role = null;
}

wss.on("connection", (ws) => {
  ws.roomId = null;
  ws.role = null;

  ws.on("message", (raw) => {
    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    // -----------------------------
    // JOIN ROOM
    // -----------------------------
    if (message.type === "join") {
      const roomId = String(message.roomId || "").trim();
      const role = message.role === "deaf" ? "deaf" : "normal";

      if (!roomId) {
        send(ws, { type: "error", error: "Room name is required." });
        return;
      }

      let room = rooms.get(roomId);

      if (!room) {
        room = new Set();
        rooms.set(roomId, room);
      }

      if (room.size >= 2) {
        send(ws, { type: "room-full" });
        return;
      }

      ws.roomId = roomId;
      ws.role = role;

      const initiator = room.size === 0;
      room.add(ws);

      send(ws, {
        type: "joined",
        roomId,
        role,
        initiator,
        peerCount: room.size,
      });

      if (room.size === 2) {
        for (const peer of room) {
          if (peer !== ws) {
            send(peer, {
              type: "peer-joined",
              initiator: true,
              role,
            });
          } else {
            send(peer, {
              type: "peer-joined",
              initiator: false,
              role,
            });
          }
        }
      }

      return;
    }

    // -----------------------------
    // LEAVE ROOM
    // -----------------------------
    if (message.type === "leave") {
      leaveRoom(ws);
      return;
    }

    if (!ws.roomId) return;

    const room = rooms.get(ws.roomId);
    if (!room) return;

    // -----------------------------
    // WEBRTC SIGNALING
    // -----------------------------
    if (message.type === "signal") {
      for (const peer of room) {
        if (peer !== ws) {
          send(peer, {
            type: "signal",
            data: message.data,
          });
        }
      }
      return;
    }

    // -----------------------------
    // APPLICATION MESSAGES
    // Text/speech input and model
    // result both use the same room.
    // -----------------------------
    if (message.type === "app-message") {
      for (const peer of room) {
        if (peer !== ws) {
          send(peer, {
            type: "app-message",
            fromRole: ws.role,
            payload: message.payload || {},
          });
        }
      }
    }
  });

  ws.on("close", () => {
    leaveRoom(ws);
  });

  ws.on("error", () => {
    leaveRoom(ws);
  });
});

console.log(`Sambhav WebRTC signaling server running on ws://localhost:${PORT}`);
