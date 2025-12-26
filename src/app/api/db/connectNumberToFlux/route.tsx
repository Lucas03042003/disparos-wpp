import { NextResponse } from "next/server";
import { db } from "@/db";
import { numbersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const { numberId, fluxId } = await request.json();

        if (!numberId || (fluxId === undefined)) {
            return NextResponse.json(
                { error: "O parâmetro 'numberId' é obrigatório e 'fluxId' deve ser fornecido (mesmo que nulo)." },
                { status: 400 }
            );
        }

        const finalFluxId = (fluxId === "none" || fluxId === null) ? null : fluxId;

        const updatedNumber = await db.update(numbersTable)
            .set({ 
                fluxId: finalFluxId
            })
            .where(eq(numbersTable.id, numberId))
            .returning();

        if (updatedNumber.length === 0) {
            return NextResponse.json(
                { error: "Instância de número não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: finalFluxId === null 
                ? "Fluxo desconectado com sucesso!" 
                : "Fluxo conectado com sucesso!",
            data: updatedNumber[0]
        });

    } catch (error) {
        console.error("Erro ao atualizar conexão de fluxo:", error);
        return NextResponse.json(
            { error: "Erro interno ao processar a atualização." },
            { status: 500 }
        );
    }
}