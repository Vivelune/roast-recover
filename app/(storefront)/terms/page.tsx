export default function TermsPage() {
    return (
      <div className="max-w-3xl mx-auto px-8 py-16">
        <p className="text-xs uppercase tracking-wide text-ember mb-2">Legal</p>
        <h1 className="font-display font-semibold text-3xl text-char mb-2">
          Terms of Service
        </h1>
        <p className="text-ash text-sm mb-10">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
  
        <div className="prose prose-sm max-w-none space-y-8 text-ash leading-relaxed">
  
          <Section title="1. About Roast & Recover">
            <p>
              Roast & Recover LLC ("Company," "we," "us," or "our") is a United
              States limited liability company that operates roastandrecover.com
              (the "Platform"). We source and supply commercial espresso equipment,
              grinders, and café packaging materials to business customers in the
              United States and internationally.
            </p>
            <p>
              Our equipment is sourced from manufacturing partners primarily
              located in the People's Republic of China. We act as the importer of
              record for all equipment shipped to United States addresses. We are
              not a manufacturer.
            </p>
            <p>
              These Terms of Service ("Terms") govern all purchases made through
              the Platform. By placing an order, you agree to be bound by these
              Terms. These Terms constitute a binding commercial agreement between
              two business entities — they are not subject to consumer protection
              laws that apply to individual consumers.
            </p>
            <p>
              <strong>You represent and warrant that you are purchasing as a
              business entity or for business use, not as a consumer.</strong>
            </p>
          </Section>
  
          <Section title="2. Orders and the Build-to-Order Model">
            <p>
              All equipment listed on the Platform is sourced on a
              <strong> build-to-order basis</strong>. We do not maintain a
              warehouse of finished inventory. When you place an equipment order:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Your deposit payment triggers a purchase order to our manufacturing
                partner
              </li>
              <li>
                The machine is built, quality-tested, and certified to your
                specific order
              </li>
              <li>
                The balance payment is invoiced once the machine is ready to ship
              </li>
              <li>
                Shipment occurs after balance payment is received in full
              </li>
            </ul>
            <p>
              Packaging products (cups, lids, bags, and similar consumables) are
              not build-to-order and are subject to standard e-commerce order
              terms.
            </p>
          </Section>
  
          <Section title="3. Deposits — Equipment Orders">
            <p>
              Equipment orders require a deposit, expressed as a percentage of the
              total order value and displayed clearly on each product page before
              checkout.
            </p>
            <p>
              <strong>
                Deposits are non-refundable once the factory purchase order has
                been placed.
              </strong>{" "}
              We place the factory purchase order within 2 business days of
              receiving your deposit. You may cancel and receive a full deposit
              refund only if you notify us in writing at{" "}
              <a href="mailto:ritual@roastandrecover.com" className="text-ember">
                ritual@roastandrecover.com
              </a>{" "}
              within 24 hours of your order being placed.
            </p>
            <p>
              After the factory purchase order is placed, cancellation is not
              available. We will complete the order and invoice the balance
              payment.
            </p>
          </Section>
  
          <Section title="4. Balance Payments — Equipment Orders">
            <p>
              When your equipment is ready to ship, we will send a secure payment
              link to your registered email address for the remaining balance.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                The balance payment link is valid for 14 days from the date of
                issue
              </li>
              <li>
                If balance payment is not received within 14 days, we reserve the
                right to charge a storage fee of $50 per machine per week, deducted
                from any eventual payment
              </li>
              <li>
                If balance payment is not received within 60 days, we reserve the
                right to resell the equipment and retain the deposit as liquidated
                damages
              </li>
            </ul>
            <p>
              Equipment does not ship until the balance is paid in full.
            </p>
          </Section>
  
          <Section title="5. Lead Times">
            <p>
              Lead times displayed on product pages are estimates based on typical
              manufacturing and shipping timelines. They are{" "}
              <strong>not guaranteed delivery dates.</strong>
            </p>
            <p>
              Actual lead times may vary due to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Manufacturing capacity at our factory partners</li>
              <li>
                Shipping delays, including port congestion, carrier delays, or
                adverse weather
              </li>
              <li>
                Customs clearance at US ports of entry (for US-bound shipments)
              </li>
              <li>
                Import documentation processing
              </li>
              <li>
                Force majeure events (see Section 13)
              </li>
            </ul>
            <p>
              We will notify you by email if your order is delayed by more than 7
              business days beyond the estimated lead time. Delays do not entitle
              you to cancel an order or reclaim a deposit.
            </p>
          </Section>
  
          <Section title="6. Equipment Certifications">
            <p>
              We source only equipment models that carry applicable US safety
              certifications (UL, NSF, ETL, or equivalent) at the time of listing.
              Certification information, including listing numbers and document
              links, is displayed on each equipment product page.
            </p>
            <p>
              <strong>
                We verify certifications at the time of listing and re-verify
                before each shipment. However, we make no warranty that
                certifications will satisfy the requirements of any specific
                jurisdiction, municipality, landlord, or insurance provider.
              </strong>{" "}
              It is your responsibility to confirm that the equipment meets the
              requirements of your specific installation location before ordering.
            </p>
            <p>
              In the unlikely event that a specific unit fails certification
              re-verification before shipment:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                We will notify you immediately and pause the order
              </li>
              <li>
                We will offer a replacement unit from a certified batch at no
                additional cost, with a revised lead time
              </li>
              <li>
                If no certified replacement is available within 30 days, we will
                offer a full refund of all amounts paid
              </li>
            </ul>
            <p>
              This is our sole obligation in the event of a certification failure.
            </p>
          </Section>
  
          <Section title="7. Pricing">
            <p>
              All prices are displayed in US Dollars (USD). Prices are subject to
              change without notice until an order is placed. Once an order is
              placed and a deposit is paid, the price is locked.
            </p>
            <p>
              Prices do not include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Applicable sales tax (charged where required by law)
              </li>
              <li>
                Import duties, customs fees, or taxes for shipments outside the
                United States (the recipient is the importer of record for
                international orders and is solely responsible for all import
                costs)
              </li>
              <li>
                Installation, commissioning, or training
              </li>
            </ul>
          </Section>
  
          <Section title="8. Shipping and Risk of Loss">
            <p>
              Risk of loss and title to equipment passes to you upon delivery to
              the carrier at the origin facility ("FOB Origin"). Once the equipment
              is in the possession of the carrier, we are not liable for loss,
              damage, delay, or misdelivery.
            </p>
            <p>
              For packaging products, standard parcel shipping terms apply. We
              will provide tracking information when available.
            </p>
            <p>
              If your shipment arrives visibly damaged:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Document the damage with photographs before accepting or opening
                the shipment
              </li>
              <li>
                Refuse the delivery if damage is severe, or note the damage on the
                carrier's delivery receipt
              </li>
              <li>
                Notify us at{" "}
                <a href="mailto:ritual@roastandrecover.com" className="text-ember">
                  ritual@roastandrecover.com
                </a>{" "}
                within 48 hours of delivery with photographs
              </li>
            </ul>
            <p>
              We will assist with carrier claims but do not guarantee outcomes.
              <strong>
                {" "}
                We strongly recommend purchasing freight insurance for equipment
                orders, which we can arrange on request.
              </strong>
            </p>
          </Section>
  
          <Section title="9. Returns and Refunds">
            <p>
              Please review our{" "}
              <a href="/returns" className="text-ember">
                Returns & Warranty Policy
              </a>{" "}
              for full details.
            </p>
            <p>
              In summary:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Packaging products (cups, lids, bags): returns accepted within 14
                days of delivery for unused, undamaged goods in original packaging.
                Return shipping is at the buyer's expense.
              </li>
              <li>
                Equipment: no returns except in cases of confirmed manufacturing
                defect or certification failure as described in Section 6. Change
                of mind returns are not accepted for build-to-order equipment.
              </li>
              <li>
                Deposits: non-refundable as described in Section 3.
              </li>
            </ul>
          </Section>
  
          <Section title="10. Warranties">
            <p>
              Equipment carries a{" "}
              <strong>12-month limited warranty</strong> against manufacturing
              defects from the date of delivery. This warranty covers repair or
              replacement (at our sole discretion) of confirmed manufacturing
              defects. It does not cover:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Normal wear and tear</li>
              <li>
                Damage from improper use, installation, or maintenance
              </li>
              <li>Damage from water quality issues (scale buildup, corrosion)</li>
              <li>
                Unauthorized modifications or repairs
              </li>
              <li>Damage in transit (covered separately by freight insurance)</li>
            </ul>
            <p>
              Packaging products carry no warranty beyond a right of return for
              defective or damaged goods within 14 days of delivery.
            </p>
            <p>
              <strong>
                EXCEPT AS EXPRESSLY SET FORTH IN THIS SECTION, WE DISCLAIM ALL
                WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                NON-INFRINGEMENT. THIS DISCLAIMER APPLIES TO THE MAXIMUM EXTENT
                PERMITTED BY APPLICABLE LAW.
              </strong>
            </p>
          </Section>
  
          <Section title="11. Limitation of Liability">
            <p>
              <strong>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
                SHALL ROAST & RECOVER LLC, ITS MEMBERS, OFFICERS, EMPLOYEES,
                AGENTS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF
                PROFITS, LOSS OF REVENUE, LOSS OF DATA, OR BUSINESS INTERRUPTION,
                ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF
                THE PLATFORM, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF
                SUCH DAMAGES.
              </strong>
            </p>
            <p>
              <strong>
                OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF
                OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT
                EXCEED THE TOTAL AMOUNT PAID BY YOU TO US IN THE 12 MONTHS
                PRECEDING THE CLAIM.
              </strong>
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of
              incidental or consequential damages, so the above limitations may
              not apply to you in full.
            </p>
          </Section>
  
          <Section title="12. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Roast & Recover
              LLC and its members, officers, employees, and agents from and against
              any claims, liabilities, damages, judgments, awards, losses, costs,
              expenses, or fees (including reasonable attorneys' fees) arising out
              of or relating to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your use of the equipment or packaging</li>
              <li>
                Your violation of these Terms
              </li>
              <li>
                Any claim that your use of the equipment caused injury, property
                damage, or other harm to a third party
              </li>
              <li>
                Your failure to comply with applicable laws and regulations in your
                jurisdiction
              </li>
            </ul>
          </Section>
  
          <Section title="13. Force Majeure">
            <p>
              We are not liable for any delay or failure to perform our obligations
              under these Terms if such delay or failure results from circumstances
              beyond our reasonable control, including but not limited to: acts of
              God, war, terrorism, pandemic, government action, trade restrictions,
              port closures, factory shutdowns, natural disasters, or disruptions
              to international shipping routes.
            </p>
            <p>
              In the event of a force majeure delay exceeding 90 days, either
              party may terminate the affected order in writing, and we will refund
              any amounts paid for goods not yet shipped.
            </p>
          </Section>
  
          <Section title="14. Dispute Resolution">
            <p>
              These Terms are governed by the laws of the State of Wyoming, United States, without regard to its conflict of law
              provisions.
            </p>
            <p>
              Any dispute arising out of or in connection with these Terms shall
              first be subject to good-faith negotiation between the parties for a
              period of 30 days. If the dispute is not resolved through
              negotiation, it shall be resolved by binding arbitration administered
              by the American Arbitration Association under its Commercial
              Arbitration Rules. The arbitration shall take place in Wyoming. The arbitration award shall be final and binding and may be
              entered as a judgment in any court of competent jurisdiction.
            </p>
            <p>
              <strong>
                YOU WAIVE ANY RIGHT TO A JURY TRIAL OR TO PARTICIPATE IN A CLASS
                ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
              </strong>
            </p>
            <p>
              Nothing in this section prevents either party from seeking
              injunctive or other equitable relief for breach of confidentiality
              obligations or intellectual property rights.
            </p>
          </Section>
  
          <Section title="15. General">
            <p>
              <strong>Entire Agreement.</strong> These Terms, together with our
              Privacy Policy, Shipping Policy, and Returns Policy, constitute the
              entire agreement between you and us regarding the Platform and
              supersede all prior agreements.
            </p>
            <p>
              <strong>Severability.</strong> If any provision of these Terms is
              found to be unenforceable, that provision will be modified to the
              minimum extent necessary to make it enforceable, and the remaining
              provisions will continue in full force.
            </p>
            <p>
              <strong>Waiver.</strong> Our failure to enforce any right or
              provision of these Terms will not constitute a waiver of that right
              or provision.
            </p>
            <p>
              <strong>Contact.</strong> Questions about these Terms should be sent
              to{" "}
              <a href="mailto:ritual@roastandrecover.com" className="text-ember">
                ritual@roastandrecover.com
              </a>.
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