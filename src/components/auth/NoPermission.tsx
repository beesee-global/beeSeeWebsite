import React from "react";

const NoPermission: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center p-6">
    <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">No permissions allowed</h1>
      <p className="mt-3 text-sm text-gray-600">
        Please contact admin for assistance.
      </p>
    </div>
  </div>
);

export default NoPermission;
