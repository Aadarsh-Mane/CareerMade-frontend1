"use client";
import Link from "next/link";

export default function OAuthFailure() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold text-gray-800">OAuth Failed</h1>
      <p className="text-gray-600">We couldn't sign you in with Google. Please try again.</p>
      <Link href="/login" className="text-[#8F59ED] underline">Back to Login</Link>
    </div>
  );
}
