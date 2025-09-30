"use client";

import { TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { FluxItem } from "./fluxItem";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

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

  useEffect(() => {
    if (!session?.user?.id) return; // Só busca se o id existir

    fetch("/api/db/getFluxes?UserId=" + session.user.id)
      .then((res) => res.json())
      .then(setFluxes);
  }, [session?.user?.id]);

  return ( 
    <TabsContent value="fluxos" className="mt-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Configuração de Fluxos</h2>
        <p className="text-muted-foreground text-sm">
          Edite, crie e controle seus fluxos de disparo
        </p>
      </div>
      {  
        fluxes && fluxes.length > 0 ? (
          fluxes.map((item: FluxesItems, idx: number) => (
            <div key={item.id ?? idx} className="text-muted-foreground text-sm">
              <FluxItem title={item.name} message={item.message} schedule={String(item.createdAt)} active={item.isActive}/>
            </div>
          ))
        ) : (
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Nenhum fluxo encontrado. Crie um novo fluxo para começar.</p>
          </Card>
        )
      }
    </TabsContent>
  );
}

export default FluxesTable;