import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Pool } from "pg";
import "dotenv/config";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Escuta eventos PostgreSQL
async function initializePostgreSQLListener() {
  try {
    const client = await pool.connect();

    // Escutando os eventos
    await client.query("LISTEN numbers_event");
    await client.query("LISTEN metadata_event");
    console.log("✅ Escutando eventos: numbers_event e metadata_event");

    // Manipulador de notificações
    client.on("notification", (msg) => {
      try {
        const payload = JSON.parse(msg.payload);

        // Mapeando dados para os nomes de colunas esperados no Drizzle
        const mappedPayload = Array.isArray(payload)
          ? payload.map((item) => ({
              id: item.id,
              fluxId: item.flux_id,
              userId: item.user_id,
              remoteJid: item.remote_jid,
              instanceName: item.instance_name,
              token: item.token,
              connectionStatus: item.connection_status,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            }))
          : {
              id: payload.id,
              userId: payload.user_id,
              activeNumbers: payload.active_numbers,
              activeFluxes: payload.active_fluxes,
              successfulContacts: payload.successful_contacts,
              unsuccessfulContacts: payload.unsuccessful_contacts,
              messagesSentToday: payload.messages_sent_today,
              totalContacts: payload.total_contacts,
            };

        console.log(`📥 Notificação [${msg.channel}]:`, mappedPayload);

        // Enviar os dados mapeados para o front-end via Socket.IO
        io.sockets.sockets.forEach((s) => {
          if (Array.isArray(mappedPayload)) {
            // 🔹 numbers_event → array de números
            io.sockets.sockets.forEach((s) => {
              const filtered = mappedPayload.filter((item) => String(item.userId) === String(s.userId));
              if (filtered.length > 0) {
                s.emit(`${msg.channel}_update`, filtered);
              }
            });
          } else {
            // 🔹 metadata_event → objeto único
            io.sockets.sockets.forEach((s) => {
              if (String(mappedPayload.userId) === String(s.userId)) {
                s.emit(`${msg.channel}_update`, mappedPayload);
              }
            });
          }
        });

      } catch (error) {
        console.error("❌ Erro ao processar notificação:", error.message);
      }
    });
  } catch (error) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", error);
  }
}

// Configurar rota básica
app.get("/", (req, res) => {
  res.send("👌 Servidor está funcionando!");
});

// Inicializar Socket.IO e PostgreSQL
io.on("connection", (socket) => {
  const { userId } = socket.handshake.query; // vem do frontend
  console.log(`🔌 Cliente conectado: ${socket.id}, userId: ${userId}`);
  
  // salva o userId na instância do socket
  socket.userId = userId;
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, async () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`);
  await initializePostgreSQLListener();
});