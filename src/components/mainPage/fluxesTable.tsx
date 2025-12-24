"use client";

import { TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { FluxItem } from "./fluxItem";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { io } from "socket.io-client";
import { Skeleton } from "@/components/ui/skeleton";

type FluxesItems = {
  id: string;
  userId: string;
  name: string;
  message: string | null;
  documentURL?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const FluxesTable = () => {
  const { data: session } = authClient.useSession();
  const [fluxes, setFluxes] = useState<FluxesItems[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    // 1. Busca Inicial (Fetch)
    const loadInitialData = async () => {
      try {
        const res = await fetch("/api/db/getFluxes?UserId=" + session.user.id);
        const data = await res.json();
        setFluxes(data);
      } catch (error) {
        console.error("Erro ao carregar fluxos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // 2. Configuração do Realtime (Socket.IO)
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080", {
      transports: ["websocket"],
      query: { userId: session.user.id }
    });

    socket.on("connect", () => console.log("✅ Conectado ao Realtime"));

    socket.on("fluxes_event_update", (payload: FluxesItems[]) => {
      console.log("📥 Atualização em tempo real recebida:", payload);
      setFluxes(payload);
    });

    // Limpeza ao desmontar o componente
    return () => {
      socket.off("fluxes_event_update");
      socket.disconnect();
    };
  }, [session?.user?.id]);

  return ( 
    <TabsContent value="fluxos" className="mt-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Configuração de Fluxos</h2>
        <p className="text-muted-foreground text-sm">
          Edite, crie e controle seus fluxos de disparo
        </p>
      </div>

      {isLoading ? (
        // Estado de Loading
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : fluxes && fluxes.length > 0 ? (
        fluxes.map((item: FluxesItems, idx: number) => (
          <div key={item.id ?? idx} className="text-muted-foreground text-sm">
            <FluxItem 
              title={item.name} 
              message={item.message} 
              schedule={new Date(item.createdAt).toLocaleDateString('pt-BR')} 
              active={item.isActive}
            />
          </div>
        ))
      ) : (
        <Card className="p-8 text-center border-dashed">
          <p className="text-sm text-muted-foreground">
            Nenhum fluxo encontrado. Crie um novo fluxo para começar.
          </p>
        </Card>
      )}
    </TabsContent>
  );
}

export default FluxesTable;