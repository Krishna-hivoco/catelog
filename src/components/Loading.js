import React from "react";

// 1. Simple Spinner Loading
 const SpinnerLoading = ({ size = "md", color = "blue" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    blue: "border-blue-500",
    gray: "border-gray-500",
    green: "border-green-500",
    red: "border-red-500",
    purple: "border-purple-500",
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-500">
      <div className="text-center">
        <div className="flex justify-center items-center">
          <div
            className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-t-transparent rounded-full animate-spin`}
          ></div>
        </div>
        <p className="mt-4 text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};
export default SpinnerLoading