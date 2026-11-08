/* import { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import VerificationCard from "@/components/verification-card";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Company Verification | Hallcraft",
  description:
    "Verify Hallcraft's official registration and company details. Confirm the authenticity of our platform and services.",
};

export default function VerifyPage() {
  return (
    <PageShell
      eyebrow="Verification"
      title="Confirm Official Registration"
      intro="Verify the authenticity of Hallcraft and confirm official company registration details. Enter a registration ID below to view verification status."
      meta={site.lastUpdated}
    >
      <div className="-mx-6 -mt-8 sm:-mx-9">
        <div className="px-6 py-8 sm:px-9">
          <VerificationCard />
        </div>

        {/* Info Section *\/}
        <div className="border-t border-[#e2dccf] bg-[#f8f4ea] px-6 py-8 sm:px-9">
          <h2 className="mb-6 text-[15px] font-semibold tracking-[-0.01em] text-[#111]">
            Why Verify?
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#7d9a68]/10">
                <svg
                  className="h-5 w-5 text-[#7d9a68]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-[13px] font-semibold text-[#111]">
                Authenticity
              </h3>
              <p className="text-[11.5px] leading-relaxed text-[#6f695e]">
                Confirm you're working with the official Hallcraft platform
                and not an impersonator.
              </p>
            </div>
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#7d9a68]/10">
                <svg
                  className="h-5 w-5 text-[#7d9a68]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-[13px] font-semibold text-[#111]">
                Trust
              </h3>
              <p className="text-[11.5px] leading-relaxed text-[#6f695e]">
                Verify our registration details, operational status, and
                compliance certifications.
              </p>
            </div>
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#7d9a68]/10">
                <svg
                  className="h-5 w-5 text-[#7d9a68]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-[13px] font-semibold text-[#111]">
                Transparency
              </h3>
              <p className="text-[11.5px] leading-relaxed text-[#6f695e]">
                Access public records of our company registration and service
                offerings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
 */

// This page is temporarily disabled
export default function VerifyPage() {
  return null;
}
