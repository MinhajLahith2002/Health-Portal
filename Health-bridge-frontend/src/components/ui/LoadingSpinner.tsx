"use client";

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-slate-500 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;