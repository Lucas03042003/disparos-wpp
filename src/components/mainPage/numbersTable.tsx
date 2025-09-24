"use client";

import { TabsContent } from "@/components/ui/tabs"
import { CheckCircle2, CircleOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

type NumberItems = {
  id: string
  fluxId: string | null
  userId: string | null
  remoteJid: string
  instanceName: string
  token: string
  connectionStatus: "open" | "close" | "connecting"
  createdAt: Date
  updatedAt: Date
}

const NumbersTable = () => {
    
  const { data: session } = authClient.useSession();
  const [numbers, setNumbers] = useState<NumberItems[] | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

  useEffect(() => {

      if (!session?.user?.id) return; // Só busca se o id existir

      fetch("/api/db/getNumbers?UserId=" + session.user.id)
        .then((res) => res.json())
        .then(setNumbers);
    }, [session?.user?.id, refreshTrigger]);

    
  useEffect(() => {
    const handleRefreshEvent = () => {
      setRefreshTrigger(prev => prev + 1);
    };
  
    window.addEventListener('refreshNumbers', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('refreshNumbers', handleRefreshEvent);
    };
  }, []);

    return ( 
          <TabsContent value="gerenciar" className="mt-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Números do WhatsApp</h2>
              <p className="text-muted-foreground text-sm">
                Gerencie os números utilizados para envio de mensagens
              </p>
            </div>

            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left">Campanha</th>
                    <th className="px-6 py-3 text-left">Data de Criação</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Ações</th>
                  </tr>
                </thead>
                  <tbody>
                    {numbers && numbers.length > 0 ? (
                      numbers.map((item: NumberItems) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-6 py-4">{item.instanceName.split(" : ").at(1)}</td>
                          <td className="px-6 py-4">{String(item.createdAt)}</td>
                          <td className="px-6 py-4">
                            {item.connectionStatus === "close" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                <CircleOff className="w-3 h-3" />
                                Inativo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-gray-500 hover:text-gray-700">•••</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
                          Nenhum número encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
              </table>
            </Card>
          </TabsContent>
     );
}
 
export default NumbersTable;