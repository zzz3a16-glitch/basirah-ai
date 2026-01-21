import { FC } from "react";

interface BasirahLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const BasirahLogo: FC<BasirahLogoProps> = ({ className = "", size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer circle with gradient */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Inner geometric Islamic pattern */}
        <path
          d="M50 15 L65 35 L85 50 L65 65 L50 85 L35 65 L15 50 L35 35 Z"
          stroke="url(#logoGradient)"
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Center star */}
        <path
          d="M50 30 L55 45 L70 50 L55 55 L50 70 L45 55 L30 50 L45 45 Z"
          fill="url(#logoGradient)"
          opacity="0.8"
        />
        
        {/* Small dots */}
        <circle cx="50" cy="50" r="4" fill="url(#logoGradient)" />
        
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(163, 74%, 40%)" />
            <stop offset="100%" stopColor="hsl(163, 50%, 25%)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default BasirahLogo;
