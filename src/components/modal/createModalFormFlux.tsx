import { useState } from "react";
import { Flux, FluxStep } from "./modalFormFluxes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StepBuilder } from "./modalStepBuilderFluxes";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

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

  const handleClose = () => {
    // Reset state when closing
    setWizardStep("nickname");
    setNickname("");
    setSteps([]);
    setNicknameError("");
    onOpenChange(false);
  };

  const handleNicknameNext = () => {
    if (!nickname.trim()) {
      setNicknameError("Nickname is required");
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
              wizardStep === "nickname"
                ? "bg-primary text-primary-foreground"
                : "bg-primary/20 text-primary"
            }`}
          >
            {wizardStep === "steps" ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <div className="h-0.5 flex-1 bg-border">
            <div
              className={`h-full bg-primary transition-all duration-300 ${
                wizardStep === "steps" ? "w-full" : "w-0"
              }`}
            />
          </div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
              wizardStep === "steps"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
        </div>

        {wizardStep === "nickname" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Flux
              </DialogTitle>
              <DialogDescription>
                Give your flux a memorable nickname to get started.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nickname">
                  Flux Nickname <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nickname"
                  placeholder="e.g., Morning Routine, Project Setup"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    if (nicknameError) setNicknameError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNicknameNext();
                  }}
                  className={`mt-1.5 ${nicknameError ? "border-destructive" : ""}`}
                  autoFocus
                />
                {nicknameError && (
                  <p className="mt-1.5 text-sm text-destructive">{nicknameError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNicknameNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Build Your Steps</DialogTitle>
              <DialogDescription>
                Add and organize the steps for {nickname}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 max-h-[400px] overflow-y-auto">
              <StepBuilder steps={steps} onStepsChange={setSteps} />
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setWizardStep("nickname")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                <Check className="mr-2 h-4 w-4" />
                Create Flux
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}