"use client";

import { useEffect, useState, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle2, 
  CircleOff, 
  Trash2, 
  ScanQrCode, 
  CloudOff, 
  ChevronDown, 
  Check, 
  XCircle, 
  Loader2, 
  Save 
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Ou sua biblioteca de toast preferida

// Utilitário cn para facilitar o uso de classes condicionais
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FluxOption = {
  id: string;
  name: string;
};

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

// Funções de API existentes
async function connectInstance(instanceName: string, setIsModalOpen: () => void, setModalStep: () => void, setModalQrCode: (qr: string) => void) {
  try {
    const response = await fetch('/api/evolution-api/conectar-instancia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceName }),
    });
    const data = await response.json();
    setModalQrCode(data.base64);
    setModalStep();
    setIsModalOpen();
  } catch (error) {
    console.error("Erro ao conectar instância:", error);
  }
};

async function disconnectInstance(instanceName: string) {
  try {
    await fetch('/api/evolution-api/desconectar-instancia', {
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
    await fetch('/api/evolution-api/delete-instancia', {
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
  const className="flex items-center gap-2 w-full px-4 py-1 text-sm font-medium hover:bg-green-100 rounded-t-lg justify-left";

  return (
    status !== "open"
    ? (<button className={twMerge(className, "text-green-700")} onClick={onConnect}>
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

  // --- NOVOS ESTADOS PARA FLUXOS ---
  const [fluxOptions, setFluxOptions] = useState<FluxOption[]>([]);
  const [selectedFluxes, setSelectedFluxes] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Buscar Opções de Fluxos
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/db/getFluxes?UserId=" + session.user.id)
      .then((res) => res.json())
      .then(setFluxOptions)
      .catch((err) => console.error("Erro ao buscar fluxos:", err));
  }, [session?.user?.id]);

  // Sincronizar selectedFluxes quando a lista de números carregar
  useEffect(() => {
    if (numbers) {
      const initialSelected: { [key: string]: string } = {};
      numbers.forEach(item => {
        initialSelected[item.id] = item.fluxId || "none";
      });
      setSelectedFluxes(initialSelected);
    }
  }, [numbers]);

  // Socket.io Logic
  useEffect(() => {
    if (!session?.user?.id) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080", {
      transports: ["websocket", "polling"],
      query: { userId: session.user.id }
    });
    socketRef.current = socket;
    socket.on("numbers_event_update", (payload) => setNumbers(payload));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [session?.user?.id]);

  // Fetch Inicial de Números
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/db/getNumbers?UserId=" + session.user.id)
      .then((res) => res.json())
      .then(setNumbers)
      .catch(() => setNumbers([]));
  }, [session?.user?.id]);
  
  // Click Outside para fechar menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FUNÇÃO PARA SALVAR CONEXÃO ---
  const handleSaveConnection = async (numberId: string) => {
    const fluxIdValue = selectedFluxes[numberId];
    const fluxIdToSend = fluxIdValue === "none" ? null : fluxIdValue;

    setIsSaving(numberId);
    try {
      const res = await fetch("/api/db/connectNumberToFlux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numberId, fluxId: fluxIdToSend }),
      });

      if (res.ok) {
        toast.success(fluxIdToSend === null ? "Número desconectado!" : "Fluxo conectado!");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Erro ao salvar conexão");
    } finally {
      setIsSaving(null);
    }
  };

  const toggleMenu = (id: string) => {
    setActiveMenu(prev => prev === id ? null : id);
  };

  return (
    <TabsContent value="gerenciar" className="mt-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Números do WhatsApp</h2>
        <p className="text-muted-foreground text-sm">Gerencie os números e seus fluxos de atendimento</p>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-6 py-3 text-left">Campanha</th>
              <th className="px-6 py-3 text-left">Número Conectado</th>
              <th className="px-6 py-3 text-left">Fluxo</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {numbers && numbers.length > 0 ? (
              numbers.map((item: NumberItems) => (
                <tr key={item.id} className="border-t relative">
                  <td className="px-6 py-4 font-medium">{item.instanceName.split(" : ").at(1)}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {item.remoteJid ? item.remoteJid.split("@")[0] : "---"}
                  </td>

                  {/* COLUNA DE FLUXO ADICIONADA */}
                  <td className="px-6 py-4">
                    <div className="relative max-w-[200px]">
                      <button 
                        type="button" 
                        onClick={() => setOpenDropdownId(item.id)} 
                        className={cn(
                          "flex h-9 w-full items-center justify-between rounded-md border px-3 py-2 text-xs font-medium shadow-sm transition-colors",
                          selectedFluxes[item.id] === "none" 
                            ? "bg-gray-50 border-dashed text-gray-400" 
                            : "bg-white border-input text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span className="truncate">
                          {selectedFluxes[item.id] === "none" 
                            ? "Nenhum fluxo" 
                            : (fluxOptions.find(f => f.id === selectedFluxes[item.id])?.name || "Selecionar...")}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                      </button>
                                
                      <AnimatePresence>
                        {openDropdownId === item.id && (
                          <>
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              exit={{ opacity: 0 }} 
                              onClick={() => !isSaving && setOpenDropdownId(null)} 
                              className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-[2px]" 
                            />
                            
                            <div className="fixed inset-0 z-[201] flex items-end justify-center p-4 pb-32 pointer-events-none">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                                className="pointer-events-auto w-full max-w-[300px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
                              >
                                <div className="px-5 py-4 border-b border-muted/50 bg-muted/5">
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Configurar Fluxo</div>
                                  <div className="text-xs text-gray-400 mt-0.5">Defina o destino para esta instância</div>
                                </div>
                        
                                <div className="max-h-[250px] overflow-y-auto p-1.5 custom-scrollbar">
                                  {fluxOptions.map((flux) => (
                                    <button 
                                      key={flux.id} 
                                      type="button" 
                                      onClick={() => setSelectedFluxes(prev => ({ ...prev, [item.id]: flux.id }))} 
                                      className={cn(
                                        "flex w-full items-center justify-between px-4 py-3 text-sm rounded-xl transition-all duration-200 mb-1", 
                                        selectedFluxes[item.id] === flux.id 
                                          ? "bg-primary/10 text-primary font-bold" 
                                          : "hover:bg-muted text-gray-600"
                                      )}
                                    >
                                      <span className="truncate">{flux.name}</span>
                                      {selectedFluxes[item.id] === flux.id && <Check className="h-4 w-4" />}
                                    </button>
                                  ))}
                                </div>

                                <button 
                                  type="button" 
                                  onClick={() => setSelectedFluxes(prev => ({ ...prev, [item.id]: "none" }))} 
                                  className={cn(
                                    "flex w-full items-center justify-between px-4 py-3 text-sm rounded-xl transition-all duration-200 m-1.5 border border-dashed", 
                                    selectedFluxes[item.id] === "none" 
                                      ? "bg-red-50 text-red-600 font-bold border-red-200" 
                                      : "hover:bg-muted text-gray-400 border-transparent"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    <span className="truncate">Nenhum (Desconectar)</span>
                                  </div>
                                  {selectedFluxes[item.id] === "none" && <Check className="h-4 w-4" />}
                                </button>
                                
                                <div className="p-3 bg-muted/20 border-t border-border/50">
                                  <Button 
                                    className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 gap-2"
                                    disabled={isSaving === item.id}
                                    onClick={async () => {
                                      await handleSaveConnection(item.id);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    {isSaving === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4" />
                                        Confirmar e Salvar
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </motion.div>
                            </div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {item.connectionStatus === "open" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        <CircleOff className="w-3 h-3" /> Inativo
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 relative">
                    <button
                      ref={buttonRef}
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => toggleMenu(item.id)}
                    >
                      •••
                    </button>

                    {activeMenu === item.id && (
                      <div
                        ref={menuRef}
                        className="absolute top-[calc(100%-40px)] left-5 bg-white border border-gray-200 rounded-lg shadow-lg w-35 z-50"
                      >
                        <ConnectionButton
                          status={item.connectionStatus}
                          instanceName={item.instanceName}
                          onConnect={() => connectInstance(item.instanceName, setIsModalOpen, setModalStep, setModalQrCode)}
                          onDesconnect={() => disconnectInstance(item.instanceName)}
                        />
                        <button className="flex items-center gap-2 w-full px-4 py-1 text-sm font-medium text-red-600 hover:bg-red-100 rounded-b-lg justify-left"
                          onClick={() => deleteInstance(item.instanceName)}
                        >
                          <Trash2 className="w-4 h-4" /> Deletar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
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