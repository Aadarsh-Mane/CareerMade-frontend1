"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  ArrowLeft,
  User2,
  Edit,
  FileText,
  File,
  Upload,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Award,
  BookOpen,
  Briefcase,
  Code,
  Book,
  Trophy,
} from "lucide-react";
import GradientLoader from "@/app/components/GradientLoader";
import { toast } from "react-hot-toast";

export default function JobSeekerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "jobseeker") {
      router.push("/login");
      return;
    }
  }, [router]);

  // Fetch user from localStorage
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
    setUser(storedUser);
  }, []);

  // Fetch profile
  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const seeker = data.data?.jobSeeker || data;
        setProfile(seeker);
        setResume(seeker.resume || null);
        setCoverLetter(seeker.coverLetter || null);
      })
      .catch(() => toast.error("Failed to fetch profile"))
      .finally(() => setLoading(false));
  }, [token]);

  // File upload
  const handleFileUpload = async (e: any, type: "resume" | "coverLetter") => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);

    const endpoint =
      type === "resume"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        if (type === "resume") setResume(data.data.resume);
        else setCoverLetter(data.data.coverLetter);
        toast.success(`${type === "resume" ? "Resume" : "Cover letter"} uploaded!`);
      } else toast.success(data.message || "Upload failed");
    } catch (err) {
      toast.error("Error uploading file");
    }
  };

  // File delete
  const handleDelete = async (type: "resume" | "coverLetter") => {
    if (!confirm(`Delete ${type}?`)) return;
    const endpoint =
      type === "resume"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`;
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (type === "resume") setResume(null);
        else setCoverLetter(null);
        toast.success(`${type} deleted!`);
      } else toast.success("Failed to delete");
    } catch (err) {
      toast.error("Error deleting file");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
      </div>
    );

  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-6">
        <p className="text-gray-700 mb-4">Profile not found.</p>
        <button
          onClick={() => router.push("/dashboard/jobseeker/profile/create")}
          className="bg-linear-to-r from-[#007BFF] to-[#00CFFF] text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all"
        >
          Create Profile
        </button>
      </div>
    );

  // ✅ Validation logic (right side completion card)
  const missingSections: { key: string; label: string; isMissing: boolean }[] = [
    { key: "bio", label: "Professional Summary", isMissing: !profile?.bio },
    { key: "workExperience", label: "Work Experience", isMissing: !(profile?.workExperience?.length > 0) },
    { key: "education", label: "Education", isMissing: !(profile?.education?.length > 0) },
    { key: "certifications", label: "Certifications", isMissing: !(profile?.certifications?.length > 0) },
    { key: "skills", label: "Skills", isMissing: !(profile?.skills?.length > 0) },
    { key: "specializations", label: "Specializations", isMissing: !(profile?.specializations?.length > 0) },
    { key: "resume", label: "Resume", isMissing: !resume?.url },
    { key: "coverLetter", label: "Cover Letter", isMissing: !coverLetter?.url },
  ];

  const incomplete = missingSections.filter(s => s.isMissing);
  const autoCompletion =
    Math.round(
      ((missingSections.length - incomplete.length) / missingSections.length) * 100
    );

  const overallCompletion = profile?.profileCompletion ?? autoCompletion;

  return (
    <>
      <Navbar />

      {/* ===== HEADER SECTION ===== */}
      <div className="bg-gray-50">
        <div className="w-full relative bg-[#002B6B] text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>
          <div className="absolute inset-0 bg-linear-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Job Seeker{" "}
                <span className="bg-linear-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                  Profile
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                View and manage your professional profile
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-start sm:justify-end w-full sm:w-auto">
              <button
                onClick={() =>
                  router.push("/dashboard/jobseeker/profile/create")
                }
                className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
              <button
                onClick={() => router.push("/dashboard/jobseeker")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DASHBOARD SECTION ===== */}
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col items-center text-center">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-linear-to-r from-[#007BFF] to-[#00CFFF] flex items-center justify-center mb-4">
                  <User2 className="w-12 h-12 text-white" />
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-[#007BFF] font-medium mt-1">
                {profile?.professionalInfo?.category || profile?.title || "Healthcare Professional"}
              </p>

              <div className="flex flex-col items-center gap-2 mt-4 w-full">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {user?.phone || "N/A"}
                </div>
              </div>

              <div className="w-full border-t border-gray-200 my-5"></div>

              {/* Profile Completion Progress */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Profile Completion
                  </span>
                  <span className="text-sm font-bold text-[#007BFF]">
                    {profile?.profileCompletion ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-linear-to-r from-[#007BFF] to-[#00CFFF] h-2.5 rounded-full transition-all"
                    style={{ width: `${profile?.profileCompletion ?? 0}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Complete your profile to increase visibility
              </p>
            </div>

            {/* Resume Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#007BFF]" />
                Resume
              </h3>
              {resume ? (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <a
                      href={resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007BFF] hover:text-indigo-800 font-medium text-sm break-all"
                    >
                      {resume.filename}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded:{" "}
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete("resume")}
                    className="w-full text-red-500 hover:text-red-700 text-sm font-medium py-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="inline w-4 h-4 mr-2" /> Delete Resume
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition group">
                  <Upload className="w-8 h-8 text-indigo-400 group-hover:text-[#007BFF] mb-2" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#007BFF]">
                    Upload Resume
                  </span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "resume")}
                  />
                </label>
              )}
            </div>

            {/* Cover Letter Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <File className="w-5 h-5 text-[#007BFF]" />
                Cover Letter
              </h3>
              {coverLetter ? (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <a
                      href={coverLetter.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007BFF] hover:text-indigo-800 font-medium text-sm break-all"
                    >
                      {coverLetter.filename}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded:{" "}
                      {new Date(coverLetter.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete("coverLetter")}
                    className="w-full text-red-500 hover:text-red-700 text-sm font-medium py-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="inline w-4 h-4 mr-2" /> Delete Cover
                    Letter
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition group">
                  <Upload className="w-8 h-8 text-[#007BFF] group-hover:text-[#007BFF] mb-2" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#007BFF]">
                    Upload Cover Letter
                  </span>
                  <span className="text-xs text-gray-500">PDF, DOC, DOCX</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "coverLetter")}
                  />
                </label>
              )}
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="md:col-span-2 space-y-6">
            {/* ✅ Completion / Validation Card */}
            {overallCompletion < 100 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-[#007BFF] to-[#00CFFF] text-white text-sm font-bold">
                    {overallCompletion}%
                  </span>
                  Complete Your Profile
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Finish the sections below to reach 100% and improve visibility.
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="h-2 rounded-full bg-linear-to-r from-[#007BFF] to-[#00CFFF]"
                    style={{ width: `${overallCompletion}%` }}
                  />
                </div>

                {incomplete.length > 0 ? (
                  <ul className="space-y-2 mb-4">
                    {incomplete.map(item => (
                      <li
                        key={item.key}
                        className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
                      >
                        <span className="text-xs font-medium text-rose-700">
                          {item.label} missing
                        </span>
                        <button
                          onClick={() => router.push("/dashboard/jobseeker/profile/create")}
                          className="text-xs font-semibold text-[#007BFF] hover:underline"
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-emerald-600 font-medium mb-4">
                    All required sections completed.
                  </p>
                )}

                <button
                  onClick={() => router.push("/dashboard/jobseeker/profile/create")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:opacity-90 transition"
                >
                  <Edit className="w-4 h-4" />
                  Update Now
                </button>
              </div>
            )}
            {/* Professional Summary */}
            {profile?.bio && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Professional Summary
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {profile?.workExperience && profile.workExperience.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#007BFF]" />
                  Work Experience
                </h3>
                <div className="space-y-4">
                  {profile.workExperience.map((exp: any, idx: number) => (
                    <div
                      key={idx}
                      className="border-l-4 border-[#007BFF] pl-4 py-2"
                    >
                      <h4 className="font-semibold text-gray-900">
                        {exp.position}
                      </h4>
                      <p className="text-[#007BFF] text-sm font-medium">
                        {exp.company}
                      </p>
                      <p className="text-gray-600 text-sm">
                        📍 {exp.location}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {exp.startDate
                          ? new Date(exp.startDate).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short" }
                          )
                          : ""}{" "}
                        -{" "}
                        {exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          })
                          : "Present"}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 text-sm mt-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Certifications */}
            {(profile?.education?.length > 0 ||
              profile?.certifications?.length > 0) && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#007BFF]" />
                    Education & Certifications
                  </h3>

                  {/* Education */}
                  {profile?.education && profile.education.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                        Education
                      </h4>
                      <div className="space-y-3">
                        {profile.education.map((edu: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-[#007BFF] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                <Book className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 text-sm">
                                  {edu.degree} in {edu.field}
                                </h5>
                                <p className="text-gray-700 text-sm">
                                  {edu.institution}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {edu.yearOfCompletion}
                                  {edu.grade && ` • Grade: ${edu.grade}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {profile?.certifications && profile.certifications.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                        Certifications
                      </h4>
                      <div className="space-y-3">
                        {profile.certifications.map((cert: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                <Trophy className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 text-sm">
                                  {cert.name}
                                </h5>
                                <p className="text-gray-700 text-sm">
                                  {cert.issuingOrganization}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  Issued:{" "}
                                  {new Date(cert.issueDate).toLocaleDateString(
                                    "en-US",
                                    { year: "numeric", month: "short" }
                                  )}
                                  {cert.expiryDate &&
                                    ` • Expires: ${new Date(
                                      cert.expiryDate
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                    })}`}
                                </p>
                                {cert.credentialUrl && (
                                  <a
                                    href={cert.credentialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#007BFF] hover:underline text-xs mt-1 inline-block"
                                  >
                                    View Credential
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#007BFF]" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block px-4 py-2 bg-linear-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            {profile?.specializations && profile.specializations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#007BFF]" />
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
