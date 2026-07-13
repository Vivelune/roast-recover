import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ShieldCheck, AlertTriangle, Plus, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DeleteCertificationButton } from "@/components/DeleteButton";

export default async function AdminCertificationsPage() {
  const [certs, equipmentProducts] = await Promise.all([
    prisma.certification.findMany({
      include: { products: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { category: "EQUIPMENT" },
      select: { id: true, name: true, certificationId: true },
    }),
  ]);

  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  async function createCert(formData: FormData) {
    "use server";
    const expiresAt = formData.get("expiresAt") as string;
    const verifiedAt = formData.get("verifiedAt") as string;
    await prisma.certification.create({
      data: {
        type: formData.get("type") as string,
        listingNumber: formData.get("listingNumber") as string,
        documentUrl: formData.get("documentUrl") as string,
        verifiedAt: verifiedAt ? new Date(verifiedAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    revalidatePath("/admin/certifications");
  }

  async function linkProduct(formData: FormData) {
    "use server";
    const certId = formData.get("certId") as string;
    const productId = formData.get("productId") as string;
    await prisma.product.update({
      where: { id: productId },
      data: { certificationId: certId },
    });
    revalidatePath("/admin/certifications");
  }

  async function unlinkProduct(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    await prisma.product.update({
      where: { id: productId },
      data: { certificationId: null },
    });
    revalidatePath("/admin/certifications");
  }

  async function deleteCert(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.product.updateMany({
      where: { certificationId: id },
      data: { certificationId: null },
    });
    await prisma.certification.delete({ where: { id } });
    revalidatePath("/admin/certifications");
  }

  const unlinkedProducts = equipmentProducts.filter((p) => !p.certificationId);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        Certifications
      </h1>

      {/* Explanation */}
      <div className="bg-steam/60 border border-steam rounded-lg px-4 py-3 mb-8 text-sm text-ash leading-relaxed">
        <p className="font-medium text-char mb-1">What certifications do</p>
        <p>
          Every equipment product must have a linked, valid certification before
          it can be sold. This is the UL, NSF, or ETL listing number that
          confirms the machine is safe for commercial use in the US. Link a
          certification to a product using the dropdown on each card below.
          Certifications expiring within 60 days are flagged automatically.
        </p>
      </div>

      {/* Expiry alert banner */}
      {certs.some((c) => c.expiresAt && c.expiresAt < soon) && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>
            One or more certifications are expiring within 60 days. Renew the
            listing with UL/NSF/ETL and update the expiry date below.
          </p>
        </div>
      )}

      {/* Add new certification form */}
      <Card className="p-5 mb-8">
        <p className="text-sm font-medium text-char mb-4 flex items-center gap-2">
          <Plus size={15} /> Add certification
        </p>
        <form action={createCert} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="type">Certification type</Label>
              <select
                id="type"
                name="type"
                required
                className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
              >
                <option value="UL">UL (Underwriters Laboratories)</option>
                <option value="NSF">NSF (National Sanitation Foundation)</option>
                <option value="ETL">ETL (Intertek)</option>
                <option value="UL_NSF">UL + NSF (both)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="listingNumber">Listing number</Label>
              <Input
                id="listingNumber"
                name="listingNumber"
                required
                placeholder="e.g. E123456 or NSF-78901"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="documentUrl">
              Document URL{" "}
              <span className="text-ash text-xs">
                (public listing page or uploaded PDF)
              </span>
            </Label>
            <Input
              id="documentUrl"
              name="documentUrl"
              type="url"
              required
              placeholder="https://ul.com/listings/..."
            />
            <p className="text-xs text-ash">
              Link directly to the UL/NSF/ETL public listing, or upload the
              certification PDF to any file host and paste the URL here.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="verifiedAt">Date verified</Label>
              <Input
                id="verifiedAt"
                name="verifiedAt"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">
                Expiry date{" "}
                <span className="text-ash text-xs">(blank = no expiry)</span>
              </Label>
              <Input id="expiresAt" name="expiresAt" type="date" />
            </div>
          </div>

          <Button type="submit" className="bg-ember hover:bg-ember-dark">
            Add certification
          </Button>
        </form>
      </Card>

      {/* Certification cards */}
      {certs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <ShieldCheck size={24} className="text-ash mx-auto mb-3" />
          <p className="text-char font-medium mb-1">No certifications yet</p>
          <p className="text-ash text-sm">
            Add a certification above, then link it to your equipment products.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certs.map((cert) => {
            const expired = cert.expiresAt && cert.expiresAt < now;
            const expiringSoon =
              cert.expiresAt && cert.expiresAt < soon && !expired;

            const availableToLink = equipmentProducts.filter(
              (p) => !p.certificationId
            );

            return (
              <Card
                key={cert.id}
                className={`p-5 ${
                  expired
                    ? "border-red-300 bg-red-50/20"
                    : expiringSoon
                    ? "border-amber-300 bg-amber-50/20"
                    : ""
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 shrink-0 ${
                        expired
                          ? "text-red-500"
                          : expiringSoon
                          ? "text-amber-500"
                          : "text-ember"
                      }`}
                    >
                      {expired || expiringSoon ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-char">
                        {cert.type} — #{cert.listingNumber}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {cert.verifiedAt && (
                          <p className="text-xs text-ash">
                            Verified{" "}
                            {new Date(cert.verifiedAt).toLocaleDateString()}
                          </p>
                        )}
                        {cert.expiresAt ? (
                          <p
                            className={`text-xs font-medium ${
                              expired
                                ? "text-red-600"
                                : expiringSoon
                                ? "text-amber-600"
                                : "text-ash"
                            }`}
                          >
                            {expired ? "Expired" : "Expires"}{" "}
                            {new Date(cert.expiresAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-xs text-ash">No expiry date</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                                  {cert.documentUrl && (
                  <a
                    href={cert.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ember flex items-center gap-1 hover:underline"
                  >
                    View doc <ExternalLink size={11} />
                  </a>
                )}
                    <form action={deleteCert}>
                      <input type="hidden" name="id" value={cert.id} />
                      <DeleteCertificationButton />
                    </form>
                  </div>
                </div>

                <Separator className="mb-4" />

                {/* Linked products */}
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-ash mb-2">
                    Linked products
                  </p>
                  {cert.products.length === 0 ? (
                    <p className="text-sm text-ash italic">
                      No products linked yet — use the dropdown below to link one.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {cert.products.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between bg-steam/50 rounded-md px-3 py-2"
                        >
                          <p className="text-sm text-char">{p.name}</p>
                          <form action={unlinkProduct}>
                            <input
                              type="hidden"
                              name="productId"
                              value={p.id}
                            />
                            <button
                              type="submit"
                              className="text-xs text-ash hover:text-red-500 transition-colors"
                            >
                              Unlink
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Link a product dropdown */}
                {availableToLink.length > 0 ? (
                  <form
                    action={linkProduct}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="certId" value={cert.id} />
                    <select
                      name="productId"
                      required
                      className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
                    >
                      <option value="">
                        Link an equipment product to this cert...
                      </option>
                      {availableToLink.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      Link
                    </Button>
                  </form>
                ) : (
                  <p className="text-xs text-ash">
                    All equipment products are already linked to a certification.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}