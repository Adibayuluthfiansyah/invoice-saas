import * as React from "react";

interface InvoiceEmailProps {
  customerName: string;
  invoiceNumber: string;
  pdfUrl: string;
  totalAmount: string;
  dueDate: string;
}

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({
  customerName,
  invoiceNumber,
  pdfUrl,
  totalAmount,
  dueDate,
}) => (
  <div style={{ fontFamily: "sans-serif", lineHeight: 1.5, color: "#333" }}>
    <h2 style={{ color: "#2563eb" }}>Tagihan Baru dari MY COMPANY</h2>

    <p>
      Halo <strong>{customerName}</strong>,
    </p>

    <p>
      Terima kasih telah menggunakan layanan kami. Berikut adalah detail tagihan
      terbaru Anda:
    </p>

    <div
      style={{
        background: "#f3f4f6",
        padding: "20px",
        borderRadius: "8px",
        margin: "20px 0",
      }}
    >
      <p style={{ margin: "5px 0" }}>
        <strong>Nomor Invoice:</strong> {invoiceNumber}
      </p>
      <p style={{ margin: "5px 0" }}>
        <strong>Total Tagihan:</strong> {totalAmount}
      </p>
      <p style={{ margin: "5px 0" }}>
        <strong>Jatuh Tempo:</strong> {dueDate}
      </p>
    </div>

    <p>
      Silakan unduh dan lihat detail lengkap invoice melalui tombol di bawah
      ini:
    </p>

    <a
      href={pdfUrl}
      style={{
        display: "inline-block",
        background: "#2563eb",
        color: "white",
        padding: "12px 24px",
        textDecoration: "none",
        borderRadius: "6px",
        fontWeight: "bold",
        marginTop: "10px",
      }}
    >
      Download Invoice PDF
    </a>

    <p style={{ marginTop: "30px", fontSize: "12px", color: "#666" }}>
      Jika tombol di atas tidak berfungsi, silakan copy-paste link berikut ke
      browser Anda:
      <br />
      {pdfUrl}
    </p>
  </div>
);
