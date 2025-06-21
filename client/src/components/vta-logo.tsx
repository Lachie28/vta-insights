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
          className="drop-shadow-sm"
        >
          <defs>
            <linearGradient id="vta-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="50%" stopColor="#0066ff" />
              <stop offset="100%" stopColor="#3366ff" />
            </linearGradient>
          </defs>
          
          {/* Hexagonal background */}
          <path
            d="M25 28.87L50 15.74L75 28.87V55.13L50 68.26L25 55.13V28.87Z"
            fill="url(#vta-gradient)"
            stroke="none"
          />
          
          {/* V symbol */}
          <path
            d="M35 35L50 55L65 35"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Tech accent lines */}
          <rect x="30" y="70" width="40" height="2" rx="1" fill="url(#vta-gradient)" opacity="0.6" />
          <rect x="35" y="75" width="30" height="1.5" rx="0.75" fill="url(#vta-gradient)" opacity="0.4" />
          <rect x="40" y="79" width="20" height="1" rx="0.5" fill="url(#vta-gradient)" opacity="0.3" />
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