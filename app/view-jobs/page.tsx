"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle,
  Building2,
  Briefcase,
  IndianRupee,
  FileText,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const SPECIALIZATIONS = [
  "General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
  "Gynecology", "Dermatology", "Psychiatry", "Radiology", "Anesthesiology",
  "Emergency Medicine", "Surgery", "Oncology", "Pathology", "Ophthalmology",
  "ENT", "Urology", "Gastroenterology", "Pulmonology", "Endocrinology",
  "Rheumatology", "Nephrology", "Hematology", "Infectious Disease",
];

const LOCATIONS = [
  "Mumbai", "Delhi NCR", "Bangalore", "Pune", "Hyderabad",
  "Chennai", "Kolkata", "Ahmedabad",
];

const WORK_MODES = ["On-site", "Remote", "Full-time"];

export default function JobSeekerJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    salary: "",
    years: "",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter section expansion states
  const [expandedSections, setExpandedSections] = useState({
    specialty: true,
    workMode: true,
    experience: true,
    location: false,
    salary: false,
  });

  // Selected filters
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState(0);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);

  const jobsPerPage = 5;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleWorkMode = (mode: string) => {
    setSelectedWorkModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (selectedSpecialties.length > 0) count++;
    if (selectedWorkModes.length > 0) count++;
    if (experienceRange > 0) count++;
    if (filters.location) count++;
    if (filters.salary) count++;
    return count;
  };

  const clearAllFilters = () => {
    setSelectedSpecialties([]);
    setSelectedWorkModes([]);
    setExperienceRange(0);
    setFilters({
      specialization: "",
      location: "",
      salary: "",
      years: "",
    });
  };

  // ✅ Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setJobs(data.data?.items || data.items || []);
          setFilteredJobs(data.data?.items || data.items || []);
        } else {
          toast.error(data.message || "Failed to fetch jobs");
        }
      } catch {
        toast.error("Something went wrong fetching jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // ✅ Apply filters and search
  useEffect(() => {
    let filtered = [...jobs];

    // Search bar
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.specialization?.toLowerCase().includes(q) ||
          j.location?.city?.toLowerCase().includes(q) ||
          j.location?.state?.toLowerCase().includes(q)
      );
    }

    // Specialty filter (multiple selection)
    if (selectedSpecialties.length > 0) {
      filtered = filtered.filter(j =>
        selectedSpecialties.some(s =>
          j.specialization?.toLowerCase() === s.toLowerCase()
        )
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((j) => {
        const city = j.location?.city?.toLowerCase() || "";
        const state = j.location?.state?.toLowerCase() || "";
        const filterVal = filters.location.toLowerCase();
        return city.includes(filterVal) || state.includes(filterVal);
      });
    }

    // Experience filter
    if (experienceRange > 0) {
      filtered = filtered.filter(
        (j) => (j.experienceRequired?.minYears || 0) >= experienceRange
      );
    }

    // Salary filter
    if (filters.salary) {
      filtered = filtered.filter(
        (j) => (j.salary?.max || 0) / 100000 >= Number(filters.salary)
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [filters, searchQuery, jobs, selectedSpecialties, selectedWorkModes, experienceRange]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const start = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(start, start + jobsPerPage);

  const formatSalary = (amt?: number) => {
    if (!amt) return "—";
    return `₹${(amt / 100000).toFixed(1)} LPA`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getSpecialtyCount = (specialty: string) => {
    return jobs.filter(j => j.specialization?.toLowerCase() === specialty.toLowerCase()).length;
  };

  const displayedSpecialties = showAllSpecialties ? SPECIALIZATIONS : SPECIALIZATIONS.slice(0, 4);

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* ===== HEADER ===== */}
      {/* <div className="bg-gray-400">
        <div className="relative w-full bg-[#002B6B] text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90 scale-105 blur-[1px]"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>

          <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/95 via-[#002b6b]/70 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                Job{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Seeker Dashboard
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3 leading-relaxed">
                Explore verified opportunities from India's leading hospitals
                and healthcare facilities.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3 justify-start sm:justify-end w-full sm:w-auto"
            >
              <button
                onClick={() => router.push("/dashboard/jobseeker/applications")}
                className="flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                My Applications
              </button>
            </motion.div>
          </div>
        </div>
      </div> */}

      {/* ===== MAIN CONTENT ===== */}
      <div className=" max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
        {/* ===== FILTERS ===== */}
        <div
          className={`lg:static absolute z-20 bg-white lg:bg-transparent  shadow-lg lg:shadow-none p-5 rounded-lg lg:rounded-none lg:p-0 transition-all duration-300 ${mobileFilters
            ? "top-20 left-0 right-0 mx-4 opacity-100"
            : "hidden lg:block opacity-0 lg:opacity-100"
            }`}
        >
          <div className="bg-white lg:sticky lg:top-4">
            {/* Header with Clear All */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">All Filters</h2>
              {getAppliedFiltersCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Applied ({getAppliedFiltersCount()})
                </button>
              )}
            </div>

            {/* SPECIALTY FILTER */}
            <div className="mb-6 pb-6 border-b">
              <button
                onClick={() => toggleSection('specialty')}
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
                  {displayedSpecialties.map((specialty) => {
                    const count = getSpecialtyCount(specialty);
                    return (
                      <label
                        key={specialty}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.includes(specialty)}
                          onChange={() => toggleSpecialty(specialty)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                          {specialty}
                        </span>
                        <span className="text-xs text-gray-400">({count})</span>
                      </label>
                    );
                  })}
                  <button
                    onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                    className="text-sm text-blue-600 font-medium hover:underline mt-2"
                  >
                    {showAllSpecialties ? "View Less" : "View More"}
                  </button>
                </div>
              )}
            </div>

            {/* WORK MODE FILTER */}
            <div className="mb-6 pb-6 border-b">
              <button
                onClick={() => toggleSection('workMode')}
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
                        onChange={() => toggleWorkMode(mode)}
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
            <div className="mb-6 pb-6 border-b">
              <button
                onClick={() => toggleSection('experience')}
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
                      {experienceRange === 20 ? 'Any' : experienceRange}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0 Yrs</span>
                    <span>Any</span>
                  </div>
                </div>
              )}
            </div>

            {/* LOCATION FILTER */}
            <div className="mb-6 pb-6 border-b">
              <button
                onClick={() => toggleSection('location')}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h3 className="text-base font-bold text-gray-900">Location</h3>
                {expandedSections.location ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.location && (
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* SALARY FILTER */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection('salary')}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h3 className="text-base font-bold text-gray-900">Salary</h3>
                {expandedSections.salary ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.salary && (
                <input
                  type="number"
                  placeholder="Minimum Salary (LPA)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.salary}
                  onChange={(e) =>
                    setFilters({ ...filters, salary: e.target.value })
                  }
                />
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
          <div className="mb-8">
            <div className="relative max-w-lg mx-auto lg:mx-0">
              <input
                type="text"
                placeholder="Search by title, specialization, or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No matching jobs found
            </div>
          ) : (
            <div className="space-y-4">
              {currentJobs.map((job) => (
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
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>

                      {/* Job Details */}
                      <div className="flex-1">
                        {/* Title with Verified Badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          {job.status === "Active" && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>

                        {/* Organization Name + Type */}
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">{job.organizationName || "Healthcare Facility"}</span>
                          <span className="text-gray-400 mx-1">|</span>
                          <span className="text-gray-500">Multi-Specialty</span>
                        </p>

                        {/* Meta Information Row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                          {/* Experience */}
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <span>{job.experienceRequired?.minYears}-{job.experienceRequired?.maxYears} years</span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{job.location?.city}, {job.location?.state}</span>
                          </div>

                          {/* Salary */}
                          <div className="flex items-center gap-1.5">
                            <IndianRupee className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {formatSalary(job.salary?.min)} – {formatSalary(job.salary?.max)}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-1.5 mb-4">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {job.description || "Join our hospital to advance your medical career and serve patients with excellence."}
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

                          {/* Time Posted */}
                          <span className="ml-auto text-xs text-gray-500">
                            {getTimeAgo(job.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Bookmark Icon */}
                    <button
                      className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition p-1"
                      onClick={() => router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded-md text-sm ${currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {/* RIGHT SIDEBAR (Desktop) */}
        <div className=" lg:flex flex-col gap-6 ">
          {/* Top organizations + Recommended Jobs */}
          {/* ===== RIGHT SIDEBAR ===== */}
          <div className=" lg:flex flex-col gap-6">
            {/* Top Organizations */}
            <div className="bg-white border rounded-2xl shadow-sm p-5 mb-5">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                See 20 jobs matching your profile 
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Replace with your actual logo paths */}
                <img src="/apollo.png" alt="Apollo" className="h-10 w-auto object-contain" />
                <img src="/max.png" alt="Max Healthcare" className="h-10 w-auto object-contain" />
                <img src="/fortis.png" alt="Fortis" className="h-10 w-auto object-contain" />
                <img src="/aiims.png" alt="AIIMS" className="h-10 w-auto object-contain" />
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className="bg-white border rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Recommended Jobs
              </h3>

              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">3 days ago</p>
                    <h4 className="font-semibold text-gray-900 text-sm">ICU Nurse</h4>
                    <p className="text-sm text-gray-600">City General Hospital</p>
                    <button className="mt-2 px-4 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-full transition">
                      View
                    </button>
                  </div>
                  <img
                    src="/hos.png"
                    alt="Hospital"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              ))}

              <p className="text-sm text-gray-600 mt-4">
                Personalized job recommendations tailored to your profile and career goals in healthcare.
              </p>

              <button className="mt-3 text-blue-600 font-semibold text-sm hover:underline">
                View More
              </button>
            </div>
          </div>


        </div>

        {/* SIDEBAR (Mobile) — shows below job list */}
        <div className="flex flex-col gap-6 lg:hidden">
          {/* Top organizations + Recommended Jobs */}
          {/* ===== RIGHT SIDEBAR ===== */}
          <div className="hidden lg:flex flex-col gap-6">
            {/* Top Organizations */}
            <div className="bg-white border rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                See 20 jobs matching your profile
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Replace with your actual logo paths */}
                <img src="/apollo.png" alt="Apollo" className="h-10 w-auto object-contain" />
                <img src="/max.png" alt="Max Healthcare" className="h-10 w-auto object-contain" />
                <img src="/fortis.png" alt="Fortis" className="h-10 w-auto object-contain" />
                <img src="/aiims.png" alt="AIIMS" className="h-10 w-auto object-contain" />
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className="bg-white border rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                Recommended Jobs
              </h3>

              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">3 days ago</p>
                    <h4 className="font-semibold text-gray-900 text-sm">ICU Nurse</h4>
                    <p className="text-sm text-gray-600">City General Hospital</p>
                    <button className="mt-2 px-4 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-full transition">
                      View
                    </button>
                  </div>
                  <img
                    src="/hos.png"
                    alt="Hospital"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              ))}

              <p className="text-sm text-gray-600 mt-4">
                Personalized job recommendations tailored to your profile and career goals in healthcare.
              </p>

              <button className="mt-3 text-blue-600 font-semibold text-sm hover:underline">
                View More
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}