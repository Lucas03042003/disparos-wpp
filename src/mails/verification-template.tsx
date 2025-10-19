import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Img,
  Link,
} from "@react-email/components";
import Logo from "@/components/common/logo";

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

const containerStyle: React.CSSProperties = {
  margin: "0 auto",
  padding: "24px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: `1px solid ${brand.border}`,
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

export default function VerficationEmailTemplate({
  url,
  name,
}: VerificationEmailTemplateProps) {
  const fallbackLink = url;

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Confirme seu e-mail para continuar</Preview>
      <Body
        style={{
          margin: 0,
          padding: "32px 16px",
          backgroundColor: brand.bg,
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Helvetica Neue",Arial,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",sans-serif',
        }}
      >
        <Container style={containerStyle}>
          <Section style={{ textAlign: "center", marginBottom: 16 }}>
            {/* Opcional: substitua o src pela sua marca */}
            <Logo subtitulo=""/>
            <Heading
              as="h2"
              style={{
                color: brand.text,
                fontSize: "20px",
                lineHeight: "28px",
                margin: 0,
                fontWeight: 700,
              }}
            >
              Verificação de e-mail
            </Heading>
          </Section>

          <Section style={{ margin: "12px 0 16px" }}>
            <Text style={textStyle}>
              Olá, <strong>{name}</strong>!
            </Text>
            <Text style={{ ...textStyle, marginTop: 8 }}>
              Para manter sua conta segura e concluir seu cadastro, confirme seu
              endereço de e-mail clicando no botão abaixo. Este link pode
              expirar por motivos de segurança.
            </Text>
          </Section>

          <Section style={{ textAlign: "center", margin: "16px 0 8px" }}>
            <Button href={url} style={buttonStyle} target="_blank">
              Confirmar e-mail
            </Button>
          </Section>

          <Section style={{ marginTop: 12 }}>
            <Text style={mutedStyle}>
              Se o botão não funcionar, copie e cole este link no seu
              navegador:
            </Text>
            <Text style={{ ...mutedStyle, marginTop: 6, wordBreak: "break-all" }}>
              <Link
                href={fallbackLink}
                style={{ color: brand.primary, textDecoration: "underline" }}
              >
                {fallbackLink}
              </Link>
            </Text>
          </Section>

          <Hr style={{ borderColor: brand.border, margin: "16px 0" }} />

          <Section style={{ marginTop: 8 }}>
            <Text style={mutedStyle}>
              Caso você não tenha solicitado esta verificação, ignore esta
              mensagem. Nenhuma ação adicional será necessária.
            </Text>
            <Text style={{ ...mutedStyle, marginTop: 8 }}>
              Atenciosamente,
              <br />
              Equipe {brand.name}
            </Text>
          </Section>
        </Container>

        <Section style={{ marginTop: 16, textAlign: "center" }}>
          <Text style={mutedStyle}>
            © {new Date().getFullYear()} {brand.name}. Todos os direitos
            reservados.
          </Text>
        </Section>
      </Body>
    </Html>
  );
}