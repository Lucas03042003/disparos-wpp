"use client";

import { useEffect, useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CheckCircle2, CircleOff, Trash2, ScanQrCode } from "lucide-react";
import { io, Socket } from "socket.io-client";

type NumberItems = {
  id: string;
  fluxId: string | null;
  userId: string | null;
  remoteJid: string;
  instanceName: string;
  token: string;
  connectionStatus: "open" | "close" | "connecting";
  createdAt: Date;
  updatedAt: Date;
};

const NumbersTable = () => {
  const { data: session } = authClient.useSession();
  const [numbers, setNumbers] = useState<NumberItems[] | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Refs para o menu e botão
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar ao servidor Socket.IO definido em server.js
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080", {
      transports: ["websocket", "polling"],
      timeout: 20000,
      query: { userId: session?.user.id }
    });

    socketRef.current = socket;

    // Escutar atualizações dos números enviadas pelo evento `numbers_event_update`
    socket.on("numbers_event_update", (payload) => {
      setNumbers(payload); // Atualize todos os números recebidos
    });

    // Cleanup ao desmontar o componente
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id]); // [] garante que useEffect seja executado apenas uma vez

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/db/getNumbers?UserId=" + session.user.id)
      .then((res) => res.json())
      .then(setNumbers);
  }, [session?.user?.id]);
  
  // Fechar o menu quando for detectado clique fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verifica se o clique aconteceu fora do menu e do botão
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    };

    // Adiciona o evento de clique no documento
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Remove o evento ao desmontar
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (id: string) => {
    if (activeMenu === id) {
      // Fecha o menu se já estiver ativo
      setActiveMenu(null);
    } else {
      // Abre o menu
      setActiveMenu(id);
    }
  };

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
              <th className="px-6 py-3 text-left">Número Conectado</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {numbers && numbers.length > 0 ? (
              numbers.map((item: NumberItems) => (
                <tr key={item.id} className="border-t relative">
                  <td className="px-6 py-4">{item.instanceName.split(" : ").at(1)}</td>
                  <td className="px-6 py-4">
                    {item.remoteJid ? item.remoteJid.split("@")[0] : "Desconectado."}
                  </td>
                  <td className="px-6 py-4">
                    {item.connectionStatus === "open" ? (
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

                  <td className="px-6 py-4 relative">
                    {/* Botão de menu */}
                    <button
                      ref={buttonRef}
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => toggleMenu(item.id)}
                    >
                      •••
                    </button>

                    {/* Menu suspenso */}
                    {activeMenu === item.id && (
                      <div
                        ref={menuRef} // Conecta o menu à ref do menu
                        className="absolute top-[calc(100%-40px)] left-5 bg-white border border-gray-200 rounded-lg shadow-lg w-30 z-50"
                      >
                        {/* Botão Conectar */}
                        <button className="flex items-center gap-2 w-full px-4 py-1 text-sm font-medium text-green-700 hover:bg-green-100 rounded-t-lg justify-left">
                          <ScanQrCode className="w-4 h-4" /> {/* Ícone com tamanho reduzido */}
                          Conectar
                        </button>
                    
                        {/* Botão Deletar */}
                        <button className="flex items-center gap-2 w-full px-4 py-1 text-sm font-medium text-red-600 hover:bg-red-100 rounded-b-lg justify-left">
                          <Trash2 className="w-4 h-4" /> {/* Ícone com tamanho reduzido */}
                          Deletar
                        </button>
                      </div>
                    )}
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
};

export default NumbersTable;