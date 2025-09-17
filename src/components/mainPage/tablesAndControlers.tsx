import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import NumbersTable from "./numbersTable"
import FluxesTable from "./fluxesTable"

export default function TablesAndControllers() {

  return (
    <div className="space-y-6 gap-6 p-5 ml-20 mr-20 mt-5">

      <div className="flex items-center justify-between">
        <Tabs defaultValue="gerenciar" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="gerenciar" onClick={() => console.log('oi')}>Gerenciar Números</TabsTrigger>
              <TabsTrigger value="fluxos">Configurar Fluxos</TabsTrigger>
            </TabsList>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              + Adicionar Número
            </Button>
          </div>

          <NumbersTable/>
          <FluxesTable/>

        </Tabs>
      </div>
    </div>
  )
}
