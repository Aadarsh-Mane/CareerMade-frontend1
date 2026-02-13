"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  Search, 
  Filter,
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Pause,
  Play
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import toast from "react-hot-toast";

interface Job {
  _id: string;
  title: string;
  specialization: string;
  description: string;
  jobType: string;
  shift: string;
  isRemote: boolean;
  status: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  employer: {
    _id: string;
    organizationName: string;
  };
  createdAt: string;
}

export default function JobsManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  
  // Action menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter, jobTypeFilter, appliedSearchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please log in again");
        router.push("/login");
        return;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (appliedSearchQuery) params.append("q", appliedSearchQuery);
      if (statusFilter) params.append("status", statusFilter);
      if (jobTypeFilter) params.append("jobType", jobTypeFilter);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch jobs");
      }

      setJobs(data.data.items || data.data);
      setTotal(data.data.total || data.data.length);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      toast.error(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setAppliedSearchQuery(searchQuery);
  };

  const handleStatusFilterChange = (value: string) => {
    setPage(1);
    setStatusFilter(value);
  };

  const handleJobTypeFilterChange = (value: string) => {
    setPage(1);
    setJobTypeFilter(value);
  };

  const handleChangeStatus = async (jobId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change job status");
      }

      toast.success("Job status updated successfully");
      fetchJobs();
      setActiveMenu(null);
    } catch (err: any) {
      console.error("Error changing job status:", err);
      toast.error(err.message || "Failed to change job status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case "Pending":
        return (
          <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "Archived":
        return (
          <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <Pause className="w-3 h-3" />
            Archived
          </span>
        );
      case "Closed":
        return (
          <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Closed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatSalary = (salary: any) => {
    if (!salary || !salary.min || !salary.max) return "Not specified";
    const currencySymbol = salary.currency === "INR" ? "₹" : "$";
    return `${currencySymbol}${salary.min.toLocaleString()} - ${currencySymbol}${salary.max.toLocaleString()} ${salary.period}`;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Banner */}
      <div className="bg-gray-50">
        <div className="w-full relative bg-[#002B6B] text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Jobs{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                Monitor and manage all job postings on the platform
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-start sm:justify-end w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push("/dashboard/admin")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#007BFF]" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Job title, specialization..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Type
              </label>
              <select
                value={jobTypeFilter}
                onChange={(e) => handleJobTypeFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            Apply Filters
          </button>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-[#007BFF] to-[#00CFFF] flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Building2 className="w-4 h-4" />
                          <span>{job.employer?.organizationName || "Unknown Employer"}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    {getStatusBadge(job.status)}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === job._id ? null : job._id)}
                        className="text-gray-400 hover:text-gray-600 p-2"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {activeMenu === job._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleChangeStatus(job._id, "Pending")}
                              disabled={job.status === "Pending"}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                job.status === "Pending"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              Mark as Pending
                            </button>
                            
                            <button
                              onClick={() => handleChangeStatus(job._id, "Active")}
                              disabled={job.status === "Active"}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                job.status === "Active"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <Play className="w-4 h-4" />
                              Mark as Active
                            </button>
                            
                            <button
                              onClick={() => handleChangeStatus(job._id, "Archived")}
                              disabled={job.status === "Archived"}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                job.status === "Archived"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <Pause className="w-4 h-4" />
                              Archive Job
                            </button>
                            
                            <button
                              onClick={() => handleChangeStatus(job._id, "Closed")}
                              disabled={job.status === "Closed"}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                job.status === "Closed"
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <XCircle className="w-4 h-4" />
                              Close Job
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="font-medium">{job.jobType}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Shift</div>
                      <div className="font-medium">{job.shift}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="font-medium">
                        {job.isRemote
                          ? "Remote"
                          : job.location?.city
                          ? `${job.location.city}, ${job.location.state}`
                          : "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Salary</div>
                      <div className="font-medium text-xs">{formatSalary(job.salary)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#007BFF] hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        {jobs.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} jobs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= total}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>
                  <p className="text-blue-100">{selectedJob.employer?.organizationName}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Specialization</h4>
                  <p className="text-gray-600">{selectedJob.specialization}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Job Type</h4>
                  <p className="text-gray-600">{selectedJob.jobType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Shift</h4>
                  <p className="text-gray-600">{selectedJob.shift}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Status</h4>
                  {getStatusBadge(selectedJob.status)}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Salary Range</h4>
                <p className="text-gray-600">{formatSalary(selectedJob.salary)}</p>
              </div>

              {!selectedJob.isRemote && selectedJob.location && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Location</h4>
                  <p className="text-gray-600">
                    {[selectedJob.location.city, selectedJob.location.state, selectedJob.location.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Posted on {new Date(selectedJob.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
