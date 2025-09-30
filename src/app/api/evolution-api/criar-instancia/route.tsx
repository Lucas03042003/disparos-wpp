// app/api/evolution/create-instance/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL as string;
  const API_KEY = process.env.API_KEY as string;

  try {
    
    const { instanceName, token } = await req.json();

    const payload = {
      "instanceName": instanceName,
      "integration": "WHATSAPP-BAILEYS",
	    "token": token,
	    "qrcode": true
    };

    const apiRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json({ error: data.error || "Erro ao criar instância" }, { status: apiRes.status });
    }


    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erro interno" }, { status: 500 });
  }
}
