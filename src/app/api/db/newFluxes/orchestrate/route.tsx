import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactsTable, fluxesTable, stepsTable } from "@/db/schema";

export async function POST(request: Request) {
    try {
        const { nickname, steps, intervalValue, intervalUnit, contacts, userId } = await request.json();

        const result = await db.transaction(async (tx) => {
            // 1. Inserir o Fluxo Principal com updatedAt now
            const insertedFluxes = await tx.insert(fluxesTable).values({
                userId: userId,
                name: nickname,
                isActive: false,
                intervalValue: Number(intervalValue),
                intervalUnit: intervalUnit,
                updatedAt: new Date() // Define a data de atualização na criação
            }).returning({ 
                insertedId: fluxesTable.id 
            });

            const newFluxId = insertedFluxes[0].insertedId;

            // 2. Inserir os Passos (Steps) com classificação de mídia
            if (steps && steps.length > 0) {
                const stepsData = steps.map((step: any, index: number) => {
                    const rawUrl = step.mediaUrl || "";
                    const urlLower = rawUrl.toLowerCase();
                    
                    let classifiedType: "text" | "image" | "video" = "text";
                    
                    // Lógica de classificação baseada na extensão
                    if (urlLower.match(/\.(png|jpeg|jpg|webp|gif)$/)) {
                        classifiedType = "image";
                    } else if (urlLower.match(/\.(mp4|webm|ogg|mov)$/)) {
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

            // 3. Inserir os Contatos com updatedAt now
            if (contacts && contacts.length > 0) {
                const contactsData = contacts.map((contact: any) => ({
                    fluxId: newFluxId,
                    name: contact.name,
                    phoneNumber: contact.phone_number || contact.phoneNumber || "",
                    updatedAt: new Date() // Define a data de atualização para cada contato
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