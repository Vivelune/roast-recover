"use client";
import { useState } from "react";
import { createCompany } from "@/app/actions/company";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCompanyForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createCompany(name);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 max-w-sm">
      <div className="w-10 h-10 rounded-full bg-steam flex items-center justify-center text-ember mb-4">
        <Building2 size={18} />
      </div>
      <h2 className="font-medium text-char mb-1">Create your company</h2>
      <p className="text-ash text-sm mb-4">
        This enables multi-location management, team accounts, and consolidated billing.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          required
          placeholder="e.g. Eleven Coffee Group"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="w-full bg-ember hover:bg-ember-dark">
          {loading ? "Creating..." : "Create company account"}
        </Button>
      </form>
    </Card>
  );
}