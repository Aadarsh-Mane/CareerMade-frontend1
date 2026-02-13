import React from 'react'

const Card = () => {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 w-full max-w-sm">
        {/* Header with Logo/Image */}
        <div className="relative mb-5">
          {/* Colored Banner */}
          <div className="w-full h-20 bg-[#1A0152] rounded-lg"></div>

          {/* Circular Image Container */}
          <div className="absolute -bottom-6 left-6">
            <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#1A0152] flex items-center justify-center overflow-hidden">
                <img
                  src="/card.png"
                  alt="Hospital Logo"
                  className="w-2/4 h-2/4 object-contain"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Title and Bookmark */}
        <div className="flex items-start justify-between mt-8 mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#1A0152] leading-tight mb-1">
              Registered Nurse
            </h3>
            <p className="text-sm text-gray-500 font-medium">City General Hospital</p>
          </div>
          <button className="text-gray-300 hover:text-[#1A0152] transition-colors ml-3 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Location and Experience */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Mumbai, India</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">5-8 years</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">15-25 LPA</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-gray-100">
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
            Cardiology
          </span>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
            Full-time
          </span>
          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
            Reception
          </span>
        </div>

        {/* Main Action Button */}
        <button className="w-full bg-[#1A0152] hover:bg-[#B482FF] text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-200 mb-3 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>View Applications</span>
        </button>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center justify-center gap-1 px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-[#CBA2FF] hover:text-[#1A0152] transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-1 px-3 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-[#CBA2FF] hover:text-[#1A0152] transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          <button className="flex flex-col items-center justify-center gap-1 px-3 py-2.5 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
      </>
  )
}

export default Card