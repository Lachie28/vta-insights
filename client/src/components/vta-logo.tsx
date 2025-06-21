interface VTALogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function VTALogo({ size = 'md', showText = true, className = '' }: VTALogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', spacing: 'gap-2' },
    md: { icon: 40, text: 'text-xl', spacing: 'gap-3' },
    lg: { icon: 56, text: 'text-2xl', spacing: 'gap-4' }
  };

  const { icon, text, spacing } = sizes[size];

  return (
    <div className={`flex items-center ${spacing} ${className}`}>
      <div className="relative">
        <svg 
          width={icon} 
          height={icon} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <defs>
            <linearGradient id={`vta-gradient-${icon}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="50%" stopColor="#0066ff" />
              <stop offset="100%" stopColor="#3366ff" />
            </linearGradient>
            <filter id={`glow-${icon}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Hexagonal background */}
          <polygon
            points="50,10 75,27.5 75,62.5 50,80 25,62.5 25,27.5"
            fill={`url(#vta-gradient-${icon})`}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
            filter={`url(#glow-${icon})`}
          />
          
          {/* Inner hexagon for depth */}
          <polygon
            points="50,18 67,30 67,54 50,66 33,54 33,30"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          
          {/* V symbol - more precise design */}
          <path
            d="M38 32L50 52L62 32"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={`url(#glow-${icon})`}
          />
          
          {/* Tech circuit pattern */}
          <g opacity="0.4">
            <circle cx="35" cy="42" r="1.5" fill="white"/>
            <circle cx="65" cy="42" r="1.5" fill="white"/>
            <line x1="37" y1="42" x2="45" y2="42" stroke="white" strokeWidth="0.8"/>
            <line x1="55" y1="42" x2="63" y2="42" stroke="white" strokeWidth="0.8"/>
          </g>
          
          {/* Analytics data points */}
          <g opacity="0.3">
            <rect x="42" y="60" width="2" height="6" fill="white" rx="1"/>
            <rect x="46" y="58" width="2" height="8" fill="white" rx="1"/>
            <rect x="50" y="56" width="2" height="10" fill="white" rx="1"/>
            <rect x="54" y="58" width="2" height="8" fill="white" rx="1"/>
            <rect x="58" y="60" width="2" height="6" fill="white" rx="1"/>
          </g>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <div className={`${text} font-black leading-none bg-gradient-to-r from-[#00f3ff] via-[#0066ff] to-[#3366ff] bg-clip-text text-transparent tracking-tight`}>
            VTA
          </div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-none mt-1">
            VAST TECH ANALYTICS
          </div>
        </div>
      )}
    </div>
  );
}