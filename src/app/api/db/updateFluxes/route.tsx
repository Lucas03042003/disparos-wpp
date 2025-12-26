import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { fluxesTable, stepsTable, contactsTable } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { 
      id: fluxId, 
      name, 
      nickname, 
      intervalValue, 
      intervalUnit, 
      steps, 
      contacts 
    } = payload;

    if (!fluxId) {
      return NextResponse.json({ error: "ID do fluxo é obrigatório" }, { status: 400 });
    }

    const finalName = (name || nickname || "").trim();

    return await db.transaction(async (tx) => {
      
      // 1. ATUALIZAÇÃO DOS METADADOS DO FLUXO
      const currentFlux = await tx.query.fluxesTable.findFirst({
        where: eq(fluxesTable.id, fluxId),
      });

      if (!currentFlux) throw new Error("Fluxo não encontrado.");

      const fluxUpdates: any = {};
      if (finalName && finalName !== currentFlux.name) fluxUpdates.name = finalName;
      if (intervalValue !== undefined && intervalValue !== currentFlux.intervalValue) fluxUpdates.intervalValue = intervalValue;
      if (intervalUnit !== undefined && intervalUnit !== currentFlux.intervalUnit) fluxUpdates.intervalUnit = intervalUnit;

      if (Object.keys(fluxUpdates).length > 0) {
        await tx.update(fluxesTable)
          .set({ ...fluxUpdates, updatedAt: new Date() })
          .where(eq(fluxesTable.id, fluxId));
      }

      // 2. RECONCILIAÇÃO DE STEPS (PASSOS)
      const dbSteps = await tx.query.stepsTable.findMany({
        where: eq(stepsTable.fluxId, fluxId),
      });

      const incomingStepIds = steps
        .map((s: any) => s.id)
        .filter((id: any) => typeof id === "string" && id.length > 30);

      const stepsToDelete = dbSteps
        .filter(s => !incomingStepIds.includes(s.id))
        .map(s => s.id);
      
      if (stepsToDelete.length > 0) {
        await tx.delete(stepsTable).where(inArray(stepsTable.id, stepsToDelete));
      }

      for (const [index, step] of steps.entries()) {
        
        // --- LÓGICA DE DETECÇÃO DE TIPO DE MÍDIA ---
        let validStepType: "text" | "image" | "video" = "text";
        const url = (step.mediaUrl || step.documentURL || "").toLowerCase();
        const rawType = (step.type || step.stepType || "").toLowerCase();

        if (rawType.includes("text")) {
          validStepType = "text";
        } else {
          // Se não for texto, verificamos a extensão do arquivo na URL
          // Detecta mp4, webm, ogg, mov, etc.
          const videoExtensions = /\.(mp4|webm|ogg|mov|m4v)$/i;
          
          if (videoExtensions.test(url)) {
            validStepType = "video";
          } else {
            // Se houver URL mas não for vídeo, assumimos que é imagem
            validStepType = "image";
          }
        }

        const stepData = {
          fluxId: fluxId as string,
          name: (step.title || step.name || "Sem título") as string,
          stepPosition: (index + 1) as number,
          stepType: validStepType,
          message: (step.text || step.message || "") as string,
          documentURL: (step.mediaUrl || step.documentURL || null) as string | null,
        };

        if (step.id && dbSteps.find(s => s.id === step.id)) {
          await tx.update(stepsTable)
            .set(stepData)
            .where(eq(stepsTable.id, step.id));
        } else {
          await tx.insert(stepsTable).values({
            ...stepData,
            id: uuidv4(),
          });
        }
      }

      // 3. RECONCILIAÇÃO DE CONTACTS (CONTATOS)
      const dbContacts = await tx.query.contactsTable.findMany({
        where: eq(contactsTable.fluxId, fluxId),
      });

      const incomingContactIds = contacts
        .map((c: any) => c.id)
        .filter((id: any) => typeof id === "string" && id.length > 30);

      const contactsToDelete = dbContacts
        .filter(c => !incomingContactIds.includes(c.id))
        .map(c => c.id);

      if (contactsToDelete.length > 0) {
        await tx.delete(contactsTable).where(inArray(contactsTable.id, contactsToDelete));
      }

      for (const contact of contacts) {
        const contactData = {
          fluxId: fluxId as string,
          name: (contact.name || "Sem nome") as string,
          phoneNumber: (contact.phoneNumber || contact.phone_number || contact.phone || "") as string,
          updatedAt: new Date(),
        };

        if (contact.id && dbContacts.find(c => c.id === contact.id)) {
          await tx.update(contactsTable)
            .set(contactData)
            .where(eq(contactsTable.id, contact.id));
        } else {
          await tx.insert(contactsTable).values({
            ...contactData,
            id: uuidv4(),
          });
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: "Fluxo e dependências sincronizados com sucesso." 
      });
    });

  } catch (error: any) {
    console.error("ERRO NO UPDATE_FLUXES:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao processar atualização." }, 
      { status: 500 }
    );
  }
}