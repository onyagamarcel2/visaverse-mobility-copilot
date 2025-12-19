import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";

export default function OnboardingPage() {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Onboarding</h1>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          Back home
        </Link>
      </div>
      <p className="text-slate-700">Share your travel details to build a visa plan.</p>
      <div className="rounded-2xl bg-white p-6 shadow">
        <ProfileForm />
      </div>
    </main>
  );
}
