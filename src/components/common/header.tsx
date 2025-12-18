"use client";

import { Crown, LogInIcon, LogOutIcon, MenuIcon } from "lucide-react";
import Logo from "./logo";
import Link from "next/link";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export const Header = () => {

  const router = useRouter();

  const { data: session } = authClient.useSession();

  const closeConnection = () => {
    authClient.signOut();
    router.push("/authentication");
  };

  type sessionType = typeof session;

  const handleSubscriptionButton = async (session: sessionType) => {
      const { error } = await authClient.subscription.billingPortal({
          locale:"pt-BR",
          referenceId: session!.user.id,
          returnUrl: "/",
      });

      if(error) {
        toast.error(error.message);
      }
  }

  return (
    <header className="ml-10 flex items-center justify-between p-5">
      <Link href="/">
        {/* <Image src="/logo_temp.svg" alt="WhatsApp Sender" width={100} height={26.14} /> */}
        <Logo />
      </Link>

      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="px-5">
              {session?.user ? (
                <>
                  <div className="flex justify-between space-y-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={session?.user?.image as string | undefined}
                        />
                        <AvatarFallback>
                          {session?.user?.name?.split(" ")?.[0]?.[0]}
                          {session?.user?.name?.split(" ")?.[1]?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold">{session?.user?.name}</h3>
                        <span className="text-muted-foreground block text-xs">
                          {session?.user?.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => closeConnection()}
                    >
                      <LogOutIcon />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Olá. Faça seu login!</h2>
                  <Button size="icon" asChild variant="outline">
                    <Link href="/authentication">
                      <LogInIcon />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {session?.user ? (
              <div className="ml-5 mr-5 flex flex-col">
                <Button
                  onClick={() => handleSubscriptionButton(session)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 rounded-xl px-5 py-2"
                >
                  <Crown className="w-4 h-4" />
                  Gerenciar Assinatura
                </Button>
              </div>
            ) : (
              <div className="ml-5 mr-5 flex flex-col">
                <Button
                  onClick={() => router.push('/subscriptions')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 rounded-xl px-5 py-2"
                >
                  <Crown className="w-4 h-4" />
                  Ver Planos de Assinatura
                </Button>
              </div>
            )}

          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};