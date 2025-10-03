import React from 'react';
import { FaSignInAlt, FaUserPlus, FaIdCard, FaUsers, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaIdCard className="text-3xl text-blue-500" />,
      title: "RFID Technology",
      description: "Modern RFID-based attendance tracking for accurate and efficient monitoring"
    },
    {
      icon: <FaUsers className="text-3xl text-violet-500" />,
      title: "Multi-Role Support",
      description: "Separate dashboards for students, teachers, and administrators"
    },
    {
      icon: <FaChartLine className="text-3xl text-emerald-500" />,
      title: "Analytics & Reports",
      description: "Comprehensive attendance analytics and detailed reporting"
    },
    {
      icon: <FaShieldAlt className="text-3xl text-amber-500" />,
      title: "Secure Platform",
      description: "Advanced security features with role-based access control"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Smart RFID
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">
                Attendance System
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-10">
              A modern, secure platform for tracking attendance using RFID technology. 
              Designed for educational institutions with role-based access for students, teachers, and administrators.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[160px] w-full sm:w-auto touch-manipulation"
              >
                <FaSignInAlt />
                Sign In
              </button>

              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-200 transform hover:-translate-y-0.5 min-w-[160px] w-full sm:w-auto touch-manipulation"
              >
                <FaUserPlus />
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Built with modern technology and user experience in mind
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-gray-50 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA Section */}
      <div className="bg-gradient-to-r from-blue-500 to-violet-500 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users already using our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 w-full sm:w-auto touch-manipulation"
            >
              <FaUserPlus />
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-transparent hover:bg-white/10 text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/50 transition-all duration-200 w-full sm:w-auto touch-manipulation"
            >
              <FaSignInAlt />
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
