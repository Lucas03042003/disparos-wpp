import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL as string;
  const API_KEY = process.env.API_KEY as string;

  try {
    
    const { instanceName } = await req.json();

    const apiRes = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
      method: "GET",
      headers: {
        "apikey": API_KEY
      },
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json({ error: data.error || "Erro ao buscar instâncias" }, { status: apiRes.status });
    }


    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erro interno" }, { status: 500 });
  }
}
