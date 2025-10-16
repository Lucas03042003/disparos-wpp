// app/api/evolution/create-instance/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL as string;
  const API_KEY = process.env.API_KEY as string;

  try {
    
    const { instanceName} = await req.json();

    const apiRes = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY
      }
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json({ error: data.error || "Erro ao deletar instância" }, { status: apiRes.status });
    }


    return NextResponse.json({ status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erro interno" }, { status: 500 });
  }
}
