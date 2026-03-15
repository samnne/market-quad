import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./db/db";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Connected", socket.id);

    socket.on("open-convo", ({ cid, uid }) => {
      socket.join(cid);
      console.log(`User ${uid}, Convo: ${cid}`);

      socket.to(cid).emit("user_connected");
    });
    socket.on('typing', ({cid, typing})=>{
      socket.to(cid).emit('typing', typing)
    })
    socket.on("message", ({ cid, message }) => {
      socket.to(cid).emit("message", { sender: "chat", message });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
