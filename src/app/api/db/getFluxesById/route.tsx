import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { fluxesTable } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const fluxData = await db.query.fluxesTable.findFirst({
      where: eq(fluxesTable.id, id),
      with: {
        steps: true,
        contacts: true,
      },
    });

    if (!fluxData) {
      return NextResponse.json({ error: "Fluxo não encontrado" }, { status: 404 });
    }

    return NextResponse.json(fluxData);
  } catch (error) {
    console.error("Erro na rota getFluxesById:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}