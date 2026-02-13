"use client";
import React from "react";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Share2,
  Eye,
  Heart,
  TrendingUp,
  Award,
  Building2,
  Mail,
  Phone,
  Globe,
  Target,
  BookOpen,
  Zap,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";

interface ApplicationDetail {
  _id: string;
  job: {
    _id: string;
    title: string;
    organizationName: string;
    department: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    location: {
      city: string;
      state: string;
      country: string;
    };
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    jobType: string;
    experienceLevel: string;
    postedDate: string;
    applicationDeadline: string;
  };
  status: "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";
  appliedAt: string;
  viewedAt?: string;
  notes?: string;
  resume?: { _id: string; title: string; url: string };
  interviewDate?: string;
  interviewTime?: string;
  interviewLink?: string;
  rejectionReason?: string;
  coverLetter?: string;
  offerDetails?: {
    salary: number;
    startDate: string;
    benefits: string[];
    offerExpiry: string;
  };
  lastUpdatedAt?: string;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    applied: 0,
    underReview: 0,
    interview: 0,
    offered: 0,
    rejected: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const router = useRouter();

  // Helper function to format address
  const formatAddress = (address: any) => {
    if (!address) return "Not specified";
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);
    return parts.length > 0 ? parts.join(", ") : "Not specified";
  };

  // Helper function to format salary
  const formatSalary = (salary: any) => {
    if (!salary) return "Not specified";
    if (typeof salary === "object" && salary.min && salary.max) {
      const currency = salary.currency || "USD";
      return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    return salary;
  };

  // Calculate days since applied
  const daysSinceApplied = (appliedDate: string) => {
    const days = Math.floor(
      (Date.now() - new Date(appliedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  // Get application timeline progress
  const getApplicationTimeline = (app: ApplicationDetail) => {
    const timeline = [
      { status: "Applied", date: app.appliedAt, completed: true },
      { status: "Under Review", date: app.viewedAt, completed: app.viewedAt ? true : false },
      { status: "Interview", date: app.interviewDate, completed: app.interviewDate ? true : false },
      { status: "Offered", date: app.offerDetails?.startDate, completed: app.status === "Offered" },
      { status: "Rejected", date: null, completed: app.status === "Rejected" },
    ];
    return timeline;
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/applications/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        const items = (data.data?.items || data.items || []) as ApplicationDetail[];

        setApplications(items);
        if (items.length > 0) {
          setSelectedApp(items[0]);
        }

        // Calculate stats from applications
        const statsData = {
          totalApplications: items.length,
          applied: items.filter((app) => app.status === "Applied").length,
          underReview: items.filter((app) => app.status === "Under Review").length,
          interview: items.filter((app) => app.status === "Interview").length,
          offered: items.filter((app) => app.status === "Offered").length,
          rejected: items.filter((app) => app.status === "Rejected").length,
        };
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch applications", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  // Filter applications based on search and status
  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      app.job?.title?.toLowerCase().includes(searchLower) ||
      app.job?.organizationName?.toLowerCase().includes(searchLower) ||
      app.job?.department?.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === "All" || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; icon: React.ReactElement }> = {
      Applied: {
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        icon: <Clock className="w-4 h-4" />,
      },
      "Under Review": {
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        icon: <Eye className="w-4 h-4" />,
      },
      Interview: {
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      Offered: {
        color: "text-green-700",
        bgColor: "bg-green-50",
        icon: <Award className="w-4 h-4" />,
      },
      Rejected: {
        color: "text-red-700",
        bgColor: "bg-red-50",
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    return configs[status] || configs["Applied"];
  };

  // Map status to progress percentage for the horizontal bar
  const getProgressPercent = (status: string) => {
    switch (status) {
      case "Applied":
        return 10;
      case "Under Review":
        return 45;
      case "Interview":
        return 70;
      case "Offered":
        return 100;
      case "Rejected":
        return 100;
      default:
        return 0;
    }
  };

  const statusOptions = ["All", "Applied", "Under Review", "Interview", "Offered", "Rejected"];

  return (
    <>
      <Navbar />
      {/* Main container for the dashboard content, using min-h-screen */}
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header (Fixed Height) */}
        <div className="bg-[#002B6B] text-white py-10 relative overflow-hidden flex-shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6">
            <div>
              <h1 className="text-4xl font-bold leading-tight">
                Track{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Your Applications
                </span>
              </h1>
              <p className="text-blue-100 mt-3">
                Monitor your job application status and upcoming interviews in real-time.
              </p>
            </div>
            {/* <button
              onClick={() => router.push("/dashboard/jobseeker")}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] text-[#1A0152] rounded-full text-sm font-semibold shadow-md flex items-center gap-2 hover:shadow-lg transition flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button> */}
          </div>
        </div>

        {/* Stats Overview (Fixed Height) */}
        {/* <div className="max-w-7xl w-full mx-auto px-6 py-6 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  <p className="text-xs text-gray-600 mt-1">Total</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.applied}</p>
                  <p className="text-xs text-gray-600 mt-1">Applied</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
                  <p className="text-xs text-gray-600 mt-1">Under Review</p>
                </div>
                <Eye className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.interview}</p>
                  <p className="text-xs text-gray-600 mt-1">Interview</p>
                </div>
                <AlertCircle className="w-8 h-8 text-purple-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.offered}</p>
                  <p className="text-xs text-gray-600 mt-1">Offer</p>
                </div>
                <Award className="w-8 h-8 text-green-500 flex-shrink-0" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  <p className="text-xs text-gray-600 mt-1">Rejected</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div> */}

        {/* Main Section (Takes up remaining space) */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="bg-white rounded-xl border h-full border-gray-100 shadow-sm flex flex-col">
            {/* Search and Filter (Fixed Height) */}
            <div className="p-4 border-b border-gray-100 space-y-3 flex-shrink-0">
              <input
                type="text"
                placeholder="Search by role or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2 focus:ring-2 focus:ring-[#00B8DB] focus:border-[#00B8DB] outline-none"
              />
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition ${filterStatus === status
                      ? "bg-[#00B8DB] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications List (Scrollable) */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B8DB]"></div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex-1 flex items-center justify-center flex-col text-center">
                <Briefcase className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-gray-500 text-sm">{applications.length === 0 ? "No applications yet" : "No matching results"}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredApplications.map((app) => {
                  const statusConfig = getStatusConfig(app.status);
                  const isActive = selectedApp?._id === app._id;
                  return (
                    <div
                      key={app._id}
                      onClick={() => setSelectedApp(app)}
                      className={`cursor-pointer p-4 transition ${isActive ? "bg-blue-50 border-l-4 border-[#00B8DB]" : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${statusConfig.bgColor}`}>
                          {statusConfig.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {app.job?.title || "Untitled Position"}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">{app.job?.organizationName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {daysSinceApplied(app.appliedAt)}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 w-fit ${statusConfig.bgColor} ${statusConfig.color}`}
                            >
                              {statusConfig.icon}
                              {app.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Details */}
          <div className="lg:col-span-2  flex flex-col">
            {selectedApp ? (
              <>
                {/* Details Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto">
                  <div className=" space-y-6">
                    {/* Header Section */}
                    {/* Top summary card (matches requested design) */}
                    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold text-gray-900 truncate">
                            {selectedApp.job?.title}
                          </h2>
                          <p className="text-sm text-gray-600 mt-2">
                            {selectedApp.job?.organizationName} • <span className="text-xs bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{selectedApp.job?.department}</span>
                          </p>
                          <a
                            onClick={() => router.push(`/dashboard/jobseeker/?similar=${selectedApp.job?._id}`)}
                            className="text-sm text-[#00A3FF] mt-2 inline-block hover:underline cursor-pointer"
                          >
                            View similar jobs
                          </a>
                        </div>

                        <div className={`text-xs font-semibold px-3 py-2 rounded-full flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${getStatusConfig(selectedApp.status).bgColor} ${getStatusConfig(selectedApp.status).color}`}>
                          {getStatusConfig(selectedApp.status).icon}
                          {selectedApp.status}
                        </div>
                      </div>

                      {/* Application status horizontal timeline */}
                      <div className="py-4">
                        <p className="text-sm font-semibold text-gray-900 mb-4">Application status</p>
                        <div className="w-full bg-gray-100 rounded-full h-2 relative">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#00A3FF] rounded-full"
                            style={{ width: `${getProgressPercent(selectedApp.status)}% ` }}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          {/* Step 1 */}
                          <div className="flex flex-col items-center flex-1">
                            <div className="w-9 h-9 rounded-full bg-[#00A3FF] text-white flex items-center justify-center font-semibold">✓</div>
                            <p className="text-sm font-semibold text-gray-900 mt-2">Applied</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(selectedApp.appliedAt).toLocaleDateString()}</p>
                          </div>

                          {/* Connector */}
                          <div className="hidden sm:block flex-1 h-px mx-4 bg-gray-200" />

                          {/* Step 2 */}
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-9 h-9 rounded-full ${selectedApp.viewedAt ? "bg-[#00A3FF] text-white" : "bg-white border border-gray-300 text-gray-400"} flex items-center justify-center font-semibold`}>{selectedApp.viewedAt ? '✓' : '2'}</div>
                            <p className="text-sm font-semibold text-gray-900 mt-2">Under Review</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedApp.viewedAt ? new Date(selectedApp.viewedAt).toLocaleDateString() : '—'}</p>
                          </div>

                          {/* Connector */}
                          <div className="hidden sm:block flex-1 h-px mx-4 bg-gray-200" />

                          {/* Step 3 */}
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-9 h-9 rounded-full ${selectedApp.status === 'Offered' ? "bg-green-500 text-white" : "bg-white border border-gray-300 text-gray-400"} flex items-center justify-center font-semibold`}>{selectedApp.status === 'Offered' ? '✓' : '3'}</div>
                            <p className="text-sm font-semibold text-gray-900 mt-2">Results</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedApp.status === 'Offered' ? new Date(selectedApp.offerDetails?.startDate || Date.now()).toLocaleDateString() : 'Pending'}</p>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                          <button
                            onClick={() => router.push(`/dashboard/jobseeker/jobs/${selectedApp.job?._id}/view`)}
                            className="w-full md:w-1/2 lg:w-1/3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Action Buttons (Fixed Height) */}
              </>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">Select an application to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div >
    </>
  );
}