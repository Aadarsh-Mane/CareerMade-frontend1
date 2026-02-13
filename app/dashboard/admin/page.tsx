"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  TrendingUp,
  ArrowRight,
  Shield,
  Activity
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import toast from "react-hot-toast";

interface Stats {
  users: number;
  employers: number;
  jobs: number;
  applications: number;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color,
  link 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string;
  link: string;
}) => {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => router.push(link)}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#007BFF] transition-colors" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    employers: 0,
    jobs: 0,
    applications: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please log in again");
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch stats");
      }

      setStats(data.data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      toast.error(err.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-[#007BFF] to-[#00CFFF] rounded-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  Admin{" "}
                  <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>
              </div>
              <p className="text-base sm:text-lg text-blue-100">
                Manage users, employers, jobs, and monitor platform statistics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-gradient-to-r from-[#007BFF] to-[#00CFFF]"
            link="/dashboard/admin/users"
          />
          <StatCard
            title="Total Employers"
            value={stats.employers}
            icon={<Building2 className="w-6 h-6 text-white" />}
            color="bg-gradient-to-r from-[#00B8DB] to-[#00E0FF]"
            link="/dashboard/admin/employers"
          />
          <StatCard
            title="Total Jobs"
            value={stats.jobs}
            icon={<Briefcase className="w-6 h-6 text-white" />}
            color="bg-gradient-to-r from-[#155DFC] to-[#007BFF]"
            link="/dashboard/admin/jobs"
          />
          <StatCard
            title="Total Applications"
            value={stats.applications}
            icon={<FileText className="w-6 h-6 text-white" />}
            color="bg-gradient-to-r from-[#0066d9] to-[#00B8E6]"
            link="/dashboard/admin/jobs"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#007BFF]" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/dashboard/admin/users")}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#007BFF] hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#007BFF]" />
                <span className="font-medium text-gray-900">Manage Users</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#007BFF]" />
            </button>

            <button
              onClick={() => router.push("/dashboard/admin/employers")}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#007BFF] hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#007BFF]" />
                <span className="font-medium text-gray-900">Manage Employers</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#007BFF]" />
            </button>

            <button
              onClick={() => router.push("/dashboard/admin/jobs")}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#007BFF] hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-[#007BFF]" />
                <span className="font-medium text-gray-900">Manage Jobs</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#007BFF]" />
            </button>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#007BFF]" />
            Platform Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Active Users</span>
              <span className="font-semibold text-gray-900">{stats.users}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Verified Employers</span>
              <span className="font-semibold text-gray-900">{stats.employers}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Active Job Postings</span>
              <span className="font-semibold text-gray-900">{stats.jobs}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Applications</span>
              <span className="font-semibold text-gray-900">{stats.applications}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}