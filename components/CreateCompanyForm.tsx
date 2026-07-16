"use client";

import { useState } from "react";
import { createCompany } from "@/app/actions/company";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
    <Card className="p-6 max-w-md border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
      <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center text-[#B5481F] mb-4 border border-gray-100">
        <Building2 size={20} />
      </div>
      
      <h2 className="font-display font-semibold text-lg text-char tracking-tight mb-1">
        Create your company profile
      </h2>
      <p className="text-ash text-xs font-medium leading-relaxed mb-5">
        This configurations framework activates multi-location tracking, unified member permission routing, and consolidated commercial billing pipelines.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">
            Company / Legal Entity Name
          </Label>
          <Input
            required
            placeholder="e.g. Eleven Coffee Group"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 font-bold uppercase tracking-wider text-xs transition-colors"
        >
          {loading ? "Creating corporate space..." : "Create company account"}
        </Button>
      </form>
    </Card>
  );
}