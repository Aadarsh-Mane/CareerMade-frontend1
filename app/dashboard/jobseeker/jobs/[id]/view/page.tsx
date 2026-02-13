"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Building2,
    ArrowLeft,
    FileText,
    Trash2,
    Upload,
    CheckCircle,
    BookmarkPlus,
    Globe,
    Rocket,
    Heart,
    Car,
    GraduationCap,
    Dumbbell,
    UtensilsCrossed,
    Star,
    Save,
    IndianRupee,
    ChevronLeft,
    Edit2,
    Calendar,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import GradientLoader from "@/app/components/GradientLoader";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";

export default function JobViewPage() {
    const { id } = useParams();
    const router = useRouter();
    const [hasApplied, setHasApplied] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [resume, setResume] = useState<any>(null);
    const [coverLetter, setCoverLetter] = useState<any>(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [expandedDescription, setExpandedDescription] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");
        if (!token || !user) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(user);
        setUser(parsedUser);
        if (parsedUser.role !== "jobseeker") {
            router.push("/login");
            return;
        }
    }, [router]);

    // Check if user has already applied
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token || !id) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/applications`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                const applications = data.data?.applications || data.applications || [];
                const userData = localStorage.getItem("user");
                if (userData) {
                    const user = JSON.parse(userData);
                    const hasUserApplied = applications.some((app: any) =>
                        app.jobSeeker?.user?._id === user._id ||
                        app.jobSeeker?._id === user.jobSeekerId
                    );
                    setHasApplied(hasUserApplied);
                }
            })
            .catch((err) => {
                console.error("Error checking application status:", err);
            });
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            toast.error("No access token found. Please log in first!");
            return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`;

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                return res
                    .json()
                    .catch((e) => {
                        toast.error(`[JobView] Failed to parse JSON: ${String(e)}`);
                        throw e;
                    });
            })
            .then((data) => {
                const dataLayer = data?.data ?? data;
                const base = dataLayer?.job ?? dataLayer;
                const salary = base?.salary ?? {};
                const exp = base?.experienceRequired ?? {};
                const normalized = {
                    ...base,
                    organization: base?.organization ?? base?.organizationName,
                    salary: {
                        min: salary?.min ?? salary?.amountMin ?? salary?.minimum ?? null,
                        max: salary?.max ?? salary?.amountMax ?? salary?.maximum ?? null,
                        currency: salary?.currency ?? salary?.currencyCode ?? salary?.curr,
                    },
                    experienceRequired: {
                        minYears: exp?.minYears ?? exp?.min ?? exp?.minimum ?? null,
                        maxYears: exp?.maxYears ?? exp?.max ?? exp?.maximum ?? null,
                    },
                };
                console.log(normalized);
                setJob(normalized);
            })
            .catch((err) => {
                toast.error(`[JobView] Error while loading job details: ${String(err)}`);
                setMessage("Failed to load job details.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                const js = data?.data?.jobSeeker ?? data?.jobSeeker ?? data;
                setResume(js?.resume ?? null);
                setCoverLetter(js?.coverLetter ?? null);
            })
            .catch((e) => toast.error(`[JobView] Failed to load profile: ${String(e)}`));
    }, []);

    const handleUploadResume = async (file: File) => {
        try {
            setUploadingResume(true);
            const token = localStorage.getItem("accessToken");
            const fd = new FormData();
            fd.append("resume", file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            setResume(data?.data?.resume ?? data?.resume ?? null);
            setMessage(data?.message || "Resume uploaded");
            toast.success(data?.message || "Resume uploaded");
        } catch (e) {
            setMessage("Failed to upload resume");
            toast.error("Failed to upload resume");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleDeleteResume = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setResume(null);
            setMessage(data?.message || (res.ok ? "Resume deleted" : "Failed to delete resume"));
            if (res.ok) toast.success(data?.message || "Resume deleted");
            else toast.error(data?.message || "Failed to delete resume");
        } catch (e) {
            setMessage("Failed to delete resume");
            toast.error("Failed to delete resume");
        }
    };

    const handleUploadCover = async (file: File) => {
        try {
            setUploadingCover(true);
            const token = localStorage.getItem("accessToken");
            const fd = new FormData();
            fd.append("coverLetter", file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            setCoverLetter(data?.data?.coverLetter ?? data?.coverLetter ?? null);
            setMessage(data?.message || "Cover letter uploaded");
            toast.success(data?.message || "Cover letter uploaded");
        } catch (e) {
            setMessage("Failed to upload cover letter");
            toast.error("Failed to upload cover letter");
        } finally {
            setUploadingCover(false);
        }
    };

    const handleDeleteCover = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setCoverLetter(null);
            setMessage(data?.message || (res.ok ? "Cover letter deleted" : "Failed to delete cover letter"));
            if (res.ok) toast.success(data?.message || "Cover letter deleted");
            else toast.error(data?.message || "Failed to delete cover letter");
        } catch (e) {
            setMessage("Failed to delete cover letter");
            toast.error("Failed to delete cover letter");
        }
    };

    const applyJob = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast.error("Please log in to apply.");
                return;
            }

            if (!resume) {
                toast.error("Please upload a resume before applying!");
                return;
            }

            const payload: any = {
                resume: resume.url || resume._id || resume,
            };

            if (coverLetter) {
                payload.coverLetter = coverLetter.url || coverLetter._id || coverLetter;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                setHasApplied(true);
                setMessage(data.message || "Application submitted successfully!");
                toast.success(data.message || "Application submitted successfully!");
            } else {
                setMessage(data.message || "Failed to submit application.");
                toast.error(data.message || "Failed to submit application.");
            }
        } catch (error) {
            console.error("Error applying:", error);
            setMessage("Something went wrong while applying.");
            toast.error("Something went wrong while applying.");
        }
    };

    const saveJob = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/saved-jobs/jobs/${id}/save`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            setMessage(data.message || "Job saved successfully!");
            toast.success(data.message || "Job saved successfully!");
        } catch {
            setMessage("Failed to save job.");
            toast.error("Failed to save job.");
        }
    };

    const extractSkills = () => {
        if (!job) return [];

        if (job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0) {
            const skillKeywords = ["Java", "Python", "JavaScript", "React", "Node.js", "SAP", "Machine Learning", "Artificial Intelligence", "Cloud Platform", "SQL", "MongoDB", "Docker", "Kubernetes", "TypeScript", "Angular", "Vue", "AWS", "Azure", "GCP"];
            const foundSkills: string[] = [];
            job.requirements.forEach((req: string) => {
                skillKeywords.forEach(keyword => {
                    if (req.toLowerCase().includes(keyword.toLowerCase()) && !foundSkills.includes(keyword)) {
                        foundSkills.push(keyword);
                    }
                });
            });
            if (foundSkills.length > 0) return foundSkills.slice(0, 8);
        }

        if (job.description) {
            const skillKeywords = ["Java", "Python", "JavaScript", "React", "Node.js", "SAP", "Machine Learning", "Artificial Intelligence", "Cloud Platform", "SQL", "MongoDB", "Docker", "Kubernetes"];
            const foundSkills = skillKeywords.filter(skill =>
                job.description.toLowerCase().includes(skill.toLowerCase())
            );
            if (foundSkills.length > 0) return foundSkills.slice(0, 8);
        }

        return [];
    };

    const skills = extractSkills();
    const organizationName = job?.organizationName || job?.organization || "Company Name";

    const formatPostedDate = () => {
      if (!job?.createdAt) return null;
      const createdDate = new Date(job.createdAt);
      const now = new Date();
      const diffInMs = now.getTime() - createdDate.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return `${Math.floor(diffInDays / 30)} months ago`;
    };

    const descriptionPreview = job?.description 
      ? job.description.substring(0, 300) + (job.description.length > 300 ? "..." : "")
      : "";
    
    const hasMoreDescription = job?.description && job.description.length > 300;

    const formatSalary = () => {
        if (job?.salary?.min && job?.salary?.max) {
          return `${job.salary.min}-${job.salary.max} LPA`;
        }
        return "Not specified";
      };
    
      const formatExperience = () => {
        if (
          job?.experienceRequired?.minYears !== undefined &&
          job?.experienceRequired?.maxYears !== undefined
        ) {
          return `${job.experienceRequired.minYears}-${job.experienceRequired.maxYears} years`;
        }
        return "Not specified";
      };
    
      const formatLocation = () => {
        if (job?.location?.city && job?.location?.state) {
          return `${job.location.city}, ${job.location.state}`;
        }
        return "Not specified";
      };
    
      const getCompanyName = () => {
        // organizationName is at the top level
        if (job?.organizationName) {
          return job.organizationName;
        }
        // fallback if employer is an object
        if (
          typeof job?.employer === "object" &&
          job?.employer?.organizationName
        ) {
          return job.employer.organizationName;
        }
        return "Company Name";
      };
    
      const createdDate = job?.createdAt
        ? new Date(job.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        : "N/A";
    
      const expiryDate = job?.expiresAt
        ? new Date(job.expiresAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        : "N/A";


    return (
        <>
            <Navbar />
            {loading ? (
                <div className="h-screen flex items-center justify-center bg-white">
                    <GradientLoader />
                </div>
            ) : !job ? (
                <div className="h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
                        <p className="text-gray-600 mb-4">The job posting you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => router.push("/dashboard/jobseeker")}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Back to Jobs
                        </button>
                    </div>
                </div>
            ) : (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb and Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Left Side (2 columns) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Job Header Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                                {/* Title Section */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-3">
                                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                                {job.title}
                                            </h1>
                                            {job.isVerified && (
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 font-medium">
                                            {getCompanyName()}
                                        </p>
                                        {job.specialization && (
                                            <p className="text-gray-600 text-sm mt-1">
                                                {job.specialization}
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap ${job.status === "Active" || job.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {job.status || "Active"}
                                    </span>
                                </div>

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                            Experience
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatExperience()}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                            Salary
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatSalary()}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                            Location
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatLocation()}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                                            Type
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                            <p className="text-sm font-semibold text-gray-900">
                                                {job.jobType || "Not specified"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-gray-200">
                                    {job.specialization && (
                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                                            {job.specialization}
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                                        {job.jobType}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">
                                        {job.isRemote ? "Remote" : "On-site"}
                                    </span>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Created on: {createdDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-400" />
                                        <span>Apply by: {expiryDate}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-500"> <span className="text-gray-700 font-medium">{job?.createdAt ? formatPostedDate() ?? '4 days ago' : '4 days ago'}</span></div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={saveJob}
                                            className="px-4 py-2 border border-[#D1E9FF] text-[#0B74FF] rounded-full text-sm font-medium hover:bg-[#F3F9FF] transition"
                                        >
                                            Save
                                        </button>
                                        {hasApplied ? (
                                            <button
                                                disabled
                                                className="px-4 py-2 bg-gray-300 text-white rounded-full text-sm font-medium cursor-not-allowed"
                                            >
                                                <CheckCircle className="w-4 h-4 inline-block mr-1" /> Already Applied
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    // if (!resume) {
                                                    //     toast.error("Please upload a resume before applying!");
                                                    //     return;
                                                    // }
                                                    setIsApplyModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-[#007BFF] hover:bg-[#006AE6] text-white rounded-full text-sm font-semibold"
                                            >
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Description
                                </h2>
                                <div className="text-gray-700 leading-relaxed text-sm">
                                    <h3 className="font-bold text-gray-900 mb-2">
                                        Role & responsibilities
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-wrap mb-4">
                                        {expandedDescription
                                            ? job?.description
                                            : job ? (job.description?.substring(0, 300) + (job.description?.length > 300 ? "..." : "")) : ""}
                                    </p>
                                    {job && job.description && job.description.length > 300 && (
                                        <button
                                            onClick={() =>
                                                setExpandedDescription(!expandedDescription)
                                            }
                                            className="text-blue-600 font-semibold hover:text-blue-700 text-sm"
                                        >
                                            {expandedDescription ? "read less" : "read more"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Key Skills Section */}
                            {job.requirements && job.requirements.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Key Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requirements.map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Responsibilities Section */}
                            {job.responsibilities && job.responsibilities.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Key Responsibilities
                                    </h2>
                                    <ul className="space-y-3">
                                        {job.responsibilities.map(
                                            (resp: string, index: number) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-3 text-gray-700 text-sm"
                                                >
                                                    <span className="shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></span>
                                                    <span>{resp}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        </div>

                        {/* Sidebar - Right Side (1 column) */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Key Highlights Card */}
                            {job.benefits && job.benefits.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        Key highlights at {getCompanyName()}
                                    </h3>
                                    <div className="space-y-4">
                                        {job.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="shrink-0 mt-1">
                                                    <Briefcase className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {benefit}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Highly rated
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Benefits & Perks Card */}
                            {job.benefits && job.benefits.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Benefits & Perks
                                        </h3>
                                        {job.benefits.length > 6 && (
                                            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                                                View all
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {job.benefits.slice(0, 6).map((benefit: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <BenefitIcon benefit={benefit} />
                                                <p className="text-xs font-medium text-gray-900 line-clamp-2 mt-2">
                                                    {benefit}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-xs text-gray-500 mt-4">
                                        {job.benefits.length} benefits offered
                                    </p>
                                </div>
                            )}

                            {/* Additional Info Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Job Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                            Work Mode
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {job.isRemote ? "Remote" : "On-site"}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                            Shift
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {job.shift || "Not specified"}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                            Application Deadline
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {expiryDate}
                                        </p>
                                    </div>

                                    {job.isFeatured && (
                                        <div className="border-t border-gray-100 pt-4">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-xs font-semibold">
                                                ⭐ Featured Job
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Dialog
                    open={isApplyModalOpen}
                    onClose={() => setIsApplyModalOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                >
                    <Dialog.Panel className="bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                        <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
                            Confirm Application
                        </Dialog.Title>

                        {/* User Info Section */}
                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    value={user?.firstName || ""}
                                    readOnly
                                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm focus:outline-none cursor-not-allowed"
                                />
                                <label className="text-sm font-medium text-gray-700 mt-2 block">Last Name</label>
                                <input
                                    type="text"
                                    value={user?.lastName || ""}
                                    readOnly
                                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm focus:outline-none cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    readOnly
                                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm focus:outline-none cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    value={user?.phone || ""}
                                    readOnly
                                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 text-sm focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">
                            Please confirm your resume and cover letter before applying.
                        </p>

                        {/* Resume Section */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Resume</label>
                            {resume ? (
                                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <FileText className="w-4 h-4 text-[#1A0152]" />
                                        <span>{resume.filename || "Resume uploaded"}</span>
                                    </div>
                                    <a
                                        href={resume.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        View
                                    </a>
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600">
                                    <p className="text-sm">No resume found.</p>
                                    <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-all">
                                        <Upload className="w-4 h-4" />
                                        {uploadingResume ? "Uploading..." : "Upload Resume"}
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.txt,.rtf"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleUploadResume(f);
                                            }}
                                            disabled={uploadingResume}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Cover Letter Section */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Cover Letter (Optional)</label>
                            {coverLetter ? (
                                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <FileText className="w-4 h-4 text-[#1A0152]" />
                                        <span>{coverLetter.filename || "Cover letter uploaded"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={coverLetter.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 text-sm hover:underline"
                                        >
                                            View
                                        </a>
                                        <button
                                            onClick={handleDeleteCover}
                                            className="text-red-600 text-sm hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-600">
                                    <p className="text-sm mb-2">No cover letter uploaded.</p>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-all">
                                        <Upload className="w-4 h-4" />
                                        {uploadingCover ? "Uploading..." : "Upload Cover Letter"}
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.txt,.rtf"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleUploadCover(f);
                                            }}
                                            disabled={uploadingCover}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsApplyModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!resume) {
                                        toast.error("Please select or upload a resume before applying!");
                                        return;
                                    }
                                    applyJob();
                                    setIsApplyModalOpen(false);
                                }}
                                className="px-5 py-2 bg-[#1A0152] hover:bg-[#2B0D85] text-white rounded-lg text-sm font-semibold transition"
                            >
                                Submit Application
                            </button>
                        </div>
                    </Dialog.Panel>
                </Dialog>
            </div>
            )}
        </>
    );
}

// Helper component for benefit icons
function BenefitIcon({ benefit }: { benefit: string }) {
    const iconClass = "w-6 h-6 text-blue-600";
    const benefitLower = benefit.toLowerCase();

    if (benefitLower.includes("insurance") || benefitLower.includes("health")) {
        return (
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
        );
    }

    if (benefitLower.includes("transport") || benefitLower.includes("car")) {
        return (
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
        );
    }

    if (benefitLower.includes("gym") || benefitLower.includes("fitness")) {
        return (
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
            </svg>
        );
    }

    if (benefitLower.includes("meal") || benefitLower.includes("food")) {
        return (
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.9 5H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6.1h-2V19H6V7h5.9V5z" />
            </svg>
        );
    }

    if (benefitLower.includes("development") || benefitLower.includes("education") || benefitLower.includes("cme")) {
        return (
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6.18L23 9 12 3zm6.82 6L12 5.18 5.18 9 12 12.82 18.82 9z" />
            </svg>
        );
    }

    if (benefitLower.includes("remote") || benefitLower.includes("work")) {
        return (
            <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-3 8h-2V5h2v6z" />
            </svg>
        );
    }

    // Default briefcase icon
    return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 16.5l6-4.5 6 4.5v6h-12zm-8-9h20V9c0-1.1-.9-2-2-2h-5V5c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v.5z" />
        </svg>
    );
}