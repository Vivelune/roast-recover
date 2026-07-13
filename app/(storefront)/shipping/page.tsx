export default function ShippingPage() {
    return (
      <div className="max-w-3xl mx-auto px-8 py-16">
        <p className="text-xs uppercase tracking-wide text-ember mb-2">Legal</p>
        <h1 className="font-display font-semibold text-3xl text-char mb-2">
          Shipping Policy
        </h1>
        <p className="text-ash text-sm mb-10">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
  
        <div className="space-y-8 text-ash leading-relaxed text-sm">
  
          <Section title="Equipment Shipping">
            <p>
              All equipment is sourced on a build-to-order basis. Estimated lead
              times are displayed on each product page and represent the time from
              deposit payment to shipment — not to delivery.
            </p>
            <p className="font-medium text-char">Typical lead times:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Espresso machines: 14–28 business days</li>
              <li>Commercial grinders: 10–21 business days</li>
            </ul>
            <p>
              Lead times are estimates and may be affected by manufacturing
              capacity, shipping conditions, and customs clearance. See our Terms
              of Service Section 5 for details.
            </p>
            <p className="font-medium text-char mt-3">Shipping method:</p>
            <p>
              Equipment ships via international freight (sea or air depending on
              size and urgency) from our manufacturing partners' facilities. For
              US domestic delivery, equipment is cleared through US customs by
              Roast & Recover LLC as the importer of record, then delivered via
              freight carrier to your address.
            </p>
            <p className="font-medium text-char mt-3">
              Delivery requirements:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Equipment is delivered to the curbside or loading dock. We do not
                include inside delivery or installation unless separately agreed in
                writing.
              </li>
              <li>
                Someone must be present to receive and sign for equipment delivery.
                Re-delivery fees may apply for missed deliveries.
              </li>
              <li>
                Please inspect equipment for visible damage before signing the
                delivery receipt. See our Terms of Service Section 8 for damage
                claims procedures.
              </li>
            </ul>
          </Section>
  
          <Section title="Packaging Shipping">
            <p>
              Packaging products (cups, lids, bags) are shipped from US fulfillment
              locations via standard parcel carriers (UPS, FedEx, USPS).
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Processing time:</strong> 1–3 business days after payment
              </li>
              <li>
                <strong>Standard shipping:</strong> 3–7 business days after
                dispatch (continental US)
              </li>
              <li>
                <strong>Tracking:</strong> provided by email when your order
                ships
              </li>
            </ul>
            <p>
              Expedited shipping options may be available at checkout depending on
              your location and order size.
            </p>
          </Section>
  
          <Section title="International Shipping">
            <p>
              We currently ship equipment to the United States only. Packaging
              products may be available for international shipping — contact us at{" "}
              <a href="mailto:ritual@roastandrecover.com" className="text-ember">
                ritual@roastandrecover.com
              </a>{" "}
              for a quote.
            </p>
            <p>
              For international orders, the buyer is responsible for all import
              duties, customs fees, taxes, and compliance with local import
              regulations. Roast & Recover LLC is not responsible for items held
              at customs or subject to import restrictions.
            </p>
          </Section>
  
          <Section title="Freight Insurance">
            <p>
              We strongly recommend purchasing freight insurance for all equipment
              orders. Standard carrier liability is limited and may not cover the
              full value of your equipment in the event of loss or damage.
            </p>
            <p>
              We can arrange freight insurance on your behalf — contact us before
              your order ships to request this. The cost of insurance will be added
              to your balance payment.
            </p>
          </Section>
  
          <Section title="Subscriptions (Packaging Auto-Reorder)">
            <p>
              Packaging subscription orders are processed on your billing cycle and
              ship within 3 business days of each billing date. Tracking
              information is emailed when each subscription order ships.
            </p>
          </Section>
  
        </div>
      </div>
    );
  }
  
  function Section({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section>
        <h2 className="font-display font-semibold text-lg text-char mb-3 pb-2 border-b border-border">
          {title}
        </h2>
        <div className="space-y-3">{children}</div>
      </section>
    );
  }