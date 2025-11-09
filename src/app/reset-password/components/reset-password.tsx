"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export default function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") as string;

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (values.password !== values.confirmPassword) {
      toast.error("Senhas não coincidem");
      setIsLoading(false);
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha redefinida com sucesso!");
      router.push("/authentication");
    }

    setIsLoading(false);
  }

  return (
    <div
      className={cn("flex items-center justify-center min-h-screen px-4", className)}
      {...props}
    >
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Redefina sua senha</CardTitle>
            <CardDescription>
              Insira sua nova senha para finalizar a recuperação da conta.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova senha</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Crie uma senha segura"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirme a nova senha</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Confirme a senha"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <CardFooter className="flex flex-col gap-2 pt-0">
                  <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Redefinir senha"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    Lembrou a senha?{" "}
                    <Link
                      href="/authentication"
                      className="underline underline-offset-4"
                    >
                      Entrar
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* opcional: texto auxiliar abaixo do card */}
        {/* <div className="mt-4 text-muted-foreground text-xs text-center">
          Ao continuar você concorda com os nossos{" "}
          <Link href="#" className="underline underline-offset-4">Termos de Serviço</Link> e{" "}
          <Link href="#" className="underline underline-offset-4">Política de Privacidade</Link>.
        </div> */}

      </div>
    </div>
  );
}