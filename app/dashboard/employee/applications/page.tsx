"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GradientLoader from "@/app/components/GradientLoader";
import toast from "react-hot-toast";

export default function EmployerApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      toast.error("Please log in to continue.");
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user);

    // Role-based access: allow only employers
    if (parsedUser.role !== "employer") {
      toast.error("Access denied. Employers only.");
      router.push("/login");
      return;
    }

    // ✅ Fetch employer applications
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/employer?limit=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.data?.items || []);
      })
      .catch((err) => {
        console.error("Error fetching applications:", err);
        toast.error("Failed to fetch applications.");
      })
      .finally(() => setLoading(false));
  }, [router]);


  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Applications for Your Jobs</h1>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="border p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/dashboard/employee/applications/${app._id}`)}
            >
              <h2 className="text-lg font-medium">{app.job?.title}</h2>
              <p className="text-sm text-gray-600">
                Applicant:{" "}
                {app.jobSeeker?.name ||
                  app.jobSeeker?.user?.name ||
                  "Unknown Candidate"}
              </p>
              <p className="text-sm mt-1">
                Status:{" "}
                <span
                  className={`font-medium ${app.status === "Applied"
                      ? "text-blue-600"
                      : app.status === "Interview"
                        ? "text-yellow-600"
                        : app.status === "Rejected"
                          ? "text-red-600"
                          : "text-green-600"
                    }`}
                >
                  {app.status}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Applied on: {new Date(app.appliedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
