import { prisma } from "@/lib/prisma";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default async function AdminCertificationsPage() {
  const certs = await prisma.certification.findMany({
    include: { products: true },
    orderBy: { expiresAt: "asc" },
  });

  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        Certifications
      </h1>
      <p className="text-ash text-sm mb-8">
        Compliance gate — a product must have a valid certification before
        it can be set to active.
      </p>

      <div className="space-y-3">
        {certs.map((cert) => {
          const expired = cert.expiresAt && cert.expiresAt < now;
          const expiringSoon =
            cert.expiresAt && cert.expiresAt < soon && !expired;

          return (
            <Card
              key={cert.id}
              className={`p-5 ${
                expired
                  ? "border-red-300 bg-red-50/30"
                  : expiringSoon
                  ? "border-amber-300 bg-amber-50/30"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 ${
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
                    <p className="text-xs text-ash mt-0.5">
                      {cert.products.map((p) => p.name).join(", ") || "No products linked"}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {cert.verifiedAt && (
                    <p className="text-xs text-ash">
                      Verified{" "}
                      {new Date(cert.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                  {cert.expiresAt && (
                    <p
                      className={`text-xs font-medium mt-0.5 ${
                        expired
                          ? "text-red-600"
                          : expiringSoon
                          ? "text-amber-600"
                          : "text-ash"
                      }`}
                    >
                      {expired ? "Expired " : "Expires "}
                      {new Date(cert.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}