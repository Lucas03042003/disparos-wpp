"use client";

import { useState, useEffect } from "react";
import { Flux, FluxStep, TimeUnit, Contact } from "./modalFormFluxes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepBuilder } from "./modalStepBuilderFluxes";
import { ContactsUploader } from "./modalContatUploader";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  X, 
  Clock, 
  ChevronDown,
  Users,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TIME_UNIT_LABELS: Record<TimeUnit, { singular: string; plural: string }> = {
  days: { singular: "Dia", plural: "Dias" },
  weeks: { singular: "Semana", plural: "Semanas" },
  months: { singular: "Mês", plural: "Meses" },
  years: { singular: "Ano", plural: "Anos" },
};

interface CreateFluxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (flux: Omit<Flux, "id" | "createdAt"> & { contacts?: Contact[] }) => void;
}

type WizardStep = "nickname" | "steps" | "contacts";

export function CreateFluxModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateFluxModalProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>("nickname");
  const [nickname, setNickname] = useState("");
  const [intervalValue, setIntervalValue] = useState<number>(1);
  const [intervalUnit, setIntervalUnit] = useState<TimeUnit>("days");
  const [steps, setSteps] = useState<FluxStep[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  const [nicknameError, setNicknameError] = useState("");
  const [intervalError, setIntervalError] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSelectOpen) {
          setIsSelectOpen(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, isSelectOpen]);

  const handleClose = () => {
    setWizardStep("nickname");
    setNickname("");
    setIntervalValue(1);
    setIntervalUnit("days");
    setSteps([]);
    setContacts([]);
    setNicknameError("");
    setIntervalError("");
    setIsSelectOpen(false);
    onOpenChange(false);
  };

  const handleNicknameNext = () => {
    let hasError = false;
    if (!nickname.trim()) {
      setNicknameError("O apelido é obrigatório");
      hasError = true;
    }
    if (intervalValue < 1) {
      setIntervalError("O intervalo deve ser maior que 0");
      hasError = true;
    }
    if (hasError) return;
    setNicknameError("");
    setIntervalError("");
    setWizardStep("steps");
  };

  const handleStepsNext = () => {
    if (steps.length === 0) return;
    setWizardStep("contacts");
  };

  const handleSubmit = () => {
    onSubmit({
      nickname: nickname.trim(),
      steps,
      intervalValue,
      intervalUnit,
      contacts
    });
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-[110] w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-[120]">
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 overflow-y-auto">
          {/* Progress Bar Corrigida */}
          <div className="flex items-center gap-2 mb-8 pr-6">
            {/* Passo 1: Nickname */}
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all", 
              wizardStep === "nickname" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
            )}>
              {wizardStep !== "nickname" ? <Check className="h-4 w-4" /> : "1"}
            </div>
            
            <div className="h-0.5 flex-1 bg-border relative">
              <div className={cn(
                "absolute inset-y-0 left-0 bg-primary transition-all duration-500", 
                (wizardStep === "steps" || wizardStep === "contacts") ? "w-full" : "w-0"
              )} />
            </div>

            {/* Passo 2: Steps */}
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all", 
              wizardStep === "steps" ? "bg-primary text-primary-foreground" : 
              wizardStep === "contacts" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {wizardStep === "contacts" ? <Check className="h-4 w-4" /> : "2"}
            </div>

            <div className="h-0.5 flex-1 bg-border relative">
              <div className={cn(
                "absolute inset-y-0 left-0 bg-primary transition-all duration-500", 
                wizardStep === "contacts" ? "w-full" : "w-0"
              )} />
            </div>

            {/* Passo 3: Contacts */}
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all", 
              wizardStep === "contacts" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              3
            </div>
          </div>

          {wizardStep === "nickname" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Configuração Inicial
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Defina o nome e a frequência do seu novo fluxo.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-sm font-semibold text-gray-700">Apelido do Fluxo <span className="text-destructive">*</span></Label>
                <Input
                  id="nickname"
                  placeholder="Ex: Follow-up de Vendas"
                  value={nickname}
                  onChange={(e) => { setNickname(e.target.value); if (nicknameError) setNicknameError(""); }}
                  className={nicknameError ? "border-destructive h-11" : "h-11"}
                  autoFocus
                />
                {nicknameError && <p className="text-xs text-destructive font-medium">{nicknameError}</p>}
              </div>

              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700"><Clock className="h-4 w-4 text-primary" />Intervalo entre disparos</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={intervalValue}
                    onChange={(e) => { const val = parseInt(e.target.value) || 1; setIntervalValue(Math.max(1, val)); if (intervalError) setIntervalError(""); }}
                    className={`w-20 font-medium ${intervalError ? "border-destructive" : ""}`}
                  />
                  <div className="relative flex-1">
                    <button type="button" onClick={() => setIsSelectOpen(true)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm font-medium">
                      <span className="truncate">{intervalValue === 1 ? TIME_UNIT_LABELS[intervalUnit].singular : TIME_UNIT_LABELS[intervalUnit].plural}</span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>
                    <AnimatePresence>
                      {isSelectOpen && (
                        <>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSelectOpen(false)} className="fixed inset-0 z-[200] bg-black/10 backdrop-blur-[1px]" />
                          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="pointer-events-auto w-full max-w-[260px] bg-white rounded-xl shadow-2xl border border-border p-1">
                              <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">Unidade de Tempo</div>
                              {(Object.keys(TIME_UNIT_LABELS) as TimeUnit[]).map((unit) => (
                                <button key={unit} type="button" onClick={() => { setIntervalUnit(unit); setIsSelectOpen(false); }} className={cn("flex w-full items-center justify-between px-3 py-2.5 text-sm rounded-md", intervalUnit === unit ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted text-gray-600")}>
                                  {intervalValue === 1 ? TIME_UNIT_LABELS[unit].singular : TIME_UNIT_LABELS[unit].plural}
                                  {intervalUnit === unit && <Check className="h-4 w-4" />}
                                </button>
                              ))}
                            </motion.div>
                          </div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {intervalError && <p className="text-xs text-destructive font-medium">{intervalError}</p>}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleNicknameNext} className="w-full sm:w-auto px-8 h-11 shadow-sm">Próximo Passo <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {wizardStep === "steps" && (
            <div className="space-y-6 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Construir Sequência
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Defina as mensagens e o tempo de espera entre cada passo.</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 min-h-[300px]">
                <StepBuilder steps={steps} onStepsChange={setSteps} />
              </div>

              <div className="flex justify-between pt-6 border-t gap-3 mt-auto bg-white">
                <Button variant="ghost" onClick={() => setWizardStep("nickname")} className="h-11">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleStepsNext} disabled={steps.length === 0} className="px-8 h-11">
                  Configurar Contatos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {wizardStep === "contacts" && (
            <div className="space-y-6 flex flex-col h-full">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Importar Contatos
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Opcional: importe uma lista de contatos para este flux.</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 max-h-[400px]">
                <ContactsUploader contacts={contacts} onContactsChange={setContacts} />
              </div>

              <div className="flex justify-between pt-6 border-t gap-3 mt-auto bg-white">
                <Button variant="ghost" onClick={() => setWizardStep("steps")} className="h-11">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleSubmit} className="flex-1 px-8 h-11 shadow-md bg-primary hover:bg-primary/90 text-white font-bold transition-all">
                  <Check className="mr-2 h-4 w-4" /> Criar Fluxo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}