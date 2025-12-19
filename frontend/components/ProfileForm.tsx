"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileInput } from "@/lib/types";

const defaultProfile: ProfileInput = {
  origin_country: "CM",
  destination_country: "FR",
  purpose: "STUDY",
  planned_departure_date: new Date().toISOString().slice(0, 10),
  duration_months: 6,
  passport_expiry_date: new Date().toISOString().slice(0, 10),
  has_sponsor: true,
  proof_of_funds_level: "MEDIUM",
  language: "EN",
  notes: "",
};

interface Props {
  onSubmit?: (profile: ProfileInput) => void;
}

export default function ProfileForm({ onSubmit }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileInput>(defaultProfile);

  useEffect(() => {
    const stored = localStorage.getItem("visaverse_profile");
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const handleChange = (
    key: keyof ProfileInput,
    value: string | boolean | number
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("visaverse_profile", JSON.stringify(profile));
    onSubmit?.(profile);
    router.push("/plan");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Origin country</span>
          <input
            className="rounded border px-3 py-2"
            value={profile.origin_country}
            onChange={(e) => handleChange("origin_country", e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Destination country</span>
          <input
            className="rounded border px-3 py-2"
            value={profile.destination_country}
            onChange={(e) => handleChange("destination_country", e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Purpose</span>
          <select
            className="rounded border px-3 py-2"
            value={profile.purpose}
            onChange={(e) => handleChange("purpose", e.target.value as ProfileInput["purpose"])}
            required
          >
            <option value="STUDY">Study</option>
            <option value="WORK">Work</option>
            <option value="TOURISM">Tourism</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Language</span>
          <select
            className="rounded border px-3 py-2"
            value={profile.language}
            onChange={(e) => handleChange("language", e.target.value as ProfileInput["language"])}
          >
            <option value="EN">English</option>
            <option value="FR">French</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Planned departure date</span>
          <input
            type="date"
            className="rounded border px-3 py-2"
            value={profile.planned_departure_date}
            onChange={(e) => handleChange("planned_departure_date", e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Passport expiry date</span>
          <input
            type="date"
            className="rounded border px-3 py-2"
            value={profile.passport_expiry_date}
            onChange={(e) => handleChange("passport_expiry_date", e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Duration (months)</span>
          <input
            type="number"
            min={1}
            className="rounded border px-3 py-2"
            value={profile.duration_months}
            onChange={(e) => handleChange("duration_months", Number(e.target.value))}
            required
          />
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={profile.has_sponsor}
            onChange={(e) => handleChange("has_sponsor", e.target.checked)}
          />
          <span className="text-sm font-medium">I have a sponsor</span>
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium">Proof of funds level</span>
          <select
            className="rounded border px-3 py-2"
            value={profile.proof_of_funds_level}
            onChange={(e) =>
              handleChange("proof_of_funds_level", e.target.value as ProfileInput["proof_of_funds_level"])
            }
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            className="rounded border px-3 py-2"
            value={profile.notes}
            rows={3}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </label>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white shadow hover:bg-indigo-500"
      >
        Generate plan
      </button>
    </form>
  );
}
