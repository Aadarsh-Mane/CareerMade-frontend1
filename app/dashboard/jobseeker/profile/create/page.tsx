"use client";
// bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6]
import React, { useEffect, useMemo, useState } from "react";
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
  Save,
  Mail,
  Phone,
} from "lucide-react";
import GradientLoader from "@/app/components/GradientLoader";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = [
  "Doctor",
  "Nurse",
  "Technician",
  "Pharmacy",
  "Support",
  "Admin",
  "Insurance",
  "Marketing",
  "Other",
];

const SPECIFICATIONS_BY_CATEGORY: Record<string, string[]> = {
  Nurse: ["ANM", "GNM", "BSC", "Others"],
  Technician: [
    "Cathlab",
    "Dylisis",
    "Opration theatre",
    "Laboratory",
    "Endoscopy",
    "X- ray",
    "CT/MRI",
    "Other",
  ],
  Pharmacy: ["D. Pharma", "B. Pharma", "Other"],
  Support: ["Ward assistant", "OT assistant", "House keeping", "Security", "Accounting", "Others"],
  Doctor: ["Specialist", "Super specialist", "Medicine officer", "RMO"],
};

const DOCTOR_SPECIALIZATION_GROUPS: Record<string, string[]> = {
  Medicine: [
    "Cardiology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Nephrology",
    "Pulmonology",
    "Rheumatology",
  ],
  Surgery: [
    "General Surgery",
    "Orthopedic Surgery",
    "Neurosurgery",
    "Cardiothoracic Surgery",
    "Plastic Surgery",
    "Urology",
  ],
  "Women & Child": [
    "Obstetrics & Gynecology",
    "Pediatrics",
    "Neonatology",
    "Pediatric Surgery",
  ],
  Diagnostics: [
    "Radiology",
    "Pathology",
    "Nuclear Medicine",
    "Microbiology",
  ],
  "Critical Care": [
    "Anesthesiology",
    "Emergency Medicine",
    "Critical Care Medicine",
  ],
};

const COUNTRY_STATE_CITY: Record<string, Record<string, string[]>> = {
  India: {
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangaluru"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    Delhi: ["New Delhi"],
  },
  "United States": {
    California: ["Los Angeles", "San Francisco", "San Diego"],
    Texas: ["Houston", "Dallas", "Austin"],
    Florida: ["Miami", "Orlando", "Tampa"],
  },
};

export default function JobSeekerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [panCardFile, setPanCardFile] = useState<File | null>(null);
  const [aadhaarCardFile, setAadhaarCardFile] = useState<File | null>(null);

  const updateProfileAtPath = (path: string, value: any) => {
    setProfile((prev: any) => {
      const base = prev ? JSON.parse(JSON.stringify(prev)) : {};
      const parts = path.split('.');
      let cur: any = base;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isIndex = /^\d+$/.test(part);
        if (i === parts.length - 1) {
          if (isIndex) {
            const idx = parseInt(part, 10);
            if (!Array.isArray(cur)) cur = [];
            cur[idx] = value;
          } else {
            cur[part] = value;
          }
        } else {
          if (isIndex) {
            const idx = parseInt(part, 10);
            if (!Array.isArray(cur)) cur = [];
            if (!cur[idx]) cur[idx] = {};
            cur = cur[idx];
          } else {
            if (!cur[part]) {
              const next = parts[i + 1];
              cur[part] = /^\d+$/.test(next) ? [] : {};
            }
            cur = cur[part];
          }
        }
      }
      return base;
    });
  };

  const toggleArrayValue = (path: string, value: string) => {
    setProfile((prev: any) => {
      const base = prev ? JSON.parse(JSON.stringify(prev)) : {};
      const parts = path.split('.');
      let arrParent: any = base;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!arrParent[p]) arrParent[p] = {};
        arrParent = arrParent[p];
      }
      const key = parts[parts.length - 1];
      if (!Array.isArray(arrParent[key])) arrParent[key] = [];
      const idx = arrParent[key].indexOf(value);
      if (idx === -1) arrParent[key].push(value);
      else arrParent[key].splice(idx, 1);
      return base;
    });
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;

    if (!token) {
      toast.error("Please log in to access your dashboard");
      router.push("/login");
      return;
    }

    if (!storedUser || storedUser.role !== "jobseeker") {
      toast.error("Unauthorized access");
      router.push("/login");
      return;
    }
  }, [token, router]);

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
        // console.log(data);
        const seeker = data.data?.jobSeeker || data;
        seeker.personalInfo = seeker.personalInfo || {};
        seeker.professionalInfo = seeker.professionalInfo || {};
        seeker.professionalInfo.location = seeker.professionalInfo.location || {};
        seeker.professionalInfo.specifications = seeker.professionalInfo.specifications || [];
        seeker.documents = seeker.documents || {};
        setProfile(seeker);
        setResume(seeker.resume || null);
        setCoverLetter(seeker.coverLetter || null);
      })
      .catch(() => toast.error("Failed to fetch profile"))
      .finally(() => setLoading(false));
  }, [token]);

  const selectedCategory = profile?.professionalInfo?.category || "";
  const specificationOptions = useMemo(
    () => SPECIFICATIONS_BY_CATEGORY[selectedCategory] || [],
    [selectedCategory]
  );
  const showDoctorSpecializationFlow =
    selectedCategory === "Doctor" &&
    Array.isArray(profile?.professionalInfo?.specifications) &&
    (profile.professionalInfo.specifications.includes("Specialist") ||
      profile.professionalInfo.specifications.includes("Super specialist"));
  const doctorSpecializationGroup = profile?.professionalInfo?.doctorSpecialization || "";
  const doctorSubSpecialtyOptions = useMemo(
    () => DOCTOR_SPECIALIZATION_GROUPS[doctorSpecializationGroup] || [],
    [doctorSpecializationGroup]
  );
  const selectedCountry = profile?.professionalInfo?.location?.country || "";
  const selectedState = profile?.professionalInfo?.location?.state || "";
  const stateOptions = useMemo(
    () => (selectedCountry ? Object.keys(COUNTRY_STATE_CITY[selectedCountry] || {}) : []),
    [selectedCountry]
  );
  const cityOptions = useMemo(
    () => (selectedCountry && selectedState ? COUNTRY_STATE_CITY[selectedCountry]?.[selectedState] || [] : []),
    [selectedCountry, selectedState]
  );

  // Save profile
  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = JSON.parse(JSON.stringify(profile || {}));
      payload.personalInfo = payload.personalInfo || {};
      payload.professionalInfo = payload.professionalInfo || {};
      payload.documents = payload.documents || {};

      if (payload.professionalInfo.category !== "Other") {
        payload.professionalInfo.otherCategory = "";
      }
      if (!Array.isArray(payload.professionalInfo.specifications)) {
        payload.professionalInfo.specifications = [];
      }
      if (
        !payload.professionalInfo.specifications.includes("Other") &&
        !payload.professionalInfo.specifications.includes("Others")
      ) {
        payload.professionalInfo.otherSpecification = "";
      }
      const isDoctor = payload.professionalInfo.category === "Doctor";
      const isSpecialistDoctor =
        isDoctor &&
        Array.isArray(payload.professionalInfo.specifications) &&
        (payload.professionalInfo.specifications.includes("Specialist") ||
          payload.professionalInfo.specifications.includes("Super specialist"));
      if (!isSpecialistDoctor) {
        payload.professionalInfo.doctorSpecialization = "";
        payload.professionalInfo.doctorSubSpecialty = "";
      }
      if (payload.personalInfo?.dateOfBirth) {
        const dob = new Date(payload.personalInfo.dateOfBirth);
        if (!Number.isNaN(dob.getTime())) {
          const ageDiff = Date.now() - dob.getTime();
          const ageDate = new Date(ageDiff);
          const computedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
          payload.personalInfo.age = computedAge;
        }
      }

      const formData = new FormData();
      formData.append("profile", JSON.stringify(payload));
      if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);
      if (panCardFile) formData.append("panCardImage", panCardFile);
      if (aadhaarCardFile) formData.append("aadhaarCardImage", aadhaarCardFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const data = await res.json();
      if (res.ok) {
        const updated = data?.data?.jobSeeker;
        if (updated) {
          setProfile(updated);
          if (updated.user) {
            setUser(updated.user);
            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(updated.user));
            }
          }
        }
        setProfilePhotoFile(null);
        setPanCardFile(null);
        setAadhaarCardFile(null);
        toast.success("Profile updated!");
      } else toast.error(data.message || "Update failed");
    } catch {
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

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
    } else toast.error(data.message || "Upload failed");
  };

  // File delete
  const handleDelete = async (type: "resume" | "coverLetter") => {
    if (!confirm(`Delete ${type}?`)) return;
    const endpoint =
      type === "resume"
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`;
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      if (type === "resume") setResume(null);
      else setCoverLetter(null);
      toast.success(`${type} deleted!`);
    } else toast.error("Failed to delete");
  };

  // ---------------- LOADING STATES ----------------
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
          className="bg-[#8F59ED] hover:bg-[#7c4dd4] text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all"
        >
          Create Profile
        </button>
      </div>
    );

  // ---------------- UI ----------------
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
                  Dashboard
                </span>
              </h1>
              <p className="text-base sm:text-lg text-blue-100 mt-3">
                Manage your profile, resume, and cover letter to apply for jobs seamlessly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-start sm:justify-end w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard/jobseeker/profile")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-full text-sm sm:text-base font-semibold transition-all shadow-lg whitespace-nowrap"
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
          <div className="bg-white rounded-2xl shadow-sm p-6 border sm:h-64 border-gray-100 flex flex-col items-center text-center">
            {/* Profile Icon */}
            <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <User2 className="w-12 h-12 text-gray-400" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex flex-col items-center gap-1 mb-2">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <p className="text-sm text-gray-500">{user?.phone}</p>
              </div>
            </div>


            {/* <div className="w-full border-t border-gray-200 my-4"></div> */}

            {/* ===== Edit Profile Button ===== */}
            {/* <button
              onClick={() =>
                router.push("/dashboard/jobseeker/profile/edit")
              }
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white rounded-lg text-sm font-medium shadow-md transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button> */}
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100 space-y-8">
            {/* ===== PROFILE FORM ===== */}
            <form onSubmit={handleSave} className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Profile Photo</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border bg-gray-100">
                      {profilePhotoFile ? (
                        <img
                          src={URL.createObjectURL(profilePhotoFile)}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhotoFile(e.target.files?.[0] || null)}
                      className="border rounded-lg w-full p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Primary Email (Locked)</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="mt-1 border rounded-lg w-full p-2.5 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Primary Mobile (Locked)</label>
                  <input
                    type="text"
                    value={user?.phone || ""}
                    readOnly
                    className="mt-1 border rounded-lg w-full p-2.5 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Alternate Email</label>
                  <input
                    type="email"
                    value={profile.personalInfo?.alternateEmail || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.alternateEmail", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="alternate@email.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Alternate Mobile</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.alternatePhone || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.alternatePhone", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Alternate mobile number"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">DOB</label>
                  <input
                    type="date"
                    value={
                      profile.personalInfo?.dateOfBirth
                        ? new Date(profile.personalInfo.dateOfBirth).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => updateProfileAtPath("personalInfo.dateOfBirth", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Age</label>
                  <input
                    type="number"
                    value={profile.personalInfo?.age ?? ""}
                    onChange={(e) =>
                      updateProfileAtPath(
                        "personalInfo.age",
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    min={18}
                    max={100}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Sex</label>
                  <select
                    value={profile.personalInfo?.gender || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.gender", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Marital Status</label>
                  <select
                    value={profile.personalInfo?.maritalStatus || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.maritalStatus", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select status</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Address Line 1</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.address?.line1 || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.address.line1", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="House no, street, area"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Address Line 2</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.address?.line2 || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.address.line2", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Landmark (optional)"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Address Country</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.address?.country || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.address.country", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Address State</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.address?.state || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.address.state", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Address City</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.address?.city || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.address.city", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Pincode</label>
                  <input
                    type="text"
                    value={profile.personalInfo?.address?.pincode || ""}
                    onChange={(e) => updateProfileAtPath("personalInfo.address.pincode", e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Postal code"
                  />
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Professional Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <select
                    value={profile.professionalInfo?.category || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateProfileAtPath("professionalInfo.category", value);
                      updateProfileAtPath("professionalInfo.specifications", []);
                      if (value !== "Other") updateProfileAtPath("professionalInfo.otherCategory", "");
                      if (value !== "Doctor") {
                        updateProfileAtPath("professionalInfo.doctorSpecialization", "");
                        updateProfileAtPath("professionalInfo.doctorSubSpecialty", "");
                      }
                    }}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {profile.professionalInfo?.category === "Other" && (
                  <div>
                    <label className="text-sm text-gray-600">Specify Other Category</label>
                    <input
                      type="text"
                      value={profile.professionalInfo?.otherCategory || ""}
                      onChange={(e) => updateProfileAtPath("professionalInfo.otherCategory", e.target.value)}
                      className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Enter category"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Specifications</label>
                  <div className="mt-2 max-h-40 overflow-auto border rounded p-2">
                    {specificationOptions.length === 0 && (
                      <p className="text-sm text-gray-500">Select a category first.</p>
                    )}
                    {specificationOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm mb-1">
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(profile.professionalInfo?.specifications)
                              ? profile.professionalInfo.specifications.includes(opt)
                              : false
                          }
                          onChange={() => toggleArrayValue("professionalInfo.specifications", opt)}
                          className="w-4 h-4"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                    {Array.isArray(profile.professionalInfo?.specifications) &&
                      (profile.professionalInfo.specifications.includes("Other") ||
                        profile.professionalInfo.specifications.includes("Others")) && (
                      <input
                        type="text"
                        value={profile.professionalInfo?.otherSpecification || ""}
                        onChange={(e) =>
                          updateProfileAtPath("professionalInfo.otherSpecification", e.target.value)
                        }
                        className="mt-2 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Please specify other specification"
                      />
                    )}
                  </div>
                </div>
                {showDoctorSpecializationFlow && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Doctor Specialization Group</label>
                      <select
                        value={profile.professionalInfo?.doctorSpecialization || ""}
                        onChange={(e) => {
                          updateProfileAtPath("professionalInfo.doctorSpecialization", e.target.value);
                          updateProfileAtPath("professionalInfo.doctorSubSpecialty", "");
                        }}
                        className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select specialization group</option>
                        {Object.keys(DOCTOR_SPECIALIZATION_GROUPS).map((group) => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Doctor Sub-specialty</label>
                      <select
                        value={profile.professionalInfo?.doctorSubSpecialty || ""}
                        onChange={(e) => updateProfileAtPath("professionalInfo.doctorSubSpecialty", e.target.value)}
                        className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        disabled={!doctorSpecializationGroup}
                      >
                        <option value="">Select sub-specialty</option>
                        {doctorSubSpecialtyOptions.map((specialty) => (
                          <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm text-gray-600">Total Experience (years)</label>
                  <input
                    type="number"
                    value={profile.experience?.totalYears ?? ''}
                    onChange={(e) => updateProfileAtPath('experience.totalYears', e.target.value === '' ? undefined : Number(e.target.value))}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 3"
                    min={0}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Professional Location</label>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={profile.professionalInfo?.location?.country || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateProfileAtPath("professionalInfo.location.country", value);
                        updateProfileAtPath("professionalInfo.location.state", "");
                        updateProfileAtPath("professionalInfo.location.city", "");
                      }}
                      className="border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select country</option>
                      {Object.keys(COUNTRY_STATE_CITY).map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    <select
                      value={profile.professionalInfo?.location?.state || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateProfileAtPath("professionalInfo.location.state", value);
                        updateProfileAtPath("professionalInfo.location.city", "");
                      }}
                      className="border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      disabled={!selectedCountry}
                    >
                      <option value="">Select state</option>
                      {stateOptions.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <select
                      value={profile.professionalInfo?.location?.city || ""}
                      onChange={(e) => updateProfileAtPath("professionalInfo.location.city", e.target.value)}
                      className="border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      disabled={!selectedState}
                    >
                      <option value="">Select city</option>
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">PAN & Aadhaar</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">PAN Number</label>
                      <input
                        type="text"
                        value={profile.documents?.panNumber || ""}
                        onChange={(e) =>
                          updateProfileAtPath("documents.panNumber", e.target.value.toUpperCase())
                        }
                        className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Aadhaar Number</label>
                      <input
                        type="text"
                        value={profile.documents?.aadhaarNumber || ""}
                        onChange={(e) => updateProfileAtPath("documents.aadhaarNumber", e.target.value)}
                        className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="12 digit Aadhaar number"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">PAN Card Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPanCardFile(e.target.files?.[0] || null)}
                        className="mt-1 border rounded-lg w-full p-2.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Aadhaar Card Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAadhaarCardFile(e.target.files?.[0] || null)}
                        className="mt-1 border rounded-lg w-full p-2.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio || ""}
                    onChange={(e) => updateProfileAtPath('bio', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[90px]"
                    placeholder="Write something about yourself..."
                  />
                </div>

                {/* Education (single entry) */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Education</h3>
                  {(profile.education || []).map((edu: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 border p-3 rounded-lg bg-gray-50">
                      <select
                        value={edu.degree || ""}
                        onChange={(e) => updateProfileAtPath(`education.${index}.degree`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Select Degree</option>
                        {['MBBS', 'MD', 'MS', 'BDS', 'MDS', 'BPT', 'MPT', 'BSc Nursing', 'MSc Nursing', 'BPharm', 'MPharm', 'BSc', 'MSc', 'PhD', 'Diploma', 'Certificate', 'Other'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Field"
                        value={edu.field || ""}
                        onChange={(e) => updateProfileAtPath(`education.${index}.field`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution || ""}
                        onChange={(e) => updateProfileAtPath(`education.${index}.institution`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Year of Completion"
                        value={edu.yearOfCompletion || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`education.${index}.yearOfCompletion`, e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        min={1950}
                        max={new Date().getFullYear() + 5}
                      />
                      <input
                        type="text"
                        placeholder="Grade (optional)"
                        value={edu.grade || ""}
                        onChange={(e) => updateProfileAtPath(`education.${index}.grade`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev: any) => ({
                            ...prev,
                            education: prev.education.filter((_: any, i: number) => i !== index),
                          }))
                        }
                        className="text-red-500 text-sm mt-1 hover:underline col-span-full text-right"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setProfile((prev: any) => ({
                        ...prev,
                        education: [...(profile.education || []), {}],
                      }))
                    }
                    className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    + Add Education
                  </button>
                </div>

                {/* Work Experience (multiple) */}
                {/* === Work Experience (multiple) === */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Work Experience</h3>
                  {(profile.workExperience || []).map((exp: any, index: number) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 border p-3 rounded-lg bg-gray-50">
                      <input
                        type="text"
                        placeholder="Position"
                        value={exp.position || ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.position`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Company / Hospital"
                        value={exp.company || ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.company`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={exp.location || ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.location`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="date"
                        value={exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.startDate`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="date"
                        value={exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) => updateProfileAtPath(`workExperience.${index}.endDate`, e.target.value)}
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev: any) => ({
                            ...prev,
                            workExperience: prev.workExperience.filter((_: any, i: number) => i !== index),
                          }))
                        }
                        className="text-red-500 text-sm mt-1 hover:underline col-span-full text-right"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setProfile((prev: any) => ({
                        ...prev,
                        workExperience: [...(prev.workExperience || []), {}],
                      }))
                    }
                    className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    + Add Work Experience
                  </button>
                </div>

                {/* Skills (comma separated) full width */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map((s: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 border rounded-full px-3 py-1 bg-gray-100">
                        <span>{s.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setProfile((prev: any) => ({
                              ...prev,
                              skills: prev.skills.filter((_: any, i: number) => i !== index),
                            }))
                          }
                          className="text-red-500 text-xs hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const skill = { name: e.currentTarget.value.trim(), level: "Intermediate" };
                        setProfile((prev: any) => ({
                          ...prev,
                          skills: [...(prev.skills || []), skill],
                        }));
                        e.currentTarget.value = "";
                      }
                    }}
                    className="mt-3 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Job Preferences: one location and job types */}
                <div>
                  <label className="text-sm text-gray-600">Preferred City</label>
                  <input
                    type="text"
                    value={profile.jobPreferences?.preferredLocations?.[0]?.city || ''}
                    onChange={(e) => updateProfileAtPath('jobPreferences.preferredLocations.0.city', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Preferred State</label>
                  <input
                    type="text"
                    value={profile.jobPreferences?.preferredLocations?.[0]?.state || ''}
                    onChange={(e) => updateProfileAtPath('jobPreferences.preferredLocations.0.state', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Preferred Country</label>
                  <input
                    type="text"
                    value={profile.jobPreferences?.preferredLocations?.[0]?.country || 'India'}
                    onChange={(e) => updateProfileAtPath('jobPreferences.preferredLocations.0.country', e.target.value)}
                    className="mt-1 border rounded-lg w-full p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Preferred Job Types</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Volunteer'].map((jt) => (
                      <label key={jt} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={profile.jobPreferences?.preferredJobTypes?.includes(jt)} onChange={() => toggleArrayValue('jobPreferences.preferredJobTypes', jt)} className="w-4 h-4" />
                        <span>{jt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Privacy settings and profile completion */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700">Privacy Settings</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showContactInfo ?? true} onChange={(e) => updateProfileAtPath('privacySettings.showContactInfo', e.target.checked)} className="w-4 h-4" /> Show contact info</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showCurrentSalary ?? false} onChange={(e) => updateProfileAtPath('privacySettings.showCurrentSalary', e.target.checked)} className="w-4 h-4" /> Show current salary</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.showProfileToEmployers ?? true} onChange={(e) => updateProfileAtPath('privacySettings.showProfileToEmployers', e.target.checked)} className="w-4 h-4" /> Show profile to employers</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profile.privacySettings?.allowDirectMessages ?? true} onChange={(e) => updateProfileAtPath('privacySettings.allowDirectMessages', e.target.checked)} className="w-4 h-4" /> Allow direct messages</label>
                  </div>
                </div>
                {/* Certifications (multiple) */}
                <div className="sm:col-span-2 border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Certifications</h3>
                  {(profile.certifications || []).map((cert: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 border p-3 rounded-lg bg-gray-50"
                    >
                      <input
                        type="text"
                        placeholder="Certification Name"
                        value={cert.name || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.name`, e.target.value)
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Issuing Organization"
                        value={cert.issuingOrganization || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.issuingOrganization`, e.target.value)
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="date"
                        placeholder="Issue Date"
                        value={cert.issueDate ? new Date(cert.issueDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.issueDate`, e.target.value ? new Date(e.target.value).toISOString() : "")
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="date"
                        placeholder="Expiry Date (optional)"
                        value={cert.expiryDate ? new Date(cert.expiryDate).toISOString().slice(0, 10) : ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.expiryDate`, e.target.value ? new Date(e.target.value).toISOString() : "")
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Credential ID (optional)"
                        value={cert.credentialId || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.credentialId`, e.target.value)
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="url"
                        placeholder="Credential URL (optional)"
                        value={cert.credentialUrl || ""}
                        onChange={(e) =>
                          updateProfileAtPath(`certifications.${index}.credentialUrl`, e.target.value)
                        }
                        className="border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((prev: any) => ({
                            ...prev,
                            certifications: prev.certifications.filter(
                              (_: any, i: number) => i !== index
                            ),
                          }))
                        }
                        className="text-red-500 text-sm mt-1 hover:underline col-span-full text-right"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setProfile((prev: any) => ({
                        ...prev,
                        certifications: [...(prev.certifications || []), {}],
                      }))
                    }
                    className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                  >
                    + Add Certification
                  </button>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Profile Completion</label>
                  <div className="mt-1 text-sm text-indigo-700 font-medium">{profile.profileCompletion ?? 0}%</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-linear-to-r from-[#007BFF] to-[#00CFFF] hover:from-[#0066d9] hover:to-[#00B8E6] text-white px-6 py-2.5 rounded-lg shadow-md transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </form>

            {/* ===== DOCUMENTS ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Resume */}
              <div className="p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Resume
                </h2>
                {resume ? (
                  <div className="mt-3 text-sm">
                    <a
                      href={resume.url}
                      target="_blank"
                      className="text-indigo-600 underline"
                    >
                      {resume.filename}
                    </a>
                    <button
                      onClick={() => handleDelete("resume")}
                      className="ml-4 text-red-500 hover:underline"
                    >
                      <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full px-4 py-3 mt-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">
                      Upload Resume (PDF/DOC)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "resume")}
                    />
                  </label>
                )}
              </div>

              {/* Cover Letter */}
              <div className="p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <File className="w-5 h-5 text-indigo-600" />
                  Cover Letter
                </h2>
                {coverLetter ? (
                  <div className="mt-3 text-sm">
                    <a
                      href={coverLetter.url}
                      target="_blank"
                      className="text-indigo-600 underline"
                    >
                      {coverLetter.filename}
                    </a>
                    <button
                      onClick={() => handleDelete("coverLetter")}
                      className="ml-4 text-red-500 hover:underline"
                    >
                      <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full px-4 py-3 mt-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <Upload className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-600">
                      Upload Cover Letter (PDF/DOC)
                    </span>
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
          </div>
        </div>
      </div>
    </>
  );
}
