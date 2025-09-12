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

const formSchema = z
  .object({
    name: z.string().min(2, "Nome inválido!"),
    email: z.string().email("Email inválido!"),
    password: z.string().min(8, "Senha inválida!"),
    confirmPassword: z.string().min(8, "Senha inválida!"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem!",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export const SignUpForm = () => {
  
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  };

  return (
    <Card>

      <CardHeader>
        <CardTitle>Cria sua conta grátis</CardTitle>
        <CardDescription>
          Crie uma conta gratuita para começar a usar!
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="grid gap-6">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Escreva seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu melhor email" {...field} />
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
                    {/* <Input placeholder="Crie uma senha segura" {...field} type="password"/> */}
                    <PasswordInput placeholder="Crie uma senha segura" {...field}></PasswordInput>
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
                  <FormLabel>Confirma sua senha</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Confirme sua senha" {...field} ></PasswordInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
          <CardFooter>
            <Button type="submit">Criar Conta</Button>
          </CardFooter>
        </form>
      </Form>

    </Card>
  );
};
