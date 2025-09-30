import { NextResponse } from "next/server";
import { db } from "@/db";
import { numbersTable } from "@/db/schema";

export async function POST(req: Request) {

        const { userId, instanceName, token } = await req.json();
      
        await db.insert(numbersTable).values({
            userId: userId,
            instanceName: instanceName,
            token: token
        });

        return NextResponse.json({resultado: "success"});

};