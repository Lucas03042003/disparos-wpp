import { Pool } from "pg";
import "dotenv/config";

// Configuração do PostgreSQL
const poolEvol = new Pool({
  connectionString: process.env.EVOLUTION_API_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const poolDb = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initializeEvolutionListener() {
  const clientEvol = await poolEvol.connect();

  try {
    // Escutando os eventos
    await clientEvol.query("LISTEN instance_event");
    console.log("✅ Escutando evento instance_event");

    clientEvol.on("notification", async (msg) => {
      const clientDb = await poolDb.connect();

      try {
        // Obtém todas as mudanças da tabela "Change"
        const { rows: instanceChanges } = await clientEvol.query(`
          SELECT C."id" AS change_id, C."operation", I.* 
          FROM public."Change" C
          JOIN public."Instance" I ON C."instance_id" = I.id;
        `);

        console.log("📝 Mudanças recebidas:", instanceChanges);

        // Processa cada "change" de forma sequencial
        for (const change of instanceChanges) {
          let query = "";
          const params = []; // Protege contra SQL Injection

          // Verifica o tipo de operação
          if (change.operation === "INSERT") {
            query = `
              INSERT INTO numbers (user_id, instance_name, token) 
              VALUES ($1, $2, $3)
              ON CONFLICT DO NOTHING; -- Evita duplicatas
            `;
            params.push(
              change.name.split(" : ")[0],
              change.name,
              change.token
            );
          } else if (change.operation === "UPDATE") {
            query = `
              UPDATE numbers 
              SET connection_status = $1, remote_jid = $2, updated_at = NOW() 
              WHERE instance_name = $3 AND token = $4;
            `;
            params.push(
              change.connectionStatus,
              change.ownerJid,
              change.name,
              change.token
            );
          } else if (change.operation === "DELETE") {
            query = `
              DELETE FROM numbers 
              WHERE instance_name = $1 AND token = $2;
            `;
            params.push(change.name, change.token);
          }

          // Executa a query de atualização/inserção/remoção no banco principal
          if (query) {
            console.log(`⚙️ Executando query: ${query} | Params: ${params}`);
            await clientDb.query(query, params);
          }

          // Exclui a linha da tabela "Change" para evitar reprocessamento no futuro
          await clientEvol.query(
            `DELETE FROM public."Change" WHERE id = $1;`,
            [change.change_id]
          );
          console.log(`🗑️ Mudança com ID ${change.change_id} excluída da tabela "Change"`);
        }
      } catch (err) {
        console.error("❌ Erro ao processar mudanças:", err.message);
      } finally {
        // Libera a conexão do `poolDb` após o processamento
        clientDb.release();
      }
    });
  } catch (err) {
    console.error("❌ Erro ao escutar o evento:", err.message);
  }
}

await initializeEvolutionListener();