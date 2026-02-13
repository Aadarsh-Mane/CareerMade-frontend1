"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import toast from "react-hot-toast";

export default function EmployerProfileCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    description: "",
    website: "",
    foundedYear: "",
    employeeCount: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    specializations: [] as string[],
    accreditations: [] as string[],
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      toast.error("Please log in to continue.");
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user);

    if (parsedUser.role !== "employer") {
      toast.error("Access denied. Employers only.");
      router.push("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data?.data?.employer) {
          const p = data.data.employer;
          setFormData({
            organizationName: p.organizationName || "",
            organizationType: p.organizationType || "",
            description: p.description || "",
            website: p.website || "",
            foundedYear: p.foundedYear || "",
            employeeCount: p.employeeCount || "",
            contactPersonEmail: p.contactPerson?.email || "",
            contactPersonPhone: p.contactPerson?.phone || "",
            street: p.address?.street || "",
            city: p.address?.city || "",
            state: p.address?.state || "",
            pincode: p.address?.pincode || "",
            country: p.address?.country || "",
            specializations: p.specializations || [],
            accreditations: p.accreditations?.map((a: any) => a.name) || [],
          });
          setIsEditing(true);
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSpecialization = (spec: string) => {
    if (spec.trim() && !formData.specializations.includes(spec.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, spec.trim()],
      });
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter((s: string) => s !== spec),
    });
  };

  const addAccreditation = (acc: string) => {
    if (acc.trim() && !formData.accreditations.includes(acc.trim())) {
      setFormData({
        ...formData,
        accreditations: [...formData.accreditations, acc.trim()],
      });
    }
  };

  const removeAccreditation = (acc: string) => {
    setFormData({
      ...formData,
      accreditations: formData.accreditations.filter((a: string) => a !== acc),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.organizationName.trim()) {
      return toast.error("Organization name is required");
    }
    if (!formData.organizationType.trim()) {
      return toast.error("Organization type is required");
    }
    if (!formData.contactPersonEmail.trim()) {
      return toast.error("Contact email is required");
    }
    if (!formData.contactPersonPhone.trim()) {
      return toast.error("Contact phone is required");
    }
    if (!formData.street.trim()) {
      return toast.error("Street address is required");
    }
    if (!formData.city.trim()) {
      return toast.error("City is required");
    }
    if (!formData.state.trim()) {
      return toast.error("State is required");
    }
    if (!formData.pincode.trim()) {
      return toast.error("Pincode is required");
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return toast.error("Please log in again");

    const payload = {
      organizationName: formData.organizationName.trim(),
      organizationType: formData.organizationType.trim(),
      description: formData.description.trim(),
      website: formData.website.trim(),
      foundedYear: formData.foundedYear ? Number(formData.foundedYear) : undefined,
      employeeCount: formData.employeeCount,
      contactPerson: {
        name: formData.organizationName.trim(),
        designation: "HR Representative", // Required field - provide default
        phone: formData.contactPersonPhone.trim(),
        email: formData.contactPersonEmail.trim(),
      },
      address: {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        country: formData.country.trim() || "India",
      },
      specializations: formData.specializations.filter(s => s.trim()),
      accreditations: formData.accreditations.map((a) => ({
        name: a.trim(),
        issuingBody: "Self", // Required field - provide default
        issueDate: new Date().toISOString(),
      })),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          isEditing
            ? "Profile updated successfully!"
            : "Profile created successfully!"
        );
        router.push("/dashboard/employee/profile");
      } else {
        toast.error(data.message || "Failed to save profile");
        console.error("Error response:", data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving the profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 sm:p-8 mt-8 mb-8 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Employer Profile
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your organization's information and your profile
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => router.push("/dashboard/employee/profile/")}
              className="px-6 py-2.5 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profileForm"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Details */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Organization Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apollo Hospitals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Medical Center">Medical Center</option>
                  <option value="Nursing Home">Nursing Home</option>
                  <option value="Diagnostic Center">Diagnostic Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Established Year
                </label>
                <input
                  type="number"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1983"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Count
                </label>
                <select
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">500-1000</option>
                  <option value="1001-5000">1001-5000</option>
                  <option value="5000+">5000+</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Organization
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about your organization..."
                rows={3}
              />
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactPersonEmail"
                  value={formData.contactPersonEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="hr@apollohospitals.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPersonPhone"
                  value={formData.contactPersonPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="www.apollohospitals.com"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Location
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="123 Health Avenue, Medical District"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maharashtra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="400001"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="India"
              />
            </div>
          </section>

          {/* Medical Specialities */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Medical Specialities
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                id="specInput"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for medical specialities"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("specInput") as HTMLInputElement;
                  addSpecialization(input.value);
                  input.value = "";
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(spec)}
                    className="font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Accreditations & Certifications */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Accreditations & Certifications
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                id="accInput"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for medical specialities"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("accInput") as HTMLInputElement;
                  addAccreditation(input.value);
                  input.value = "";
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.accreditations.map((acc) => (
                <span
                  key={acc}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {acc}
                  <button
                    type="button"
                    onClick={() => removeAccreditation(acc)}
                    className="font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>
        </form>
      </div>
    </>
  );
}