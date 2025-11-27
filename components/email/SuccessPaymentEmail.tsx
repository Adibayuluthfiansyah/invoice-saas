import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SuccessPaymentEmailProps {
  customerName: string;
  invoiceNumber: string;
  amount: string;
  paymentDate: string;
}

export const SuccessPaymentEmail = ({
  customerName,
  invoiceNumber,
  amount,
  paymentDate,
}: SuccessPaymentEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Pembayaran Diterima untuk Invoice #{invoiceNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Pembayaran Berhasil 🎉</Heading>
          <Text style={paragraph}>Halo {customerName},</Text>
          <Text style={paragraph}>
            Terima kasih! Kami telah menerima pembayaran Anda dengan detail
            berikut:
          </Text>
          <Section style={box}>
            <Text style={paragraph}>
              <strong>No. Invoice:</strong> #{invoiceNumber}
            </Text>
            <Text style={paragraph}>
              <strong>Jumlah:</strong> {amount}
            </Text>
            <Text style={paragraph}>
              <strong>Tanggal:</strong> {paymentDate}
            </Text>
            <Text style={paragraph}>
              <strong>Status:</strong> LUNAS
            </Text>
          </Section>
          <Text style={paragraph}>
            Invoice Anda kini sudah lunas. Terima kasih atas kepercayaan Anda.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>7ONG Invoice Automation System</Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles (Bisa disamakan dengan InvoiceEmail)
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
};
const paragraph = { color: "#333", fontSize: "16px", lineHeight: "26px" };
const box = {
  padding: "24px",
  backgroundColor: "#f0f0f0",
  borderRadius: "4px",
};
const hr = { borderColor: "#cccccc", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px" };

export default SuccessPaymentEmail;
