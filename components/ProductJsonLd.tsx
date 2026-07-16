export default function ProductJsonLd({
    name,
    description,
    image,
    priceCents,
    availability,
    brand = "Roast & Recover",
    sku,
  }: {
    name: string;
    description: string;
    image?: string;
    priceCents: number;
    availability: "InStock" | "OutOfStock" | "PreOrder";
    brand?: string;
    sku: string;
  }) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description,
      sku,
      brand: { "@type": "Brand", name: brand },
      offers: {
        "@type": "Offer",
        url: typeof window !== "undefined" ? window.location.href : "",
        priceCurrency: "USD",
        price: (priceCents / 100).toFixed(2),
        availability: `https://schema.org/${availability}`,
        seller: { "@type": "Organization", name: "Roast & Recover LLC" },
      },
      ...(image && { image }),
    };
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  }