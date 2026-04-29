// components/SkeletonLoader.tsx
import React from 'react';

export const SettingsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
      </div>

      {/* Form Area Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full md:col-span-2"></div>
        </div>
      </div>
    </div>
  );
};