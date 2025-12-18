// app/api/evolution/create-instance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ensureCanAddNumber } from "@/lib/subscription-permissions";

export async function POST(req: NextRequest) {
  try {
    const { name, token, userId } = await req.json();

    const permission = await ensureCanAddNumber(userId);

    if (!permission) {
      return NextResponse.json({ error: "Limite de números atingido." }, { status: 403 });
    }

    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL as string;
    const API_KEY = process.env.API_KEY as string;

    const payload = {
      instanceName: `${userId} : ${name}`,
      integration: "WHATSAPP-BAILEYS",
      token,
      qrcode: true,
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
