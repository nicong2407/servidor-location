const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");


const app = express();
const httpServer = createServer(app);

// Configuración de Socket.IO con opciones CORS para permitir la conexión desde el cliente React
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permite conexiones desde cualquier origen. En producción, especifica el dominio de tu cliente.
    methods: ["GET", "POST"],
  },
});

// Un mapa para almacenar las ubicaciones de los usuarios conectados.
// La clave será el socket.id y el valor será un objeto con id, latitud y longitud.
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Cuando un nuevo cliente se conecta, le enviamos todas las ubicaciones actuales
  // para que tenga el estado inicial.
  socket.emit("allLocations", Array.from(connectedUsers.values()));

  // Escuchar el evento 'sendLocation' del cliente.
  // El cliente (hook) envía directamente el objeto de ubicación.
  socket.on("sendLocation", (location) => {
    console.log(`Ubicación recibida de ${socket.id}:`, location);

    // Actualizar la ubicación de este usuario en el mapa de usuarios conectados.
    // Aseguramos que la estructura enviada al cliente coincida con lo que espera el hook.
    connectedUsers.set(socket.id, {
      id: socket.id,
      latitude: location.latitude,
      longitude: location.longitude,
      // Puedes añadir más campos como timestamp si lo necesitas
      createdAt: new Date().toISOString(),
    });

    // Emitir la lista completa y actualizada de todas las ubicaciones a *todos* los clientes conectados.
    io.emit("allLocations", Array.from(connectedUsers.values()));
  });

  // Manejar la desconexión de un usuario
  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    // Eliminar al usuario desconectado del mapa
    connectedUsers.delete(socket.id);

    // Emitir la lista actualizada de todas las ubicaciones a los clientes restantes
    io.emit("allLocations", Array.from(connectedUsers.values()));
  });
});

// Exportar el servidor HTTP para que pueda ser iniciado en otro archivo.
module.exports = httpServer;
// });
