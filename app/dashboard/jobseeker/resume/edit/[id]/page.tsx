'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import GradientLoader from '@/app/components/GradientLoader';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  User,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Code,
  Save,
  FileText,
  ArrowLeft,
  Star,
  Plus,
  X,
  CheckCircle,
} from 'lucide-react';

export default function EditResumePage() {
    const params = useParams();
    const router = useRouter();
    const [resume, setResume] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [activeTab, setActiveTab] = useState('personal');
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token) {
            toast.error("Please log in to edit your resume");
            router.push("/login");
            return;
        }

        if (!storedUser || storedUser.role !== "jobseeker") {
            toast.error("Unauthorized access");
            router.push("/login");
            return;
        }
    }, [router]);

    useEffect(() => {
        fetchResume();
    }, []);

    const fetchResume = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resume/${params.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );
            setResume(response.data.data.resume);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load resume');
            router.push('/dashboard/jobseeker/resume');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resume/${params.id}`,
                { ...resume, regeneratePdf: false },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );
            toast.success('Resume saved successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save resume');
        } finally {
            setSaving(false);
        }
    };

    const handleGeneratePDF = async () => {
        try {
            setGenerating(true);

            // Step 1: Save first
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resume/${params.id}`,
                { ...resume, regeneratePdf: false },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            // Step 2: Generate PDF
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resume/${params.id}/generate-pdf`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            toast.success('PDF generated successfully');

            // Step 3: Redirect to preview
            const resumeId = params.id;
            router.push(`/dashboard/jobseeker/resume/preview/${resumeId}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to generate PDF');
        } finally {
            setGenerating(false);
        }
    };

    const handleSetDefault = async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/resume/${params.id}/set-default`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );
            toast.success('Resume set as default');
            fetchResume();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to set default');
        }
    };

    const updateArrayField = (fieldName: string, index: number, fieldKey: string, value: any) => {
        const updatedArray = [...resume[fieldName]];
        updatedArray[index] = { ...updatedArray[index], [fieldKey]: value };
        setResume({ ...resume, [fieldName]: updatedArray });
    };

    const addArrayItem = (fieldName: string, emptyItem: any) => {
        setResume({
            ...resume,
            [fieldName]: [...resume[fieldName], emptyItem],
        });
    };

    const removeArrayItem = (fieldName: string, index: number) => {
        const updatedArray = resume[fieldName].filter((_: any, i: number) => i !== index);
        setResume({ ...resume, [fieldName]: updatedArray });
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <GradientLoader />
            </div>
        );
    }
    if (!resume) return <div className="p-8">Resume not found</div>;

    return (
        <>
            <Navbar />
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-[#002B6B] to-[#004B9B] text-white py-8 overflow-hidden">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: "url('/bg.png')" }}
                ></div>
                
                <div className="relative z-10 max-w-6xl mx-auto px-6">
                    <button
                        onClick={() => router.push('/dashboard/jobseeker/resume')}
                        className="flex items-center gap-2 text-white hover:text-blue-100 mb-4 transition text-sm"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{resume.title}</h1>
                            <p className="text-blue-100">Edit your resume details and generate PDF</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleSetDefault}
                                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition shadow-md"
                            >
                                <Star size={16} />
                                Set as Default
                            </button>

                            <button
                                onClick={handleGeneratePDF}
                                disabled={generating}
                                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <FileText size={16} />
                                {generating ? 'Generating...' : 'Generate PDF'}
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] text-white rounded-lg hover:shadow-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
                    <div className="flex gap-2 overflow-x-auto">
                        {[
                            { key: 'personal', label: 'Personal Info', icon: User },
                            { key: 'education', label: 'Education', icon: GraduationCap },
                            { key: 'experience', label: 'Experience', icon: Briefcase },
                            { key: 'skills', label: 'Skills', icon: Code },
                            { key: 'certifications', label: 'Certifications', icon: Award },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'bg-gradient-to-r from-[#155DFC] to-[#00B8DB] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <User className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                <p className="text-sm text-gray-600">Update your personal details</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={resume.personalInfo.fullName}
                                    onChange={(e) =>
                                        setResume({
                                            ...resume,
                                            personalInfo: { ...resume.personalInfo, fullName: e.target.value },
                                        })
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={resume.personalInfo.email}
                                    onChange={(e) =>
                                        setResume({
                                            ...resume,
                                            personalInfo: { ...resume.personalInfo, email: e.target.value },
                                        })
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    value={resume.personalInfo.phone || ''}
                                    onChange={(e) =>
                                        setResume({
                                            ...resume,
                                            personalInfo: { ...resume.personalInfo, phone: e.target.value },
                                        })
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="url"
                                    value={resume.personalInfo.linkedIn || ''}
                                    onChange={(e) =>
                                        setResume({
                                            ...resume,
                                            personalInfo: { ...resume.personalInfo, linkedIn: e.target.value },
                                        })
                                    }
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="border-t pt-4">
                            <h3 className="font-medium mb-3">Address</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={resume.personalInfo.address?.street || ''}
                                            onChange={(e) =>
                                                setResume({
                                                    ...resume,
                                                    personalInfo: {
                                                        ...resume.personalInfo,
                                                        address: { ...resume.personalInfo.address, street: e.target.value },
                                                    },
                                                })
                                            }
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="Enter your street address"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={resume.personalInfo.address?.city || ''}
                                            onChange={(e) =>
                                                setResume({
                                                    ...resume,
                                                    personalInfo: {
                                                        ...resume.personalInfo,
                                                        address: { ...resume.personalInfo.address, city: e.target.value },
                                                    },
                                                })
                                            }
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={resume.personalInfo.address?.state || ''}
                                            onChange={(e) =>
                                                setResume({
                                                    ...resume,
                                                    personalInfo: {
                                                        ...resume.personalInfo,
                                                        address: { ...resume.personalInfo.address, state: e.target.value },
                                                    },
                                                })
                                            }
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="Enter your state"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={resume.personalInfo.address?.country || ''}
                                            onChange={(e) =>
                                                setResume({
                                                    ...resume,
                                                    personalInfo: {
                                                        ...resume.personalInfo,
                                                        address: { ...resume.personalInfo.address, country: e.target.value },
                                                    },
                                                })
                                            }
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="Enter your country"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={resume.personalInfo.address?.zipCode || ''}
                                            onChange={(e) =>
                                                setResume({
                                                    ...resume,
                                                    personalInfo: {
                                                        ...resume.personalInfo,
                                                        address: { ...resume.personalInfo.address, zipCode: e.target.value },
                                                    },
                                                })
                                            }
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="Enter your zip code"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="border-t pt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                            <textarea
                                value={resume.summary || ''}
                                onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="Write a brief professional summary highlighting your key skills and experience..."
                                rows={5}
                                maxLength={1000}
                            />
                            <p className="text-sm text-gray-500 mt-2">{(resume.summary || '').length}/1000 characters</p>
                        </div>
                    </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <GraduationCap className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Education</h2>
                                    <p className="text-sm text-gray-600">Add your educational qualifications</p>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    addArrayItem('education', {
                                        degree: '',
                                        field: '',
                                        institution: '',
                                        yearOfCompletion: new Date().getFullYear(),
                                        grade: '',
                                        isVisible: true,
                                    })
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#155DFC] to-[#00B8DB] text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
                            >
                                <Plus size={16} />
                                Add Education
                            </button>
                        </div>
                        <div className="space-y-6">
                            {resume.education?.map((edu: any, index: number) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-4 pb-4 relative">
                                    <button
                                        onClick={() => removeArrayItem('education', index)}
                                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-6 h-6 hover:bg-red-600 text-sm"
                                    >
                                        ×
                                    </button>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Degree (e.g., Bachelor of Science)"
                                    />
                                    <input
                                        type="text"
                                        value={edu.field}
                                        onChange={(e) => updateArrayField('education', index, 'field', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Field of Study"
                                    />
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => updateArrayField('education', index, 'institution', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Institution"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            value={edu.yearOfCompletion}
                                            onChange={(e) => updateArrayField('education', index, 'yearOfCompletion', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Year of Completion"
                                        />
                                        <input
                                            type="text"
                                            value={edu.grade || ''}
                                            onChange={(e) => updateArrayField('education', index, 'grade', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Grade/GPA"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Work Experience</h2>
                            <button
                                onClick={() =>
                                    addArrayItem('workExperience', {
                                        position: '',
                                        company: '',
                                        location: '',
                                        startDate: new Date(),
                                        endDate: null,
                                        isCurrent: false,
                                        description: '',
                                        achievements: [],
                                        isVisible: true,
                                    })
                                }
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                + Add
                            </button>
                        </div>
                        <div className="space-y-6">
                            {resume.workExperience?.map((exp: any, index: number) => (
                                <div key={index} className="border-l-4 border-green-500 pl-4 pb-4 relative">
                                    <button
                                        onClick={() => removeArrayItem('workExperience', index)}
                                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-6 h-6 hover:bg-red-600 text-sm"
                                    >
                                        ×
                                    </button>
                                    <input
                                        type="text"
                                        value={exp.position}
                                        onChange={(e) => updateArrayField('workExperience', index, 'position', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Position"
                                    />
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => updateArrayField('workExperience', index, 'company', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Company"
                                    />
                                    <input
                                        type="text"
                                        value={exp.location || ''}
                                        onChange={(e) => updateArrayField('workExperience', index, 'location', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Location"
                                    />
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <input
                                            type="date"
                                            value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => updateArrayField('workExperience', index, 'startDate', new Date(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Start Date"
                                        />
                                        <input
                                            type="date"
                                            value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => updateArrayField('workExperience', index, 'endDate', e.target.value ? new Date(e.target.value) : null)}
                                            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                                            placeholder="End Date"
                                            disabled={exp.isCurrent}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={exp.isCurrent}
                                            onChange={(e) => updateArrayField('workExperience', index, 'isCurrent', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label className="text-sm">Currently working here</label>
                                    </div>
                                    <textarea
                                        value={exp.description || ''}
                                        onChange={(e) => updateArrayField('workExperience', index, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Job Description"
                                        rows={3}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Skills</h2>
                            <button
                                onClick={() =>
                                    addArrayItem('skills', {
                                        name: '',
                                        level: 'Intermediate',
                                        isVisible: true,
                                    })
                                }
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                + Add
                            </button>
                        </div>
                        <div className="space-y-3">
                            {resume.skills?.map((skill: any, index: number) => (
                                <div key={index} className="flex gap-3 items-end pb-2 border-b">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={skill.name}
                                            onChange={(e) => updateArrayField('skills', index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Skill Name"
                                        />
                                    </div>
                                    <select
                                        value={skill.level}
                                        onChange={(e) => updateArrayField('skills', index, 'level', e.target.value)}
                                        className="px-3 py-2 border rounded-lg"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                        <option>Expert</option>
                                    </select>
                                    <button
                                        onClick={() => removeArrayItem('skills', index)}
                                        className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications Tab */}
                {activeTab === 'certifications' && (
                    <div className="bg-white p-6 rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Certifications</h2>
                            <button
                                onClick={() =>
                                    addArrayItem('certifications', {
                                        name: '',
                                        issuingOrganization: '',
                                        issueDate: new Date(),
                                        expiryDate: null,
                                        credentialId: '',
                                        credentialUrl: '',
                                        isVisible: true,
                                    })
                                }
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                + Add
                            </button>
                        </div>
                        <div className="space-y-6">
                            {resume.certifications?.map((cert: any, index: number) => (
                                <div key={index} className="border-l-4 border-yellow-500 pl-4 pb-4 relative">
                                    <button
                                        onClick={() => removeArrayItem('certifications', index)}
                                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-6 h-6 hover:bg-red-600 text-sm"
                                    >
                                        ×
                                    </button>
                                    <input
                                        type="text"
                                        value={cert.name}
                                        onChange={(e) => updateArrayField('certifications', index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Certification Name"
                                    />
                                    <input
                                        type="text"
                                        value={cert.issuingOrganization}
                                        onChange={(e) => updateArrayField('certifications', index, 'issuingOrganization', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Issuing Organization"
                                    />
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <input
                                            type="date"
                                            value={cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => updateArrayField('certifications', index, 'issueDate', new Date(e.target.value))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Issue Date"
                                        />
                                        <input
                                            type="date"
                                            value={cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => updateArrayField('certifications', index, 'expiryDate', e.target.value ? new Date(e.target.value) : null)}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            placeholder="Expiry Date (Optional)"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={cert.credentialId || ''}
                                        onChange={(e) => updateArrayField('certifications', index, 'credentialId', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                        placeholder="Credential ID"
                                    />
                                    <input
                                        type="url"
                                        value={cert.credentialUrl || ''}
                                        onChange={(e) => updateArrayField('certifications', index, 'credentialUrl', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Credential URL"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects Tab */}
                {/* {activeTab === 'projects' && (
                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Projects</h2>
                        <button
                            onClick={() =>
                                addArrayItem('projects', {
                                    title: '',
                                    description: '',
                                    technologies: [],
                                    startDate: null,
                                    endDate: null,
                                    url: '',
                                    isVisible: true,
                                })
                            }
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                            + Add
                        </button>
                    </div>
                    <div className="space-y-6">
                        {resume.projects?.map((project: any, index: number) => (
                            <div key={index} className="border-l-4 border-purple-500 pl-4 pb-4 relative">
                                <button
                                    onClick={() => removeArrayItem('projects', index)}
                                    className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-6 h-6 hover:bg-red-600 text-sm"
                                >
                                    ×
                                </button>
                                <input
                                    type="text"
                                    value={project.title}
                                    onChange={(e) => updateArrayField('projects', index, 'title', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg mb-2"
                                    placeholder="Project Title"
                                />
                                <textarea
                                    value={project.description || ''}
                                    onChange={(e) => updateArrayField('projects', index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg mb-2"
                                    placeholder="Project Description"
                                    rows={3}
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-600 mb-2">{(project.description || '').length}/500 characters</p>
                                <input
                                    type="text"
                                    value={project.technologies?.join(', ') || ''}
                                    onChange={(e) =>
                                        updateArrayField('projects', index, 'technologies', e.target.value.split(',').map(t => t.trim()))
                                    }
                                    className="w-full px-3 py-2 border rounded-lg mb-2"
                                    placeholder="Technologies (comma-separated)"
                                />
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <input
                                        type="date"
                                        value={project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateArrayField('projects', index, 'startDate', e.target.value ? new Date(e.target.value) : null)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="Start Date"
                                    />
                                    <input
                                        type="date"
                                        value={project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateArrayField('projects', index, 'endDate', e.target.value ? new Date(e.target.value) : null)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="End Date"
                                    />
                                </div>
                                <input
                                    type="url"
                                    value={project.url || ''}
                                    onChange={(e) => updateArrayField('projects', index, 'url', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Project URL"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )} */}

                {/* Languages Tab */}
                {/* {activeTab === 'languages' && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Languages</h2>
            <button
              onClick={() =>
                addArrayItem('languages', {
                  name: '',
                  proficiency: 'Intermediate',
                  isVisible: true,
                })
              }
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              + Add
            </button>
          </div>
          <div className="space-y-3">
            {resume.languages?.map((lang: any, index: number) => (
              <div key={index} className="flex gap-3 items-end pb-2 border-b">
                <div className="flex-1">
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => updateArrayField('languages', index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Language Name"
                  />
                </div>
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateArrayField('languages', index, 'proficiency', e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option>Basic</option>
                  <option>Intermediate</option>
                  <option>Fluent</option>
                  <option>Native</option>
                </select>
                <button
                  onClick={() => removeArrayItem('languages', index)}
                  className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )} */}
            </div>
        </>
    );
}