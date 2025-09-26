import React, { useState, useEffect } from "react";
import { FaUser, FaCog, FaSignOutAlt, FaChevronDown, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";

const Sidebar = ({ 
  userRole, 
  userName, 
  children, 
  className = "fixed left-0 top-0 h-screen w-72 bg-white shadow-xl p-6 flex flex-col justify-between z-10 overflow-y-auto" 
}) => {
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
      case 'admin': return 'from-blue-200 to-purple-200';
      case 'teacher': return 'from-indigo-200 to-purple-200';
      case 'student': return 'from-indigo-200 to-purple-200';
      default: return 'from-gray-200 to-gray-300';
    }
  };

  return (
    <>
      <div className={className}>
        <div>
          {/* User Info */}
          <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-100">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center shadow-md relative overflow-hidden`}>
              {profileData?.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-indigo-700 text-lg font-bold">
                  {getInitials(userName)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{userName}</h3>
              <p className="text-sm text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>

          {/* Dynamic Content */}
          {children}
        </div>

        {/* Profile & Logout Dropdown */}
        <div className="relative">
          {dropdownOpen && (
            <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
              >
                <FaUser /> Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors border-t border-gray-100"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
          
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
          >
            <FaCog /> Settings
            <FaChevronDown className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Profile Picture */}
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center shadow-md relative overflow-hidden`}>
                  {profileForm.profilePicture ? (
                    <img
                      src={profileForm.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-700 text-2xl font-bold">
                      {getInitials(profileForm.name)}
                    </span>
                  )}
                  <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <FaCamera className="text-white text-xl" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">Click to change photo</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

export default Sidebar;