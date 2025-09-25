"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import InfoCard from "@/components/common/info-cards";
import { Phone, Zap, Send, UserRoundCheck } from "lucide-react";
import Loading from "./common/loading";

const InfoCardsRow = () => {
    const { data: session } = authClient.useSession();
    const [metaData, setMetaData] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Estado de gatilho para o refresh

    // Fetch para obter os dados atualizados da API com dependência no refreshTrigger
    useEffect(() => {
        if (!session?.user?.id) return; // Só busca se o id existir

        fetch("/api/db/getMetaData?UserId=" + session.user.id)
            .then((res) => res.json())
            .then(setMetaData)
            .catch((err) => console.error("Erro ao buscar metadados:", err));
    }, [session?.user?.id, refreshTrigger]); // Atualiza sempre que refreshTrigger mudar

    // Configuração do listener para o evento customizado "refreshMetaData"
    useEffect(() => {
        const handleRefreshEvent = () => {
            setRefreshTrigger((prev) => prev + 1); // Incrementa o gatilho de atualização
        };

        window.addEventListener('refreshMetaData', handleRefreshEvent); // Adiciona o evento global

        return () => {
            window.removeEventListener('refreshMetaData', handleRefreshEvent); // Remove o listener ao desmontar o componente
        };
    }, []);

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
    
    const taxa = `${(metaSuccess) * 100 / ((metaUnsuccess === 0 ? 1 : metaUnsuccess ?? 1) + metaSuccess)}%`;

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