"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  FileText,
  Mail,
  Phone,
  Star,
  Search,
  Filter,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";

// Helper function to safely convert any value to string
const toText = (value: any): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(toText).join(" ");
  if (typeof value === "object") {
    if ((value as any).text) return (value as any).text;
    if ((value as any).content) return (value as any).content;
    if ((value as any).blocks) return (value as any).blocks.map(toText).join(" ");
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
};

type User = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  role?: string;
};

type Application = {
  _id: string;
  jobSeeker: {
    _id: string;
    user: User;
    experience?: {
      totalYears?: number;
      years?: number;
    };
    fullName?: string;
    resume?: {
      url: string;
    };
    title?: string; // optional designation if present
  };
  status: string;
  resume?: string | { url: string };
  coverLetter?: any;
  answers?: Array<{
    question: string;
    answer: string;
  }>;
  history?: Array<{
    status: string;
    at: string;
  }>;
  rating?: number;
  createdAt?: string;
};

// UI classes for status badges
const statusClasses: Record<string, string> = {
  Applied: "bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200",
  "Under Review": "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200",
  Shortlisted: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Interview: "bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-200",
  Offered: "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200",
  Rejected: "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200",
  default: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
};

const STATUS_OPTIONS = ["Applied", "Under Review", "Shortlisted", "Interview", "Offered", "Rejected"];

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

const StarRating = ({
  rating,
  setRating,
  filter = false,
}: {
  rating: number;
  setRating?: (rating: number) => void;
  filter?: boolean;
}) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating && setRating(star)}
          className={`${filter ? "cursor-pointer" : "pointer-events-none"} ${star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
        >
          <Star className={`w-5 h-5 ${star <= rating ? "fill-current" : ""}`} />
        </button>
      ))}
      {filter && (
        <button
          onClick={() => setRating && setRating(0)}
          className="ml-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default function JobApplicationsPage() {
  const { id: jobId } = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  const itemsPerPage = 8;
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    []
  );

  const filterRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setOpenStatusMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user);

    if (parsedUser.role !== "employer") {
      toast.error("Access denied. Employers only.");
      router.push("/login");
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await fetch(`${apiBase}/api/applications/job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching applications:", data.message);
          setApplications([]);
          throw new Error(data.message || "Failed to fetch applications");
        } else {
          setApplications(
            Array.isArray(data.data?.applications) ? data.data.applications : []
          );
        }
      } catch (err) {
        console.error("Network error:", err);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchApplications();
  }, [jobId, router, apiBase]);

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiBase}/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
      );
      setOpenStatusMenuId(null);
      toast.success("Status updated");
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...applications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((app) => {
        const js = app.jobSeeker || {};
        const u = js.user || {};
        const fullName =
          [u.firstName, u.lastName].filter(Boolean).join(" ").toLowerCase() ||
          js.fullName?.toLowerCase() ||
          "";
        const email = u.email?.toLowerCase() || "";
        const phone = u.phone?.toLowerCase() || "";
        const title = js.title?.toLowerCase() || "";

        return (
          fullName.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          title.includes(term) ||
          (app.status || "").toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter) {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (minRating > 0) {
      result = result.filter((app) => (app.rating || 0) >= minRating);
    }

    setFilteredApplications(result);
    setCurrentPage(1);
  }, [applications, searchTerm, statusFilter, minRating]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setMinRating(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSkeleton />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApps = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const activeFilterCount = (statusFilter ? 1 : 0) + (minRating > 0 ? 1 : 0);
  const hasFilters = activeFilterCount > 0;

  // Summary counts (map Interview to Shortlisted for this UI)
  const count = (status: string) =>
    applications.filter((a) => a.status === status).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Applicants</h1>
        {/* Optional subtext: job title/company if available */}
        {/* <p className="text-sm text-gray-500 mt-1">Senior Cardiologist • Apollo Hospitals, Mumbai</p> */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          <SummaryCard label="All applications" value={applications.length} />
          <SummaryCard label="New" value={count("Applied")} accent="sky" />
          <SummaryCard label="Under review" value={count("Under Review")} accent="amber" />
          <SummaryCard
            label="Shortlisted"
            value={count("Shortlisted") + count("Interview")}
            accent="emerald"
          />
          <SummaryCard label="Rejected" value={count("Rejected")} accent="rose" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#155DFC] focus:border-transparent bg-white"
              placeholder="Search by name, email, qualification..."
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#155DFC] px-1.5 text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-[#155DFC] focus:border-[#155DFC] rounded-md"
                    >
                      <option value="">All Statuses</option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Rating
                    </label>
                    <StarRating rating={minRating} setRating={setMinRating} filter />
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-3 py-1.5 bg-[#155DFC] text-white text-sm font-medium rounded-md hover:bg-[#1e45f6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#155DFC]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active filters chips */}
        {(statusFilter || minRating > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {statusFilter && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("")}
                  className="ml-1.5 rounded-full bg-sky-700 text-white h-4 w-4 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Min Rating: {minRating}★
                <button
                  onClick={() => setMinRating(0)}
                  className="ml-1.5 rounded-full bg-yellow-800 text-white h-4 w-4 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
              <p className="text-gray-500 mb-4">
                {hasFilters
                  ? "No applications match your current filters."
                  : "No applications have been submitted for this job yet."}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#155DFC] hover:bg-[#1e45f6]"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Applicant</th>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Experience</th>
                      <th className="px-6 py-3">Rating</th>
                      <th className="px-6 py-3">Applied Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedApps.map((app) => {
                      const js = app.jobSeeker || {};
                      const u = js.user || {};
                      const fullName =
                        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                        js.fullName ||
                        "Unknown";
                      const email = u.email || "N/A";
                      const phone = u.phone || "N/A";
                      const experienceYears =
                        js.experience?.totalYears ?? js.experience?.years;
                      const resumeUrl =
                        typeof app.resume === "string" ? app.resume : app.resume?.url;
                      const status = app.status || "Applied";
                      // pick first "Applied" from history, else earliest, else createdAt
                      const appliedAt =
                        app.history?.find((h) => h.status?.toLowerCase() === "applied")?.at ||
                        app.history?.[0]?.at ||
                        app.createdAt;

                      return (
                        <tr key={app._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {u.profileImage ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={u.profileImage}
                                    alt={fullName}
                                  />
                                ) : (
                                  <span className="text-gray-600 font-medium">
                                    {fullName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {fullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {js.title || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="truncate max-w-[180px]">{email}</span>
                            </div>
                            <div className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="truncate max-w-[180px]">{phone}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                              {experienceYears ? `${experienceYears} years` : "N/A"}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {app.rating ? (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span className="text-sm font-medium text-gray-900">
                                  {app.rating.toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Not rated</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-700">
                              {formatRelativeTime(appliedAt)}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative inline-block" ref={statusMenuRef}>
                              <button
                                onClick={() =>
                                  setOpenStatusMenuId((prev) => (prev === app._id ? null : app._id))
                                }
                                className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.default}`}
                              >
                                {status}
                                <ChevronDown className="ml-1 h-3.5 w-3.5" />
                              </button>

                              {openStatusMenuId === app._id && (
                                <div className="absolute z-10 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                  <div className="py-1">
                                    {STATUS_OPTIONS.map((s) => (
                                      <button
                                        key={s}
                                        onClick={() => updateApplicationStatus(app._id, s)}
                                        className={`block w-full text-left px-3 py-2 text-sm ${status === s
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700 hover:bg-gray-50"
                                          }`}
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex justify-end gap-2">
                              {resumeUrl && (
                                <a
                                  href={resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                                  title="Resume"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">Resume</span>
                                </a>
                              )}
                              <button
                                onClick={() =>
                                  router.push(`/dashboard/employee/applications/${app._id}`)
                                }
                                className="inline-flex items-center px-3 py-2 rounded-md text-white bg-[#155DFC] hover:bg-[#1e45f6]"
                              >
                                View Profile
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="hidden sm:block text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredApplications.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredApplications.length}</span> results
                  </div>
                  <div className="ml-auto">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(
                          Math.max(0, Math.min(currentPage - 3, totalPages - 5)),
                          Math.max(5, Math.min(totalPages, currentPage + 2))
                        )
                        .map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                              ? "z-10 bg-[#155DFC] border-[#155DFC] text-white"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "sky" | "amber" | "emerald" | "rose";
}) {
  const color =
    accent === "amber"
      ? "text-amber-600"
      : accent === "emerald"
        ? "text-emerald-600"
        : accent === "rose"
          ? "text-rose-600"
          : accent === "sky"
            ? "text-sky-600"
            : "text-gray-900";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className={`text-sm font-medium ${color} mb-1`}>{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded mb-3"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}