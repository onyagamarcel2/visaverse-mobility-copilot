import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl">VisaVerse Mobility Copilot</h1>
        <p className="mt-3 text-lg text-slate-700">
          Collect a travel profile and generate a structured, Pydantic-validated plan for your
          visa journey.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-white shadow hover:bg-indigo-500"
        >
          Start
        </Link>
      </div>
    </main>
  );
}
