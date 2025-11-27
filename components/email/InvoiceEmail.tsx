import * as React from "react";
import {
  Html,
  Body,
  Container,
  Text,
  Link,
  Preview,
  Heading,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";

interface InvoiceEmailProps {
  customerName: string;
  invoiceNumber: string;
  pdfUrl: string;
  totalAmount: string;
  dueDate: string;
  invoiceId: string;
  sender?: {
    name: string;
    address?: string | null;
    taxId?: string | null;
    logoUrl?: string | null;
  };
}

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({
  customerName,
  invoiceNumber,
  pdfUrl,
  totalAmount,
  dueDate,
  invoiceId,
  sender,
}) => {
  // Fallback nama jika kosong
  const companyName = sender?.name || "7ONG Invoice User";

  return (
    <Html>
      <Preview>
        Tagihan Baru #{invoiceNumber} dari {companyName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Tagihan Baru</Heading>
          <Text style={text}>Halo {customerName},</Text>
          <Text style={text}>
            Terima kasih atas kerjasamanya. Berikut adalah rincian tagihan
            terbaru Anda yang perlu dibayarkan sebelum tanggal{" "}
            <strong>{dueDate}</strong>.
          </Text>

          <Section style={box}>
            <Row>
              <Column>
                <Text style={paragraph}>
                  <strong>No. Invoice</strong>
                </Text>
                <Text style={paragraph}>{invoiceNumber}</Text>
              </Column>
              <Column>
                <Text style={paragraph}>
                  <strong>Total Tagihan</strong>
                </Text>
                <Text style={paragraph}>{totalAmount}</Text>
              </Column>
            </Row>
          </Section>

          <Section
            style={{
              textAlign: "center",
              marginTop: "32px",
              marginBottom: "32px",
            }}
          >
            <Link
              href={`${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoiceId}`}
              style={button}
            >
              Lihat Invoice & Bayar
            </Link>
            <Text style={{ marginTop: "16px", fontSize: "12px" }}>
              Atau download PDF: <a href={pdfUrl}>Klik di sini</a>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer Info Pengirim */}
          <Section>
            <Text style={footer}>
              Tagihan ini dikirim oleh:
              <br />
              <strong>{companyName}</strong>
              {sender?.address && (
                <>
                  <br />
                  {sender.address}
                </>
              )}
              {sender?.taxId && (
                <>
                  <br />
                  NPWP: {sender.taxId}
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = { backgroundColor: "#ffffff", fontFamily: "sans-serif" };
const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};
const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  paddingTop: "32px",
  paddingBottom: "16px",
};
const text = { color: "#333", fontSize: "16px", lineHeight: "26px" };
const box = {
  padding: "24px",
  backgroundColor: "#f4f4f4",
  borderRadius: "4px",
};
const paragraph = { fontSize: "16px", lineHeight: "26px", margin: "0" };
const button = {
  backgroundColor: "#2563eb",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  width: "100%",
};
const hr = { borderColor: "#e6ebf1", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px", lineHeight: "16px" };

export default InvoiceEmail;
