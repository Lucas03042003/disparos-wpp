import { useRef, useState } from "react";
import { FluxStep, StepType } from "./modalFormFluxes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Trash2, Edit2, Check, X, Image, Video, MessageSquare, FileImage } from "lucide-react";
import { z } from "zod";

interface StepBuilderProps {
  steps: FluxStep[];
  onStepsChange: (steps: FluxStep[]) => void;
}

const sendTextSchema = z.object({
  type: z.literal("send_text"),
  title: z.string().min(1, "Título é obrigatório"),
  text: z.string().min(1, "Texto é obrigatório"),
});

const sendMediaSchema = z.object({
  type: z.literal("send_media"),
  title: z.string().min(1, "Título é obrigatório"),
  text: z.string().optional(),
  mediaFile: z.instanceof(File, { message: "Arquivo de mídia é obrigatório" }),
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
    if (editingStep?.id === id) {
      handleCancelEdit();
    }
  };

  const navigateStep = (direction: "prev" | "next") => {
    if (currentStepIndex === null) return;
    const newIndex = direction === "prev" ? currentStepIndex - 1 : currentStepIndex + 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      const step = steps[newIndex];
      setEditingStep({ ...step });
      setCurrentStepIndex(newIndex);
      setIsCreating(false);
      setErrors({});
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
      });
    }
  };

  const getStepTypeIcon = (type: StepType) => {
    return type === "send_text" ? (
      <MessageSquare className="h-4 w-4" />
    ) : (
      <FileImage className="h-4 w-4" />
    );
  };

  const getStepTypeLabel = (type: StepType) => {
    return type === "send_text" ? "Enviar Texto" : "Enviar Mídia";
  };

  return (
    <div className="space-y-4">
      {/* Step List */}
      {steps.length > 0 && !editingStep && (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-all hover:bg-secondary/50"
            >
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
                {step.text && (
                  <p className="text-sm text-muted-foreground truncate">
                    {step.text}
                  </p>
                )}
                {step.mediaPreview && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Image className="h-4 w-4" />
                    <span className="truncate">{step.mediaFile?.name}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEditStep(step, index)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteStep(step.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step Editor */}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentStepIndex === 0}
                  onClick={() => navigateStep("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentStepIndex === steps.length - 1}
                  onClick={() => navigateStep("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="step-title" className="text-sm">
                Título do Step <span className="text-destructive">*</span>
              </Label>
              <Input
                id="step-title"
                placeholder="Digite o título do step"
                value={editingStep.title}
                onChange={(e) =>
                  setEditingStep({ ...editingStep, title: e.target.value })
                }
                className="mt-1.5"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            {editingStep.type === "send_text" ? (
              <div>
                <Label htmlFor="step-text" className="text-sm">
                  Texto <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="step-text"
                  placeholder="Digite o texto da mensagem"
                  value={editingStep.text || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, text: e.target.value })
                  }
                  className="mt-1.5 resize-none"
                  rows={3}
                />
                {errors.text && (
                  <p className="text-sm text-destructive mt-1">{errors.text}</p>
                )}
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="step-text" className="text-sm">
                    Texto (opcional)
                  </Label>
                  <Textarea
                    id="step-text"
                    placeholder="Digite uma legenda para a mídia"
                    value={editingStep.text || ""}
                    onChange={(e) =>
                      setEditingStep({ ...editingStep, text: e.target.value })
                    }
                    className="mt-1.5 resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-sm">
                    Mídia <span className="text-destructive">*</span>
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {editingStep.mediaPreview ? (
                    <div className="mt-1.5 relative rounded-lg border border-border overflow-hidden">
                      {editingStep.mediaFile?.type.startsWith("video/") ? (
                        <video
                          src={editingStep.mediaPreview}
                          className="w-full h-40 object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={editingStep.mediaPreview}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeMedia}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1.5 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex gap-2">
                        <Image className="h-6 w-6 text-muted-foreground" />
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Clique para fazer upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Imagem ou vídeo
                        </p>
                      </div>
                    </div>
                  )}
                  {errors.mediaFile && (
                    <p className="text-sm text-destructive mt-1">{errors.mediaFile}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              <X className="mr-1.5 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveStep}
            >
              <Check className="mr-1.5 h-4 w-4" />
              {isCreating ? "Adicionar" : "Salvar"}
            </Button>
          </div>
        </div>
      )}

      {/* Add Step Buttons */}
      {!editingStep && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-dashed"
            onClick={() => handleAddStep("send_text")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Enviar Texto
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-dashed"
            onClick={() => handleAddStep("send_media")}
          >
            <FileImage className="mr-2 h-4 w-4" />
            Enviar Mídia
          </Button>
        </div>
      )}

      {/* Empty State */}
      {steps.length === 0 && !editingStep && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Nenhum step adicionado ainda.</p>
          <p className="text-sm">Escolha um tipo de step acima para começar.</p>
        </div>
      )}
    </div>
  );
}