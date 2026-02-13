"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Trash2,
  Pencil,
  Users,
  ChevronDown,
  ChevronUp,
  Building2,
  IndianRupee,
  CheckCircle,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


interface Location {
  city?: string;
  state?: string;
}
interface Experience {
  minYears?: number;
  maxYears?: number;
}
interface Salary {
  min?: number;
  max?: number;
  currency?: string;
}
interface Job {
  _id: string;
  title?: string;
  organizationName?: string;
  specialization?: string;
  location?: Location;
  experienceRequired?: Experience;
  salary?: Salary;
  jobType?: "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship" | "Volunteer";
  status?: "Active" | "Pending" | "Flagged" | "Archived" | "Closed";
  description?: string;
  createdAt?: string;
}

interface EmployerProfile {
  _id: string;
  name: string;
  email: string;
  companyName?: string;
}

const SPECIALIZATIONS = [
  "General Medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
  "Gynecology", "Dermatology", "Psychiatry", "Radiology", "Anesthesiology",
  "Emergency Medicine", "Internal Medicine", "Surgery", "Oncology", "Pathology",
  "Ophthalmology", "ENT", "Urology", "Gastroenterology", "Pulmonology",
  "Endocrinology", "Rheumatology", "Nephrology", "Hematology", "Infectious Disease",
  "Physical Therapy", "Occupational Therapy", "Speech Therapy", "Nursing",
  "Pharmacy", "Medical Technology", "Other",
];

const LOCATIONS = [
  "Mumbai", "Delhi NCR", "Bangalore", "Pune", "Hyderabad",
  "Chennai", "Kolkata", "Ahmedabad",
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Volunteer",
];

export default function JobListing() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
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
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);

  // Filter section expansion states
  const [expandedSections, setExpandedSections] = useState({
    specialty: true,
    location: true,
    jobType: true,
    experience: true,
    salary: true,
  });

  // Selected filters
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState(0);
  const [salaryRange, setSalaryRange] = useState(0);

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

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const toggleJobType = (jobType: string) => {
    setSelectedJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(jt => jt !== jobType)
        : [...prev, jobType]
    );
  };

  const getSpecialtyCount = (specialty: string) => {
    return jobs.filter(j => j.specialization?.toLowerCase() === specialty.toLowerCase()).length;
  };

  const getLocationCount = (location: string) => {
    return jobs.filter(j =>
      j.location?.city?.toLowerCase() === location.toLowerCase() ||
      j.location?.state?.toLowerCase().includes(location.toLowerCase())
    ).length;
  };

  const getJobTypeCount = (jobType: string) => {
    return jobs.filter(j => j.jobType?.toLowerCase() === jobType.toLowerCase()).length;
  };

  const clearAllFilters = () => {
    setSelectedSpecialties([]);
    setSelectedLocations([]);
    setSelectedJobTypes([]);
    setExperienceRange(0);
    setSalaryRange(0);
    setSearchQuery("");
    setFilters({
      specialization: "",
      location: "",
      salary: "",
      years: "",
    });
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (selectedSpecialties.length > 0) count++;
    if (selectedLocations.length > 0) count++;
    if (selectedJobTypes.length > 0) count++;
    if (experienceRange > 0) count++;
    if (salaryRange > 0) count++;
    return count;
  };


  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Unauthorized");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setJobs((prev) => prev.filter((job) => job._id !== id));
        toast.success("Job deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete job");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong while deleting the job");
    }
  };
  // ✅ Fetch jobs
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);

    if (user.role !== "employer") {
      toast.error("Access denied: Only employers can view this page");
      router.push("/login");
      return;
    }

    // ✅ Only fetch jobs if valid employer
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/my?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setJobs(data.data?.items || data.items || []);
          setFilteredJobs(data.data?.items || data.items || []);
        } else {
          toast.error(data.message || "Failed to fetch jobs");
        }
      } catch (e) {
        toast.error("Something went wrong fetching jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [router]);

  // ✅ Filtering Logic
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
          j.location?.state?.toLowerCase().includes(q) ||
          j.organizationName?.toLowerCase().includes(q)
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

    // Location filter (multiple selection)
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(j =>
        selectedLocations.some(loc => {
          const city = j.location?.city?.toLowerCase() || "";
          const state = j.location?.state?.toLowerCase() || "";
          const filterVal = loc.toLowerCase();
          return city.includes(filterVal) || state.includes(filterVal);
        })
      );
    }

    // Job Type filter (multiple selection)
    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter(j =>
        selectedJobTypes.some(jt =>
          j.jobType?.toLowerCase() === jt.toLowerCase()
        )
      );
    }

    // Experience filter
    if (experienceRange > 0) {
      filtered = filtered.filter(
        (j) => (j.experienceRequired?.minYears || 0) >= experienceRange
      );
    }

    // Salary filter
    if (salaryRange > 0) {
      filtered = filtered.filter(
        (j) => (j.salary?.max || 0) / 100000 >= salaryRange
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchQuery, jobs, selectedSpecialties, selectedLocations, selectedJobTypes, experienceRange, salaryRange]);


  // ✅ Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const start = (currentPage - 1) * jobsPerPage;
  const currentJobs = filteredJobs.slice(start, start + jobsPerPage);

  // ✅ Salary Formatter
  const formatSalary = (amt?: number) => {
    if (!amt) return "—";
    return `₹${(amt / 100000).toFixed(1)} LPA`;
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />


      {/* HEADER */}
      {/* <div className="w-full relative bg-[#002B6B] text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/new1.png')" }}
        ></div>


        <div className="absolute inset-0 bg-linear-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Find Your Perfect{" "}
              <span className="bg-linear-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                Healthcare Role
              </span>
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mt-3">
              Explore verified opportunities from India's leading hospitals and
              healthcare facilities.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/employee/jobs/create")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Create Job
          </button>
        </div>
      </div> */}



      <div className="max-w-7xl mx-auto px-4 py-10 flex gap-8 relative">
        {/* ===== LEFT SIDEBAR FILTERS ===== */}
        <div
          className={`lg:w-80 lg:sticky lg:top-24 lg:self-start bg-white border border-gray-200 rounded-xl shadow-sm p-6 transition-all duration-300 ${mobileFilters
            ? "fixed inset-0 z-50 overflow-y-auto"
            : "hidden lg:block"
            }`}
          style={{ maxHeight: mobileFilters ? "100vh" : "calc(100vh - 120px)" }}
        >
          <style>{`
  .no-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`}</style>
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <button
              onClick={() => setMobileFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Filters</h2>
            {getAppliedFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-6 overflow-y-auto no-scrollbar" style={{ maxHeight: "calc(100vh - 200px)" }}>
            {/* SPECIALTY FILTER */}
            <div className="pb-6 border-b">
              <button
                onClick={() => toggleSection("specialty")}
                className="w-full flex items-center justify-between mb-4"
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
                  {(showAllSpecialties ? SPECIALIZATIONS : SPECIALIZATIONS.slice(0, 5)).map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={() => toggleSpecialty(specialty)}
                        className="w-4 h-4 accent-black text-black border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                        {specialty}
                      </span>
                      <span className="text-xs text-gray-400">({getSpecialtyCount(specialty)})</span>
                    </label>
                  ))}
                  {SPECIALIZATIONS.length > 5 && (
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

            {/* LOCATION FILTER */}
            <div className="pb-6 border-b">
              <button
                onClick={() => toggleSection("location")}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-base font-bold text-gray-900">Location</h3>
                {expandedSections.location ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.location && (
                <div className="space-y-2.5">
                  {(showAllLocations ? LOCATIONS : LOCATIONS.slice(0, 5)).map((location) => (
                    <label
                      key={location}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location)}
                        onChange={() => toggleLocation(location)}
                        className="w-4 h-4 accent-black text-black border-gray-300 rounded "
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                        {location}
                      </span>
                      <span className="text-xs text-gray-400">({getLocationCount(location)})</span>
                    </label>
                  ))}
                  {LOCATIONS.length > 5 && (
                    <button
                      onClick={() => setShowAllLocations(!showAllLocations)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                    >
                      {showAllLocations ? "View Less" : "View More"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* JOB TYPE FILTER */}
            <div className="pb-6 border-b">
              <button
                onClick={() => toggleSection("jobType")}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-base font-bold text-gray-900">Job Type</h3>
                {expandedSections.jobType ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.jobType && (
                <div className="space-y-2.5">
                  {JOB_TYPES.map((jobType) => (
                    <label
                      key={jobType}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedJobTypes.includes(jobType)}
                        onChange={() => toggleJobType(jobType)}
                        className="w-4 h-4 accent-black text-black border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                        {jobType}
                      </span>
                      <span className="text-xs text-gray-400">({getJobTypeCount(jobType)})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* EXPERIENCE FILTER */}
            <div className="pb-6 border-b">
              <button
                onClick={() => toggleSection("experience")}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-base font-bold text-gray-900">Experience</h3>
                {expandedSections.experience ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.experience && (
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Experience: {experienceRange} years</span>
                  </div>

                  <style>{`
        .slider {
          --slider-width: 100%;
          --slider-height: 6px;
          --slider-bg: rgb(82, 82, 82);
          --slider-border-radius: 999px;

          /* black progress fill */
          --level-color: #000;
          --level-transition-duration: 0.1s;

          /* icon */
          --icon-margin: 15px;
          --icon-color: var(--slider-bg);
          --icon-size: 25px;

          cursor: pointer;
          display: inline-flex;
          flex-direction: row-reverse;
          align-items: center;
        }

        .slider .volume {
          display: inline-block;
          margin-right: var(--icon-margin);
          color: var(--icon-color);
          width: var(--icon-size);
          height: auto;
        }

        .slider .level {
          appearance: none;
          width: var(--slider-width);
          height: var(--slider-height);
          background: #e2e2e2;
          overflow: hidden;
          border-radius: var(--slider-border-radius);
          transition: height var(--level-transition-duration);
          cursor: inherit;
        }

        /* progress fill (black) */
        .slider .level::-webkit-slider-thumb {
          appearance: none;
          width: 0;
          height: 0;
          box-shadow: -200px 0 0 200px var(--level-color);
        }

        .slider .level::-moz-range-thumb {
          width: 0;
          height: 0;
          box-shadow: -200px 0 0 200px var(--level-color);
        }

        .slider:hover .level {
          height: calc(var(--slider-height) * 2);
        }
      `}</style>

                  <label className="slider w-full">
                    <input
                      type="range"
                      className="level"
                      min="0"
                      max="20"
                      value={experienceRange}
                      onChange={(e) => setExperienceRange(Number(e.target.value))}
                    />
                  </label>
                </div>
              )}
            </div>


            {/* SALARY FILTER */}
            <div className="pb-6">
              <button
                onClick={() => toggleSection("salary")}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-base font-bold text-gray-900">Salary (LPA)</h3>
                {expandedSections.salary ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.salary && (
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Min: ₹{salaryRange} LPA</span>
                  </div>

                  <style>{`
        .salary-slider {
          --slider-height: 6px;
          --slider-bg: #e2e2e2;
          --slider-border-radius: 999px;
          --level-color: #000;
          --level-transition-duration: 0.1s;

          width: 100%;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .salary-slider .salary-level {
          appearance: none;
          width: 100%;
          height: var(--slider-height);
          background: var(--slider-bg);
          border-radius: var(--slider-border-radius);
          overflow: hidden;
          transition: height var(--level-transition-duration);
          cursor: inherit;
        }

        /* black progress fill */
        .salary-slider .salary-level::-webkit-slider-thumb {
          appearance: none;
          width: 0;
          height: 0;
          box-shadow: -400px 0 0 400px var(--level-color);
        }

        .salary-slider .salary-level::-moz-range-thumb {
          width: 0;
          height: 0;
          box-shadow: -400px 0 0 400px var(--level-color);
        }

        .salary-slider:hover .salary-level {
          height: calc(var(--slider-height) * 2);
        }
      `}</style>

                  <label className="salary-slider w-full">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(Number(e.target.value))}
                      className="salary-level"
                    />
                  </label>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* MOBILE FILTER BUTTON */}
        <button
          onClick={() => setMobileFilters(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <Filter className="w-5 h-5" />
          Filters
          {getAppliedFiltersCount() > 0 && (
            <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {getAppliedFiltersCount()}
            </span>
          )}
        </button>


        {/* ===== JOB CARDS ===== */}
        <div className="flex-1">
          {/* ===== SEARCH BAR ===== */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, specialization, or location..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-2 top-1.5 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full p-2.5 shadow-md transition"
              >
                <Search size={18} />
              </button>
            </div>
          </div>


          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery || selectedSpecialties.length > 0 || selectedJobTypes.length > 0 || experienceRange > 0 || salaryRange > 0
                  ? "Try adjusting your filters or search query"
                  : "You haven't created any jobs yet"}
              </p>
              {(searchQuery || selectedSpecialties.length > 0 || selectedJobTypes.length > 0 || experienceRange > 0 || salaryRange > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {currentJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon + Content */}
                    <div className="flex gap-4 flex-1">
                      {/* Building Icon */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        {/* Title + Status Badge */}
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 hover:underline transition cursor-pointer"
                            onClick={() => router.push(`/dashboard/employee/jobs/view/${job._id}`)}>
                            {job.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide shrink-0 ${job.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : job.status === "Pending"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {job.status || "Active"}
                          </span>

                        </div>

                        {/* Organization */}
                        <p className="text-sm text-gray-600 mb-3">
                          {job.organizationName || "Healthcare Facility"}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            {job.experienceRequired?.minYears}–{job.experienceRequired?.maxYears} yrs
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {job.location?.city}, {job.location?.state}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <IndianRupee className="w-4 h-4 text-gray-400" />
                            {formatSalary(job.salary?.min)} – {formatSalary(job.salary?.max)}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <p className="line-clamp-2">
                            {job.description || "A great opportunity to lead and grow with a skilled healthcare team."}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                            {job.specialization || "General"}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            {job.jobType || "Full-time"}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            On-site
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Created on {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}
                    </p>

                    {/* View Details */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/employee/jobs/${job._id}/applications`)}
                        className="px-4 py-2 rounded-lg bg-[#096BCB] text-white text-sm font-normal flex gap-1 justify-center items-center transition"
                      >
                        <Users className="w-4 h-4" />
                        Applicants
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => router.push(`/dashboard/employee/jobs/edit/${job._id}`)}
                        title="Edit Job"
                        className="p-2 rounded-lg text-sm flex gap-1 justify-center items-center text-[#096BCB] font-normal border border-gray-300 transition "
                      >
                        <Pencil className="w-4 h-4 " />
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(job._id)}
                        title="Delete Job"
                        className="p-2 rounded-lg  text-sm text-red-600 transition flex gap-1 justify-center items-center border border-gray-300 font-normal"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
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