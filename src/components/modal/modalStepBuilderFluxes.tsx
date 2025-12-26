"use client";

import { useRef, useState } from "react";
import { FluxStep, StepType } from "./modalFormFluxes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Image as ImageIcon, 
  Video, 
  MessageSquare, 
  FileImage,
} from "lucide-react";
import { z } from "zod";

interface StepBuilderProps {
  steps: FluxStep[];
  onStepsChange: (steps: FluxStep[]) => void;
}

// Esquemas de validação atualizados
const sendTextSchema = z.object({
  type: z.literal("send_text"),
  title: z.string().min(1, "Título é obrigatório"),
  text: z.string().min(1, "Texto é obrigatório"),
});

// O Schema de mídia agora permite arquivo OU URL existente
const sendMediaSchema = z.object({
  type: z.literal("send_media"),
  title: z.string().min(1, "Título é obrigatório"),
  text: z.string().optional(),
  mediaFile: z.any().optional(),
  mediaUrl: z.string().optional(),
}).refine((data) => data.mediaFile || data.mediaUrl, {
  message: "Arquivo de mídia é obrigatório",
  path: ["mediaFile"],
});

export function StepBuilder({ steps, onStepsChange }: StepBuilderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<FluxStep | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddStep = (type: StepType) => {
    setEditingStep({
      id: crypto.randomUUID(),
      type,
      title: "",
      text: "",
    });
    setIsCreating(true);
    setCurrentStepIndex(steps.length);
    setErrors({});
  };

  const validateStep = (step: FluxStep): boolean => {
    setErrors({});
    try {
      if (step.type === "send_text") {
        sendTextSchema.parse(step);
      } else {
        sendMediaSchema.parse(step);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSaveStep = () => {
    if (!editingStep || !editingStep.title.trim()) return;
    if (!validateStep(editingStep)) return;

    if (isCreating) {
      onStepsChange([...steps, editingStep]);
    } else {
      onStepsChange(
        steps.map((s) => (s.id === editingStep.id ? editingStep : s))
      );
    }
    setEditingStep(null);
    setIsCreating(false);
    setCurrentStepIndex(null);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
    setIsCreating(false);
    setCurrentStepIndex(null);
    setErrors({});
  };

  const handleEditStep = (step: FluxStep, index: number) => {
    setEditingStep({ ...step });
    setCurrentStepIndex(index);
    setIsCreating(false);
    setErrors({});
  };

  const handleDeleteStep = (id: string) => {
    onStepsChange(steps.filter((s) => s.id !== id));
    if (editingStep?.id === id) handleCancelEdit();
  };

  const navigateStep = (direction: "prev" | "next") => {
    if (currentStepIndex === null) return;
    const newIndex = direction === "prev" ? currentStepIndex - 1 : currentStepIndex + 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      handleEditStep(steps[newIndex], newIndex);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingStep) {
      const preview = URL.createObjectURL(file);
      setEditingStep({
        ...editingStep,
        mediaFile: file,
        mediaPreview: preview,
        // Ao selecionar um novo arquivo, limpamos a URL antiga para forçar o novo upload
        mediaUrl: undefined, 
      });
      setErrors((prev) => ({ ...prev, mediaFile: "" }));
    }
  };

  const removeMedia = () => {
    if (editingStep) {
      if (editingStep.mediaPreview) {
        URL.revokeObjectURL(editingStep.mediaPreview);
      }
      setEditingStep({
        ...editingStep,
        mediaFile: undefined,
        mediaPreview: undefined,
        mediaUrl: undefined, // Remove a referência do R2 também
      });
    }
  };

  const getStepTypeIcon = (type: StepType) => 
    type === "send_text" ? <MessageSquare className="h-4 w-4" /> : <FileImage className="h-4 w-4" />;

  const getStepTypeLabel = (type: StepType) => 
    type === "send_text" ? "Enviar Texto" : "Enviar Mídia";

  return (
    <div className="space-y-4">
      {/* Listagem de Steps */}
      {steps.length > 0 && !editingStep && (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-all hover:bg-secondary/50">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {getStepTypeIcon(step.type)}
                    {getStepTypeLabel(step.type)}
                  </span>
                </div>
                <p className="font-medium text-foreground truncate mt-1">{step.title}</p>
                
                {/* Preview na lista se houver URL ou Preview local */}
                {(step.mediaPreview || step.mediaUrl) && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-10 w-10 rounded border overflow-hidden bg-muted flex items-center justify-center">
                      <img 
                        src={step.mediaPreview || step.mediaUrl} 
                        alt="Preview" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/40x40?text=Video";
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground truncate">Mídia anexada</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStep(step, index)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteStep(step.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor de Step */}
      {editingStep && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {currentStepIndex !== null ? currentStepIndex + 1 : steps.length + 1}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {getStepTypeIcon(editingStep.type)}
                {getStepTypeLabel(editingStep.type)}
              </span>
            </div>
            {!isCreating && steps.length > 1 && (
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={currentStepIndex === 0} onClick={() => navigateStep("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={currentStepIndex === steps.length - 1} onClick={() => navigateStep("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm">Título do Step <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Ex: Mensagem de Boas-vindas"
                value={editingStep.title}
                onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                className="mt-1.5"
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>

            {editingStep.type === "send_text" ? (
              <div>
                <Label className="text-sm">Texto da Mensagem <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Digite o conteúdo da mensagem..."
                  value={editingStep.text || ""}
                  onChange={(e) => setEditingStep({ ...editingStep, text: e.target.value })}
                  className="mt-1.5 resize-none"
                  rows={4}
                />
                {errors.text && <p className="text-sm text-destructive mt-1">{errors.text}</p>}
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-sm">Legenda da Mídia (opcional)</Label>
                  <Textarea
                    placeholder="Digite uma legenda..."
                    value={editingStep.text || ""}
                    onChange={(e) => setEditingStep({ ...editingStep, text: e.target.value })}
                    className="mt-1.5 resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-sm">Mídia <span className="text-destructive">*</span></Label>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                  
                  {/* Lógica de Preview Unificada (Local ou R2) */}
                  {(editingStep.mediaPreview || editingStep.mediaUrl) ? (
                    <div className="mt-1.5 relative rounded-lg border border-border bg-black/5 overflow-hidden group">
                      {/* Verifica se é vídeo (pela extensão da URL ou tipo do arquivo) */}
                      {(editingStep.mediaFile?.type.startsWith("video/") || editingStep.mediaUrl?.match(/\.(mp4|webm|ogg)$/i)) ? (
                        <div className="relative aspect-video flex items-center justify-center bg-black">
                           <video src={editingStep.mediaPreview || editingStep.mediaUrl} className="max-h-60 w-full" controls />
                        </div>
                      ) : (
                        <img 
                          src={editingStep.mediaPreview || editingStep.mediaUrl} 
                          alt="Preview" 
                          className="w-full max-h-60 object-contain" 
                        />
                      )}
                      
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-8 shadow-md"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Alterar Mídia
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 shadow-md"
                          onClick={removeMedia}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1.5 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Clique para selecionar uma mídia</p>
                        <p className="text-xs text-muted-foreground">Imagens (JPG, PNG) ou Vídeos (MP4)</p>
                      </div>
                    </div>
                  )}
                  {errors.mediaFile && <p className="text-sm text-destructive mt-1">{errors.mediaFile}</p>}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={handleSaveStep}>
              <Check className="mr-1.5 h-4 w-4" />
              {isCreating ? "Adicionar Step" : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      )}

      {/* Botões de Adição */}
      {!editingStep && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1 border-dashed h-12" onClick={() => handleAddStep("send_text")}>
            <MessageSquare className="mr-2 h-4 w-4" /> Texto
          </Button>
          <Button type="button" variant="outline" className="flex-1 border-dashed h-12" onClick={() => handleAddStep("send_media")}>
            <FileImage className="mr-2 h-4 w-4" /> Mídia
          </Button>
        </div>
      )}
    </div>
  );
}