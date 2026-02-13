"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { MapPin, Briefcase, Bookmark, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

type Job = {
  _id: string;
  title: string;
  specialization?: string;
  location?: { city?: string; state?: string };
  experienceRequired?: { minYears?: number; maxYears?: number };
  isRemote?: boolean;
  salary?: { min?: number; max?: number; currency?: string };
};

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const headerColors = ["#1A0152", "#9333EA", "#16A34A", "#0F172A"];

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem('user'); // assuming you store user info after login

    // If not logged in → redirect
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userData);

    // If not an jobseeker → redirect
    if (user.role !== 'jobseeker') {
      router.push('/login');
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?limit=30`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = (data.data?.items || data.items || []) as Job[];
        setJobs(items);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b mx-auto max-w-7xl border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
          {/* full-width banner wrapper */}
          <div className="w-full bg-[#1A0152] text-white relative rounded-xl overflow-hidden shadow-md">
            <div
              className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-40"
              style={{ backgroundImage: "url('/bg.png')" }}
            ></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
              <button
                onClick={() => router.push("/dashboard/jobseeker")}
                className="flex items-center gap-2 text-white hover:text-gray-200 mb-4 transition text-sm"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-semibold leading-tight">
                    Browse{" "}
                    <span className="italic text-[#CBA2FF] font-light">
                      Jobs
                    </span>
                  </h1>
                  <p className="text-sm text-gray-200 mt-1">
                    Explore thousands of healthcare opportunities tailored just for you
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-500 animate-pulse">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No jobs found
              </h3>
              <p className="text-sm text-gray-500">
                Try again later or update your search filters
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, index) => {
                const headerColor = headerColors[index % headerColors.length];

                return (
                  <div
                    key={job._id}
                    onClick={() => router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 w-full max-w-sm relative cursor-pointer"
                  >
                    {/* ===== Header with Colored Banner and Circular Logo ===== */}
                    <div className="relative mb-5">
                      <div
                        className="w-full h-20 rounded-lg"
                        style={{ backgroundColor: headerColor }}
                      ></div>

                      <div className="absolute -bottom-6 left-6">
                        <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md flex items-center justify-center">
                          <div
                            className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: headerColor }}
                          >
                            <img
                              src="/card.png"
                              alt="Company Logo"
                              className="w-2/4 h-2/4 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ===== Title and Organization ===== */}
                    <div className="flex items-start justify-between mt-8 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold leading-tight mb-1">
                          {job.title || "Job Title"}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {/* {job.organizationName || "—"}Hospital */}Hospital
                        </p>
                      </div>
                    </div>

                    {/* ===== Location, Experience, Salary ===== */}
                    <div className="space-y-2 mb-3">
                      {job.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                          <span className="font-medium">
                            {job.location.city || "—"}, {job.location.state || ""}
                          </span>
                        </div>
                      )}

                      {job.experienceRequired && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium">
                            {job.experienceRequired.minYears || "—"}–
                            {job.experienceRequired.maxYears || "—"} years
                          </span>
                        </div>
                      )}

                      {job.salary && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="font-medium">
                            💰 {job.salary?.min} - {job.salary?.max} {job.salary?.currency}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ===== Specialization Tag ===== */}
                    <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-gray-100">
                      {job.specialization ? (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                          {job.specialization}
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-50 text-gray-400 text-xs font-semibold rounded-md">
                          Not specified
                        </span>
                      )}
                    </div>

                    {/* ===== View Details Button ===== */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/jobseeker/jobs/${job._id}/view`);
                      }}
                      className="w-full rounded-xl"
                      style={{ backgroundColor: headerColor }}
                    >
                      <div className="text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:opacity-90">
                        <span>View Details</span>
                        <svg
                          className="w-5 h-5"
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
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
