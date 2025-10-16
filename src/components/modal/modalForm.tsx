// Esse objeto atua como um orquestrador
// A partir dele que os usuário terá acesso às demais funcionalidades

"use client";

import React, { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ModalQRCode from "./modalNewQRCode";

import { v4 as uuidv4 } from 'uuid';
// import updateNumbers from "@/functions/updateNumbers"; Não é mais utilizado, estou usando web sockets
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter mais de dois dígitos.",
  }),
});

export default function ModalForm({ state, onClose, description, qrCode, step }: 
  { state: boolean, onClose: () => void, description: string, qrCode: string, step: number }) {

  const [formStep, setFormStep] = useState<number>(step);
  const [name, setName] = useState<string>("");
  const [token] = useState(() => uuidv4().toUpperCase());

  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    }
  }, [state]);

  useEffect(() => {
    if (!state) return;
    function esc(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [state, onClose]);

  // AO ENVIAR O FORMULÁRIO
  function onSubmit(values: z.infer<typeof formSchema>) {
    setFormStep(1);
    setName(values.name);
  }

  if (!state) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all"
        onClick={onClose}
      />
      <div
        className="relative z-10 bg-white rounded-lg shadow-lg p-8 min-w-[320px] w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-600"
          onClick={() => {
            onClose();
            // if (description.includes('whatsapp') && formStep !== 0) {
            //   const instanceName = name;
            //   updateNumbers({ instanceName, token, userId });
            //   window.dispatchEvent(new CustomEvent('refreshMetaData'));
            // }
          }}
          aria-label="Fechar modal"
          type="button"
        >
          ×
        </button>
        
        {
        (formStep === 0) ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da instância</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={description}
                        {...field}
                        ref={inputRef}
                        id="modal-nome-da-instancia"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Continuar</Button>
            </form>
          </Form>):(
            (qrCode === "")? (
              <ModalQRCode name={name} token={token} userId={userId}/>
            ) : (
              <div>
                <h3>Leia o QR-Code abaixo para conectar o whatsapp:</h3>
                <img src={qrCode} alt="QR Code" className="filter-none" />
              </div>
            )
          )
        }


      </div>
    </div>
  );
}