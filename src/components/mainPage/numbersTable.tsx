"use client";

import { useEffect, useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CheckCircle2, CircleOff, Trash2, ScanQrCode, CloudOff } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { twMerge } from 'tailwind-merge';

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

async function connectInstance(
  instanceName: string,
  setIsModalOpen: () => void,
  setModalStep: () => void,
  setModalQrCode: (qr: string) => void
) {
  try {
    const response = await fetch('/api/evolution-api/conectar-instancia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceName }),
    });

    const data = await response.json();

    // chamar as callbacks recebidas
    setModalQrCode(data.base64);
    setModalStep();
    setIsModalOpen();

  } catch (error) {
    console.error("Erro ao conectar instância:", error);
  }
};

async function disconnectInstance(instanceName: string) {
  try {
    const response = await fetch('/api/evolution-api/desconectar-instancia', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceName }),
    });

  } catch (error) {
    console.error("Erro ao desconectar instância:", error);
  } 
};

async function deleteInstance(instanceName: string) {
  try {
    const response = await fetch('/api/evolution-api/delete-instancia', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceName }),
    });
  } catch (error) {
    console.error("Erro ao deletar instância:", error);
  }
};

const ConnectionButton = ({ status, instanceName, onConnect, onDesconnect }:
  { status: "open" | "close" | "connecting"; instanceName: string; onConnect: () => void, onDesconnect: () => void }) => {
  
  const className="flex items-center gap-2 w-full px-4 py-1 text-sm font-medium hover:bg-green-100 rounded-t-lg justify-left"
  
  return (
    status !== "open"
    ? (<button className={twMerge(className,  "text-green-700")} onClick={onConnect}>
        <ScanQrCode className="w-4 h-4" />
        Conectar
      </button>) : (
        <button className={className} onClick={onDesconnect}>
          <CloudOff className="w-4 h-4" />
          Desconectar
        </button>
      )
  );
};

const NumbersTable = ({
  setIsModalOpen,
  setModalStep,
  setModalQrCode
}: {
  setIsModalOpen: () => void;
  setModalStep: () => void;
  setModalQrCode: (qr: string) => void;
}) => {
  const { data: session } = authClient.useSession();
  const [numbers, setNumbers] = useState<NumberItems[] | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Refs para o menu e botão
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Não conecta socket se não houver session
    if (!session?.user?.id) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080", {
      transports: ["websocket", "polling"],
      timeout: 20000,
      query: { userId: session.user.id }
    });

    socketRef.current = socket;

    socket.on("numbers_event_update", (payload) => {
      setNumbers(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch("/api/db/getNumbers?UserId=" + session.user.id)
      .then((res) => res.json())
      .then(setNumbers)
      .catch((err) => {
        console.error("Erro ao buscar números:", err);
        setNumbers([]);
      });
  }, [session?.user?.id]);
  
  // Fechar o menu quando for detectado clique fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (id: string) => {
    setActiveMenu(prev => prev === id ? null : id);
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
                    {item.remoteJid ? item.remoteJid.split("@")[0] : ""}
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
                        ref={menuRef}
                        className="absolute top-[calc(100%-40px)] left-5 bg-white border border-gray-200 rounded-lg shadow-lg w-35 z-50"
                      >
                        {/* botão des/conectar */}
                        <ConnectionButton
                          status={item.connectionStatus}
                          instanceName={item.instanceName}
                          onConnect={() => connectInstance(item.instanceName, setIsModalOpen, setModalStep, setModalQrCode)}
                          onDesconnect={() => disconnectInstance(item.instanceName)}
                        />
                    
                        {/* botão deletar */}
                        <button className="flex items-center gap-2 w-full px-4 py-1 text-sm font-medium text-red-600 hover:bg-red-100 rounded-b-lg justify-left"
                          onClick={() => deleteInstance(item.instanceName)}
                        >
                          <Trash2 className="w-4 h-4" />
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