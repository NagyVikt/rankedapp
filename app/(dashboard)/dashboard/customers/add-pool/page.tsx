// page.tsx

import React from 'react';

// Define the props for the component, if any. In this case, none are needed.
interface ComingSoonPageProps {}

// Functional component for the Coming Soon page
const ComingSoonPage: React.FC<ComingSoonPageProps> = () => {
  return (
    // Main container, centers content vertically and horizontally
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-sans">
      {/* Construction Icon (Optional - using a simple emoji here) */}
      <div className="text-6xl mb-8 animate-bounce">🚧</div>

      {/* Main Title */}
      <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center text-yellow-400">
        Coming Soon!
      </h1>

      {/* Subtitle / Message */}
      <p className="text-xl md:text-2xl text-gray-300 mb-8 text-center">
        We're working hard to bring you something amazing.
      </p>

      {/* Under Construction Details */}
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center text-yellow-500">
          Site Under Construction
        </h2>
        <p className="text-gray-400 text-center">
          Our team is currently developing this page. Please check back later for updates.
          We appreciate your patience!
        </p>
      </div>

      {/* Optional: A subtle animation or a countdown timer could be added here */}
      <div className="mt-12 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Your Company Name
      </div>
    </div>
  );
};

// Export the component as default
export default ComingSoonPage;
