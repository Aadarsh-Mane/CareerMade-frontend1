"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import toast from "react-hot-toast";
import { ChevronRight, CheckCircle } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  title: string;
  specialization: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  experienceRequired: {
    minYears: number | string;
    maxYears: number | string;
  };
  jobType: string;
  shift: string;
  salary: {
    min: number | string;
    max: number | string;
    currency: string;
    period: string;
  };
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  isRemote: boolean;
  isFeatured: boolean;
  expiresAt: string;
}

const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
  "Psychiatry",
  "Radiology",
  "Anesthesiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Surgery",
  "Oncology",
  "Pathology",
  "Ophthalmology",
  "ENT",
  "Urology",
  "Gastroenterology",
  "Pulmonology",
  "Endocrinology",
  "Rheumatology",
  "Nephrology",
  "Hematology",
  "Infectious Disease",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Nursing",
  "Pharmacy",
  "Medical Technology",
  "Other",
];

const JOB_TYPES = [
  { value: "Full-time", label: "Full-time", desc: "Permanent position" },
  { value: "Part-time", label: "Part-time", desc: "Flexible hours" },
  { value: "Contract", label: "Contract", desc: "Fixed term contract" },
  { value: "Freelance", label: "Freelance", desc: "Project-based" },
  { value: "Internship", label: "Internship", desc: "Learning opportunity" },
  { value: "Volunteer", label: "Volunteer", desc: "Unpaid position" },
];

const SHIFTS = [
  { value: "Day", label: "Day Shift", desc: "9 AM - 5 PM" },
  { value: "Night", label: "Night Shift", desc: "Evening hours" },
  { value: "Rotating", label: "Rotating Shifts", desc: "Variable schedules" },
  { value: "Flexible", label: "Flexible", desc: "Custom timing" },
];

const WORK_MODES = [
  { value: "on-site", label: "On-site", desc: "Work from hospital" },
  { value: "hybrid", label: "Hybrid", desc: "Mix of on-site and remote" },
  { value: "remote", label: "Remote", desc: "Telemedicine/Consultation" },
];

const BENEFITS_OPTIONS = [
  "Health Insurance",
  "Life Insurance",
  "Retirement/Pension Plan",
  "CME Allowance",
  "Professional Development",
  "Housing Assistance",
  "Relocation Assistance",
  "Paid Time Off",
  "Sick Leave",
  "Maternity/Paternity Leave",
  "Meal Allowance",
  "Transportation",
  "Conference Attendance",
  "Research Opportunities",
  "Malpractice Insurance",
];

const MEDICAL_QUALIFICATIONS = [
  "MBBS",
  "MD",
  "MS",
  "DNB",
  "DM",
  "MCh",
  "Diploma",
  "Fellowship",
  "FRCS",
  "MRCP",
];

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [workMode, setWorkMode] = useState("on-site");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    specialization: "",
    location: {
      city: "",
      state: "",
      country: "India",
    },
    experienceRequired: {
      minYears: "",
      maxYears: "",
    },
    jobType: "Full-time",
    shift: "Day",
    salary: {
      min: "",
      max: "",
      currency: "INR",
      period: "Annual",
    },
    description: "",
    responsibilities: [],
    requirements: [],
    benefits: [],
    isRemote: false,
    isFeatured: false,
    expiresAt: "",
  });

  const [qualifications, setQualifications] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      toast.error("Please log in to continue.");
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "employer") {
      toast.error("Access denied. Employers only.");
      router.push("/login");
      return;
    }

    if (!jobId) {
      setLoading(false);
      return;
    }

    // Fetch job data
    const fetchJobData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          toast.error(errorData.message || "Failed to load job details");
          setTimeout(() => router.push("/dashboard/employee/jobs"), 2000);
          return;
        }

        const data = await response.json();
        console.log("Full response:", data);

        const job = data?.data || data;
        console.log("Job data:", job);

        if (!job) {
          toast.error("Job not found");
          setTimeout(() => router.push("/dashboard/employee/jobs"), 2000);
          return;
        }

        // Safely parse arrays
        const responsibilitiesArray = Array.isArray(job.responsibilities)
          ? job.responsibilities.filter(
              (item: any) => item && typeof item === "string"
            )
          : [];

        const benefitsArray = Array.isArray(job.benefits)
          ? job.benefits.filter((item: any) => item && typeof item === "string")
          : [];

        const requirementsArray = Array.isArray(job.requirements)
          ? job.requirements.filter(
              (item: any) => item && typeof item === "string"
            )
          : [];

        // Separate qualifications and skills
        const quals = requirementsArray.filter((req: string) =>
          MEDICAL_QUALIFICATIONS.includes(req)
        );
        const skls = requirementsArray.filter(
          (req: string) => !MEDICAL_QUALIFICATIONS.includes(req)
        );

        setQualifications(quals);
        setSkills(skls);

        // Format expiry date
        let formattedExpiry = "";
        if (job.expiresAt) {
          const expiryDate = new Date(job.expiresAt);
          formattedExpiry = expiryDate.toISOString().split("T")[0];
        }

        // Determine work mode
        const isRemote = job.isRemote === true;
        const workModeValue = isRemote ? "remote" : "on-site";
        setWorkMode(workModeValue);

        // Set form data
        setFormData({
          title: job.title || "",
          specialization: job.specialization || "",
          location: {
            city: job.location?.city || "",
            state: job.location?.state || "",
            country: job.location?.country || "India",
          },
          experienceRequired: {
            minYears: job.experienceRequired?.minYears || "",
            maxYears: job.experienceRequired?.maxYears || "",
          },
          jobType: job.jobType || "Full-time",
          shift: job.shift || "Day",
          salary: {
            min: job.salary?.min || "",
            max: job.salary?.max || "",
            currency: job.salary?.currency || "INR",
            period: job.salary?.period || "Annual",
          },
          description: job.description || "",
          responsibilities: responsibilitiesArray,
          requirements: requirementsArray,
          benefits: benefitsArray,
          isRemote: isRemote,
          isFeatured: job.isFeatured || false,
          expiresAt: formattedExpiry,
        });
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to fetch job details");
        setTimeout(() => router.push("/dashboard/employee/jobs"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Record<string, any>),
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addToArray = (field: string, value: string): boolean => {
    if (!value || !value.trim()) return false;

    if (field === "qualifications") {
      if (!qualifications.includes(value)) {
        setQualifications([...qualifications, value]);
        return true;
      }
      toast.error("Qualification already added");
      return false;
    } else if (field === "skills") {
      const trimmedValue = value.trim();
      if (!skills.includes(trimmedValue)) {
        setSkills([...skills, trimmedValue]);
        return true;
      }
      toast.error("Skill already added");
      return false;
    } else {
      const currentArray = (formData[field as keyof FormData] || []) as string[];
      const trimmedValue = value.trim();
      if (!currentArray.includes(trimmedValue)) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...currentArray, trimmedValue],
        }));
        return true;
      }
      toast.error("Item already added");
      return false;
    }
  };

  const removeFromArray = (field: string, value: string) => {
    if (field === "qualifications") {
      setQualifications(qualifications.filter((q) => q !== value));
    } else if (field === "skills") {
      setSkills(skills.filter((s) => s !== value));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: ((prev[field as keyof FormData] as string[]) || []).filter(
          (item) => item !== value
        ),
      }));
    }
  };

  const toggleMultiSelect = (field: string, value: string) => {
    const currentArray = (formData[field as keyof FormData] || []) as string[];
    if (currentArray.includes(value)) {
      removeFromArray(field, value);
    } else {
      addToArray(field, value);
    }
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Job title is required";
        if (!formData.specialization.trim())
          newErrors.specialization = "Specialization is required";
        if (!formData.location.city.trim())
          newErrors["location.city"] = "City is required";
        if (!formData.location.state.trim())
          newErrors["location.state"] = "State is required";
        if (!formData.jobType) newErrors.jobType = "Select a job type";
        break;

      case 2:
        if (qualifications.length === 0)
          newErrors.qualifications = "Add at least one qualification";
        const minYears = formData.experienceRequired.minYears;
        // Treat empty string / missing value as invalid; allow "0" or 0 (freshers) as valid
        if (minYears === "" || minYears === null || minYears === undefined)
          newErrors.experience = "Minimum experience is required";
        break;

      case 3:
        if (!formData.description.trim())
          newErrors.description = "Job description is required";
        if (formData.responsibilities.length === 0)
          newErrors.responsibilities = "Add at least one responsibility";
        break;

      case 4:
        if (!formData.salary.min) newErrors["salary.min"] = "Min salary is required";
        if (!formData.salary.max) newErrors["salary.max"] = "Max salary is required";
        break;

      case 5:
        if (!formData.expiresAt) newErrors.expiresAt = "Expiry date is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((currentStep + 1) as Step);
        window.scrollTo(0, 0);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    setUpdating(true);

    const payload = {
      title: formData.title.trim(),
      specialization: formData.specialization,
      location: {
        city: formData.location.city.trim(),
        state: formData.location.state.trim(),
        country: formData.location.country.trim() || "India",
      },
      experienceRequired: {
        minYears: Number(formData.experienceRequired.minYears) || 0,
        maxYears: Number(formData.experienceRequired.maxYears) || 0,
      },
      jobType: formData.jobType,
      shift: formData.shift,
      salary: {
        min: Number(formData.salary.min),
        max: Number(formData.salary.max),
        currency: formData.salary.currency,
        period: formData.salary.period,
      },
      description: formData.description.trim(),
      responsibilities: formData.responsibilities.filter((r) => r.trim()),
      requirements: [...qualifications, ...skills].filter((r) => r.trim()),
      benefits: formData.benefits.filter((b) => b.trim()),
      isRemote: workMode === "remote",
      isFeatured: formData.isFeatured,
      expiresAt: formData.expiresAt,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Job updated successfully!");
        setTimeout(() => router.push("/dashboard/employee/jobs"), 1500);
      } else {
        toast.error(data.message || "Failed to update job");
        console.error("Error response:", data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong while updating the job.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <GradientLoader />
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Basic Information", description: "Job title and type" },
    {
      number: 2,
      title: "Requirements",
      description: "Qualifications & experience",
    },
    {
      number: 3,
      title: "Job Details",
      description: "Description & responsibilities",
    },
    { number: 4, title: "Compensation", description: "Salary & location" },
    { number: 5, title: "Review", description: "Review & update" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Job Posting
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Update your job listing details
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Sidebar - Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Edit Job
              </h2>

              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                      currentStep === step.number
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : currentStep > step.number
                          ? "bg-green-50"
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      if (currentStep > step.number) {
                        setCurrentStep(step.number as Step);
                        window.scrollTo(0, 0);
                      }
                    }}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm flex-shrink-0 ${
                        currentStep === step.number
                          ? "bg-blue-500 text-white"
                          : currentStep > step.number
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm truncate ${
                          currentStep === step.number
                            ? "text-blue-600"
                            : "text-gray-900"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                {/* STEP 1: BASIC INFORMATION */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Basic Information
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Update the basic details about the job position
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Job Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Ex. Senior Cardiologist"
                          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.title ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.title}
                          </p>
                        )}
                      </div>

                      {/* Medical Specialty */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medical Specialty/Department{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.specialization
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select a specialty</option>
                          {SPECIALIZATIONS.map((spec) => (
                            <option key={spec} value={spec}>
                              {spec}
                            </option>
                          ))}
                        </select>
                        {errors.specialization && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.specialization}
                          </p>
                        )}
                      </div>

                      {/* Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="location.city"
                            value={formData.location.city}
                            onChange={handleInputChange}
                            placeholder="Mumbai"
                            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                              errors["location.city"]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors["location.city"] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors["location.city"]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="location.state"
                            value={formData.location.state}
                            onChange={handleInputChange}
                            placeholder="Maharashtra"
                            className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                              errors["location.state"]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors["location.state"] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors["location.state"]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Job Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Employment Type{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {JOB_TYPES.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  jobType: type.value,
                                }))
                              }
                              className={`p-4 border-2 rounded-lg text-left transition ${
                                formData.jobType === type.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <p className="font-medium text-sm text-gray-900">
                                {type.label}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {type.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                        {errors.jobType && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.jobType}
                          </p>
                        )}
                      </div>

                      {/* Work Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Work Mode <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {WORK_MODES.map((mode) => (
                            <button
                              key={mode.value}
                              type="button"
                              onClick={() => {
                                setWorkMode(mode.value);
                                setFormData((prev) => ({
                                  ...prev,
                                  isRemote: mode.value === "remote",
                                }));
                              }}
                              className={`p-4 border-2 rounded-lg text-left transition ${
                                workMode === mode.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <p className="font-medium text-sm text-gray-900">
                                {mode.label}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {mode.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: REQUIREMENTS */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Job Requirements
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Update qualifications and experience requirements
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Medical Qualifications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Medical Qualifications{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {MEDICAL_QUALIFICATIONS.map((qual) => (
                            <button
                              key={qual}
                              type="button"
                              onClick={() => {
                                if (qualifications.includes(qual)) {
                                  removeFromArray("qualifications", qual);
                                } else {
                                  addToArray("qualifications", qual);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition ${
                                qualifications.includes(qual)
                                  ? "border-blue-500 bg-blue-100 text-blue-700"
                                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              }`}
                            >
                              {qual}
                            </button>
                          ))}
                        </div>
                        {qualifications.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {qualifications.map((qual) => (
                              <span
                                key={qual}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                              >
                                {qual}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromArray("qualifications", qual)
                                  }
                                  className="font-bold hover:text-blue-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {errors.qualifications && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.qualifications}
                          </p>
                        )}
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Experience <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block font-medium">
                              Minimum Years
                            </label>
                            <input
                              type="number"
                              name="experienceRequired.minYears"
                              value={formData.experienceRequired.minYears}
                              onChange={handleInputChange}
                              placeholder="2"
                              min="0"
                              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.experience
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block font-medium">
                              Maximum Years
                            </label>
                            <input
                              type="number"
                              name="experienceRequired.maxYears"
                              value={formData.experienceRequired.maxYears}
                              onChange={handleInputChange}
                              placeholder="10"
                              min="0"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Freshers OK
                              </span>
                            </label>
                          </div>
                        </div>
                        {errors.experience && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.experience}
                          </p>
                        )}
                      </div>

                      {/* Required Skills */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Required Skills & Competencies
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            id="skillInput"
                            placeholder="Ex. Patient Care, Surgical Skills, EMR Systems"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (addToArray("skills", input.value)) {
                                  input.value = "";
                                }
                              }
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "skillInput"
                              ) as HTMLInputElement;
                              if (addToArray("skills", input.value)) {
                                input.value = "";
                                input.focus();
                              }
                            }}
                            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm whitespace-nowrap transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeFromArray("skills", skill)}
                                  className="font-bold hover:text-blue-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Shift */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Shift
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SHIFTS.map((shift) => (
                            <button
                              key={shift.value}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  shift: shift.value,
                                }))
                              }
                              className={`p-4 border-2 rounded-lg text-left transition ${
                                formData.shift === shift.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <p className="font-medium text-sm text-gray-900">
                                {shift.label}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {shift.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: JOB DETAILS */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Job Details
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Update comprehensive job information
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Job Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Description{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Provide a detailed description of the position..."
                          rows={5}
                          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.description
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.description.length} characters
                        </p>
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.description}
                          </p>
                        )}
                      </div>

                      {/* Responsibilities */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Responsibilities{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            id="respInput"
                            placeholder="Ex. Patient diagnosis and treatment"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (addToArray("responsibilities", input.value)) {
                                  input.value = "";
                                }
                              }
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                "respInput"
                              ) as HTMLInputElement;
                              if (addToArray("responsibilities", input.value)) {
                                input.value = "";
                                input.focus();
                              }
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium whitespace-nowrap transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {formData.responsibilities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.responsibilities.map((resp) => (
                              <span
                                key={resp}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                              >
                                {resp}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromArray("responsibilities", resp)
                                  }
                                  className="font-bold hover:text-blue-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        {errors.responsibilities && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.responsibilities}
                          </p>
                        )}
                      </div>

                      {/* Benefits */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Benefits & Perks
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                          {BENEFITS_OPTIONS.map((benefit) => (
                            <button
                              key={benefit}
                              type="button"
                              onClick={() =>
                                toggleMultiSelect("benefits", benefit)
                              }
                              className={`p-3 border-2 rounded-lg text-sm font-medium text-left transition ${
                                formData.benefits.includes(benefit)
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                              }`}
                            >
                              {benefit}
                            </button>
                          ))}
                        </div>
                        {formData.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.benefits.map((benefit) => (
                              <span
                                key={benefit}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                              >
                                {benefit}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromArray("benefits", benefit)
                                  }
                                  className="font-bold hover:text-blue-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: COMPENSATION */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Compensation
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Update salary and benefits information
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Salary Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Annual Salary Range (in Lakhs){" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 font-medium mb-2 block">
                              Min
                            </label>
                            <input
                              type="number"
                              name="salary.min"
                              value={formData.salary.min}
                              onChange={handleInputChange}
                              placeholder="10"
                              min="0"
                              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                errors["salary.min"]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors["salary.min"] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors["salary.min"]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-xs text-gray-600 font-medium mb-2 block">
                              Max
                            </label>
                            <input
                              type="number"
                              name="salary.max"
                              value={formData.salary.max}
                              onChange={handleInputChange}
                              placeholder="25"
                              min={formData.salary.min || "0"}
                              className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                errors["salary.max"]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {errors["salary.max"] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors["salary.max"]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Currency & Period */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                          </label>
                          <select
                            name="salary.currency"
                            value={formData.salary.currency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Period
                          </label>
                          <select
                            name="salary.period"
                            value={formData.salary.period}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Annual">Annual</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Daily">Daily</option>
                            <option value="Hourly">Hourly</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Review & Update
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Review your changes before updating
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Expiry Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Application Deadline{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="expiresAt"
                          value={formData.expiresAt}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                            errors.expiresAt
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.expiresAt && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.expiresAt}
                          </p>
                        )}
                      </div>

                      {/* Featured Option */}
                      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <label
                          htmlFor="isFeatured"
                          className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                        >
                          Make this a featured job (gets more visibility)
                        </label>
                      </div>

                      {/* Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Job Summary
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">Position</p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {formData.title || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">
                              Specialization
                            </p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {formData.specialization || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Location</p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {formData.location.city}, {formData.location.state}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">
                              Employment Type
                            </p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {formData.jobType}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">
                              Work Mode
                            </p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {workMode.charAt(0).toUpperCase() +
                                workMode.slice(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Shift</p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {formData.shift}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">
                              Experience
                            </p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {formData.experienceRequired.minYears} -{" "}
                              {formData.experienceRequired.maxYears} years
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Salary</p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              ₹{formData.salary.min} - ₹{formData.salary.max}{" "}
                              Lakhs
                            </p>
                          </div>
                          {qualifications.length > 0 && (
                            <div className="sm:col-span-2">
                              <p className="text-gray-600 font-medium">
                                Qualifications
                              </p>
                              <p className="text-gray-900 mt-1 font-semibold">
                                {qualifications.join(", ")}
                              </p>
                            </div>
                          )}
                          {skills.length > 0 && (
                            <div className="sm:col-span-2">
                              <p className="text-gray-600 font-medium">Skills</p>
                              <p className="text-gray-900 mt-1 font-semibold">
                                {skills.join(", ")}
                              </p>
                            </div>
                          )}
                          {formData.benefits.length > 0 && (
                            <div className="sm:col-span-2">
                              <p className="text-gray-600 font-medium">
                                Benefits
                              </p>
                              <p className="text-gray-900 mt-1 font-semibold">
                                {formData.benefits.join(", ")}
                              </p>
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <p className="text-gray-600 font-medium">
                              Application Deadline
                            </p>
                            <p className="text-gray-900 mt-1 font-semibold">
                              {formData.expiresAt || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with buttons */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 sm:px-8 py-4 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="order-2 sm:order-1 px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Back
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="order-1 sm:order-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={updating}
                    className="order-1 sm:order-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    {updating ? "Updating..." : "Update Job"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}