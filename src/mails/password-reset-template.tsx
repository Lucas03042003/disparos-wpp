type VerificationEmailTemplateProps = {
  url: string;
  name: string;
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
          Redefina sua senha do <b>Better Auth</b>
        </h2>

        <p style={{ fontSize: "15px", color: "#444", marginTop: "24px" }}>
          Olá <a href={`mailto:${name}`}>{name}</a>,
        </p>

        <p style={{ fontSize: "15px", color: "#444", lineHeight: "1.6" }}>
          Recebemos uma solicitação para redefinir a senha da sua conta Better
          Auth. Se você não fez essa solicitação, pode ignorar este e-mail com
          segurança.
        </p>

        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a
            href={url}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              textDecoration: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            Redefinir Senha
          </a>
        </div>

        <p style={{ fontSize: "14px", color: "#555" }}>
          Ou copie e cole este link no seu navegador:
        </p>

        <p style={{ wordBreak: "break-all", color: "#1a73e8", fontSize: "14px" }}>
          {url}
        </p>

        <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #eee" }} />

        <p style={{ fontSize: "13px", color: "#777", textAlign: "center" }}>
          Se você não solicitou a redefinição de senha, ignore este e-mail ou
          entre em contato com o suporte se tiver dúvidas.
        </p>
      </div>
    </div>
  );
}
