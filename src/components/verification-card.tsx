"use client";

import { useEffect, useState } from "react";

interface CompanyRecord {
  registrationId: string;
  companyName: string;
  website: string;
  status: string;
  registrationDate: string;
  expiryDate: string;
  planType: string;
  securityCompliance: string;
  headquarters: string;
  country: string;
}

// Official Hallcraft company record
const companyDatabase: CompanyRecord[] = [
  {
    registrationId: "HC-2026-00001",
    companyName: "Hallcraft", // "Ivents",
    website: "hallcraft.xyz",
    status: "Verified",
    registrationDate: "2026-01-10",
    expiryDate: "2029-01-09",
    planType: "Event Space Planning Platform",
    securityCompliance: "ISO 27001 & SOC 2 Type II",
    headquarters: "Lagos",
    country: "Nigeria",
  },
];

const VerificationCard = () => {
  const [regIdValue, setRegIdValue] = useState("");
  const [result, setResult] = useState<CompanyRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = () => {
    const regId = regIdValue.trim().toUpperCase();
    if (!regId) return;

    const found = companyDatabase.find((c) => c.registrationId === regId);
    if (!found) {
      setResult(null);
      setNotFound(true);
      return;
    }

    setResult(found);
    setNotFound(false);
  };

  const handleReset = () => {
    setRegIdValue("");
    setResult(null);
    setNotFound(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const copyLink = () => {
    if (!result) return;
    const link = `${window.location.origin}/verify?id=${result.registrationId}`;
    navigator.clipboard.writeText(link);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const regId = id.toUpperCase();
      setRegIdValue(regId);
      const found = companyDatabase.find((c) => c.registrationId === regId);
      if (found) {
        setResult(found);
      } else {
        setNotFound(true);
      }
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Search Input */}
      <div className="rounded-2xl border border-[#ddd6c8] bg-white p-8 shadow-lg">
        <label className="mb-3 block text-sm font-medium text-[#111]">
          Enter Hallcraft Registration ID
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="e.g., HC-2026-00001"
            value={regIdValue}
            onChange={(e) => setRegIdValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="flex-1 rounded-xl border border-[#ddd6c8] bg-[#f8f4ea] px-4 py-3 text-[#111] placeholder:text-[#9a9488] focus:border-[#7d9a68] focus:outline-none"
          />
          <button
            onClick={handleVerify}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#7d9a68] px-6 py-3 font-semibold text-white transition hover:bg-[#6d8a58]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Verify ID
          </button>
        </div>
      </div>

      {/* Success Result */}
      {result && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#ddd6c8] bg-white shadow-lg">
          <div className="border-b border-[#ddd6c8] bg-[#7d9a68] px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {result.companyName}
                </h3>
                <p className="mt-1 font-mono text-sm text-[#e8f0e3]">
                  {result.registrationId} • {result.website}
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-500 px-4 py-1.5 text-sm font-semibold text-white">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {result.status}
              </span>
            </div>
          </div>
          <div className="p-8">
            {/* Location confirmation */}
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <svg
                className="h-6 w-6 shrink-0 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-[#111]">
                  Registered Location Confirmed
                </p>
                <p className="text-sm text-[#6f695e]">
                  {result.headquarters}, {result.country}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailBlock
                label="Registration ID"
                value={result.registrationId}
              />
              <DetailBlock label="Official Domain" value={result.website} />
              <DetailBlock
                label="Registration Date"
                value={formatDate(result.registrationDate)}
              />
              <DetailBlock
                label="Expiry Date"
                value={formatDate(result.expiryDate)}
              />
              <DetailBlock label="Service Type" value={result.planType} />
              <DetailBlock
                label="Security Compliance"
                value={result.securityCompliance}
              />
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={copyLink}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#ddd6c8] bg-[#f8f4ea] px-6 py-3 font-medium text-[#111] transition hover:bg-[#efe9d8]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Link
              </button>
              <button
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7d9a68] px-6 py-3 font-medium text-white transition hover:bg-[#6d8a58]"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Not Found */}
      {notFound && (
        <div className="mt-8 rounded-2xl border border-[#ddd6c8] bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-[#111]">
            Record Not Found
          </h3>
          <p className="mb-6 text-[#6f695e]">
            No record found for this Registration ID. Please check the ID and
            try again.
          </p>
          <button
            onClick={handleReset}
            className="rounded-xl border border-[#ddd6c8] bg-[#f8f4ea] px-6 py-2.5 font-medium text-[#111] transition hover:bg-[#efe9d8]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quick Demo Info */}
      <div className="mt-12 rounded-xl border border-[#ddd6c8] bg-[#f8f4ea] p-6 text-center">
        <p className="mb-3 text-sm text-[#6f695e]">
          Official Hallcraft Registration ID:
        </p>
        <button
          onClick={() => {
            setRegIdValue("HC-2026-00001");
            setResult(null);
            setNotFound(false);
          }}
          className="rounded-lg bg-white px-4 py-2 font-mono text-sm font-medium text-[#111] transition hover:bg-[#efe9d8]"
        >
          HC-2026-00001
        </button>
      </div>
    </div>
  );
};

const DetailBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-[#f8f4ea] p-4">
    <p className="mb-1 text-sm text-[#6f695e]">{label}</p>
    <p className="text-lg font-semibold text-[#111]">{value}</p>
  </div>
);

export default VerificationCard;
