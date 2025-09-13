import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignInForm } from "./components/sign-in-form" 
import { SignUpForm } from "./components/sign-up-form"
import { Header } from "@/components/common/header"

export const Authentication = async () => {
  return (
  <>

      <Header/>

      <div className="flex w-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col p-5">
          <Tabs defaultValue="SignIn">
        <TabsList>
          <TabsTrigger value="SignIn">Entrar</TabsTrigger>
          <TabsTrigger value="SignUp">Criar Conta</TabsTrigger>
        </TabsList>
        <TabsContent value="SignIn">
            <SignInForm />
        </TabsContent>
        <TabsContent value="SignUp">
            <SignUpForm />
        </TabsContent>
          </Tabs>
        </div>
      </div>
  
  </>
  )
}

export default Authentication;