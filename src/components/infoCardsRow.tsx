"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import InfoCard from "@/components/common/info-cards";
import { Phone, Zap, Send, UserRoundCheck } from "lucide-react";
import Loading from "./common/loading";
import { io, Socket } from "socket.io-client";

const InfoCardsRow = () => {
    const { data: session } = authClient.useSession();
    const [metaData, setMetaData] = useState<any>(null);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Conectar ao servidor Socket.IO definido em server.js
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080", {
          transports: ["websocket", "polling"],
          timeout: 20000,
          query: { userId: session?.user.id }
        });
      
        socketRef.current = socket;
      
        // Escutar atualizações dos números enviadas pelo evento `metadata_event_update`
        socket.on("metadata_event_update", (payload) => {
          setMetaData(payload); // Atualize todos os números recebidos
        });
      
        // Cleanup ao desmontar o componente
        return () => {
          socket.disconnect();
          socketRef.current = null;
        };
    }, [session?.user.id]); // [] garante que useEffect seja executado apenas uma vez

    // Fetch para obter os dados atualizados da API com dependência no refreshTrigger
    useEffect(() => {
        if (!session?.user?.id) return; // Só busca se o id existir

        fetch("/api/db/getMetaData?UserId=" + session.user.id)
            .then((res) => res.json())
            .then(setMetaData)
            .catch((err) => console.error("Erro ao buscar metadados:", err));
    }, [session?.user?.id]);

    // Mostra tela de loading enquanto os dados estão sendo carregados
    if (!metaData) {
        return (
            <div className="flex justify-center items-center mt-40">
                <Loading />
            </div>
        );
    }

    // Cálculo da taxa de sucesso
    const metaSuccess = metaData.successfulContacts ?? 0;
    const metaUnsuccess = metaData.unsuccessfulContacts ?? 0;
    
    const taxa = `${(
                      (metaSuccess * 100) /
                      ((metaUnsuccess === 0 ? 1 : metaUnsuccess ?? 1) + metaSuccess)
                    ).toFixed(2)}%`;

    return ( 
        <div className="mt-5 align-text-top justify-center items-center flex gap-12">
            <InfoCard title="Números Ativos" value={metaData.activeNumbers ?? 0} subtitle="Total de números conectados" icon={Phone} />
            <InfoCard title="Fluxos Ativos" value={metaData.activeFluxes ?? 0} subtitle="Total de fluxos ativos" icon={Zap} />
            <InfoCard title="Mensagens de Hoje" value={metaData.messagesSentToday ?? 0} subtitle="Mensagens enviadas com sucesso" icon={UserRoundCheck} />
            <InfoCard title="Taxa de sucesso" value={taxa} subtitle="Sucessos dividido pelas tentativas" icon={Send} />
        </div>
    );
}
 
export default InfoCardsRow;