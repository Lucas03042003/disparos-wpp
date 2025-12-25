import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Zap, AlarmClock, Calendar, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"

type FluxItemProps = {
  id: string;
  title: string
  intervalValue: number,
  intervalUnit: string,
  schedule: string
  active: boolean
}

export function FluxItem({ id, title, intervalValue, intervalUnit, schedule, active }: FluxItemProps) {
  const [enabled, setEnabled] = useState(active)
  const [isPending, setIsPending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Função para atualizar o status (ON/OFF)
  const handleToggle = async (newStatus: boolean) => {
    setEnabled(newStatus);
    setIsPending(true);
    try {
      const response = await fetch("/api/db/updateFluxState", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      });
      if (!response.ok) throw new Error("Falha ao atualizar");
    } catch (error) {
      setEnabled(!newStatus);
      alert("Erro ao atualizar status.");
    } finally {
      setIsPending(false);
    }
  };

  // NOVA: Função para deletar o fluxo
  const handleDelete = async () => {
    if (!confirm(`Deseja realmente excluir o fluxo "${title}"?`)) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/db/deleteFlux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Falha ao excluir o fluxo");
      
      console.log(`✅ Fluxo ${id} excluído com sucesso`);
      // O Realtime (Socket.io) no componente pai cuidará de remover o item da lista
    } catch (error) {
      console.error("❌ Erro ao excluir:", error);
      alert("Erro ao excluir o fluxo. Tente novamente.");
      setIsDeleting(false);
    }
  };

  return (
    <Card className={`flex flex-row items-center justify-between p-4 shadow-sm transition-all ${isDeleting ? "opacity-50 scale-95" : "opacity-100"}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <AlarmClock className="h-4 w-4" /> {intervalValue} {intervalUnit}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {schedule}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            disabled={isPending || isDeleting}
            checked={enabled}
            onCheckedChange={handleToggle}
            className={enabled ? "hover:cursor-pointer data-[state=checked]:bg-green-500" : "hover:cursor-pointer data-[state=unchecked]:bg-red-500"}
          />
          <span className={`text-xs font-semibold w-8 ${enabled ? "text-green-600" : "text-red-600"}`}>
            {enabled ? "ON" : "OFF"}
          </span>
        </div>
        
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 hover:cursor-pointer transition-colors disabled:text-gray-400 p-1"
        >
          {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
        </button>
      </div>
    </Card>
  )
}