import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { numbersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function ensureCanAddNumber(userId: string) {
  if (!userId) throw new Error("userId é obrigatório");

  const subscriptions = await auth.api.listActiveSubscriptions({
    query: { referenceId: userId },
    headers: await headers(),
  });

  const activeSubscription = subscriptions.find(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  const numbersLimit = activeSubscription?.limits?.numbers ?? 1;

  const existingNumbers = await db
    .select()
    .from(numbersTable)
    .where(eq(numbersTable.userId, userId));

  if (existingNumbers.length >= numbersLimit) {
    return false;
  }

  return true;
}