"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Star,
  FileText,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Building,
  Calendar,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  role?: string;
};

const statusColors: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-800",
  "Under Review": "bg-amber-100 text-amber-800",
  Shortlisted: "bg-emerald-100 text-emerald-800",
  Interview: "bg-purple-100 text-purple-800",
  Offered: "bg-green-100 text-green-800",
  Rejected: "bg-rose-100 text-rose-800",
  default: "bg-gray-100 text-gray-800",
};

// Relative time like "2 days ago"
function formatRelativeTime(dateLike?: string) {
  if (!dateLike) return "N/A";
  const date = new Date(dateLike);
  if (isNaN(date.getTime())) return "N/A";
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} day${d === 1 ? "" : "s"} ago`;
  if (h > 0) return `${h} hour${h === 1 ? "" : "s"} ago`;
  if (m > 0) return `${m} minute${m === 1 ? "" : "s"} ago`;
  return "Just now";
}

// ⭐ Star Rating Component
const StarRating = ({
  rating,
  setRating,
  readOnly = false,
}: {
  rating: number;
  setRating?: (rating: number) => void;
  readOnly?: boolean;
}) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && setRating && setRating(star)}
          className={`${!readOnly ? "cursor-pointer" : "cursor-default"} ${star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
        >
          <Star className={`w-5 h-5 ${star <= rating ? "fill-current" : ""}`} />
        </button>
      ))}
    </div>
  );
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    []
  );

  // 🟦 Fetch application details
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");

        if (!token || !user) {
          toast.error("Please log in to continue.");
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== "employer") {
          toast.error("Access denied. Employers only.");
          router.push("/login");
          return;
        }

        const res = await fetch(`${apiBase}/api/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();
        if (!res.ok)
          throw new Error(json.message || "Failed to load application");

        const application = json.data?.application || json.data || json;
        setApp(application);
        setStatus(application.status || "Applied");
        setRating(application.rating || 0);
      } catch (e: any) {
        setError(e.message || "Failed to load application");
        toast.error(e.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id, apiBase, router]);

  // 🟨 Save status change
  const saveStatus = async (newStatus: string) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");

      setStatus(newStatus);
      setApp({ ...app, status: newStatus });
      toast.success("Status updated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  // ⭐ Save rating
  const saveRating = async (newRating: number) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${id}/rating`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save rating");

      setRating(newRating);
      toast.success("Rating saved successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to save rating");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
      </div>
    );

  if (error || !app)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6 text-red-600">
          {error || "Application not found"}
        </div>
      </div>
    );

  const u: User = app?.jobSeeker?.user || {};
  const js = app?.jobSeeker || {};
  const fullName =
    [u.firstName, u.lastName].filter(Boolean).join(" ") || js.fullName || "Applicant";
  const title =
    js.title ||
    (js.workExperience?.[0]?.title || js.workExperience?.[0]?.designation) ||
    "—";
  const experienceYears =
    js.experience?.totalYears ?? js.experience?.years ?? undefined;
  const institution =
    (app.education?.[0]?.institution ||
      js.education?.[0]?.institution ||
      js.education?.[0]?.school) ??
    "—";
  const location =
    js.location ||
    js.city ||
    js.address ||
    app.location ||
    "—";

  const appliedAt =
    app.history?.find((h: any) => h.status?.toLowerCase() === "applied")?.at ||
    app.history?.[0]?.at ||
    app.createdAt;

  const toText = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (Array.isArray(v)) return v.map(toText).join(" ");
    if (typeof v === "object") {
      if (typeof (v as any).text === "string") return (v as any).text;
      if (Array.isArray((v as any).blocks)) return (v as any).blocks.map(toText).join(" ");
      if ((v as any).content) return toText((v as any).content);
      try {
        return JSON.stringify(v);
      } catch {
        return "";
      }
    }
    return String(v);
  };

  const resumeObj = js?.resume;
  const resumeHref = typeof resumeObj === "string" ? resumeObj : resumeObj?.url;
  const resumeFilename = (resumeObj as any)?.filename || "Resume";

  const cover = app.coverLetter;
  const rawSummary =
    app?.summary ??
    app?.professionalSummary ??
    js?.summary ??
    js?.professionalSummary ??
    app?.jobSeeker?.summary ??
    app?.jobSeeker?.professionalSummary ??
    js?.about ??
    js?.bio ??
    js?.description ??
    app?.about ??
    app?.bio;

  const summaryText = toText(rawSummary).trim();
  const coverHref =
    typeof cover === "string"
      ? /^https?:\/\//.test(cover)
        ? cover
        : undefined
      : cover?.url;
  const coverFilename = (cover as any)?.filename || "Cover Letter";
  const coverText = !coverHref ? toText(cover) : "";
  // ✅ Unified cover letter URL (file or generated text file)
  const coverLetterURL =
    coverHref || (coverText ? `data:text/plain;charset=utf-8,${encodeURIComponent(coverText)}` : null);
  let coverLetterDownloadName = coverFilename;
  if (!/\.[a-zA-Z0-9]{2,5}$/.test(coverLetterDownloadName)) {
    // add .txt if it is generated from plain text
    if (!coverHref && coverText) coverLetterDownloadName += ".txt";
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const matchScore: number =
    app.matchScore ?? Math.min(100, Math.round(((rating || 3) / 5) * 100));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Back + Title */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#155DFC] hover:text-[#1e45f6] mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Applications
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="shrink-0 h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {u.profileImage ? (
                  <img
                    className="h-14 w-14 rounded-full object-cover"
                    src={u.profileImage}
                    alt={fullName}
                  />
                ) : (
                  <span className="text-gray-600 font-semibold text-lg">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {fullName}
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">{title}</p>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>
                      {experienceYears ? `${experienceYears} years experience` : "Experience N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{institution}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Applied {formatRelativeTime(appliedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[status] || statusColors.default
                }`}
            >
              {status || "Applied"}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* ===== Left Column ===== */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Contact information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {u.email || "No email provided"}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {u.phone || "No phone provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional summary */}
            {summaryText && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Professional summary
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                  {summaryText.split(/\r?\n/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & expertise */}
            {((app.skills && app.skills.length) ||
              (js?.skills && js.skills.length)) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Skills & expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(app.skills || js?.skills || []).map((s: any, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                      >
                        {typeof s === "string" ? s : s.name || JSON.stringify(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Work experience */}
            {(app.workExperience || js?.workExperience) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Work experience
                </h3>
                <div className="space-y-4">
                  {(app.workExperience || js?.workExperience || []).map(
                    (we: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {we.title ||
                                we.position ||
                                we.role ||
                                we.designation}
                            </p>
                            <p className="text-sm text-gray-500">
                              {we.company || we.organization || we.employer}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {we.duration ||
                              `${we.from || ""}${we.to ? " - " + we.to : ""}`}
                          </p>
                        </div>
                        {we.description && (
                          <p className="text-sm text-gray-700 mt-2">
                            {we.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {(app.education || js?.education) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Education
                </h3>
                <div className="space-y-3">
                  {(app.education || js?.education || []).map(
                    (ed: any, ii: number) => (
                      <div key={ii}>
                        <p className="text-sm font-medium text-gray-900">
                          {ed.degree || ed.course || ed.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {ed.institution || ed.school}
                        </p>
                        {ed.description && (
                          <p className="text-sm text-gray-700">{ed.description}</p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Resume */}
            {resumeHref && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-[#155DFC]" />
                  Resume
                </h3>
                <div className="flex items-center gap-3">
                  {/* <a
                    href={resumeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#155DFC] to-[#00A3FF] hover:opacity-95"
                  >
                    <FileText className="h-4 w-4" />
                    View resume
                  </a> */}
                  <a
                    href={resumeHref}
                    download={resumeFilename}
                    className="inline-flex items-center gap-2 px-4 py-2 border text-white  text-sm font-medium rounded-md  bg-linear-to-r from-[#155DFC] to-[#00A3FF] hover:opacity-95"
                  >
                    <FileText className="h-4 w-4" />
                    Download resume
                  </a>
                </div>
              </div>
            )}

            {/* Cover Letter (now EXACTLY like Resume) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#155DFC]" />
                Cover Letter
              </h3>
              {coverLetterURL ? (
                <div className="flex items-center gap-3">
                  {/* <a
                    href={coverLetterURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#155DFC] to-[#00A3FF] hover:opacity-95"
                  >
                    <FileText className="h-4 w-4" />
                    View cover letter
                  </a> */}
                  <a
                    href={coverLetterURL}
                    download={coverLetterDownloadName}
                    className="inline-flex items-center gap-2 px-4 py-2 border text-white bg-white text-sm font-medium rounded-md bg-linear-to-r from-[#155DFC] to-[#00A3FF] hover:opacity-95"
                  >
                    <FileText className="h-4 w-4" />
                    Download cover letter
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No cover letter provided</p>
              )}
            </div>

          </div>

          {/* ===== Right Column ===== */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Quick actions
              </h3>
              <div className="flex flex-col space-y-3">
                {resumeHref && (
                  <>
                    {/* <a
                      href={resumeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#155DFC] to-[#00A3FF] hover:opacity-95"
                    >
                      <FileText className="h-4 w-4" />
                      View resume
                    </a> */}
                    <a
                      href={resumeHref}
                      download={resumeFilename}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border text-white  text-sm font-medium rounded-md  bg-linear-to-r from-[#155DFC] to-[#00A3FF] hover:opacity-95"
                    >
                      <FileText className="h-4 w-4" />
                      Download resume
                    </a>
                  </>
                )}
                {u.email && (
                  <a
                    href={`mailto:${u.email}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white text-sm font-medium rounded-md hover:bg-gray-50"
                  >
                    <Mail className="h-4 w-4 text-gray-500" />
                    Send email
                  </a>
                )}
                {u.phone && (
                  <a
                    href={`tel:${u.phone}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white text-sm font-medium rounded-md hover:bg-gray-50"
                  >
                    <Phone className="h-4 w-4 text-gray-500" />
                    Call candidate
                  </a>
                )}
              </div>
            </div>

            {/* Rate candidate */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Rate candidate
              </h3>
              <div className="space-y-3">
                <StarRating
                  rating={rating}
                  setRating={(newRating) => saveRating(newRating)}
                  readOnly={isSaving}
                />
                <p className="text-sm text-gray-500">
                  {rating
                    ? `Current rating: ${rating} star${rating > 1 ? "s" : ""}`
                    : "Not yet rated"}
                </p>
              </div>
            </div>

            {/* Update status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Update status
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => saveStatus("Under Review")}
                  disabled={isSaving || status === "Under Review"}
                  className="w-full text-left px-4 py-2 rounded-md border bg-white text-[#155DFC] font-medium hover:bg-blue-50 disabled:opacity-60"
                >
                  Move to review
                </button>
                <button
                  onClick={() => saveStatus("Shortlisted")}
                  disabled={isSaving || status === "Shortlisted"}
                  className="w-full text-left px-4 py-2 rounded-md border bg-[#F3F8FF] text-[#155DFC] font-medium hover:bg-blue-50 disabled:opacity-60"
                >
                  Shortlist candidate
                </button>
                <button
                  onClick={() => saveStatus("Offered")}
                  disabled={isSaving || status === "Offered"}
                  className="w-full text-left px-4 py-2 rounded-md border bg-[#ECFDF5] text-[#065F46] font-medium hover:bg-green-50 disabled:opacity-60"
                >
                  Accept candidate
                </button>
                <button
                  onClick={() => saveStatus("Rejected")}
                  disabled={isSaving || status === "Rejected"}
                  className="w-full text-left px-4 py-2 rounded-md border bg-[#FFF1F2] text-[#9F1239] font-medium hover:bg-red-50 disabled:opacity-60"
                >
                  Reject application
                </button>
              </div>
            </div>

            {/* Profile match */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Profile match
              </h3>
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-[#155DFC] rounded-full"
                    style={{ width: `${matchScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Strong match for this position based on qualifications and experience</span>
                  <span className="font-medium text-gray-900">{matchScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar actions */}
        <div className="max-w-7xl mx-auto p-6 mt-2">
          <div className="flex justify-end gap-3">
            <button
              onClick={async () => {
                await saveStatus("Shortlisted");
                router.back();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#155DFC] to-[#00A3FF] text-white rounded-md hover:opacity-95"
            >
              Shortlist & Close
            </button>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}