"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

import { PasswordInput } from "@/components/common/password-input";

import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
    email: z.email("Email inválido!"),
    password: z.string().min(8, "Senha inválida!")
});

type FormValues = z.infer<typeof formSchema>;

export const SignInForm = () => {

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: true,

        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
          onError: (ctx) => {
            if (ctx.error.code === "USER_NOT_FOUND") {
              toast.error("E-mail não encontrado.");
              return form.setError("email", {
                message: "E-mail não encontrado.",
              });
            }
            if (ctx.error.code === "INVALID_EMAIL_OR_PASSWORD") {
              toast.error("E-mail ou senha inválidos.");
              form.setError("password", {
                message: "E-mail ou senha inválidos.",
              });
              return form.setError("email", {
                message: "E-mail ou senha inválidos.",
              });
            }
            toast.error(ctx.error.message);
        },
        }

    });

  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entre na sua conta</CardTitle>
        <CardDescription>
          Insira suas credenciais para acessar sua conta.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="grid gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="exemplo@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Senha@123" {...field} ></PasswordInput>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
            <CardFooter>
                <Button type="submit">Entrar</Button>
            </CardFooter>
        </form>
      </Form>

    </Card>
  );
};

