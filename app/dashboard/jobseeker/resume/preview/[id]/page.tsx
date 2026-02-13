'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import GradientLoader from '@/app/components/GradientLoader';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PreviewResumePage() {
    const params = useParams();
    const router = useRouter();
    const [resume, setResume] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token) {
            toast.error("Please log in to preview resumes");
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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/${params.id}/preview`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            setResume(response.data.data.resume);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load resume');
            router.push('/dashboard/jobseeker/resume');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/${params.id}/download`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            window.open(response.data.data.downloadUrl, '_blank');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to download resume');
        } finally {
            setDownloading(false);
        }
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
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => router.back()}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {downloading ? 'Downloading...' : 'Download PDF'}
                        </button>
                    </div>

                    {/* Resume Content */}
                    <div
                        className="bg-white p-12 rounded-lg shadow-lg"
                        style={{
                            fontFamily: resume.styling?.fontFamily || 'Arial',
                            fontSize: `${resume.styling?.fontSize || 11}pt`,
                            color: resume.styling?.primaryColor || '#000000',
                        }}
                    >
                        {/* Personal Info */}
                        <div className="border-b-2 pb-4 mb-6" style={{ borderColor: resume.styling?.accentColor }}>
                            <h1 className="text-3xl font-bold">{resume.personalInfo.fullName}</h1>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                <span>{resume.personalInfo.email}</span>
                                {resume.personalInfo.phone && <span>•</span>}
                                {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
                            </div>
                            {resume.personalInfo.linkedIn && (
                                <p className="text-sm text-gray-600">LinkedIn: {resume.personalInfo.linkedIn}</p>
                            )}
                        </div>

                        {/* Summary */}
                        {resume.summary && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-2" style={{ color: resume.styling?.accentColor }}>
                                    PROFESSIONAL SUMMARY
                                </h2>
                                <p className="text-gray-700">{resume.summary}</p>
                            </div>
                        )}

                        {/* Experience */}
                        {resume.workExperience?.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-3" style={{ color: resume.styling?.accentColor }}>
                                    WORK EXPERIENCE
                                </h2>
                                <div className="space-y-4">
                                    {resume.workExperience.map((exp: any, index: number) => (
                                        <div key={index}>
                                            <div className="flex justify-between">
                                                <h3 className="font-bold">{exp.position}</h3>
                                                <span className="text-sm text-gray-600">
                                                    {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).getFullYear()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{exp.company}</p>
                                            {exp.description && (
                                                <p className="text-gray-700 text-sm mt-1">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {resume.education?.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-3" style={{ color: resume.styling?.accentColor }}>
                                    EDUCATION
                                </h2>
                                <div className="space-y-3">
                                    {resume.education.map((edu: any, index: number) => (
                                        <div key={index}>
                                            <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                                            <p className="text-gray-600">{edu.institution}</p>
                                            <p className="text-sm text-gray-500">{edu.yearOfCompletion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {resume.skills?.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-3" style={{ color: resume.styling?.accentColor }}>
                                    SKILLS
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {resume.skills.map((skill: any, index: number) => (
                                        <span key={index} className="bg-gray-200 px-3 py-1 rounded text-sm">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {/* {resume.projects?.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-3" style={{ color: resume.styling?.accentColor }}>
                                    PROJECTS
                                </h2>
                                <div className="space-y-4">
                                    {resume.projects.map((project: any, index: number) => (
                                        <div key={index}>
                                            <h3 className="font-bold">{project.title}</h3>
                                            <p className="text-gray-700 text-sm">{project.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
                        {/*Certifications */}
                        {resume.certifications?.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold mb-3" style={{ color: resume.styling?.accentColor }}>
                                    CERTIFICATIONS
                                </h2>
                                <div className="space-y-3">
                                    {resume.certifications.map((cert: any, index: number) => (
                                        <div key={index}>
                                            <h3 className="font-bold">{cert.name}</h3>
                                            <p className="text-gray-600">{cert.issuingOrganization}</p>
                                            <p className="text-sm text-gray-500">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="border-t pt-4 mt-6 text-xs text-gray-500">
                            <p>Views: {resume.stats?.views} | Downloads: {resume.stats?.downloads}</p>
                            <p>Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}