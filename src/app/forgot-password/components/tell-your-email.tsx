"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function TellYourEmail() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      await authClient.forgetPassword({
          email: email,
          redirectTo: "/reset-password",
      });

      setMessage("Link de redefinição enviado, verifique seu e-mail.");
    } catch {
      setMessage("Erro ao enviar o link. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-6 rounded-lg border shadow-sm flex flex-col gap-4"
      >
        <h1 className="text-lg font-semibold">Forgot password</h1>
        <p className="text-sm">Insira seu email para redefinir sua senha</p>

        <Label className="text-sm font-medium" htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Insira seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md p-2 outline-none"
          required
        />

        <Button
          type="submit"
          className="w-full py-2 rounded-md font-semibold border cursor-pointer"
        >
          Envie o link de redefinição
        </Button>

        <a
          href="/authentication"
          className="text-sm text-center underline cursor-pointer"
        >
          Retornar ao sign in
        </a>

        {message && (
            <div className="mt-1 flex justify-center text-center">
              <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium shadow-sm border border-green-300">
                {message}
              </span>
            </div>
        )}
      </form>
    </div>
  );
}
