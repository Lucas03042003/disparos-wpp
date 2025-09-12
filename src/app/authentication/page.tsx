import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignInForm } from "./components/sign-in-form" 
import { SignUpForm } from "./components/sign-up-form"

export const Authentication = async () => {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 p-5">
      <Tabs defaultValue="SignIn">
        <TabsList>
          <TabsTrigger value="SignIn">Sign In</TabsTrigger>
          <TabsTrigger value="SignUp">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="SignIn">
            <SignInForm />
        </TabsContent>
        <TabsContent value="SignUp">
            <SignUpForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Authentication;