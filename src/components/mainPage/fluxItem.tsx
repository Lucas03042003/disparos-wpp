import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Zap, AlarmClock, Calendar, MoreHorizontal } from "lucide-react"
import { useState } from "react"

type FluxItemProps = {
  id: string; // Adicionado o ID para a requisição
  title: string
  intervalValue: number,
  intervalUnit: string,
  schedule: string
  active: boolean
}

export function FluxItem({ id, title, intervalValue, intervalUnit, schedule, active }: FluxItemProps) {
  const [enabled, setEnabled] = useState(active)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async (newStatus: boolean) => {
    
    setEnabled(newStatus);
    setIsPending(true);

    try {
      const response = await fetch("/api/db/updateFluxState", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          isActive: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar o estado do fluxo no servidor");
      }

      console.log(`✅ Fluxo ${id} atualizado para: ${newStatus}`);
    } catch (error) {
      console.error("❌ Erro ao atualizar fluxo:", error);
      setEnabled(!newStatus);
      alert("Não foi possível atualizar o estado do fluxo. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className={`flex flex-row items-center justify-between p-4 shadow-sm transition-opacity ${isPending ? "opacity-70" : "opacity-100"}`}>
      {/* Esquerda */}
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

      {/* Direita */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            disabled={isPending} // Desabilita enquanto a requisição está em curso
            checked={enabled}
            onCheckedChange={handleToggle} // Chama a função de atualização
            className={enabled ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
          />
          <span
            className={`text-xs font-semibold w-8 ${
              enabled ? "text-green-600" : "text-red-600"
            }`}
          >
            {enabled ? "ON" : "OFF"}
          </span>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </Card>
  )
};