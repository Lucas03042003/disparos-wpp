import { db } from "@/db";
import { fluxesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        
        const { id, isActive } = await req.json();
        
        if (!id) {
            return Response.json({ error: "O ID do fluxo é obrigatório" }, { status: 400 });
        }

        const result = await db.update(fluxesTable)
            .set({ 
                isActive: isActive,
                updatedAt: new Date()
            })
            .where(eq(fluxesTable.id, id))
            .returning();

        if (result.length === 0) {
            return Response.json({ error: "Fluxo não encontrado" }, { status: 404 });
        }

        return Response.json({ 
            success: true,
            data: result[0]
        });

    } catch (err) {
        console.error("❌ Erro ao atualizar estado do fluxo:", err);
        return Response.json({ 
            error: "Erro interno ao processar a atualização",
            details: err instanceof Error ? err.message : err 
        }, { status: 500 });
    }
}