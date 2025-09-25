"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import NumbersTable from "./numbersTable"
import FluxesTable from "./fluxesTable"
import { useState } from "react";
import ModalForm from "../modal/modalForm";

export default function TablesAndControllers() {

  const [buttonType, setbuttonType] = useState<string>("+ Adicionar Número");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalKey, setModalKey] = useState<number>(0); // contador para recriar modal

  return (
    <>
      <ModalForm 
        key={modalKey} // força recriação sempre que o contador mudar
        state={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        description={
          buttonType === "+ Adicionar Número" 
            ? "Dê um apelido a esse whatsapp." 
            : "Dê um nome a esse fluxo."
        } 
      />

      <div className="space-y-6 gap-6 p-5 ml-20 mr-20 mt-5">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="gerenciar" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger 
                  value="gerenciar" 
                  onClick={() => setbuttonType("+ Adicionar Número")}
                >
                  Gerenciar Números
                </TabsTrigger>
                <TabsTrigger 
                  value="fluxos" 
                  onClick={() => setbuttonType("+ Adicionar Fluxos")}
                >
                  Configurar Fluxos
                </TabsTrigger>
              </TabsList>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white" 
                onClick={() => {
                  setModalKey(prev => prev + 1); // incrementa key
                  setIsModalOpen(true); // abre o modal
                }}
              >
                {buttonType}
              </Button>
            </div>

            <NumbersTable/>
            <FluxesTable/>

          </Tabs>
        </div>
      </div>
    </>
  ) 
};
