"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Edit2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  DollarSign,
  Briefcase,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import toast from "react-hot-toast";

interface Job {
  _id: string;
  title: string;
  specialization: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  experienceRequired: {
    minYears: number;
    maxYears: number;
  };
  location: {
    city: string;
    state: string;
    country: string;
  };
  jobType: string;
  shift: string;
  isRemote: boolean;
  isFeatured: boolean;
  isVerified?: boolean;
  status: string;
  createdAt: string;
  expiresAt: string;
  employer?: string | { _id: string; organizationName?: string };
  organizationName?: string;
  stats?: {
    views: number;
    applications: number;
  };
}

export default function JobViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDescription, setExpandedDescription] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    // 🔒 Authentication check
    if (!token || !userData) {
      toast.error("Please log in to continue");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);

      // 🔒 Role-based access control
      if (user.role !== "employer") {
        toast.error("Access denied. Employers only.");
        router.push("/login");
        return;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
      return;
    }

    if (!id) {
      setLoading(false);
      return;
    }

    // ✅ Fetch job details
    const fetchJobDetails = async () => {
      try {
        console.log("🔄 Fetching job with ID:", id);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Error response:", errorData);
          toast.error(errorData.message || "Failed to load job details");
          setTimeout(() => router.push("/dashboard/employee/jobs"), 2000);
          return;
        }

        // ...existing code...
        const data = await response.json();
        console.log("📦 Full API response:", data);

        // Extract job data - handle multiple response structures
        let jobData: any = null;

        if (data?.success && data?.data) {
          jobData = data.data.job ?? data.data;
        } else if (data?.data) {
          jobData = data.data.job ?? data.data;
        } else if (data?.job) {
          jobData = data.job;
        } else if (data?._id) {
          // Direct job object response
          jobData = data;
        }

        console.log("📄 Extracted raw job data:", jobData);

        if (!jobData || !jobData._id) {
          console.error("❌ Invalid job data structure:", data);
          toast.error("Job not found or invalid data");
          setTimeout(() => router.push("/dashboard/employee/jobs"), 2000);
          return;
        }
        // ...existing code...

        // Ensure arrays are properly initialized
        const processedJob: Job = {
          _id: jobData._id,
          title: jobData.title || "Untitled",
          specialization: jobData.specialization || "",
          description: jobData.description || "",
          jobType: jobData.jobType || "Full-time",
          shift: jobData.shift || "Day",
          isRemote: jobData.isRemote || false,
          isFeatured: jobData.isFeatured || false,
          isVerified: jobData.isVerified || false,
          status: jobData.status || "Active",
          createdAt: jobData.createdAt || new Date().toISOString(),
          expiresAt: jobData.expiresAt || "",
          organizationName: jobData.organizationName || "Company",
          employer: jobData.employer || "",
          stats: jobData.stats || { views: 0, applications: 0 },

          // Handle responsibilities - ensure it's an array
          responsibilities: Array.isArray(jobData.responsibilities)
            ? jobData.responsibilities.filter(
              (item: any) => item && typeof item === "string"
            )
            : jobData.responsibilities
              ? [jobData.responsibilities]
              : [],

          // Handle requirements - ensure it's an array
          requirements: Array.isArray(jobData.requirements)
            ? jobData.requirements.filter(
              (item: any) => item && typeof item === "string"
            )
            : jobData.requirements
              ? [jobData.requirements]
              : [],

          // Handle benefits - ensure it's an array
          benefits: Array.isArray(jobData.benefits)
            ? jobData.benefits.filter(
              (item: any) => item && typeof item === "string"
            )
            : jobData.benefits
              ? [jobData.benefits]
              : [],

          // Handle salary
          salary: {
            min: jobData.salary?.min || 0,
            max: jobData.salary?.max || 0,
            currency: jobData.salary?.currency || "INR",
            period: jobData.salary?.period || "Annual",
          },

          // Handle experience
          experienceRequired: {
            minYears: jobData.experienceRequired?.minYears || 0,
            maxYears: jobData.experienceRequired?.maxYears || 0,
          },

          // Handle location
          location: {
            city: jobData.location?.city || "",
            state: jobData.location?.state || "",
            country: jobData.location?.country || "India",
          },
        };

        console.log("✅ Processed job data:", processedJob);
        setJob(processedJob);
      } catch (error) {
        console.error("❌ Error fetching job:", error);
        toast.error("Failed to fetch job details");
        setTimeout(() => router.push("/dashboard/employee/jobs"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
      </div>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen text-red-500 text-lg bg-gray-50">
          Job not found.
        </div>
      </>
    );
  }

  const descriptionPreview = job.description
    ? job.description.substring(0, 300)
    : "";
  const hasMoreDescription =
    job.description && job.description.length > 300;

  const formatSalary = () => {
    if (job.salary?.min && job.salary?.max) {
      return `${job.salary.min}-${job.salary.max} LPA`;
    }
    return "Not specified";
  };

  const formatExperience = () => {
    if (
      job.experienceRequired?.minYears !== undefined &&
      job.experienceRequired?.maxYears !== undefined
    ) {
      return `${job.experienceRequired.minYears}-${job.experienceRequired.maxYears} years`;
    }
    return "Not specified";
  };

  const formatLocation = () => {
    if (job.location?.city && job.location?.state) {
      return `${job.location.city}, ${job.location.state}`;
    }
    return "Not specified";
  };

  const getCompanyName = () => {
    // organizationName is at the top level
    if (job.organizationName) {
      return job.organizationName;
    }
    // fallback if employer is an object
    if (
      typeof job.employer === "object" &&
      job.employer?.organizationName
    ) {
      return job.employer.organizationName;
    }
    return "Company Name";
  };

  const createdDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "N/A";

  const expiryDate = job.expiresAt
    ? new Date(job.expiresAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "N/A";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb and Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left Side (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                {/* Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {job.title}
                      </h1>
                      {job.isVerified && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap">
                          <CheckCircle2 className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 font-medium">
                      {getCompanyName()}
                    </p>
                    {job.specialization && (
                      <p className="text-gray-600 text-sm mt-1">
                        {job.specialization}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap ${job.status === "Active" || job.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {job.status || "Active"}
                  </span>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                      Experience
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {formatExperience()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                      Salary
                    </p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {formatSalary()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                      Location
                    </p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {formatLocation()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                      Type
                    </p>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-900">
                        {job.jobType || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-gray-200">
                  {job.specialization && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                      {job.specialization}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                    {job.jobType}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                    {job.isRemote ? "Remote" : "On-site"}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Created on: {createdDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <span>Apply by: {expiryDate}</span>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
                  <button
                    onClick={() => router.push("/dashboard/employee/jobs")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
                  >
                    <ChevronLeft size={20} />
                    Back
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/dashboard/employee/jobs/edit/${id}`)
                    }
                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-white px-8 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-all"
                  >
                    <Edit2 size={20} />
                    Edit
                  </button>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                <div className="text-gray-700 leading-relaxed text-sm">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Role & responsibilities
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">
                    {expandedDescription
                      ? job.description
                      : descriptionPreview}
                  </p>
                  {hasMoreDescription && (
                    <button
                      onClick={() =>
                        setExpandedDescription(!expandedDescription)
                      }
                      className="text-blue-600 font-semibold hover:text-blue-700 text-sm"
                    >
                      {expandedDescription ? "read less" : "read more"}
                    </button>
                  )}
                </div>
              </div>

              {/* Key Skills Section */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Key Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities Section */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Key Responsibilities
                  </h2>
                  <ul className="space-y-3">
                    {job.responsibilities.map(
                      (resp: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-gray-700 text-sm"
                        >
                          <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></span>
                          <span>{resp}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              {/* <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
                <button
                  onClick={() => router.push("/dashboard/employee/jobs")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>

                <button
                  onClick={() =>
                    router.push(`/dashboard/employee/jobs/edit/${id}`)
                  }
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-white px-8 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-all"
                >
                  <Edit2 size={20} />
                  Edit
                </button>
              </div> */}
            </div>

            {/* Sidebar - Right Side (1 column) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Key Highlights Card */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Key highlights at {getCompanyName()}
                  </h3>
                  <div className="space-y-4">
                    {job.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Briefcase className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {benefit}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Highly rated
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits & Perks Card */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Benefits & Perks
                    </h3>
                    {job.benefits.length > 6 && (
                      <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                        View all
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {job.benefits.slice(0, 6).map((benefit: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <BenefitIcon benefit={benefit} />
                        <p className="text-xs font-medium text-gray-900 line-clamp-2 mt-2">
                          {benefit}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    {job.benefits.length} benefits offered
                  </p>
                </div>
              )}

              {/* Additional Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Job Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                      Work Mode
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {job.isRemote ? "Remote" : "On-site"}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                      Shift
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {job.shift || "Not specified"}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                      Application Deadline
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {expiryDate}
                    </p>
                  </div>

                  {job.isFeatured && (
                    <div className="border-t border-gray-100 pt-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-xs font-semibold">
                        ⭐ Featured Job
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper component for benefit icons
function BenefitIcon({ benefit }: { benefit: string }) {
  const iconClass = "w-6 h-6 text-blue-600";
  const benefitLower = benefit.toLowerCase();

  if (benefitLower.includes("insurance") || benefitLower.includes("health")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
      </svg>
    );
  }

  if (benefitLower.includes("transport") || benefitLower.includes("car")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 11l1.5-4.5h11L19 11H5z" />
      </svg>
    );
  }

  if (benefitLower.includes("gym") || benefitLower.includes("fitness")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
      </svg>
    );
  }

  if (benefitLower.includes("meal") || benefitLower.includes("food")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.9 5H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6.1h-2V19H6V7h5.9V5z" />
      </svg>
    );
  }

  if (benefitLower.includes("development") || benefitLower.includes("education") || benefitLower.includes("cme")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6.18L23 9 12 3zm6.82 6L12 5.18 5.18 9 12 12.82 18.82 9z" />
      </svg>
    );
  }

  if (benefitLower.includes("remote") || benefitLower.includes("work")) {
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-3 8h-2V5h2v6z" />
      </svg>
    );
  }

  // Default briefcase icon
  return (
    <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 16.5l6-4.5 6 4.5v6h-12zm-8-9h20V9c0-1.1-.9-2-2-2h-5V5c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v.5z" />
    </svg>
  );
}