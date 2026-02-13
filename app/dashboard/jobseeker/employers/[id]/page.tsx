"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  CheckCircle,
  Briefcase,
  Eye,
  Mail,
  Phone,
  Award,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";

interface Employer {
  _id: string;
  organizationName: string;
  organizationType: string;
  description: string;
  website?: string;
  foundedYear?: number;
  employeeCount?: string;
  contactPerson: {
    name: string;
    designation: string;
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  specializations: string[];
  services: Array<{
    name: string;
    description?: string;
  }>;
  accreditations: Array<{
    name: string;
    issuingBody: string;
    issueDate: string;
  }>;
  logo?: {
    url: string;
  };
  gallery: Array<{
    url: string;
    caption?: string;
  }>;
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
  };
  subscription: {
    plan: string;
    status: string;
  };
  hiringPreferences: {
    preferredExperience?: {
      min: number;
      max: number;
    };
    hiringProcess?: string;
    responseTime?: string;
  };
  stats: {
    totalJobPosts: number;
    activeJobPosts: number;
    totalApplications: number;
    totalHires: number;
    profileViews: number;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  createdAt: string;
}

export default function EmployerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchEmployerDetails();
    }
  }, [params.id]);

  const fetchEmployerDetails = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employer/${params.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setEmployer(data.data.employer);
      } else {
        toast.error(data.message || "Failed to fetch employer details");
      }
    } catch (error) {
      console.error("Failed to fetch employer:", error);
      toast.error("Failed to load employer details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B8DB]"></div>
        </div>
      </>
    );
  }

  if (!employer) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Employer not found</h3>
            <button
              onClick={() => router.push("/dashboard/jobseeker/employers")}
              className="text-[#155DFC] hover:underline"
            >
              Back to Employers
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-[#002B6B] text-white py-12 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{ backgroundImage: "url('/new1.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#001b3e]/90 via-[#002b6b]/60 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <button
              onClick={() => router.push("/dashboard/jobseeker/employers")}
              className="flex items-center gap-2 text-white hover:text-blue-100 mb-6 transition text-sm"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo */}
              {employer.logo?.url ? (
                <img
                  src={employer.logo.url}
                  alt={employer.organizationName}
                  className="w-24 h-24 rounded-xl object-cover border-4 border-white/20 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20 shadow-lg">
                  {employer.organizationName.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{employer.organizationName}</h1>
                  {employer.verification.isVerified && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-400 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-100">Verified</span>
                    </div>
                  )}
                </div>

                <p className="text-xl text-blue-100 mb-4">{employer.organizationType}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>
                      {employer.address.city}, {employer.address.state}
                    </span>
                  </div>
                  {employer.employeeCount && (
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{employer.employeeCount} employees</span>
                    </div>
                  )}
                  {employer.foundedYear && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Founded {employer.foundedYear}</span>
                    </div>
                  )}
                  {employer.website && (
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-white transition"
                    >
                      <Globe size={16} />
                      <span>Website</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{employer.description}</p>
              </div>

              {/* Specializations */}
              {employer.specializations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Specializations</h2>
                  <div className="flex flex-wrap gap-2">
                    {employer.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-blue-50 text-[#155DFC] font-medium rounded-lg"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {employer.services.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Services Offered</h2>
                  <ul className="space-y-3">
                    {employer.services.map((service, idx) => (
                      <li key={idx} className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery */}
              {employer.gallery.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {employer.gallery.map((image, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={image.url}
                          alt={image.caption || `Gallery image ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-5 h-5" />
                      <span>Active Jobs</span>
                    </div>
                    <span className="text-2xl font-bold text-[#155DFC]">
                      {employer.stats.activeJobPosts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span>Total Hires</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {employer.stats.totalHires}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="w-5 h-5" />
                      <span>Profile Views</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {employer.stats.profileViews}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                    <p className="font-semibold text-gray-900">{employer.contactPerson.name}</p>
                    <p className="text-sm text-gray-600">{employer.contactPerson.designation}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${employer.contactPerson.email}`}
                      className="hover:text-[#155DFC] transition"
                    >
                      {employer.contactPerson.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${employer.contactPerson.phone}`}
                      className="hover:text-[#155DFC] transition"
                    >
                      {employer.contactPerson.phone}
                    </a>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Address</p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {employer.address.street}
                      <br />
                      {employer.address.city}, {employer.address.state}
                      <br />
                      {employer.address.pincode}
                      <br />
                      {employer.address.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Accreditations */}
              {employer.accreditations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Accreditations</h3>
                  <div className="space-y-4">
                    {employer.accreditations.map((acc, idx) => (
                      <div key={idx} className="flex gap-3">
                        <Award className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">{acc.name}</p>
                          <p className="text-sm text-gray-600">Issued by: {acc.issuingBody}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(acc.issueDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hiring Preferences */}
              {employer.hiringPreferences && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Hiring Preferences</h3>
                  <div className="space-y-3 text-sm">
                    {employer.hiringPreferences.preferredExperience && (
                      <div>
                        <p className="text-gray-600 mb-1">Preferred Experience</p>
                        <p className="font-semibold text-gray-900">
                          {employer.hiringPreferences.preferredExperience.min} -{" "}
                          {employer.hiringPreferences.preferredExperience.max} years
                        </p>
                      </div>
                    )}
                    {employer.hiringPreferences.hiringProcess && (
                      <div>
                        <p className="text-gray-600 mb-1">Hiring Process</p>
                        <p className="font-semibold text-gray-900">
                          {employer.hiringPreferences.hiringProcess}
                        </p>
                      </div>
                    )}
                    {employer.hiringPreferences.responseTime && (
                      <div>
                        <p className="text-gray-600 mb-1">Response Time</p>
                        <p className="font-semibold text-gray-900">
                          {employer.hiringPreferences.responseTime}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
