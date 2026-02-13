import React from "react";

export default function ProfileCard({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="border p-3 rounded-lg bg-gray-50">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-semibold">{value || "N/A"}</p>
    </div>
  );
}
