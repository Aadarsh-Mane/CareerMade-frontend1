"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GradientLoader from "@/app/components/GradientLoader";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectToDashboard = () => {
      try {
        // Get user data from localStorage
        const accessToken = localStorage.getItem("accessToken");
        const userString = localStorage.getItem("user");

        // If no token, redirect to login
        if (!accessToken) {
          router.push("/login");
          return;
        }

        // If no user data, redirect to login
        if (!userString) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(userString);

        // Redirect based on user role
        switch (user.role) {
          case "jobseeker":
            router.push("/dashboard/jobseeker");
            break;
          case "employer":
            router.push("/dashboard/employee");
            break;
          case "admin":
            router.push("/dashboard/admin");
            break;
          default:
            // If role is unknown, redirect to jobseeker dashboard as fallback
            router.push("/dashboard/jobseeker");
            break;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.push("/login");
      }
    };

    // Add slight delay to prevent flashing
    const timer = setTimeout(() => {
      redirectToDashboard();
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  // Show loading screen while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <GradientLoader />
        <p className="mt-4 text-gray-600 text-lg">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
