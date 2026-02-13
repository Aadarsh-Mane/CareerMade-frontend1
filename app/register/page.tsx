"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, User, Mail, Lock, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Register = () => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "jobseeker",
    });

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleChange = (e: any) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleGoogle = () => {
        const role = formData.role || "jobseeker";
        const backend = process.env.NEXT_PUBLIC_API_URL;
        window.location.href = `${backend}/api/auth/google?role=${encodeURIComponent(role)}`;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // Client-side validation mirroring backend rules
            const clientErrors: string[] = [];

            // Email
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(formData.email)) {
                clientErrors.push("Please enter a valid email address");
            }

            // Password: at least 6 chars, 1 uppercase, 1 lowercase, 1 number
            // const pwdRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}/;
            // if (!pwdRegex.test(formData.password)) {
            //     clientErrors.push("Password must be 6+ chars and include upper, lower, and a number");
            // }

            // Names
            if (formData.firstName.trim().length < 2 || formData.firstName.trim().length > 50) {
                clientErrors.push("First name must be 2-50 characters");
            }
            if (formData.lastName.trim().length < 2 || formData.lastName.trim().length > 50) {
                clientErrors.push("Last name must be 2-50 characters");
            }

            // Role (backend allows only jobseeker or employer)
            if (!['jobseeker', 'employer'].includes(formData.role)) {
                clientErrors.push("Role must be either Job Seeker or Employer");
            }

            // Phone: optional in backend, but required in UI; must match +?[1-9]\d{0,15}
            const phoneRegex = /^\+?[1-9]\d{0,15}$/;
            if (!phoneRegex.test(formData.phone)) {
                clientErrors.push("Please enter a valid phone number (digits only, optional +, cannot start with 0)");
            }

            if (clientErrors.length > 0) {
                setMessage(clientErrors.join("\n"));
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            // localStorage.setItem("accessToken", data.data.tokens.accessToken);
            // localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
            // localStorage.setItem("user", JSON.stringify(data.data.user));

            // console.log("Registration success:", data);
            // alert("Registration successful!");
            // router.push("/login");

            if (!res.ok) {
                // If backend sends validation errors array, show them nicely
                if (data?.errors && Array.isArray(data.errors)) {
                    const errs = data.errors.map((e: any) => `${e.field}: ${e.message}`);
                    setMessage(errs.join("\n"));
                } else {
                    setMessage(data.message || "Registration failed.");
                    // toast.error(data.message || "Registration failed.");
                }
            } else {
                setMessage("✅ " + data.message);
                // toast.success("✅ " + data.message);


                // ✅ Store tokens & user info in localStorage
                localStorage.setItem("accessToken", data.data.tokens.accessToken);
                localStorage.setItem("refreshToken", data.data.tokens.refreshToken);
                localStorage.setItem("user", JSON.stringify(data.data.user));

                console.log("Registration success:", data);
                toast.success("Registration successful!");
                // router.push("/dashboard/employee/profile/create");
                // localStorage.setItem("user data",User)

                if (formData.role === "jobseeker") {
                    router.push("/login");
                } else {
                    router.push("/dashboard/employee/profile/create");
                }

                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    phone: "",
                    role: "jobseeker",
                });
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error("Server error. Please try again later.");
            setMessage("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">
            {/* Mobile Top Logo */}
            <div className="flex md:hidden w-full justify-center pt-6">
                <img src="/logo.png" alt="CareerMade" className="h-10" />
            </div>
            {/* LEFT SECTION - FORM */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -40 }}
                transition={{ duration: 0.8 }}
                className="order-2 md:order-1 flex flex-col justify-center items-center md:w-1/2 px-6 py-10 md:px-16"
            >
                {/* Logo */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="hidden md:flex items-center mb-8 space-x-3"
                >
                    {/* <div className="bg-[#155DFC] p-2 rounded-lg shadow-md">
                        <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">
                        CareerMade
                    </span> */}
                    <img src="/logo.png" alt="CareerMade" className="h-13" />
                </motion.div>

                {/* Heading */}
                <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
                    Create Your Account
                </h2>
                <p className="text-gray-600 mb-8 text-center max-w-sm leading-relaxed">
                    Join the CareerMade community and start connecting with the best doctors
                    and employers.
                </p>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm space-y-5 bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-100"
                >
                    {/* First Name */}
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                            required
                            minLength={2}
                            maxLength={50}
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC] outline-none text-gray-700 transition-all bg-white"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Last name"
                            required
                            minLength={2}
                            maxLength={50}
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC] outline-none text-gray-700 bg-white transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email address"
                            required
                            autoComplete="email"
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC] outline-none text-gray-700 bg-white transition-all"
                        />
                    </div>

                    {/* Phone */}
                    <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone number"
                            required
                            pattern="^\+?[1-9]\d{0,15}$"
                            title="Digits only, optional leading +, cannot start with 0"
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC] outline-none text-gray-700 bg-white transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC] outline-none text-gray-700 bg-white transition-all"
                        />
                    </div>

                    {/* Role Selector */}
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="w-full py-3 px-4 rounded-full border border-gray-300 bg-white focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC] outline-none text-gray-700"
                    >
                        {/* Only allow roles accepted by backend */}
                        <option value="jobseeker">Job Seeker</option>
                        <option value="employer">Employer</option>
                    </select>

                    {/* Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-[#155DFC] to-[#00B8DB] text-white py-3 rounded-full font-semibold transition-all duration-300 shadow-md"
                    >
                        {loading ? "Registering..." : "Register"}
                    </motion.button>

                    <div className="flex items-center gap-3">
                        <div className="h-px bg-gray-300 flex-1" />
                        <span className="text-xs text-gray-500">OR</span>
                        <div className="h-px bg-gray-300 flex-1" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogle}
                        className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 py-3 rounded-full font-medium transition"
                    >
                        Continue with Google
                    </button>

                    {/* Message */}
                    {message && (
                        <pre className="whitespace-pre-wrap text-center text-sm mt-3 text-gray-700 font-medium">
                            {message}
                        </pre>
                    )}

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-600 mt-2">
                        Already have an account?{" "}
                        <a href="/login" className="text-[#155DFC] font-medium hover:underline">
                            Login here
                        </a>
                    </p>
                </form>
            </motion.div>

            {/* RIGHT SECTION - IMAGE */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 40 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="order-1 md:order-2 flex w-full md:w-1/2 justify-center items-center mb-6 md:mb-0"
            >
                <img
                    src="/newbg.png"
                    alt="Register illustration"
                    className="w-3/4 h-auto mb-10 md:mb-20 hover:scale-105 transition-transform duration-500"
                />
            </motion.div>
        </div>
    );
};

export default Register;
