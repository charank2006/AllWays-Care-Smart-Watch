import React from 'react';

interface WatchFrameProps {
  children: React.ReactNode;
}

export const WatchFrame: React.FC<WatchFrameProps> = ({ children }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Watch Strap Top */}
      <div className="absolute -top-24 w-40 h-32 bg-gray-800 rounded-t-3xl z-0 border-x border-gray-700 shadow-inner">
         <div className="w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-600 via-gray-800 to-black"></div>
      </div>
      
      {/* Watch Strap Bottom */}
      <div className="absolute -bottom-24 w-40 h-32 bg-gray-800 rounded-b-3xl z-0 border-x border-gray-700 shadow-inner">
        <div className="w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-600 via-gray-800 to-black"></div>
      </div>

      {/* Watch Body (Bezel) */}
      <div className="relative z-10 w-[360px] h-[420px] bg-gradient-to-br from-gray-700 via-gray-900 to-black rounded-[3rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] border-4 border-gray-700">
        
        {/* Screen Container */}
        <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative ring-2 ring-gray-800">
          
          {/* Glass Reflection */}
          <div className="absolute top-0 right-0 w-2/3 h-1/3 bg-gradient-to-b from-white to-transparent opacity-5 rounded-tr-[2.5rem] z-50 pointer-events-none"></div>
          
          {/* Main Content Area */}
          <div className="w-full h-full text-white font-sans overflow-hidden">
            {children}
          </div>
        </div>

        {/* Digital Crown */}
        <div className="absolute right-[-14px] top-16 w-3 h-12 bg-gradient-to-r from-gray-500 to-gray-800 rounded-r-md shadow-lg border-l border-gray-900"></div>
        {/* Side Button */}
        <div className="absolute right-[-10px] top-36 w-2 h-16 bg-gray-800 rounded-r-md shadow-lg"></div>
      </div>
    </div>
  );
};