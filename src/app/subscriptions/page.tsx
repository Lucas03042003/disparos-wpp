"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Check, Zap, Crown, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner";

export default function AssinaturasPage() {

  const router = useRouter()

  const planos = [
    {
      nome: "Free Trial",
      preco: "Gratuito",
      descricao: "Ideal para testar as principais funcionalidades.",
      beneficios: [
        "1 número de WhatsApp conectado",
        "Bot de disparo simples",
        "Limite de 10 disparos por dia",
      ],
      icone: <Zap className="w-6 h-6 text-green-500" />,
      gradient: "from-gray-200 to-gray-300",
      action: () => toast.info("Para alterar seu plano, você deve primeiro logar em uma conta!"),
    },
    {
      nome: "Basic",
      preco: "R$170,00/mês",
      descricao: "Perfeito para quem quer automações mais robustas.",
      beneficios: [
        "Até 2 números de WhatsApp",
        "Fluxos complexos com vários disparos",
        "Até 200 mensagens/dia por número",
      ],
      icone: <Check className="w-6 h-6 text-emerald-600" />,
      gradient: "from-green-400 to-emerald-600",
      action: () => toast.info("Para alterar seu plano, você deve primeiro logar em uma conta!"),
    },
    {
      nome: "Premium",
      preco: "R$220,00/mês",
      descricao: "Ideal para empresas e times que precisam de escala.",
      beneficios: [
        "Até 5 números de WhatsApp conectados",
        "Fluxos complexos avançados",
        "200 mensagens/dia por número",
      ],
      icone: <Crown className="w-6 h-6 text-yellow-500" />,
      gradient: "from-yellow-400 to-amber-600",
      action: () => toast.info("Para alterar seu plano, você deve primeiro logar em uma conta!"),
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-white py-16 px-6 flex flex-col items-center">
        {/* Cabeçalho com botão Voltar e título */}
        <div className="w-full max-w-6xl flex flex-col sm:flex-row items-center mb-12">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mr-50 flex items-center gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-100 transition-all duration-300 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div className="text-center sm:text-right mt-6 sm:mt-0">
            <h1 className="text-4xl font-bold text-emerald-800 mb-1">
              Escolha o plano ideal para você
            </h1>
            <p className="text-gray-600 text-lg">
              Conecte seu WhatsApp e automatize seus atendimentos com facilidade.
            </p>
          </div>
        </div>

        {/* Cards de planos */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
          {planos.map((plano, index) => (
            <Card
              key={index}
              className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white"
            >
              <CardHeader className="text-center">
                <div
                  className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r ${plano.gradient} mb-3`}
                >
                  {plano.icone}
                </div>
                <CardTitle className="text-2xl font-semibold text-emerald-800">
                  {plano.nome}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plano.descricao}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <p className="text-3xl font-bold text-emerald-700 mb-4">
                  {plano.preco}
                </p>
                <ul className="space-y-2 text-gray-700">
                  {plano.beneficios.map((b, i) => (
                    <li key={i} className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" /> {b}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex justify-center mt-6">
                <Button
                  onClick={plano.action}
                  className={`bg-gradient-to-r ${plano.gradient} hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300`}
                >
                  {plano.nome === "Free Trial" ? "Começar agora" : "Assinar"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
    </main>
  )
}

  // type sessionType = typeof session;

  // const handleSelectedPlan = async (plan: string, subscriptionId: string, session: sessionType) => {
  //     const { error } = await authClient.subscription.billingPortal({
  //         locale:"pt-BR",
  //         referenceId: session!.user.id,
  //         returnUrl: "/",
  //     });

  //     if(error) {
  //       toast.error(error.message);
  //     }

      // const subscriptions = await getSubscriptions(session!.user.id);

      // if (!subscriptions && plan === "Free Trial") {
      //   return toast.error(`Você já está no plano ${plan}!`);
      // }

      // if (subscriptions && (plan == subscriptions?.plan)) {
      //   return toast.error(`Você já está no plano ${plan}!`);
      // }

      // if (plan === "Free Trial" && subscriptions) {
      //   const { data, error } = await authClient.subscription.cancel({
      //       referenceId: session!.user.id,
      //       subscriptionId: subscriptionId,
      //       returnUrl: '/subscriptions',
      //   });

      //   if(error) {
      //     toast.error(error.message);
      //   }

      //   return toast.success("Você mudou para o free trial!");
      // };

      // const { data, error } = await authClient.subscription.upgrade({
      //         plan: plan,
      //         annual: true,
      //         referenceId: session!.user.id,
      //         subscriptionId: subscriptionId,
      //         seats: 1,
      //         successUrl: "/", // required
      //         cancelUrl: "/subscriptions", // required
      //         disableRedirect: true, // required
      //     });

      // if(error) {
      //   toast.error(error.message);
      // }

      // return toast.success(`Você mudou para o plano ${plan}!`);

  // }
