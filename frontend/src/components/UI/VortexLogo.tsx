import vortexImg from '../../assets/vortex-logo.png';

export function VortexSymbol({ className = '' }: { className?: string }) {
  return (
    <img 
      src={vortexImg}
      alt="Vortex Logo"
      className={`w-12 h-12 rounded-full object-cover shadow-[0_0_15px_rgba(150,200,255,0.4)] ${className}`} 
    />
  );
}

export function VortexText({ className = '' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 225 50" 
      className={`h-6 md:h-8 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] ${className}`} 
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter" fill="none">
        {/* V */}
        <path d="M 10 10 L 12 15" />
        <path d="M 14.8 22 L 22 40 L 34 10" />

        {/* O */}
        <path d="M 51 10.5 A 15 15 0 1 1 43.5 15.5" />

        {/* R */}
        <path d="M 80 10 L 80 15" />
        <path d="M 80 22 L 80 40" />
        <path d="M 80 10 L 95 10 A 7.5 7.5 0 0 1 102.5 17.5 A 7.5 7.5 0 0 1 95 25 L 80 25" />
        <path d="M 90 25 L 102.5 40" />

        {/* T */}
        <path d="M 115 10 L 140 10" />
        <path d="M 127.5 10 L 127.5 40" />

        {/* E */}
        <path d="M 155 10 L 155 40" />
        <path d="M 155 10 L 175 10" />
        <path d="M 155 25 L 170 25" />
        <path d="M 155 40 L 175 40" />

        {/* X */}
        <path d="M 190 10 L 194 14.8" />
        <path d="M 200 22 L 215 40" />
        <path d="M 215 10 L 190 40" />
      </g>
    </svg>
  );
}
