import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Pool } from "pg";
import "dotenv/config";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Funções de Mapeamento (Banco -> Drizzle)
const mappers = {
  numbers_event: (data) => data.map(item => ({
    id: item.id,
    fluxId: item.flux_id,
    userId: item.user_id,
    remoteJid: item.remote_jid,
    instanceName: item.instance_name,
    token: item.token,
    connectionStatus: item.connection_status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  })),

  fluxes_event: (data) => data.map(item => ({
    id: item.id,
    userId: item.user_id,
    name: item.name,
    intervalValue: item.interval_value,
    intervalUnit: item.interval_unit,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    isActive: item.is_active,
  })),

  metadata_event: (item) => ({
    id: item.id,
    userId: item.user_id,
    activeNumbers: item.active_numbers,
    activeFluxes: item.active_fluxes,
    successfulContacts: item.successful_contacts,
    unsuccessfulContacts: item.unsuccessful_contacts,
    messagesSentToday: item.messages_sent_today,
    totalContacts: item.total_contacts,
  })
};

async function initializePostgreSQLListener() {
  try {
    const client = await pool.connect();

    // Canais que o servidor vai escutar
    const channels = ["numbers_event", "metadata_event", "fluxes_event"];
    for (const channel of channels) {
      await client.query(`LISTEN ${channel}`);
    }
    
    console.log(`✅ Escutando eventos: ${channels.join(", ")}`);

    client.on("notification", (msg) => {
      try {
        const channel = msg.channel;
        
        // 1. Tratamento de Payload Vazio
        if (!msg.payload || msg.payload.trim() === "") {
          console.log(`⚠️ Payload vazio em [${channel}]`);
          const emptyValue = channel === "metadata_event" ? {} : [];
          io.emit(`${channel}_update`, emptyValue);
          return;
        }

        const rawData = JSON.parse(msg.payload);
        
        // 2. Mapeamento Dinâmico baseado no canal
        const mapper = mappers[channel];
        if (!mapper) return;

        const mappedData = mapper(rawData);
        console.log(`📥 Notificação [${channel}] processada.`);

        // 3. Distribuição Filtrada por UserId
        io.sockets.sockets.forEach((socket) => {
          const socketUserId = String(socket.userId);

          if (Array.isArray(mappedData)) {
            // Para arrays (numbers e fluxes), filtramos os itens do usuário
            const userSpecificData = mappedData.filter(
              (item) => String(item.userId) === socketUserId
            );
            socket.emit(`${channel}_update`, userSpecificData);
          } else {
            // Para objetos únicos (metadata), verificamos se pertence ao usuário
            if (String(mappedData.userId) === socketUserId) {
              socket.emit(`${channel}_update`, mappedData);
            } else {
              socket.emit(`${channel}_update`, {});
            }
          }
        });

      } catch (error) {
        console.error(`❌ Erro no processamento [${msg.channel}]:`, error.message);
      }
    });

    // Tratamento de erro na conexão do cliente PG
    client.on("error", (err) => {
      console.error("❌ Erro no cliente PostgreSQL:", err);
      process.exit(1); // Força reinicialização para reconectar
    });

  } catch (error) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", error);
  }
}

app.get("/", (req, res) => res.send("👌 Realtime Server Online"));

io.on("connection", (socket) => {
  const { userId } = socket.handshake.query;
  socket.userId = userId;
  console.log(`🔌 Cliente conectado: ${socket.id} | User: ${userId}`);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, async () => {
  console.log(`🚀 Servidor em http://localhost:${PORT}`);
  await initializePostgreSQLListener();
});