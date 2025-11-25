/* eslint-disable jsx-a11y/alt-text */
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: number;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  customer: {
    name: string;
    email: string;
    address: string | null;
  };
  sender: {
    name: string;
    address: string | null;
    email: string;
    taxId: string | null;
    logoUrl: string | null;
  };
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

const styles = StyleSheet.create({
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
    marginBottom: 4,
  },
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#111827",
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    flexDirection: "column",
  },
  label: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: "#111827",
  },
  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 8,
  },
  tableColDesc: { width: "50%" },
  tableColQty: { width: "15%", textAlign: "right" },
  tableColRate: { width: "15%", textAlign: "right" },
  tableColTotal: { width: "20%", textAlign: "right" },

  textHeader: { fontSize: 9, fontWeight: "bold", color: "#374151" },
  textRow: { fontSize: 9, color: "#374151" },

  totalSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 10, color: "#6B7280" },
  totalValue: { fontSize: 10, color: "#111827", fontWeight: "bold" },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 4,
    paddingTop: 4,
  },
  grandTotalValue: { fontSize: 12, color: "#2563EB", fontWeight: "bold" },
});

export function InvoicePDF({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.subtitle}>#{data.invoiceNumber}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            {/* LOGO */}
            {data.sender.logoUrl && (
              <Image style={styles.logo} src={data.sender.logoUrl} />
            )}
            <Text
              style={[
                styles.value,
                {
                  fontWeight: "bold",
                  fontSize: 12,
                  textTransform: "uppercase",
                },
              ]}
            >
              {data.sender.name}
            </Text>
            <Text style={styles.value}>{data.sender.address}</Text>
            <Text style={styles.value}>{data.sender.email}</Text>
            {data.sender.taxId && (
              <Text style={styles.value}>NPWP: {data.sender.taxId}</Text>
            )}
          </View>
        </View>

        {/* INFO DATES & CLIENT */}
        <View style={[styles.row, { marginBottom: 20 }]}>
          <View style={styles.col}>
            <Text style={styles.label}>Ditagihkan Kepada:</Text>
            <Text style={[styles.value, { fontWeight: "bold" }]}>
              {data.customer.name}
            </Text>
            <Text style={styles.value}>{data.customer.email}</Text>
            <Text style={[styles.value, { maxWidth: 200 }]}>
              {data.customer.address}
            </Text>
          </View>
          <View style={styles.col}>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Tanggal Isu:</Text>
              <Text style={styles.value}>{formatDate(data.issueDate)}</Text>
            </View>
            <View>
              <Text style={styles.label}>Jatuh Tempo:</Text>
              <Text style={styles.value}>{formatDate(data.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* TABLE ITEMS */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableColDesc}>
              <Text style={styles.textHeader}>Deskripsi</Text>
            </View>
            <View style={styles.tableColQty}>
              <Text style={styles.textHeader}>Qty</Text>
            </View>
            <View style={styles.tableColRate}>
              <Text style={styles.textHeader}>Harga</Text>
            </View>
            <View style={styles.tableColTotal}>
              <Text style={styles.textHeader}>Total</Text>
            </View>
          </View>

          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColDesc}>
                <Text style={styles.textRow}>{item.description}</Text>
              </View>
              <View style={styles.tableColQty}>
                <Text style={styles.textRow}>{item.quantity}</Text>
              </View>
              <View style={styles.tableColRate}>
                <Text style={styles.textRow}>
                  {formatCurrency(item.unitPrice)}
                </Text>
              </View>
              <View style={styles.tableColTotal}>
                <Text style={styles.textRow}>
                  {formatCurrency(item.quantity * item.unitPrice)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.subTotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Pajak ({data.taxRate}%)</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.taxAmount)}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={[styles.totalLabel, { fontWeight: "bold" }]}>
                Total Tagihan
              </Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(data.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ position: "absolute", bottom: 30, left: 30, right: 30 }}>
          <Text style={{ fontSize: 8, textAlign: "center", color: "#9CA3AF" }}>
            Terima kasih atas kepercayaan Anda.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
