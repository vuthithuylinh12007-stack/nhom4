import React from 'react';

interface HangoMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'happy' | 'cheering' | 'thinking' | 'victory';
  className?: string;
}

export const HangoMascot: React.FC<HangoMascotProps> = ({
  size = 'md',
  mood = 'happy',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  };

  return (
    <div className={`relative select-none inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md animate-bounce-subtle"
      >
        <defs>
          <linearGradient id="mascotBody" x1="50" y1="20" x2="150" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDBA74" />
            <stop offset="0.6" stopColor="#FB923C" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>

          <linearGradient id="mascotEarInner" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FDA4AF" />
            <stop offset="1" stopColor="#F43F5E" />
          </linearGradient>

          <linearGradient id="bandanaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="badgeStar" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>

          <filter id="cheekGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Outer Ears */}
        {/* Left Ear */}
        <path
          d="M 52 75 C 35 45 45 20 70 35 C 75 48 70 65 52 75 Z"
          fill="url(#mascotBody)"
          stroke="#C2410C"
          strokeWidth="3.5"
        />
        <path d="M 54 65 C 45 45 52 32 66 42 Z" fill="url(#mascotEarInner)" />

        {/* Right Ear */}
        <path
          d="M 148 75 C 165 45 155 20 130 35 C 125 48 130 65 148 75 Z"
          fill="url(#mascotBody)"
          stroke="#C2410C"
          strokeWidth="3.5"
        />
        <path d="M 146 65 C 155 45 148 32 134 42 Z" fill="url(#mascotEarInner)" />

        {/* Head / Body Base */}
        <ellipse
          cx="100"
          cy="105"
          rx="60"
          ry="54"
          fill="url(#mascotBody)"
          stroke="#C2410C"
          strokeWidth="4"
        />

        {/* Cute Tiger Forehead Stripes */}
        <path d="M 100 56 L 100 70" stroke="#7C2D12" strokeWidth="4" strokeLinecap="round" />
        <path d="M 88 62 L 112 62" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
        <path d="M 91 69 L 109 69" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />

        {/* Side Cheeks White Patches */}
        <ellipse cx="64" cy="115" rx="14" ry="12" fill="#FFFFFF" opacity="0.9" />
        <ellipse cx="136" cy="115" rx="14" ry="12" fill="#FFFFFF" opacity="0.9" />

        {/* Rosy Cheeks */}
        <circle cx="65" cy="118" r="9" fill="#FB7185" opacity="0.6" filter="url(#cheekGlow)" />
        <circle cx="135" cy="118" r="9" fill="#FB7185" opacity="0.6" filter="url(#cheekGlow)" />

        {/* Eyes based on mood */}
        {mood === 'victory' || mood === 'cheering' ? (
          <>
            {/* Happy Curved Eyes ^ ^ */}
            <path
              d="M 72 102 Q 82 88 92 102"
              stroke="#1E1B4B"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 108 102 Q 118 88 128 102"
              stroke="#1E1B4B"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : mood === 'thinking' ? (
          <>
            <circle cx="82" cy="98" r="7" fill="#1E1B4B" />
            <circle cx="85" cy="95" r="2.5" fill="#FFFFFF" />
            {/* Wink on right eye */}
            <path
              d="M 110 100 Q 120 92 128 100"
              stroke="#1E1B4B"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            {/* Sparkling big eyes */}
            <circle cx="82" cy="98" r="8" fill="#1E1B4B" />
            <circle cx="80" cy="95" r="3" fill="#FFFFFF" />
            <circle cx="85" cy="100" r="1.5" fill="#FFFFFF" />

            <circle cx="118" cy="98" r="8" fill="#1E1B4B" />
            <circle cx="116" cy="95" r="3" fill="#FFFFFF" />
            <circle cx="121" cy="100" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {/* Snout & Cute Triangle Nose */}
        <ellipse cx="100" cy="116" rx="16" ry="11" fill="#FFFBEB" />
        <path d="M 96 112 Q 100 110 104 112 Q 100 118 96 112 Z" fill="#7C2D12" />

        {/* Mouth */}
        {mood === 'victory' || mood === 'cheering' ? (
          <path
            d="M 92 118 Q 100 132 108 118 Z"
            fill="#E11D48"
            stroke="#7C2D12"
            strokeWidth="2.5"
          />
        ) : (
          <path
            d="M 94 118 Q 97 122 100 118 Q 103 122 106 118"
            stroke="#7C2D12"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Korean Student Blue Bandana / Headband */}
        <path
          d="M 44 80 Q 100 62 156 80 L 158 90 Q 100 72 42 90 Z"
          fill="url(#bandanaGrad)"
          stroke="#1E3A8A"
          strokeWidth="2"
        />

        {/* Center Golden Star Badge on Bandana */}
        <circle cx="100" cy="78" r="7" fill="url(#badgeStar)" stroke="#B45309" strokeWidth="1" />
        <text
          x="100"
          y="81.5"
          fontFamily="system-ui"
          fontWeight="bold"
          fontSize="7"
          fill="#78350F"
          textAnchor="middle"
        >
          한
        </text>

        {/* Tiny Paws */}
        <circle cx="70" cy="150" r="12" fill="url(#mascotBody)" stroke="#C2410C" strokeWidth="3" />
        <circle cx="130" cy="150" r="12" fill="url(#mascotBody)" stroke="#C2410C" strokeWidth="3" />

        {/* Mini Flashcard in Paw */}
        {mood === 'victory' || mood === 'cheering' ? (
          <g transform="translate(130, 130) rotate(15)">
            <rect x="0" y="0" width="26" height="34" rx="4" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
            <text x="13" y="16" fontSize="12" textAnchor="middle">⭐</text>
            <text x="13" y="27" fontSize="7" fontWeight="bold" fill="#2563EB" textAnchor="middle">100</text>
          </g>
        ) : (
          <g transform="translate(42, 132) rotate(-15)">
            <rect x="0" y="0" width="24" height="32" rx="4" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
            <text x="12" y="15" fontSize="11" textAnchor="middle">🇰🇷</text>
            <text x="12" y="26" fontSize="6.5" fontWeight="black" fill="#1E3A8A" textAnchor="middle">가</text>
          </g>
        )}
      </svg>
    </div>
  );
};
