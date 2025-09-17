import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Zap, Phone, Calendar, MoreHorizontal } from "lucide-react"
import { useState } from "react"

type FluxItemProps = {
  title: string
  phone: string
  schedule: string
  active: boolean
}

export function FluxItem({ title, phone, schedule, active }: FluxItemProps) {
  const [enabled, setEnabled] = useState(active)

  return (
    <Card className="flex flex-row items-center justify-between p-4 shadow-sm">
      {/* Esquerda */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Zap className="h-5 w-5" />
        </div>
        <div>
            
          <h3 className="font-medium text-foreground">{title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" /> {phone}
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
            checked={enabled}
            onCheckedChange={setEnabled}
            className={enabled ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-red-500"}
          />
          <span
            className={`text-xs font-semibold ${
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
}