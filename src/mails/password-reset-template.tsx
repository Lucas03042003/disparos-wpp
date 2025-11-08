import {
  Link,
  Text,
} from "@react-email/components";

type VerificationEmailTemplateProps = {
  url: string;
  name: string;
};

const brand = {
  name: "Whatsapp Sender",
  primary: "#177a35ff", // azul
  text: "#111827",
  muted: "#6b7280",
  bg: "#f9fafb",
  border: "#e5e7eb",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: brand.primary,
  color: "#ffffff",
  textDecoration: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  fontWeight: 600,
};

const textStyle: React.CSSProperties = {
  color: brand.text,
  fontSize: "14px",
  lineHeight: "22px",
  margin: 0,
};

const mutedStyle: React.CSSProperties = {
  color: brand.muted,
  fontSize: "12px",
  lineHeight: "20px",
  margin: 0,
};

export default function PasswordResetEmail({ name, url }: VerificationEmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f9f9f9",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "32px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#111", fontSize: "22px" }}>
          Redefina sua senha do <b>WhatsApp Sender</b>
        </h2>

        <Text style={textStyle}>
          Olá, <strong>{name}</strong>!
        </Text>

        <Text style={{...textStyle, fontSize: "15px", color: "#444", lineHeight: "1.6" }}>
          Recebemos uma solicitação para redefinir a senha da sua conta do WhatsApp 
          Sender. Se você não fez essa solicitação, pode ignorar este e-mail com
          segurança.
        </Text>

        <div style={{...textStyle, textAlign: "center", margin: "32px 0" }}>
          <a
            href={url}
            style={buttonStyle}
          >
            Redefinir Senha
          </a>
        </div>

        <Text style={{...textStyle, fontSize: "14px", color: "#555" }}>
          Ou copie e cole este link no seu navegador:
        </Text>

        <Text style={{ ...mutedStyle, marginTop: 6, wordBreak: "break-all" }}>
          <Link
            href={url}
            style={{ color: brand.primary, textDecoration: "underline" }}
          >
            {url}
          </Link>
        </Text>

        <hr style={{...textStyle, margin: "32px 0", border: "none", borderTop: "1px solid #eee" }} />

        <Text style={{...textStyle, fontSize: "13px", color: "#777", textAlign: "center" }}>
          Se você não solicitou a redefinição de senha, ignore este e-mail ou
          entre em contato com o suporte se tiver dúvidas.
        </Text>
      </div>
    </div>
  );
}
