// app/api/evolution/create-instance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  // Sua Evolution API URL e API KEY
  const EVOLUTION_API_URL = "https://evolution-api-production-f1ec.up.railway.app/instance/create";
  const API_KEY = "Lucas@2003"; // Recomendado usar variável de ambiente

  // Importante: NUNCA exponha a API_KEY no código do client!

  try {
    // Opcional: Receber dados do body, mas aqui usamos nome fixo
    const { instanceName } = await req.json();

    const payload = {
      "instanceName": instanceName,
      "integration": "WHATSAPP-BAILEYS",
	    "token": uuidv4().toUpperCase(),
	    "qrcode": true
    };

    const apiRes = await fetch(EVOLUTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      // Pode detalhar mais a resposta de erro aqui, se desejar
      return NextResponse.json({ error: data.error || "Erro ao criar instância" }, { status: apiRes.status });
    }


    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erro interno" }, { status: 500 });
  }
}
