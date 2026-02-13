import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="text-2xl font-bold text-white mb-4">
                            <img src="/logo.png" alt="CareerMade" className="h-13" />
                        </div>
                        <p className="text-sm mb-4">
                            Empowering healthcare professionals to find their dream careers
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-white">LinkedIn</a>
                            <a href="#" className="hover:text-white">Twitter</a>
                            <a href="#" className="hover:text-white">Facebook</a>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Browse Jobs</a></li>
                            <li><a href="#" className="hover:text-white">Career Resources</a></li>
                            <li><a href="#" className="hover:text-white">Resume Builder</a></li>
                            <li><a href="#" className="hover:text-white">Salary Tools</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">For Employers</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Post a Job</a></li>
                            <li><a href="#" className="hover:text-white">Browse Candidates</a></li>
                            <li><a href="#" className="hover:text-white">Pricing</a></li>
                            <li><a href="#" className="hover:text-white">Enterprise</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">About Us</a></li>
                            <li><a href="#" className="hover:text-white">Contact</a></li>
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 text-center text-sm">
                    <p>© 2025 CareerMade. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer