"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loading from "./common/loading";

export default function ProtectedClient({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    // só redireciona quando a sessão já foi resolvida e é inexistente
    if (!isPending && !session) {
      router.push("/authentication");
    }
  }, [session, isPending, router]);

  // mostra loading enquanto a sessão está sendo carregada
  if (isPending) return (
        <div className="flex justify-center items-center mt-60">
            <Loading />
        </div>
    )
  // se não há sessão e já não estamos pendentes, o efeito fará o redirect;
  // retornar null evita flash de conteúdo não-autorizado antes do redirect.
  if (!session) return null;

  return <>{children}</>;
}