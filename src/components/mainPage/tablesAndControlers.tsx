"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import NumbersTable from "./numbersTable"
import FluxesTable from "./fluxesTable"
import { useState } from "react";
import ModalFormNumber from "../modal/modalFormNumber";
import { Flux } from "../modal/modalFormFluxes";
import { toast } from "sonner";
import { CreateFluxModal } from "../modal/createModalFormFlux";

export default function TablesAndControllers() {

  const [buttonType, setButtonType] = useState<string>("+ Adicionar Número");
  const [isModalNumberOpen, setIsModalNumberOpen] = useState<boolean>(false);
  const [modalNumberKey, setModalNumberKey] = useState<number>(0); // contador para recriar modal
  const [fuxSelect, setFluxSelect] = useState<Flux[]>([]);
  const [isModalFluxOpen, setIsModalFluxOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [step, setStep] = useState<number>(0);

  const handleCreateFlux = (fluxData: Omit<Flux, "id" | "createdAt">) => {
    const newFlux: Flux = {
      ...fluxData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setFluxSelect((prev) => [newFlux, ...prev]);
    toast.success(`Fluxo ${newFlux.nickname} criado com sucesso!`);
  };

  return (
    <>
      <ModalFormNumber 
        key={modalNumberKey} // força recriação sempre que o contador mudar
        state={isModalNumberOpen} 
        onClose={() => {
          setIsModalNumberOpen(false) 
          setQrCode("")
          setStep(0)
        }}
        description="Dê um apelido a esse whatsapp." 
        qrCode={qrCode}
        step = {step}
      />

      <div className="space-y-6 gap-6 p-5 ml-20 mr-20 mt-5">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="gerenciar" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger 
                  value="gerenciar" 
                  onClick={() => setButtonType("+ Adicionar Número")}
                >
                  Gerenciar Números
                </TabsTrigger>
                <TabsTrigger 
                  value="fluxos" 
                  onClick={() => setButtonType("+ Adicionar Fluxos")}
                >
                  Configurar Fluxos
                </TabsTrigger>
              </TabsList>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white" 
                onClick={() => {
                  if (buttonType === "+ Adicionar Número") {
                    setModalNumberKey(prev => prev + 1); // incrementa key
                    setIsModalNumberOpen(true); // abre o modal
                  } else {
                    setIsModalFluxOpen(true);
                  }
                }}
              >
                {buttonType}
              </Button>
            </div>

            <NumbersTable setIsModalOpen = {() => setIsModalNumberOpen(true)} setModalStep = {() => setStep(1)} setModalQrCode = {(qrCode:string) => setQrCode(qrCode)}/>
            <FluxesTable/>

            <CreateFluxModal
              open={isModalFluxOpen}
              onOpenChange={setIsModalFluxOpen}
              onSubmit={handleCreateFlux}
            />

          </Tabs>
        </div>
      </div>
    </>
  ) 
};
