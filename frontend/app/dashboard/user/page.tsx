"use client";

import { useEffect } from "react";

export default function UserDashboardRedirect() {
  useEffect(() => {
    // Redirect to new consumer route
    window.location.href = '/consumer';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-purple-300">Redirecting to Consumer Portal...</p>
      </div>
    </div>
  );
}
   