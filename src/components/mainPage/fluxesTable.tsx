import { TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { FluxItem } from "./fluxItem";

const FluxesTable = () => {
    return ( 
          <TabsContent value="fluxos" className="mt-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Configuração de Fluxos</h2>
              <p className="text-muted-foreground text-sm">
                Edite, crie e controle seus fluxos de disparo
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              <FluxItem title="teste" phone="teste" schedule="teste" active={true}/>
            </p>

          </TabsContent>
     );
}
 
export default FluxesTable;