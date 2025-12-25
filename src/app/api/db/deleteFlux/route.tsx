import { db } from "@/db";
import { fluxesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return Response.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        const result = await db.delete(fluxesTable)
            .where(eq(fluxesTable.id, id))
            .returning();

        if (result.length === 0) {
            return Response.json({ error: "Fluxo não encontrado" }, { status: 404 });
        }

        return Response.json({ success: true, deletedId: id });
    } catch (err) {
        return Response.json({ error: "Erro ao excluir", details: err }, { status: 500 });
    }
}