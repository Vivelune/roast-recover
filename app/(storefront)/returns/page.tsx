export default function ReturnsPage() {
    return (
      <div className="max-w-3xl mx-auto px-8 py-16">
        <p className="text-xs uppercase tracking-wide text-ember mb-2">Legal</p>
        <h1 className="font-display font-semibold text-3xl text-char mb-2">
          Returns & Warranty Policy
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
  
          <div className="bg-steam/60 border border-steam rounded-lg px-5 py-4">
            <p className="font-medium text-char mb-1">
              Summary (read the full policy below for details)
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Packaging: returnable within 14 days, unused, buyer pays return
                shipping
              </li>
              <li>
                Equipment: no change-of-mind returns — build-to-order model
              </li>
              <li>Equipment warranty: 12 months from delivery against defects</li>
              <li>Deposits: non-refundable after factory order is placed</li>
            </ul>
          </div>
  
          <Section title="Packaging Returns">
            <p>
              We accept returns of packaging products (cups, lids, bags, and
              similar consumables) within{" "}
              <strong>14 days of delivery</strong>, subject to the following
              conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Items must be unused, undamaged, and in original packaging</li>
              <li>
                Partial case returns are not accepted — full cases only
              </li>
              <li>
                Custom or printed packaging (items ordered with your branding) is
                not returnable
              </li>
            </ul>
            <p className="font-medium text-char mt-3">To initiate a return:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Email{" "}
                <a href="mailto:ritual@roastandrecover.com" className="text-ember">
                  ritual@roastandrecover.com
                </a>{" "}
                with your order number and reason for return
              </li>
              <li>We will confirm eligibility within 2 business days</li>
              <li>
                Ship the items back using a trackable carrier — return shipping is
                at your expense
              </li>
              <li>
                Refunds are processed within 5 business days of receiving the
                return in good condition
              </li>
            </ol>
            <p>
              Refunds are issued to your original payment method. Outbound
              shipping costs are not refunded.
            </p>
          </Section>
  
          <Section title="Equipment Returns">
            <p>
              <strong>
                Equipment is built to order and cannot be returned for change of
                mind.
              </strong>{" "}
              Once a factory purchase order is placed (within 2 business days of
              your deposit), the order cannot be cancelled or returned except in
              the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Certification failure</strong> — see Terms of Service
                Section 6. Full refund offered if we cannot source a certified
                replacement within 30 days.
              </li>
              <li>
                <strong>Manufacturing defect on arrival</strong> — if the equipment
                arrives non-functional or with a clear manufacturing defect, we
                will arrange repair, replacement, or refund at our discretion after
                inspection.
              </li>
              <li>
                <strong>Force majeure</strong> — see Terms of Service Section 13.
              </li>
            </ul>
            <p>
              To report a defect on arrival, contact us within{" "}
              <strong>7 days of delivery</strong> with photographs and a
              description of the issue. Claims made after 7 days will be handled
              under the warranty policy below.
            </p>
          </Section>
  
          <Section title="Equipment Warranty">
            <p>
              All equipment carries a{" "}
              <strong>12-month limited warranty</strong> from the date of delivery,
              covering manufacturing defects in materials and workmanship.
            </p>
            <p className="font-medium text-char">What is covered:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Failure of internal components due to manufacturing defect</li>
              <li>
                Electrical failures not caused by improper voltage or power
                conditions
              </li>
              <li>Structural defects in the machine body or housing</li>
            </ul>
            <p className="font-medium text-char mt-3">What is not covered:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Normal wear and tear (gaskets, seals, burrs, shower screens)
              </li>
              <li>
                Damage from scale buildup due to inadequate water filtration
              </li>
              <li>
                Damage from operation outside specified voltage or water pressure
                ranges
              </li>
              <li>Physical damage from drops, impacts, or misuse</li>
              <li>
                Unauthorized repair attempts or modifications
              </li>
              <li>Consumable parts (filters, portafilter baskets, etc.)</li>
            </ul>
            <p className="font-medium text-char mt-3">Warranty claims:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Email{" "}
                <a href="mailto:ritual@roastandrecover.com" className="text-ember">
                  ritual@roastandrecover.com
                </a>{" "}
                with your order number, a description of the fault, and
                photographs or video demonstrating the issue
              </li>
              <li>We will assess the claim within 5 business days</li>
              <li>
                Approved claims: we will arrange repair by a certified technician
                in your area, or ship a replacement part, at our discretion
              </li>
              <li>
                If repair or replacement is not possible, we will issue a refund
                of the purchase price
              </li>
            </ol>
            <p>
              <strong>
                Warranty service does not cover labor costs for technician visits
                unless we have explicitly authorized the technician and the rate in
                writing beforehand.
              </strong>
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
  