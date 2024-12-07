import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header container with flex */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          <h1 className="text-4xl font-bold text-gray-900">
            Reset Password
          </h1>
          
          {/* Empty div to help with spacing */}
          <div className="w-8"></div>
        </div>

        {/* Description text */}
        <p className="text-center text-gray-600 mb-8">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        {/* Reset password form */}
        <form className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to login link */}
        <div className="text-center">
          <Link 
            to="/login"
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 