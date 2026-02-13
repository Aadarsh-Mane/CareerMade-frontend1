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

  const jobsPerPage = 5;

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

    // Filters
    if (filters.specialization)
      filtered = filtered.filter(
        (j) =>
          j.specialization?.toLowerCase() ===
          filters.specialization.toLowerCase()
      );

    if (filters.location)
      filtered = filtered.filter((j) => {
        const city = j.location?.city?.toLowerCase() || "";
        const state = j.location?.state?.toLowerCase() || "";
        const filterVal = filters.location.toLowerCase();
        return city.includes(filterVal) || state.includes(filterVal);
      });

    if (filters.years)
      filtered = filtered.filter(
        (j) => (j.experienceRequired?.minYears || 0) >= Number(filters.years)
      );

    if (filters.salary)
      filtered = filtered.filter(
        (j) => (j.salary?.max || 0) / 100000 >= Number(filters.salary)
      );

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [filters, searchQuery, jobs]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const start = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(start, start + jobsPerPage);

  const formatSalary = (amt?: number) => {
    if (!amt) return "—";
    return `₹${(amt / 100000).toFixed(1)} LPA`;
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* ===== HEADER ===== */}
      <div className="bg-gray-50">
        <div className="relative w-full bg-[#002B6B] text-white overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90 scale-105 blur-[1px]"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/95 via-[#002b6b]/70 to-transparent"></div>

          {/* Header Content */}
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
                Explore verified opportunities from India’s leading hospitals
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
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
        {/* ===== FILTERS ===== */}
        <div
          className={`lg:static absolute z-20 bg-white lg:bg-transparent border lg:border-none shadow-lg lg:shadow-none p-5 rounded-lg lg:p-0 transition-all duration-300 ${mobileFilters
            ? "top-20 left-0 right-0 mx-4 opacity-100"
            : "hidden lg:block opacity-0 lg:opacity-100"
            }`}
        >
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="font-semibold text-lg">Filters</h2>
            <button
              onClick={() => setMobileFilters(false)}
              className="text-sm text-blue-600"
            >
              Close ✕
            </button>
          </div>

          <h2 className="text-lg font-semibold mb-4 hidden lg:block">Filters</h2>

          {/* Specialization */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
              value={filters.specialization}
              onChange={(e) =>
                setFilters({ ...filters, specialization: e.target.value })
              }
            >
              <option value="">All</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            >
              <option value="">All</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Salary (in LPA)
            </label>
            <input
              type="number"
              placeholder="e.g. 5"
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
              value={filters.salary}
              onChange={(e) =>
                setFilters({ ...filters, salary: e.target.value })
              }
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Years of Experience
            </label>
            <input
              type="number"
              placeholder="e.g. 3"
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
              value={filters.years}
              onChange={(e) =>
                setFilters({ ...filters, years: e.target.value })
              }
            />
          </div>
        </div>

        {/* ===== JOB CARDS + SEARCH ===== */}
        <div className="lg:col-span-3">
          {/* MOBILE FILTER BUTTON */}
          <button
            onClick={() => setMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 text-blue-600 font-semibold mb-6"
          >
            <Filter className="w-5 h-5" /> Filters
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
            <div className="space-y-6">
              {currentJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6 relative"
                >
                  {/* Top section with title + status */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.organizationName || "Healthcare Facility"}
                      </p>
                    </div>

                    {/* Status tag */}
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${job.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : job.status === "Pending"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {job.status || "Active"}
                    </span>
                  </div>

                  {/* Job details */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      {job.location?.city}, {job.location?.state}
                    </span>
                    <span className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
                      <Calendar className="w-4 h-4 text-green-600" />
                      {job.experienceRequired?.minYears}–{job.experienceRequired?.maxYears} yrs
                    </span>
                    <span className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                      {formatSalary(job.salary?.min)} – {formatSalary(job.salary?.max)}
                    </span>
                  </div>

                  {/* Divider and description */}
                  <div className="border-t mt-4 pt-4 text-sm text-gray-700 leading-relaxed">
                    {job.description
                      ? job.description.slice(0, 100) + "..."
                      : "Join a reputed healthcare team making an impact in patient care."}
                  </div>

                  {/* Bottom tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {job.specialization || "General"}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      Full-time
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      On-site
                    </span>
                  </div>

                  {/* Bottom section with date + button */}
                  <div className="flex justify-between items-center mt-6">
                    <p className="text-xs text-gray-500">
                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() =>
                        router.push(`/dashboard/jobseeker/jobs/${job._id}/view`)
                      }
                      className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                    >
                      View Details
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
      </div>
    </>
  );
}
