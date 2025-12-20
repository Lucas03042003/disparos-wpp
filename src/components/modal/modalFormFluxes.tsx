import { Layers, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type StepType = "send_text" | "send_media";

export interface FluxStep {
  id: string;
  type: StepType;
  title: string;
  text?: string;
  mediaFile?: File;
  mediaPreview?: string;
}

export type Flux = {
  id: string;
  nickname: string;
  steps: FluxStep[];
  createdAt: Date;
}

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
              Deletar
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
              <span className="truncate">{step.title}</span>
            </div>
          ))}
          {flux.steps.length > 3 && (
            <p className="text-xs text-muted-foreground pl-7">
              +{flux.steps.length - 3} mais step{flux.steps.length - 3 !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};