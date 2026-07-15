import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 48,
    color: "#0E0B08",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0E0B08",
  },
  brandAccent: {
    color: "#B5481F",
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#0E0B08",
    marginBottom: 4,
  },
  invoiceNum: {
    fontSize: 11,
    color: "#7A6A58",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#7A6A58",
    marginBottom: 6,
  },
  value: {
    fontSize: 10,
    color: "#0E0B08",
    lineHeight: 1.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e1db",
    marginVertical: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e1db",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0ece6",
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "right" },
  colHeader: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#7A6A58",
    fontFamily: "Helvetica-Bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#0E0B08",
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginRight: 32,
  },
  totalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 36,
    left: 48,
    right: 48,
  },
  footerText: {
    fontSize: 8,
    color: "#7A6A58",
    textAlign: "center",
  },
});

type InvoiceData = {
  invoiceNum: string;
  issuedAt: Date;
  order: {
    id: string;
    items: {
      product: { name: string };
      quantity: number;
      unitPriceCents: number;
    }[];
    shippingAddress: {
      line1: string;
      line2?: string | null;
      city: string;
      state: string;
      zip: string;
    } | null;
  };
  user: { name: string | null; email: string; company?: { name: string } | null };
  totalCents: number;
};

function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>
              roast<Text style={styles.brandAccent}>&</Text>recover
            </Text>
            <Text style={{ fontSize: 9, color: "#7A6A58", marginTop: 4 }}>
              Roast & Recover LLC
            </Text>
            <Text style={{ fontSize: 9, color: "#7A6A58" }}>
              ritual@roastandrecover.com
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNum}>{data.invoiceNum}</Text>
            <Text style={{ fontSize: 9, color: "#7A6A58", marginTop: 4 }}>
              Issued: {data.issuedAt.toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill to */}
        <View style={[styles.section, { flexDirection: "row", gap: 48 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Bill to</Text>
            <Text style={styles.value}>
              {data.user.company?.name ?? data.user.name ?? data.user.email}
            </Text>
            <Text style={[styles.value, { color: "#7A6A58" }]}>
              {data.user.email}
            </Text>
          </View>
          {data.order.shippingAddress && (
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ship to</Text>
              <Text style={styles.value}>
                {data.order.shippingAddress.line1}
              </Text>
              {data.order.shippingAddress.line2 && (
                <Text style={styles.value}>
                  {data.order.shippingAddress.line2}
                </Text>
              )}
              <Text style={styles.value}>
                {data.order.shippingAddress.city},{" "}
                {data.order.shippingAddress.state}{" "}
                {data.order.shippingAddress.zip}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Order reference</Text>
            <Text style={styles.value}>
              #{data.order.id.slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Line items */}
        <View style={styles.tableHeader}>
          <View style={styles.col1}>
            <Text style={styles.colHeader}>Description</Text>
          </View>
          <View style={styles.col2}>
            <Text style={styles.colHeader}>Qty</Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.colHeader}>Amount</Text>
          </View>
        </View>

        {data.order.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={styles.value}>{item.product.name}</Text>
              <Text style={{ fontSize: 9, color: "#7A6A58" }}>
                ${(item.unitPriceCents / 100).toFixed(2)} per unit
              </Text>
            </View>
            <View style={styles.col2}>
              <Text style={styles.value}>{item.quantity}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.value}>
                ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total (USD)</Text>
          <Text style={styles.totalValue}>
            ${(data.totalCents / 100).toFixed(2)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <Text style={styles.footerText}>
            Roast & Recover LLC · roastandrecover.com ·
            ritual@roastandrecover.com · Thank you for your business.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(
  data: InvoiceData
): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument data={data} />);
}