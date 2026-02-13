"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  LogOut,
  MapPin,
  Clock,
  Bookmark,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };
  const handleClick = () => {
    router.push("/dashboard/employee/jobs/create");
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const colors = ["bg-blue-500", "bg-purple-600", "bg-green-500", "bg-gray-800"];

  return (
    <>

      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        {/* Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-10 max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-2">
            <div className="bg-[#8F59ED] p-2 rounded-lg">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Employee Dashboard
            </h1>
          </div>

          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClick}
            className="flex items-center gap-2 text-sm md:text-base bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md"
          >
            <LogOut className="w-4 h-4" />
            Create Job
          </motion.button> */}
        </motion.header>

        {/* Section Title */}
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Job Listings</h2>
          <button
            onClick={() => router.push("/dashboard/employee/jobs")}
            className="text-[#8F59ED] hover:underline text-sm font-medium"
          >
            View all
          </button>
        </div>

        {/* Jobs Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <p className="text-gray-600">Loading recent jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-600">No jobs posted yet.</p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  onClick={() =>
                    router.push(`/dashboard/employee/jobs/view/${job._id}`)
                  }
                  className="cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden transition"
                >
                  {/* Color Bar */}
                  <div className={`h-2 ${colors[index % colors.length]}`}></div>

                  <div className="p-5">
                    {/* Title Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {job.hospital || "City General Hospital"}
                        </p>
                      </div>
                      <Bookmark className="w-5 h-5 text-gray-400 hover:text-[#8F59ED]" />
                    </div>

                    {/* Details */}
                    <div className="text-sm text-gray-500 flex flex-col gap-1 mb-3">
                      <p className="flex items-center gap-1">
                        <MapPin size={14} />{" "}
                        {job.location
                          ? `${job.location.city}, ${job.location.state}`
                          : "Remote"}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock size={14} /> {job.experience || "5-8 years"}
                      </p>
                      <p>{job.salary ? `${job.salary} LPA` : "15-25 LPA"}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {(job.specialization
                        ? [job.specialization]
                        : ["Cardiology", "Full-time", "Reception"]
                      ).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
