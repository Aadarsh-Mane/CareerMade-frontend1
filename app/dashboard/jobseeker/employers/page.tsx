"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  Building2,
  MapPin,
  Briefcase,
  CheckCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "react-toastify";

interface Employer {
  _id: string;
  organizationName: string;
  organizationType: string;
  description: string;
  website?: string;
  foundedYear?: number;
  employeeCount?: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  specializations: string[];
  logo?: {
    url: string;
  };
  verification: {
    isVerified: boolean;
  };
  stats: {
    activeJobPosts: number;
    totalJobPosts: number;
    profileViews: number;
    totalHires: number;
  };
  createdAt: string;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function EmployersPage() {
  const router = useRouter();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const organizationTypes = [
    "Hospital",
    "Clinic",
    "Medical Center",
    "Nursing Home",
    "Diagnostic Center",
    "Pharmacy",
    "Healthcare Startup",
    "Telemedicine",
  ];

  const specializations = [
    "General Medicine",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
    "Dermatology",
    "Psychiatry",
  ];

  // Filter section expansion states
  const [expandedSections, setExpandedSections] = useState({
    organizationType: true,
    specialization: true,
    location: false,
  });

  // Selected filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [showAllSpecializations, setShowAllSpecializations] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");

  const employersPerPage = 5;

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employer/all?limit=50`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setEmployers(data.data.employers);
        setPagination(data.meta.pagination);
      } else {
        toast.error(data.message || "Failed to fetch employers");
      }
    } catch (error) {
      console.error("Failed to fetch employers:", error);
      toast.error("Failed to load employers");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const getAppliedFiltersCount = () => {
    let count = 0;
    if (selectedTypes.length > 0) count++;
    if (selectedSpecializations.length > 0) count++;
    if (verifiedOnly) count++;
    if (locationFilter) count++;
    return count;
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedSpecializations([]);
    setVerifiedOnly(false);
    setLocationFilter("");
    setSearchQuery("");
  };

  const getTypeCount = (type: string) => {
    return employers.filter(e => e.organizationType === type).length;
  };

  const getSpecializationCount = (spec: string) => {
    return employers.filter(e => e.specializations.includes(spec)).length;
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

  // Apply filters
  let filteredEmployers = [...employers];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredEmployers = filteredEmployers.filter(
      (e) =>
        e.organizationName?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.organizationType?.toLowerCase().includes(q)
    );
  }

  if (selectedTypes.length > 0) {
    filteredEmployers = filteredEmployers.filter(e =>
      selectedTypes.includes(e.organizationType)
    );
  }

  if (selectedSpecializations.length > 0) {
    filteredEmployers = filteredEmployers.filter(e =>
      selectedSpecializations.some(s => e.specializations.includes(s))
    );
  }

  if (verifiedOnly) {
    filteredEmployers = filteredEmployers.filter(e => e.verification.isVerified);
  }

  if (locationFilter) {
    const locFilter = locationFilter.toLowerCase();
    filteredEmployers = filteredEmployers.filter(e =>
      e.address.city?.toLowerCase().includes(locFilter) ||
      e.address.state?.toLowerCase().includes(locFilter)
    );
  }

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredEmployers.length / employersPerPage);
  const start = (currentPage - 1) * employersPerPage;
  const currentEmployers = filteredEmployers.slice(start, start + employersPerPage);

  const displayedTypes = showAllTypes ? organizationTypes : organizationTypes.slice(0, 4);
  const displayedSpecializations = showAllSpecializations ? specializations : specializations.slice(0, 4);

  return (
    <>
      <Navbar />
      
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
            {/* Header with Clear All */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">All Filters</h2>
              {getAppliedFiltersCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  Clear ({getAppliedFiltersCount()})
                </button>
              )}
            </div>

            {/* ORGANIZATION TYPE FILTER */}
            <div className="mb-6 pb-6 border-b">
              <button
                onClick={() => toggleSection('organizationType')}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h3 className="text-base font-bold text-gray-900">Organization Type</h3>
                {expandedSections.organizationType ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.organizationType && (
                <div className="space-y-2.5">
                  {displayedTypes.map((type) => {
                    const count = getTypeCount(type);
                    return (
                      <label
                        key={type}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                          {type}
                        </span>
                        <span className="text-xs text-gray-400">({count})</span>
                      </label>
                    );
                  })}
                  <button
                    onClick={() => setShowAllTypes(!showAllTypes)}
                    className="text-sm text-blue-600 font-medium hover:underline mt-2"
                  >
                    {showAllTypes ? "View Less" : "View More"}
                  </button>
                </div>
              )}
            </div>

            {/* SPECIALIZATION FILTER */}
            <div className="mb-6 pb-6 border-b">
              <button
                onClick={() => toggleSection('specialization')}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <h3 className="text-base font-bold text-gray-900">Specialization</h3>
                {expandedSections.specialization ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {expandedSections.specialization && (
                <div className="space-y-2.5">
                  {displayedSpecializations.map((spec) => {
                    const count = getSpecializationCount(spec);
                    return (
                      <label
                        key={spec}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSpecializations.includes(spec)}
                          onChange={() => toggleSpecialization(spec)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                          {spec}
                        </span>
                        <span className="text-xs text-gray-400">({count})</span>
                      </label>
                    );
                  })}
                  <button
                    onClick={() => setShowAllSpecializations(!showAllSpecializations)}
                    className="text-sm text-blue-600 font-medium hover:underline mt-2"
                  >
                    {showAllSpecializations ? "View Less" : "View More"}
                  </button>
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
                <input
                  type="text"
                  placeholder="City or State"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            {/* VERIFIED ONLY */}
            <div className="mb-4">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Verified Only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ===== EMPLOYER CARDS + SEARCH ===== */}
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

          {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">
              Loading employers...
            </div>
          ) : filteredEmployers.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No matching employers found
            </div>
          ) : (
            <div className="space-y-4">
              {currentEmployers.map((employer) => (
                <div
                  key={employer._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 cursor-pointer"
                  onClick={() => router.push(`/dashboard/jobseeker/employers/${employer._id}`)}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Icon + Content */}
                    <div className="flex gap-4 flex-1">
                      {/* Logo */}
                      <div className="flex-shrink-0">
                        {employer.logo?.url ? (
                          <img
                            src={employer.logo.url}
                            alt={employer.organizationName}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Employer Details */}
                      <div className="flex-1">
                        {/* Title with Verified Badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {employer.organizationName}
                          </h3>
                          {employer.verification.isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>

                        {/* Organization Type */}
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">{employer.organizationType}</span>
                          {employer.employeeCount && (
                            <>
                              <span className="text-gray-400 mx-1">|</span>
                              <span className="text-gray-500">{employer.employeeCount} employees</span>
                            </>
                          )}
                        </p>

                        {/* Meta Information Row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                          {/* Location */}
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{employer.address.city}, {employer.address.state}</span>
                          </div>

                          {/* Active Jobs */}
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {employer.stats.activeJobPosts} Active Jobs
                            </span>
                          </div>

                          {/* Views */}
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span>{employer.stats.profileViews} Views</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                          {employer.description || "Leading healthcare organization committed to excellence in patient care."}
                        </p>

                        {/* Tags Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          {employer.specializations.slice(0, 3).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                            >
                              {spec}
                            </span>
                          ))}
                          {employer.specializations.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                              +{employer.specializations.length - 3} more
                            </span>
                          )}

                          {/* Time Posted */}
                          <span className="ml-auto text-xs text-gray-500">
                            {getTimeAgo(employer.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Arrow Icon */}
                    <button className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition p-1">
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
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    currentPage === i + 1
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

        {/* RIGHT SIDEBAR (Desktop) - Similar to jobs page */}
        <div className="lg:flex flex-col gap-6">
          {/* Featured Organizations */}
          <div className="bg-white border rounded-2xl shadow-sm p-5 mb-5">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Top Healthcare Organizations
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <img src="/apollo.png" alt="Apollo" className="h-10 w-auto object-contain" />
              <img src="/max.png" alt="Max Healthcare" className="h-10 w-auto object-contain" />
              <img src="/fortis.png" alt="Fortis" className="h-10 w-auto object-contain" />
              <img src="/aiims.png" alt="AIIMS" className="h-10 w-auto object-contain" />
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white border rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Browse by Category
            </h3>
            <div className="space-y-3">
              {organizationTypes.slice(0, 5).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedTypes([type]);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-700"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
