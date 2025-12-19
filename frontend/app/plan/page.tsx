"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlanView from "@/components/PlanView";
import { createPlan } from "@/lib/api";
import { PlanResponse, ProfileInput } from "@/lib/types";

export default function PlanPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileInput | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("visaverse_profile");
    if (!stored) {
      router.push("/onboarding");
      return;
    }
    const parsed: ProfileInput = JSON.parse(stored);
    setProfile(parsed);
  }, [router]);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    createPlan(profile)
      .then(setPlan)
      .catch((err) => setError(err.message || "Unable to generate plan"))
      .finally(() => setLoading(false));
  }, [profile]);

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Your plan</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/onboarding" className="text-indigo-600 hover:underline">
            Edit profile
          </Link>
          <Link href="/" className="text-slate-600 hover:underline">
            Home
          </Link>
        </div>
      </div>

      {loading && <p className="text-slate-700">Generating plan...</p>}
      {error && <p className="text-rose-700">{error}</p>}
      {!loading && !error && plan && <PlanView plan={plan} />}
    </main>
  );
}
