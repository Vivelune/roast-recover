import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ShieldCheck, AlertTriangle, Plus, ExternalLink, Package, Trash2 } from "lucide-react";
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
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-3">
          Certifications
        </h1>
        {/* Explanation banner */}
        <div className="bg-steam/40 border border-gray-150 rounded-2xl px-5 py-4 text-sm text-ash leading-relaxed">
          <p className="font-bold text-char mb-1">Commercial Safety Standards</p>
          <p>
            Every equipment listing must link to a valid certification before being eligible for sale. 
            This confirms the machine's safety listing (UL, NSF, or ETL) for commercial environments. 
            Use the tools below to register new certificates and map them to their corresponding equipment.
          </p>
        </div>
      </div>

      {/* Expiry Alert Banner */}
      {certs.some((c) => c.expiresAt && c.expiresAt < soon) && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-900 shadow-sm">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Certifications Expiring Soon</p>
            <p className="text-amber-800 mt-0.5">
              One or more certifications are expiring within the next 60 days. Please secure renewed listings and update the dates below.
            </p>
          </div>
        </div>
      )}

      {/* Register New Certification Form */}
      <Card className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
        <h2 className="font-bold text-char text-base mb-6 flex items-center gap-2">
          <Plus size={18} /> Register New Certification
        </h2>
        <form action={createCert} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-char">Certification Type</Label>
              <select
                id="type"
                name="type"
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold bg-white text-char focus:outline-none focus:ring-1 focus:ring-char"
              >
                <option value="UL">UL (Underwriters Laboratories)</option>
                <option value="NSF">NSF (National Sanitation Foundation)</option>
                <option value="ETL">ETL (Intertek)</option>
                <option value="UL_NSF">UL + NSF (Both)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="listingNumber" className="text-xs font-bold uppercase tracking-wider text-char">Listing / File Number</Label>
              <Input
                id="listingNumber"
                name="listingNumber"
                required
                className="rounded-xl border-gray-200 focus-visible:ring-char"
                placeholder="e.g. E123456 or NSF-78901"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="documentUrl" className="text-xs font-bold uppercase tracking-wider text-char">
              Document URL <span className="text-ash font-normal normal-case">(Public Database Link or Hosted PDF)</span>
            </Label>
            <Input
              id="documentUrl"
              name="documentUrl"
              type="url"
              required
              className="rounded-xl border-gray-200 focus-visible:ring-char"
              placeholder="https://ul.com/listings/..."
            />
            <p className="text-[11px] text-ash font-medium leading-relaxed">
              Link directly to the directory status page, or input a cloud-hosted link to the safety PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="verifiedAt" className="text-xs font-bold uppercase tracking-wider text-char">Date Verified</Label>
              <Input
                id="verifiedAt"
                name="verifiedAt"
                type="date"
                className="rounded-xl border-gray-200 focus-visible:ring-char"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt" className="text-xs font-bold uppercase tracking-wider text-char">
                Expiry Date <span className="text-ash font-normal normal-case">(Leave blank if indefinite)</span>
              </Label>
              <Input 
                id="expiresAt" 
                name="expiresAt" 
                type="date" 
                className="rounded-xl border-gray-200 focus-visible:ring-char"
              />
            </div>
          </div>

          <Button type="submit" className="bg-char hover:bg-char/90 text-white rounded-xl h-11 px-6 font-bold uppercase tracking-wider text-xs">
            Save Certification
          </Button>
        </form>
      </Card>

      {/* Active Listings Grid */}
      <div className="space-y-6">
        <h2 className="font-bold text-char text-lg">Active Listings</h2>

        {certs.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl">
            <ShieldCheck size={32} className="text-ash mx-auto mb-3" />
            <p className="text-char font-semibold">No certifications currently on file</p>
            <p className="text-ash text-xs mt-1">Register a standard above to map it with active equipment listings.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {certs.map((cert) => {
              const expired = cert.expiresAt && cert.expiresAt < now;
              const expiringSoon = cert.expiresAt && cert.expiresAt < soon && !expired;

              const availableToLink = equipmentProducts.filter(
                (p) => !p.certificationId
              );

              return (
                <Card
                  key={cert.id}
                  className={`p-6 border rounded-2xl transition-all ${
                    expired
                      ? "border-red-200 bg-red-50/10"
                      : expiringSoon
                      ? "border-amber-200 bg-amber-50/10"
                      : "border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
                  }`}
                >
                  {/* Card Header Block */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                    <div className="flex gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 ${
                          expired
                            ? "bg-red-100 text-red-600 border-red-200"
                            : expiringSoon
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-steam text-char border-gray-200/40"
                        }`}
                      >
                        {expired || expiringSoon ? (
                          <AlertTriangle size={18} />
                        ) : (
                          <ShieldCheck size={18} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-char text-sm sm:text-base">
                          {cert.type} — File #{cert.listingNumber}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ash font-medium">
                          {cert.verifiedAt && (
                            <span>
                              Verified {new Date(cert.verifiedAt).toLocaleDateString()}
                            </span>
                          )}
                          {cert.verifiedAt && cert.expiresAt && <span className="text-gray-250">•</span>}
                          {cert.expiresAt ? (
                            <span
                              className={
                                expired
                                  ? "text-red-600 font-semibold"
                                  : expiringSoon
                                  ? "text-amber-700 font-semibold"
                                  : ""
                              }
                            >
                              {expired ? "Expired" : "Expires"}{" "}
                              {new Date(cert.expiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span>Indefinite Validity</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta Action Buttons */}
                    <div className="flex items-center gap-3.5 shrink-0 self-end sm:self-start">
                      {cert.documentUrl && (
                        <a
                          href={cert.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-char hover:text-ember flex items-center gap-1 transition-colors"
                        >
                          View directory status <ExternalLink size={12} />
                        </a>
                      )}
                      <span className="text-gray-200 hidden sm:inline">|</span>
                      <form action={deleteCert}>
                        <input type="hidden" name="id" value={cert.id} />
                        <DeleteCertificationButton />
                      </form>
                    </div>
                  </div>

                  <Separator className="my-5 border-gray-100" />

                  {/* Linked Products Tags Section */}
                  <div className="space-y-3 mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ash flex items-center gap-1.5">
                      <Package size={12} /> Registered Products
                    </p>
                    {cert.products.length === 0 ? (
                      <p className="text-xs text-ash italic leading-normal">
                        No equipment catalog entries associated with this registry file.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {cert.products.map((p) => (
                          <div
                            key={p.id}
                            className="inline-flex items-center gap-2 bg-[#FBFBFA] border border-gray-150 rounded-lg pl-3 pr-2 py-1.5 text-xs text-char font-semibold"
                          >
                            <span>{p.name}</span>
                            <form action={unlinkProduct}>
                              <input
                                type="hidden"
                                name="productId"
                                value={p.id}
                              />
                              <button
                                type="submit"
                                className="text-ash hover:text-red-600 transition-colors focus:outline-none p-0.5 rounded-md hover:bg-red-50"
                                title="Unlink product"
                              >
                                <Trash2 size={12} />
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Association Controls (Link a Product) */}
                  {availableToLink.length > 0 ? (
                    <form
                      action={linkProduct}
                      className="flex gap-2 items-center"
                    >
                      <input type="hidden" name="certId" value={cert.id} />
                      <select
                        name="productId"
                        required
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-char bg-white focus:outline-none focus:ring-1 focus:ring-char"
                      >
                        <option value="">
                          Select equipment to assign...
                        </option>
                        {availableToLink.map((p) => (
                          <option key={p.id} value={p.id} className="text-xs">
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-char text-white hover:bg-char/90 text-xs font-bold uppercase tracking-wider rounded-xl px-4 shrink-0 h-[34px]"
                      >
                        Link
                      </Button>
                    </form>
                  ) : (
                    <p className="text-[11px] font-medium text-ash">
                      All catalog machinery is current with active compliance records.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}