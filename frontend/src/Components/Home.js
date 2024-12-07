import React from 'react'
import { Link } from "react-router-dom";
import {
  UserIcon,
  UserPlusIcon,
  ChevronRightIcon,
  LockKeyholeIcon,
} from "lucide-react";

const Home = () => {
  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[32rem] space-y-8">
        <div className="text-center">
          <div className="bg-white text-[#2F2F2F] text-[0.8rem] sm:text-[1rem] px-4 py-2 rounded-full border border-black inline-block mb-8 font-bold">
            Made by Boonful
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold mb-6 text-[#2F2F2F] tracking-tight">
            Mixiflow
          </h1>
        </div>

        <div className="rounded-xl divide-y divide-solid bg-[#F8F8F8] sm:mx-8">
          <div className="hover:bg-gray-200 px-4 hover:rounded-t-lg">
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-start text-left text-lg text-black font-normal h-14"
            >
              <UserIcon className="w-5 sm:w-6" />
              <span className="mx-auto font-semibold text-[1rem] sm:text-[1.2rem]">
                Login
              </span>
              <ChevronRightIcon className="w-5 sm:w-6 items-end" />
            </Link>
          </div>

          <div className="hover:bg-gray-200 px-4">
            <Link
              to="/register"
              className="w-full inline-flex items-center justify-start text-left text-lg text-black font-normal h-14"
            >
              <UserPlusIcon className="w-5 sm:w-6" />
              <span className="mx-auto font-semibold text-[1rem] sm:text-[1.2rem]">
                Create Account
              </span>
              <ChevronRightIcon className="w-5 sm:w-6 items-end" />
            </Link>
          </div>

          <div className="hover:bg-gray-200 px-4 hover:rounded-b-lg">
            <Link
              to="/forgot-password"
              className="w-full inline-flex items-center justify-start text-left text-lg text-black font-normal h-14"
            >
              <LockKeyholeIcon className="w-5 sm:w-6" />
              <span className="mx-auto font-semibold text-[1rem] sm:text-[1.2rem]">
                Forgot Password
              </span>
              <ChevronRightIcon className="w-5 sm:w-6 items-end" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home