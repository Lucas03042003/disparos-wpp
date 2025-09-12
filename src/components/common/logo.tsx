import { MessageCircle } from "lucide-react";

type Props = { subtitulo?: string };

const Logo = ({ subtitulo = "Painel de Controle" }: Props) => {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-br from-primary to-primary p-2 rounded-lg shadow-[var(--shadow-soft)]">
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">WhatsApp Sender</h1>
        <p className="text-sm text-muted-foreground">{subtitulo}</p>
      </div>
    </div>
  );
};

export default Logo;