import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactsTable, fluxesTable, stepsTable } from "@/db/schema";

export async function POST(request: Request) {
    try {
        const { nickname, steps, intervalValue, intervalUnit, contacts, userId } = await request.json();

        const result = await db.transaction(async (tx) => {
            // 1. Inserir o Fluxo Principal
            const insertedFluxes = await tx.insert(fluxesTable).values({
                userId: userId,
                name: nickname,
                isActive: false,
                intervalValue: Number(intervalValue),
                intervalUnit: intervalUnit
            }).returning({ 
                insertedId: fluxesTable.id 
            });

            const newFluxId = insertedFluxes[0].insertedId;

            // 2. Inserir os Passos (Steps)
            if (steps && steps.length > 0) {
                const stepsData = steps.map((step: any, index: number) => {
                    // Pegamos a URL do payload (mediaUrl)
                    const rawUrl = step.mediaUrl || "";
                    const urlLower = rawUrl.toLowerCase();
                    
                    let classifiedType: "text" | "image" | "video" = "text";
                    
                    if (urlLower.endsWith(".png") || urlLower.endsWith(".jpeg") || urlLower.endsWith(".jpg")) {
                        classifiedType = "image";
                    } else if (urlLower.endsWith(".mp4")) {
                        classifiedType = "video";
                    }

                    return {
                        fluxId: newFluxId,
                        name: step.title,
                        stepPosition: index + 1,
                        stepType: classifiedType,
                        message: step.text || null,
                        documentURL: rawUrl !== "" ? rawUrl : null,
                    };
                });

                await tx.insert(stepsTable).values(stepsData);
            }

            // 3. Inserir os Contatos
            if (contacts && contacts.length > 0) {
                const contactsData = contacts.map((contact: any) => ({
                    fluxId: newFluxId,
                    name: contact.name,
                    // No schema é phoneNumber (camelCase), no payload pode ser phone_number
                    phoneNumber: contact.phone_number || contact.phoneNumber || "",
                }));
                await tx.insert(contactsTable).values(contactsData);
            }

            return newFluxId;
        });

        return NextResponse.json({ 
            success: true, 
            fluxId: result 
        });

    } catch (error) {
        console.error("Erro detalhado na criação do fluxo:", error);
        return NextResponse.json(
            { error: "Erro ao salvar fluxo no banco de dados" },
            { status: 500 }
        );
    }
}