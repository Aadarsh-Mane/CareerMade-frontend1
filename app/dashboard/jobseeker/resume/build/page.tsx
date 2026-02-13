'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import GradientLoader from '@/app/components/GradientLoader';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BuildResumePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobSeekerData, setJobSeekerData] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: 'My Resume',
    autoPopulate: true,
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      linkedIn: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
      },
    },
    summary: '',
    styling: {
      fontFamily: 'Arial',
      fontSize: 11,
      primaryColor: '#000000',
      accentColor: '#2563eb',
      spacing: 'normal',
    },
  });
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      toast.error("Please log in to build your resume");
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
    fetchJobSeekerData();
  }, []);

  const fetchJobSeekerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      const jobSeeker = response.data.data.jobSeeker;
      setJobSeekerData(jobSeeker);

      // Pre-populate form with job seeker data
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          fullName: jobSeeker.user?.firstName && jobSeeker.user?.lastName
            ? `${jobSeeker.user.firstName} ${jobSeeker.user.lastName}`
            : '',
          email: jobSeeker.user?.email || '',
          phone: jobSeeker.phone || '',
          linkedIn: jobSeeker.linkedIn || '',
          address: {
            street: jobSeeker.address?.street || '',
            city: jobSeeker.address?.city || '',
            state: jobSeeker.address?.state || '',
            country: jobSeeker.address?.country || '',
            zipCode: jobSeeker.address?.zipCode || '',
          },
        },
        summary: jobSeeker.summary || '',
      }));
    } catch (err: any) {
      console.error('Failed to fetch job seeker data:', err);
      toast.error(err.response?.data?.message || 'Failed to load your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePersonalInfoChange = (e: any) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          address: {
            ...prev.personalInfo.address,
            [addressField]: value,
          },
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [name]: value,
        },
      }));
    }
  };

  const handleStylingChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      styling: {
        ...prev.styling,
        [name]: type === 'number' ? parseInt(value) : value,
      },
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setCreating(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resume/build`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      router.push(`/dashboard/jobseeker/resume/edit/${response.data.data.resume._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create resume');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <GradientLoader />
        <p className="mt-4 text-gray-500">Loading your profile data...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-start items-start mb-3">
          <button
            onClick={() => router.push('/dashboard/jobseeker/resume')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Build Your Resume</h1>
        <p className="text-gray-600 mb-6">
          {formData.autoPopulate
            ? '✓ Your profile data has been pre-filled below'
            : 'Enter your resume details manually'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Resume Basics</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Resume Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., My Resume, Software Engineer Resume"
                />
                <p className="text-xs text-gray-500 mt-1">Give your resume a descriptive title</p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="autoPopulate"
                  name="autoPopulate"
                  checked={formData.autoPopulate}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoPopulate" className="text-sm cursor-pointer flex-1">
                  <span className="font-medium">Auto-populated from profile</span>
                  <p className="text-xs text-gray-600">Data from your job seeker profile is already filled in</p>
                </label>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Mobile Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.personalInfo.linkedIn}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Address</h2>
            <div className="grid gap-3">
              <input
                type="text"
                name="address.street"
                placeholder="Street Address"
                value={formData.personalInfo.address.street}
                onChange={handlePersonalInfoChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="address.city"
                  placeholder="City"
                  value={formData.personalInfo.address.city}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="address.state"
                  placeholder="State/Province"
                  value={formData.personalInfo.address.state}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="address.country"
                  placeholder="Country"
                  value={formData.personalInfo.address.country}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="Zip/Postal Code"
                  value={formData.personalInfo.address.zipCode}
                  onChange={handlePersonalInfoChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Write a brief summary about yourself. Highlight your key strengths, experience, and career goals. (max 1000 characters)"
              rows={5}
              maxLength={1000}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">Tip: Keep it concise and impactful</p>
              <p className="text-sm text-gray-600">{formData.summary.length}/1000</p>
            </div>
          </div>

          {/* Styling Options */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Resume Styling</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select
                    name="fontFamily"
                    value={formData.styling.fontFamily}
                    onChange={handleStylingChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Calibri">Calibri</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Helvetica">Helvetica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <input
                    type="number"
                    name="fontSize"
                    min="10"
                    max="14"
                    value={formData.styling.fontSize}
                    onChange={handleStylingChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.styling.primaryColor}
                      onChange={handleStylingChange}
                      className="w-12 h-10 border rounded-lg cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{formData.styling.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="accentColor"
                      value={formData.styling.accentColor}
                      onChange={handleStylingChange}
                      className="w-12 h-10 border rounded-lg cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{formData.styling.accentColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Line Spacing</label>
                <select
                  name="spacing"
                  value={formData.styling.spacing}
                  onChange={handleStylingChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="compact">Compact (More content per page)</option>
                  <option value="normal">Normal (Balanced)</option>
                  <option value="relaxed">Relaxed (More breathing room)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Preview</h3>
            <div
              className="bg-white p-4 rounded border text-sm"
              style={{
                fontFamily: formData.styling.fontFamily,
                fontSize: `${formData.styling.fontSize}pt`,
                color: formData.styling.primaryColor,
              }}
            >
              <p className="font-bold mb-1">{formData.personalInfo.fullName || 'Your Name'}</p>
              <p className="text-xs text-gray-600">
                {formData.personalInfo.email && `${formData.personalInfo.email} • `}
                {formData.personalInfo.phone && `${formData.personalInfo.phone}`}
              </p>
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex gap-4 sticky bottom-0 bg-white p-4 rounded-lg border shadow-lg">
            <button
              type="submit"
              disabled={creating || !formData.personalInfo.fullName || !formData.personalInfo.email}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
            >
              {creating ? 'Creating Resume...' : 'Create Resume'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}