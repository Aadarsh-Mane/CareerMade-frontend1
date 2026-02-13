"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  ArrowLeft,
  Bookmark,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  CheckCircle,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import GradientLoader from "@/app/components/GradientLoader";


const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
];

const WORK_MODES = ["On-site", "Remote", "Full-time"];

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  // Filter states
  const [expandedSections, setExpandedSections] = useState({
    specialty: true,
    workMode: true,
    experience: true,
  });
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState(0);

  // Helper functions
  const getSpecialtyCount = (specialty: string) => {
    return savedJobs.filter((item: any) => 
      item.job?.specialization?.toLowerCase() === specialty.toLowerCase()
    ).length;
  };

  const clearAllFilters = () => {
    setSelectedSpecialties([]);
    setSelectedWorkModes([]);
    setExperienceRange(0);
    setSearchQuery("");
  };

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");

        // 🔒 If no token or user, redirect to login
        if (!token || !user) {
          router.push("/login");
          return;
        }

        let parsedUser: any = null;
        try {
          parsedUser = JSON.parse(user);
        } catch {
          router.push("/login");
          return;
        }

        // 🚫 Only jobseekers can access this page
        if (parsedUser.role !== "jobseeker") {
          router.push("/login");
          return;
        }

        // ✅ Fetch saved jobs
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/saved-jobs/saved-jobs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        const rawItems = data?.data?.items || data?.items || [];
        const normalizedItems = Array.isArray(rawItems)
          ? rawItems
              .map((item: any) => (item?.job ? item : { ...item, job: item }))
              .filter((item: any) => item?.job?._id)
          : [];

        setSavedJobs(normalizedItems);
        setFilteredJobs(normalizedItems);
      } catch (error) {
        console.error("Failed to fetch saved jobs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [router]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...savedJobs];

    // Search bar
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) => {
        const job = item.job;
        return (
          job?.title?.toLowerCase().includes(q) ||
          job?.specialization?.toLowerCase().includes(q) ||
          job?.location?.city?.toLowerCase().includes(q) ||
          job?.location?.state?.toLowerCase().includes(q) ||
          job?.organizationName?.toLowerCase().includes(q)
        );
      });
    }

    // Specialty filter (multiple selection)
    if (selectedSpecialties.length > 0) {
      filtered = filtered.filter((item: any) =>
        selectedSpecialties.some(s =>
          item.job?.specialization?.toLowerCase() === s.toLowerCase()
        )
      );
    }

    // Work mode filter (if applicable)
    if (selectedWorkModes.length > 0) {
      // You can add work mode filtering here if your job data has this field
      // For now, we'll skip it as the job data might not have this field
    }

    // Experience filter
    if (experienceRange > 0) {
      filtered = filtered.filter((item: any) =>
        (item.job?.experienceRequired?.minYears || 0) <= experienceRange &&
        (item.job?.experienceRequired?.maxYears || 0) >= experienceRange
      );
    }

    setFilteredJobs(filtered);
  }, [searchQuery, savedJobs, selectedSpecialties, selectedWorkModes, experienceRange]);


  if (loading)
    return (
      <>
        <Navbar />
        <div className="h-screen flex items-center justify-center bg-white">
          <GradientLoader />
        </div>
      </>
    );

  if (!savedJobs.length)
    return (
      <>
        <Navbar />
        <div className="p-8 text-center">
          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">You haven’t saved any jobs yet.</p>
          <p className="text-sm text-gray-400">
            Browse listings and tap the <Bookmark className="inline w-4 h-4 text-gray-400" /> icon to save them.
          </p>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="w-full relative bg-[#002B6B] text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/new1.png')" }}
        ></div>

        {/* Overlay (optional subtle gradient for text contrast) */}
        <div className="absolute inset-0 bg-linear-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10">
          <button
            onClick={() => router.push("/dashboard/jobseeker")}
            className="flex items-center gap-2 text-white hover:text-blue-100 mb-4 transition text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Left Text */}
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Saved{" "}
                <span className="bg-linear-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Jobs
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                Find Your Saved Jobs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
        {/* ===== FILTERS SIDEBAR ===== */}
        <div
          className={`lg:static absolute z-20 bg-white lg:bg-transparent shadow-lg lg:shadow-none p-5 rounded-lg lg:rounded-none lg:p-0 transition-all duration-300 ${
            mobileFilters
              ? "top-20 left-0 right-0 mx-4 opacity-100"
              : "hidden lg:block opacity-0 lg:opacity-100"
          }`}
        >
          <div className="bg-white lg:sticky lg:top-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">All Filters</h2>
            </div>

            {/* SPECIALTY FILTER */}
            <div className="mb-6 pb-6 border-b">
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, specialty: !prev.specialty }))
                }
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h3 className="text-base font-bold text-gray-900">Specialty</h3>
                {expandedSections.specialty ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.specialty && (
                <div className="space-y-2.5">
                  {(showAllSpecialties ? SPECIALIZATIONS : SPECIALIZATIONS.slice(0, 4)).map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={() => {
                          setSelectedSpecialties((prev) =>
                            prev.includes(specialty)
                              ? prev.filter((s) => s !== specialty)
                              : [...prev, specialty]
                          );
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                        {specialty}
                      </span>
                      <span className="text-xs text-gray-400">({getSpecialtyCount(specialty)})</span>
                    </label>
                  ))}
                  {SPECIALIZATIONS.length > 4 && (
                    <button
                      onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                    >
                      {showAllSpecialties ? "View Less" : "View More"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* WORK MODE FILTER */}
            <div className="mb-6 pb-6 border-b">
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, workMode: !prev.workMode }))
                }
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h3 className="text-base font-bold text-gray-900">Work mode</h3>
                {expandedSections.workMode ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.workMode && (
                <div className="space-y-2.5">
                  {WORK_MODES.map((mode) => (
                    <label
                      key={mode}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedWorkModes.includes(mode)}
                        onChange={() => {
                          setSelectedWorkModes((prev) =>
                            prev.includes(mode)
                              ? prev.filter((m) => m !== mode)
                              : [...prev, mode]
                          );
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                        {mode}
                      </span>
                      <span className="text-xs text-gray-400">(0)</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* EXPERIENCE FILTER */}
            <div className="mb-4">
              <button
                onClick={() =>
                  setExpandedSections((prev) => ({ ...prev, experience: !prev.experience }))
                }
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h3 className="text-base font-bold text-gray-900">Experience</h3>
                {expandedSections.experience ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.experience && (
                <div className="px-2">
                  <div className="relative pt-6 pb-2">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={experienceRange}
                      onChange={(e) => setExperienceRange(Number(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="absolute -top-1 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                      {experienceRange === 20 ? "Any" : experienceRange}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0 Yrs</span>
                    <span>Any</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== JOB CARDS + SEARCH ===== */}
        <div className="lg:col-span-3">
          {/* MOBILE FILTER BUTTON */}
          <button
            onClick={() => setMobileFilters((prev) => !prev)}
            className="lg:hidden flex items-center gap-2 text-blue-600 font-semibold mb-6"
          >
            <Filter className="w-5 h-5" /> {mobileFilters ? "Close Filters" : "Filters"}
          </button>

          {/* SEARCH BAR */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:flex-1">
              <input
                type="text"
                placeholder="Enter keyword / designation / companies..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          {/* JOB CARDS */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bookmark className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No saved jobs found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery || selectedSpecialties.length > 0 || experienceRange > 0
                    ? "Try adjusting your filters or search query"
                    : "You haven't saved any jobs yet"}
                </p>
                {(searchQuery || selectedSpecialties.length > 0 || experienceRange > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              filteredJobs
                .filter((item: any) => item.job)
                .map(({ job }: any) => (
                <div
                  key={job._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 cursor-pointer"
                  onClick={() => router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon + Content */}
                    <div className="flex gap-4 flex-1">
                      {/* Hospital Icon */}
                      <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>

                      {/* Job Details */}
                      <div className="flex-1">
                        {/* Title with Verified Badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        </div>

                        {/* Organization Name + Type */}
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">
                            {job.organizationName || "Healthcare Facility"}
                          </span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span className="text-gray-500">Multi-Specialty</span>
                        </p>

                        {/* Meta Information Row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                          {/* Experience */}
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <span>
                              {job.experienceRequired?.minYears}-
                              {job.experienceRequired?.maxYears} years
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>
                              {job.location?.city}, {job.location?.state}
                            </span>
                          </div>

                          {/* Salary */}
                          <div className="flex items-center gap-1.5">
                            <IndianRupee className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              ₹{(job.salary?.min / 100000).toFixed(1)} LPA — ₹
                              {(job.salary?.max / 100000).toFixed(1)} LPA
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-1.5 mb-4">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {job.description ||
                              "Join our hospital to advance your medical career and serve patients with excellence."}
                          </p>
                        </div>

                        {/* Tags Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                            {job.specialization || "General"}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                            Full-time
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                            On-site
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Arrow Icon */}
                    <button className="shrink-0 text-gray-400 hover:text-blue-600 transition p-1">
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
