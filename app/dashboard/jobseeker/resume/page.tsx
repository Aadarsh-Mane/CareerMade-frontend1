'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/app/components/Navbar';
import GradientLoader from '@/app/components/GradientLoader';
// Assuming these icons are available or you'd use a library like 'lucide-react'
import { FileText, PlusCircle, Trash2, Edit, Eye, Download, Star } from 'lucide-react';
import Link from 'next/link';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from 'next/navigation';

interface Resume {
    _id: string;
    title: string;
    personalInfo: {
        fullName: string;
        email: string;
    };
    isDefault: boolean;
    stats: {
        views: number;
        downloads: number;
    };
    createdAt: string;
    updatedAt: string;
}

export default function ResumePage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token) {
            toast.error("Please log in to access your resumes");
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
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/list`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            // Ensure response structure is correct based on your API
            setResumes(response.data.data.resumes);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                // Optimistically update the UI
                setResumes(resumes.filter(r => r._id !== id));
            } catch (err: any) {
                // Check for specific error message or fallback
                const errorMessage = err.response?.data?.message || 'Failed to delete resume.';
                toast.error(errorMessage);
            }
        }
    };

    // Helper function for date formatting (optional but nice for UI)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <GradientLoader />
                <p className="mt-4 text-gray-500">Loading your resumes...</p>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className=" bg-gray-50 ">
                <div className="bg-[#002B6B] text-white py-10 relative overflow-hidden flex-shrink-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-90"
                        style={{ backgroundImage: "url('/new1.png')" }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold leading-tight">
                                My Resumes{" "}
                                {/* <span className="bg-gradient-to-r from-[#00A3FF] to-[#00E0FF] bg-clip-text text-transparent">
                                        Your Applications
                                    </span> */}
                            </h1>
                            <p className="text-blue-100 mt-3">
                                Create Your Resumes and Stand Out to Employers!
                            </p>
                        </div>
                        <Link className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-linear-to-r from-[#155DFC] to-[#00B8DB] transition duration-300 ease-in-out transform hover:scale-[1.02]"
                            href="/dashboard/jobseeker/resume/build">✨ Build New Resume</Link>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}


                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}

                    {/* Empty State */}
                    {resumes.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-300 p-12 rounded-xl text-center shadow-inner mt-10 ">
                            <p className="text-xl text-gray-600 mb-6">
                                It looks like you haven't created any resumes yet.
                            </p>
                            <Link
                                href="/dashboard/jobseeker/resume/build"
                                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 text-lg font-medium transition duration-300"
                            >
                                🚀 Create Your First Resume
                            </Link>
                        </div>
                    ) : (
                        // Resumes List
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-4 sm:p-6 lg:p-8">
                            {resumes.map(resume => (
                                <div
                                    key={resume._id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300"
                                >
                                    {/* Header with Title and Default Badge */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {resume.title}
                                        </h3>
                                        {resume.isDefault && (
                                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    {/* Meta Info - Created Date */}
                                    <div className="flex items-center text-xs text-gray-500 mb-3">
                                        <FileText className="w-3 h-3 mr-1" />
                                        Created: {formatDate(resume.createdAt)}
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex gap-4 text-xs text-gray-600 mb-4 pb-3 border-b">
                                        <div className="flex items-center">
                                            <Eye className="w-3 h-3 mr-1 text-gray-400" />
                                            Views: <span className="font-semibold ml-1">{resume.stats.views}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Download className="w-3 h-3 mr-1 text-gray-400" />
                                            Downloads: <span className="font-semibold ml-1">{resume.stats.downloads}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {/* Edit Button */}
                                        <Link
                                            href={`/dashboard/jobseeker/resume/edit/${resume._id}`}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2  text-blue-600  font-medium text-xs transition border  rounded-md border-gray-200"
                                        >
                                            <Edit className="w-3 h-3" />
                                            Edit
                                        </Link>

                                        {/* Preview Button */}
                                        <Link
                                            href={`/dashboard/jobseeker/resume/preview/${resume._id}`}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2  text-blue-600 border  font-medium text-xs transition  rounded-md border-gray-200"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Preview
                                        </Link>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(resume._id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2  text-red-600   font-medium text-xs transition border rounded-md border-gray-200"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}