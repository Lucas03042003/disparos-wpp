import { db } from "@/db";
import { numbersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {

    try {
      const { token, status, remoteJid } = await req.json();

      console.log( token, status, remoteJid )

      const updatedNumber = await db.update(numbersTable).set({
          connectionStatus: ["connecting", "close"].includes(status ?? "")
                            ? "close"
                            : "open",
          remoteJid: remoteJid,
          updatedAt: new Date()
        }).where(
          eq(numbersTable.token, token)
        )
        .returning();

      console.log(updatedNumber[0])

      return Response.json({ 
        success: true, 
        data: updatedNumber[0] 
      });
    } catch(err) {
      return Response.json({"error":err})
    };
};