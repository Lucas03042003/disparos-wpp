import { Layers, MoreHorizontal, Trash2, MessageSquare, FileImage, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Contact } from "@/components/modal/modalContatUploader";

export type StepType = "send_text" | "send_media";
export type TimeUnit = "days" | "weeks" | "months" | "years";

export interface FluxStep {
  id: string;
  type: StepType;
  title: string;
  text?: string;
  mediaFile?: File;
  mediaPreview?: string;
}
export interface Flux {
  id: string;
  nickname: string;
  intervalValue: number;
  intervalUnit: TimeUnit;
  steps: FluxStep[];
  contacts: Contact[];
  createdAt: Date;
}

const TIME_UNIT_LABELS: Record<TimeUnit, { singular: string; plural: string }> = {
  days: { singular: "dia", plural: "dias" },
  weeks: { singular: "semana", plural: "semanas" },
  months: { singular: "mês", plural: "meses" },
  years: { singular: "ano", plural: "anos" },
};

interface FluxCardProps {
  flux: Flux;
  onDelete: (id: string) => void;
}

export function FluxCard({ flux, onDelete }: FluxCardProps) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-md hover:border-primary/20 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{flux.nickname}</h3>
            <p className="text-sm text-muted-foreground">
              {flux.steps.length} step{flux.steps.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {flux.intervalValue}{" "}
              {flux.intervalValue === 1
                ? TIME_UNIT_LABELS[flux.intervalUnit].singular
                : TIME_UNIT_LABELS[flux.intervalUnit].plural}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(flux.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {flux.steps.length > 0 && (
        <div className="mt-4 space-y-2">
          {flux.steps.slice(0, 3).map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {index + 1}
              </span>
              {step.type === "send_text" ? (
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <FileImage className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{step.title}</span>
            </div>
          ))}
          {flux.steps.length > 3 && (
            <p className="text-xs text-muted-foreground pl-7">
              +{flux.steps.length - 3} more step{flux.steps.length - 3 !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export { Contact };

