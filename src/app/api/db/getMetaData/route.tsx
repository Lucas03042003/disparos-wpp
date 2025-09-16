import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET(request: Request) {

      const { searchParams } = new URL(request.url);
      const userId = String(searchParams.get("UserId") ?? "");
      
      const metaData = await db.query.metaDataUsersTable.findFirst({
        where: (fields, { eq }) => eq(fields.userId, userId),
      });

      return NextResponse.json(metaData);

};