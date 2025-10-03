/**
 * Enhanced Sidebar Component
 * 
 * Features:
 * - Modern design system with consistent colors and typography
 * - Improved user profile section with better visual hierarchy
 * - Enhanced navigation items with hover effects and active states
 * - Mobile-responsive with slide-out menu and overlay
 * - Accessible keyboard navigation and ARIA labels
 * - Smooth transitions and micro-interactions
 * 
 * Props:
 * - userRole: string - User's role (admin, teacher, student)
 * - userName: string - User's display name
 * - children: ReactNode - Navigation content (typically NavItem components)
 * - className: string - Additional CSS classes (optional)
 */

import React, { useState, useEffect } from "react";
import { FaUser, FaCog, FaSignOutAlt, FaChevronDown, FaCamera, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";

const Sidebar = ({ 
  userRole, 
  userName, 
  children, 
  className = "" 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    profilePicture: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }
      
      const res = await axios.get("/auth/profile", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setProfileData(res.data);
      setProfileForm({
        name: res.data.name || "",
        email: res.data.email || "",
        profilePicture: res.data.profilePicture || ""
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 401) {
        console.log("Authentication failed, clearing tokens");
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!profileForm.name.trim()) {
      alert('Name is required');
      return;
    }
    
    if (!profileForm.email.trim()) {
      alert('Email is required');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in again");
        navigate("/login");
        return;
      }
      
      const updateData = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim()
      };
      
      // Only include profilePicture if it's been changed
      if (profileForm.profilePicture && profileForm.profilePicture !== profileData?.profilePicture) {
        updateData.profilePicture = profileForm.profilePicture;
      }
      
      console.log('Updating profile...', { 
        name: updateData.name, 
        email: updateData.email, 
        hasProfilePicture: !!updateData.profilePicture 
      });
      
      await axios.put("/auth/profile", updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update localStorage with new name
      localStorage.setItem(`${userRole}Name`, profileForm.name);
      
      // Refresh profile data
      await fetchProfile();
      setShowProfileModal(false);
      
      alert('Profile updated successfully!');
      
      // Force page reload to update UI with new profile data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error("Error updating profile:", err);
      
      if (err.response?.status === 413) {
        alert("Image file is too large. Please choose a smaller image (less than 5MB).");
      } else if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.clear();
        navigate("/login");
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
        alert("Failed to update profile: " + errorMessage);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB. Please choose a smaller image.');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress the image if it's too large
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 400x400)
          let { width, height } = img;
          const maxSize = 400;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          setProfileForm(prev => ({
            ...prev,
            profilePicture: compressedDataUrl
          }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : userRole[0].toUpperCase();
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin': return 'from-primary-100 to-secondary-100';
      case 'teacher': return 'from-secondary-100 to-primary-100';
      case 'student': return 'from-primary-100 to-info-100';
      default: return 'from-gray-100 to-gray-200';
    }
  };

  const getRoleTextColor = () => {
    switch (userRole) {
      case 'admin': return 'text-primary-800';
      case 'teacher': return 'text-secondary-800';
      case 'student': return 'text-primary-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-navigation"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="w-5 h-5 text-gray-700" aria-hidden="true" />
        ) : (
          <FaBars className="w-5 h-5 text-gray-700" aria-hidden="true" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav 
        id="mobile-navigation"
        className={`
          fixed left-0 top-0 h-screen w-80 bg-white shadow-2xl border-r border-gray-100 
          flex flex-col justify-between z-fixed overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="p-6">
          {/* User Profile Section */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center shadow-card relative overflow-hidden ring-2 ring-white`}>
                {profileData?.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className={`${getRoleTextColor()} text-xl font-bold`}>
                    {getInitials(userName)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 truncate">{userName}</h3>
                <p className="text-sm font-medium text-gray-500 capitalize tracking-wide">{userRole}</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Edit profile"
              >
                <FaUser className="w-3 h-3" aria-hidden="true" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-2 text-sm font-medium text-error-700 bg-error-50 hover:bg-error-100 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
                aria-label="Sign out of account"
              >
                <FaSignOutAlt className="w-3 h-3" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Content */}
          <div className="space-y-2" role="list" aria-label="Navigation items">
            {/* Clone children and pass mobile close function */}
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onMobileClick: () => setIsMobileMenuOpen(false)
                });
              }
              return child;
            })}
          </div>
        </div>

        {/* Settings Dropdown */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="relative">
            {dropdownOpen && (
              <div className="absolute bottom-full mb-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-dropdown">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors duration-200 font-medium"
                >
                  <FaUser className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-error-50 flex items-center gap-3 text-error-600 transition-colors duration-200 border-t border-gray-100 font-medium"
                >
                  <FaSignOutAlt className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
            
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <FaCog className="w-4 h-4" />
              Settings
              <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
          aria-describedby="profile-modal-description"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h3 id="profile-modal-title" className="text-2xl font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Close profile modal"
              >
                <FaTimes className="w-4 h-4 text-gray-500" aria-hidden="true" />
              </button>
            </div>
            
            <p id="profile-modal-description" className="sr-only">
              Edit your profile information including name, email, and profile picture
            </p>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Profile Picture */}
              <div className="text-center">
                <div className={`w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center shadow-card relative overflow-hidden ring-4 ring-white`}>
                  {profileForm.profilePicture ? (
                    <img
                      src={profileForm.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`${getRoleTextColor()} text-2xl font-bold`}>
                      {getInitials(profileForm.name)}
                    </span>
                  )}
                  <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-2xl">
                    <FaCamera className="text-white text-xl" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm font-medium text-gray-500 mt-3">Click to change photo</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 font-medium"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 font-medium"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Enhanced Navigation Item Component with mobile support
export const NavItem = ({ label, icon, active, onClick, badge, className = "", onMobileClick }) => {
  const handleClick = () => {
    onClick();
    // Close mobile menu when navigation item is clicked
    if (onMobileClick) {
      onMobileClick();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold 
        transition-all duration-200 group relative overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${active
          ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200 border border-primary-600"
          : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-card"
        }
        ${className}
      `}
      role="listitem"
      aria-current={active ? 'page' : undefined}
      aria-label={badge > 0 ? `${label} (${badge} notifications)` : label}
    >
      {/* Background gradient effect on hover */}
      {!active && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
      )}
      
      <span className="flex items-center gap-3 relative z-1">
        <span
          className={`text-lg transition-colors duration-200 ${
            active 
              ? "text-white" 
              : "text-primary-600 group-hover:text-primary-700"
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="relative z-1">{label}</span>
      </span>
      
      {badge > 0 && (
        <span
          className={`
            text-xs px-2 py-1 rounded-full font-bold relative z-1 min-w-[1.5rem] text-center
            ${active
              ? "bg-white bg-opacity-20 text-white"
              : "bg-error-100 text-error-700 group-hover:bg-error-200"
            }
          `}
          aria-label={`${badge} notifications`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default Sidebar;