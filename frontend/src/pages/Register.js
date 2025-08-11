// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
// import axios from 'axios';

// const Register = () => {
//   const navigate = useNavigate();
//   const [accountType, setAccountType] = useState('Student'); // ✅ Changed from 'User'
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//   });

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post('http://localhost:5000/api/auth/register', {
//         name: formData.username,
//         email: formData.email,
//         password: formData.password,
//         role: accountType, // ✅ Valid role: Student/Teacher/Admin
//       });

//       console.log('Registered user:', response.data);
//       alert('Registration successful!');
//       navigate('/login');
//     } catch (err) {
//       console.error('Registration error:', err.response?.data || err.message);
//       alert(err.response?.data?.message || 'Registration failed. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 px-4">
//       <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
//         <h2 className="text-3xl font-bold text-center text-blue-700 mb-1">
//           Create an Account
//         </h2>
//         <p className="text-center text-gray-500 mb-6">
//           Fill in the details to register.
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block font-medium mb-1">Account Type</label>
//             <select
//               value={accountType}
//               onChange={(e) => setAccountType(e.target.value)}
//               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//               required
//             >
//               <option value="student">Student</option>
//               <option value="teacher">Teacher</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>

//           <div>
//             <label className="block font-medium mb-1">Username</label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               placeholder="Enter your username"
//               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//               required
//             />
//           </div>

//           <div>
//             <label className="block font-medium mb-1">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter your email"
//               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//               required
//             />
//           </div>

//           <div className="relative">
//             <label className="block font-medium mb-1">Password</label>
//             <input
//               type={showPassword ? 'text' : 'password'}
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter your password"
//               className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-9 text-gray-500"
//             >
//               {showPassword ? <FaEyeSlash /> : <FaEye />}
//             </button>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition flex items-center justify-center gap-2"
//           >
//             <FaUserPlus /> Sign Up
//           </button>
//         </form>

//         <div className="mt-5 text-center text-sm text-gray-600">
//           <p className="mb-1 hover:underline cursor-pointer">
//             Forgot your password?
//           </p>
//           <p>
//             Already have an account?{' '}
//             <span
//               className="text-blue-600 hover:underline cursor-pointer"
//               onClick={() => navigate('/login')}
//             >
//               Sign in
//             </span>
//           </p>
//         </div>

//         <div className="mt-4 text-center">
//           <button
//             onClick={() => navigate('/')}
//             className="mt-3 text-gray-700 border border-black px-4 py-1 rounded-md hover:bg-gray-100"
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Registering with:", {
    name: formData.username,
    email: formData.email,
    password: formData.password,
    role: accountType,
  });

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: accountType,
      });

      
      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-1">
          Create an Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Fill in the details to register.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Type */}
          <div>
            <label htmlFor="accountType" className="block font-medium mb-1">
              Account Type
            </label>
            <select
              id="accountType"
              title="Account Type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select Account Type</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
              required
            />
            <button
              type="button"
              title={showPassword ? "Hide Password" : "Show Password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            title="Register"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition flex items-center justify-center gap-2"
          >
            <FaUserPlus /> Sign Up
          </button>
        </form>

        {/* Navigation */}
        <div className="mt-5 text-center text-sm text-gray-600">
          <p className="mb-1 hover:underline cursor-pointer">
            Forgot your password?
          </p>
          <p>
            Already have an account?{' '}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate('/login')}
            >
              Sign in
            </span>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            title="Go to Home"
            onClick={() => navigate('/')}
            className="mt-3 text-gray-700 border border-black px-4 py-1 rounded-md hover:bg-gray-100"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
