import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });

let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);

  ws.on("message", (message) => {
    clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
  });
});

console.log("🚀 Server running on ws://0.0.0.0:3000");
