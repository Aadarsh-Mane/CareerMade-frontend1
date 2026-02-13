"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Search, 
  Filter,
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Mail,
  Phone,
  Globe,
  Shield,
  ShieldCheck,
  ShieldOff
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import toast from "react-hot-toast";

interface Employer {
  _id: string;
  organizationName: string;
  email: string;
  phone?: string;
  website?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
  };
  createdAt: string;
}

export default function EmployersManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  useEffect(() => {
    fetchEmployers();
  }, [page, verifiedFilter, appliedSearchQuery]);

  const fetchEmployers = async () => {
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
      if (verifiedFilter) params.append("isVerified", verifiedFilter);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/employers?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch employers");
      }

      setEmployers(data.data.items);
      setTotal(data.data.total);
    } catch (err: any) {
      console.error("Error fetching employers:", err);
      toast.error(err.message || "Failed to load employers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setAppliedSearchQuery(searchQuery);
  };

  const handleVerifiedFilterChange = (value: string) => {
    setPage(1);
    setVerifiedFilter(value);
  };

  const handleVerify = async (employerId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/employers/${employerId}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to verify employer");
      }

      toast.success("Employer verified successfully");
      fetchEmployers();
    } catch (err: any) {
      console.error("Error verifying employer:", err);
      toast.error(err.message || "Failed to verify employer");
    }
  };

  const handleUnverify = async (employerId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/employers/${employerId}/unverify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to unverify employer");
      }

      toast.success("Employer unverified successfully");
      fetchEmployers();
    } catch (err: any) {
      console.error("Error unverifying employer:", err);
      toast.error(err.message || "Failed to unverify employer");
    }
  };

  if (loading && employers.length === 0) {
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
                Employers{" "}
                <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Management
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                Verify and manage employer accounts on the platform
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  placeholder="Organization name, city, state..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Verification Status
              </label>
              <select
                value={verifiedFilter}
                onChange={(e) => handleVerifiedFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
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

        {/* Employers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employers.map((employer) => (
            <div
              key={employer._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#007BFF] to-[#00CFFF] p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#007BFF]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {employer.organizationName}
                      </h3>
                    </div>
                  </div>
                  {employer.verification.isVerified ? (
                    <ShieldCheck className="w-6 h-6 text-green-300" />
                  ) : (
                    <ShieldOff className="w-6 h-6 text-yellow-300" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {employer.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{employer.email}</span>
                  </div>
                )}

                {employer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{employer.phone}</span>
                  </div>
                )}

                {employer.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007BFF] hover:underline truncate"
                    >
                      {employer.website}
                    </a>
                  </div>
                )}

                {employer.address && (employer.address.city || employer.address.state) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>
                      {[employer.address.city, employer.address.state, employer.address.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Joined {new Date(employer.createdAt).toLocaleDateString()}</span>
                    {employer.verification.isVerified && employer.verification.verifiedAt && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {employer.verification.isVerified ? (
                    <button
                      onClick={() => handleUnverify(employer._id)}
                      className="w-full px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldOff className="w-4 h-4" />
                      Unverify Employer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVerify(employer._id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Verify Employer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {employers.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No employers found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        {employers.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} employers
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
    </div>
  );
}
