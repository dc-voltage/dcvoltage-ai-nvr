import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]", className)}
    >
      <defs>
        <linearGradient id="dcv-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="dcv-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <radialGradient id="dcv-lens-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#1e40af" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Hexagonal Shield / Aperture Boundary */}
      <polygon
        points="50,4 90,26 90,74 50,96 10,74 10,26"
        stroke="url(#dcv-grad-primary)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="#0b1329"
        fillOpacity="0.9"
      />

      {/* Surveillance Iris Radial Grid Rings */}
      <circle cx="50" cy="50" r="32" stroke="url(#dcv-grad-primary)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <circle cx="50" cy="50" r="22" stroke="url(#dcv-grad-primary)" strokeWidth="1.2" opacity="0.8" />
      <circle cx="50" cy="50" r="22" fill="url(#dcv-lens-glow)" />

      {/* Crosshair Target Marks */}
      <line x1="50" y1="12" x2="50" y2="20" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="80" x2="50" y2="88" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="50" x2="26" y2="50" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="74" y1="50" x2="82" y2="50" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

      {/* DC Voltage Lightning / Kinetic Core */}
      <path
        d="M53 22L36 50H49L47 78L66 48H52L53 22Z"
        fill="url(#dcv-grad-accent)"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Optical Sensor Core Center Dot */}
      <circle cx="50" cy="50" r="3" fill="#ffffff" />
    </svg>
  );
}
