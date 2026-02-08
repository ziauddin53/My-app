
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-[30%] flex items-center justify-center text-white shadow-xl transition-all duration-500 overflow-hidden ${className}`}>
      {/* 
        আপনার নিজস্ব লোগো ইমেজ ব্যবহার করতে চাইলে নিচের SVG-টি মুছে ফেলুন এবং ইমেজ ট্যাগটি আনকমেন্ট করুন:
        <img src="YOUR_IMAGE_URL_HERE" alt="Zenumama Logo" className="w-full h-full object-cover" />
      */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="w-3/5 h-3/5" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
  );
};

export default Logo;
