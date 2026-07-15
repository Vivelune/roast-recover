import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrCreateReferralCode, getStoreCreditBalance } from "@/app/actions/referral";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Gift, Copy, Users, CheckCircle2, Clock,
} from "lucide-react";
import ReferralShareButton from "@/components/ReferralShareButton";

export default async function ReferralsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [referralCode, creditBalance] = await Promise.all([
    getOrCreateReferralCode(),
    getStoreCreditBalance(user.id),
  ]);

  const referralUrl = `${process.env.NEXT_PUBLIC_URL}?ref=${referralCode.code}`;
  const qualified = referralCode.referrals.filter(
    (r) => r.status === "credited"
  ).length;
  const pending = referralCode.referrals.filter(
    (r) => r.status === "pending" || r.status === "qualified"
  ).length;

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        Referrals
      </h1>
      <p className="text-ash text-sm mb-8">
        Refer other café operators and earn $20 store credit when they place
        their first order.
      </p>

      {/* Credit balance */}
      {creditBalance > 0 && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
          <Gift size={16} className="text-green-600" />
          <p className="text-sm text-green-800">
            You have{" "}
            <strong>${(creditBalance / 100).toFixed(0)} store credit</strong>{" "}
            — applied automatically on your next packaging order.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center">
          <p className="font-display font-semibold text-2xl text-char">
            {referralCode.referrals.length}
          </p>
          <p className="text-xs text-ash mt-0.5">Total referrals</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-display font-semibold text-2xl text-char">
            {qualified}
          </p>
          <p className="text-xs text-ash mt-0.5">Credits earned</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="font-display font-semibold text-2xl text-ember">
            ${(qualified * 20).toFixed(0)}
          </p>
          <p className="text-xs text-ash mt-0.5">Total earned</p>
        </Card>
      </div>

      {/* Share card */}
      <Card className="p-6 mb-8 bg-steam/30">
        <p className="text-sm font-medium text-char mb-1">
          Your referral link
        </p>
        <p className="text-xs text-ash mb-4">
          Share this with café owners — when they sign up and place their first
          order, you both benefit.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 border border-border rounded-md px-3 py-2.5 text-sm text-char bg-white font-mono truncate">
            {referralUrl}
          </div>
          <ReferralShareButton url={referralUrl} code={referralCode.code} />
        </div>

        <div className="text-xs text-ash space-y-1">
          <p>
            Or share your code:{" "}
            <span className="font-mono font-medium text-char bg-steam px-2 py-0.5 rounded">
              {referralCode.code}
            </span>
          </p>
        </div>
      </Card>

      {/* Referral history */}
      {referralCode.referrals.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-ash mb-3">
            Referral history
          </p>
          <div className="space-y-2">
            {referralCode.referrals.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border border-border rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      r.status === "credited"
                        ? "bg-green-50 text-green-600"
                        : "bg-steam text-ash"
                    }`}
                  >
                    {r.status === "credited" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-char">{r.refereeEmail}</p>
                    <p className="text-xs text-ash">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === "credited" && (
                    <span className="text-xs text-green-700 font-medium">
                      +$20
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      r.status === "credited"
                        ? "bg-green-50 text-green-700 border-green-200 text-[10px]"
                        : "text-[10px]"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}