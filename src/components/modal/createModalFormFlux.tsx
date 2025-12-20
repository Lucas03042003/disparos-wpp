"use client";

import { useState, useEffect } from "react";
import { Flux, FluxStep } from "./modalFormFluxes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepBuilder } from "./modalStepBuilderFluxes";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";

interface CreateFluxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (flux: Omit<Flux, "id" | "createdAt">) => void;
}

type WizardStep = "nickname" | "steps";

export function CreateFluxModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateFluxModalProps) {
  const [wizardStep, setWizardStep] = useState<WizardStep>("nickname");
  const [nickname, setNickname] = useState("");
  const [steps, setSteps] = useState<FluxStep[]>([]);
  const [nicknameError, setNicknameError] = useState("");

  // Gerenciamento manual do Scroll Lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fechar ao apertar ESC
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open]);

  const handleClose = () => {
    setWizardStep("nickname");
    setNickname("");
    setSteps([]);
    setNicknameError("");
    onOpenChange(false);
  };

  const handleNicknameNext = () => {
    if (!nickname.trim()) {
      setNicknameError("O apelido é obrigatório");
      return;
    }
    setNicknameError("");
    setWizardStep("steps");
  };

  const handleSubmit = () => {
    onSubmit({
      nickname: nickname.trim(),
      steps,
    });
    handleClose();
  };

  const canSubmit = nickname.trim() && steps.length > 0;

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop manual */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Conteúdo do Modal - Ajustado para 50% */}
      <div 
        className="relative z-10 w-1/3 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 overflow-y-auto">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6 pr-8">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all ${
                wizardStep === "nickname" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
              }`}
            >
              {wizardStep === "steps" ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className="h-0.5 flex-1 bg-border">
              <div className={`h-full bg-primary transition-all duration-300 ${wizardStep === "steps" ? "w-full" : "w-0"}`} />
            </div>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all ${
                wizardStep === "steps" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>

          {wizardStep === "nickname" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Create New Flux
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Give your flux a memorable nickname to get started.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">
                  Flux Nickname <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nickname"
                  placeholder="e.g., Morning Routine"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    if (nicknameError) setNicknameError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleNicknameNext()}
                  className={nicknameError ? "border-destructive" : ""}
                  autoFocus
                />
                {nicknameError && <p className="text-sm text-destructive">{nicknameError}</p>}
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleNicknameNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Build Your Steps</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add and organize the steps for <span className="font-medium text-foreground">{nickname}</span>
                </p>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2">
                <StepBuilder steps={steps} onStepsChange={setSteps} />
              </div>

              <div className="flex justify-between pt-2 border-t mt-4">
                <Button variant="ghost" onClick={() => setWizardStep("nickname")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="default" onClick={handleSubmit} disabled={!canSubmit}>
                  <Check className="mr-2 h-4 w-4" />
                  Create Flux
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}