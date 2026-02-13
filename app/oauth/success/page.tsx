"use client";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function OAuthHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = useCallback(async () => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError("Missing tokens in callback.");
      setProcessing(false);
      return;
    }

    // 1. Store tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    try {
      // 2. Fetch user profile using the new access token
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch user profile.");
      }

      const { user } = data.data;

      // 3. Store user object in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Redirect to the correct dashboard
      if (user.role === "jobseeker") {
        router.replace("/dashboard/jobseeker");
      } else if (user.role === "employer") {
        router.replace("/dashboard/employee/jobs");
      } else {
        router.replace("/dashboard"); // Fallback
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      toast.error(`Authentication failed: ${errorMessage}`);
      setError(`Authentication failed: ${errorMessage}`);
      setProcessing(false);
    }
  }, [params, router]);

  useEffect(() => {
    handleAuth();
  }, [params, router]);

  if (processing && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Signing you in…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-600">{error || "Something went wrong."}</p>
      <a href="/login" className="text-[#8F59ED] underline">
        Go to login
      </a>
    </div>
  );
}

export default function OAuthSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-700">Processing OAuth response…</p>
        </div>
      }
    >
      <OAuthHandler />
    </Suspense>
  );
}
