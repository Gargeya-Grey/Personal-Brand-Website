import React from 'react';

interface RenderIllustrationProps {
  type: string;
  isBig?: boolean;
}

export function renderIllustration(type: string, isBig: boolean = true) {
  const strokeCol = "#10B981"; // Emerald
  const accentCol = "#3b82f6"; // Blue
  const borderCol = "var(--color-outline-variant)"; // Border
  const textCol = "var(--color-text-primary)"; // Text
  const bgCol = "var(--color-bg-primary)"; // Soft background
  const innerCardCol = "var(--color-canvas)"; // Card filling

  const minHeightClass = isBig ? "min-h-[180px]" : "";
  const getPaddingClass = (defaultPad: string) => isBig ? defaultPad : "p-1.5";

  switch (type) {
    case "diagram1":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-8")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          <path d="M40 100 H360" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4"/>
          <path d="M40 100 Q 120 40, 200 100 T 360 100" stroke={strokeCol} strokeWidth="3" fill="none" />
          <path d="M40 100 Q 120 160, 200 100 T 360 100" stroke={accentCol} strokeWidth="1.5" fill="none" opacity="0.6"/>
          <circle cx="100" cy="70" r="12" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
          <circle cx="200" cy="100" r="16" fill={innerCardCol} stroke={accentCol} strokeWidth="4"/>
          <circle cx="300" cy="130" r="12" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
          <circle cx="100" cy="70" r="4" fill={strokeCol}/>
          <circle cx="200" cy="100" r="6" fill={accentCol}/>
          <circle cx="300" cy="130" r="4" fill={strokeCol}/>
        </svg>
      );
    case "diagram2":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-8")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          <circle cx="200" cy="170" r="14" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
          <path d="M200 156 L100 80 M200 156 L160 80 M200 156 L240 80 M200 156 L300 80" stroke="#cbd5e1" strokeWidth="2"/>
          <circle cx="100" cy="80" r="8" fill={accentCol}/>
          <circle cx="160" cy="80" r="8" fill={strokeCol}/>
          <circle cx="240" cy="80" r="8" fill={strokeCol}/>
          <circle cx="300" cy="80" r="8" fill={accentCol}/>
          <path d="M100 80 Q 200 20, 300 80" stroke={strokeCol} strokeWidth="2" strokeDasharray="3 3" fill="none"/>
        </svg>
      );
    case "diagram3":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-8")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          <g transform="translate(60, 40)">
            <rect width="80" height="120" rx="8" fill={innerCardCol} stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="10" y1="30" x2="70" y2="30" stroke={strokeCol} strokeWidth="4"/>
            <line x1="10" y1="65" x2="50" y2="65" stroke="#cbd5e1" strokeWidth="4"/>
            <line x1="10" y1="90" x2="60" y2="90" stroke="#cbd5e1" strokeWidth="4"/>
          </g>
          <g transform="translate(160, 40)">
            <rect width="80" height="120" rx="8" fill={innerCardCol} stroke={strokeCol} strokeWidth="2"/>
            <line x1="10" y1="30" x2="70" y2="30" stroke={accentCol} strokeWidth="4"/>
            <line x1="10" y1="55" x2="60" y2="55" stroke={strokeCol} strokeWidth="4"/>
            <line x1="10" y1="80" x2="70" y2="80" stroke="#cbd5e1" strokeWidth="4"/>
            <line x1="10" y1="100" x2="40" y2="100" stroke="#cbd5e1" strokeWidth="4"/>
          </g>
          <g transform="translate(260, 40)">
            <rect width="80" height="120" rx="8" fill={innerCardCol} stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="10" y1="30" x2="70" y2="30" stroke={strokeCol} strokeWidth="4"/>
            <line x1="10" y1="60" x2="60" y2="60" stroke="#cbd5e1" strokeWidth="4"/>
            <line x1="10" y1="85" x2="40" y2="85" stroke="#cbd5e1" strokeWidth="4"/>
          </g>
        </svg>
      );
    case "diagram4":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-8")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          <line x1="50" y1="100" x2="350" y2="100" stroke="#e2e8f0" strokeWidth="2"/>
          <circle cx="90" cy="100" r="25" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
          <circle cx="200" cy="100" r="25" fill={innerCardCol} stroke={accentCol} strokeWidth="3" strokeDasharray="5 2"/>
          <circle cx="310" cy="100" r="25" fill={innerCardCol} stroke={strokeCol} strokeWidth="3"/>
          <path d="M200 65 L200 40 L250 40" stroke={accentCol} strokeWidth="1.5" fill="none"/>
          <text x="90" y="104" fill={textCol} fontSize="11" textAnchor="middle" fontWeight="bold">Task</text>
          <text x="200" y="104" fill={textCol} fontSize="11" textAnchor="middle" fontWeight="bold">Run</text>
          <text x="310" y="104" fill={textCol} fontSize="11" textAnchor="middle" fontWeight="bold">Verify</text>
        </svg>
      );
    case "diagram5":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-8")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          {/* Main system cycle with active validation gate */}
          <circle cx="120" cy="100" r="30" fill={innerCardCol} stroke={strokeCol} strokeWidth="3" />
          <circle cx="280" cy="100" r="30" fill={innerCardCol} stroke={accentCol} strokeWidth="3" />
          <path d="M150 100 H250" stroke={borderCol} strokeWidth="2" strokeDasharray="4 4" />
          <path d="M120 70 Q 200 20, 280 70" stroke={strokeCol} strokeWidth="2" fill="none" />
          <path d="M280 130 Q 200 180, 120 130" stroke={accentCol} strokeWidth="2" fill="none" />
          {/* Checkpoint Badge */}
          <circle cx="200" cy="45" r="14" fill={innerCardCol} stroke={accentCol} strokeWidth="2" />
          <path d="M194 45 L198 49 L206 41" stroke={strokeCol} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="120" y="104" fill={textCol} fontSize="10" textAnchor="middle" fontWeight="bold">Agent</text>
          <text x="280" y="104" fill={textCol} fontSize="10" textAnchor="middle" fontWeight="bold">Store</text>
          <text x="200" y="19" fill={textCol} fontSize="8" textAnchor="middle" fontWeight="bold" letterSpacing="0.05em">HUMAN GATE</text>
        </svg>
      );
    case "diagram6":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-6")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          {/* Inbound request -> router -> nodes -> result */}
          <circle cx="60" cy="100" r="18" fill={innerCardCol} stroke={accentCol} strokeWidth="3" />
          <path d="M78 100 L140 60 M78 100 L140 100 M78 100 L140 140" stroke={borderCol} strokeWidth="2" />
          <rect x="140" y="45" width="90" height="30" rx="8" fill={innerCardCol} stroke={strokeCol} strokeWidth="2" />
          <rect x="140" y="85" width="90" height="30" rx="8" fill={innerCardCol} stroke={strokeCol} strokeWidth="2" />
          <rect x="140" y="125" width="90" height="30" rx="8" fill={innerCardCol} stroke={strokeCol} strokeWidth="2" />
          <path d="M230 60 L292 100 M230 100 L292 100 M230 140 L292 100" stroke={borderCol} strokeWidth="2" />
          <circle cx="310" cy="100" r="18" fill={innerCardCol} stroke={accentCol} strokeWidth="3" />
          <text x="60" y="104" fill={textCol} fontSize="9" textAnchor="middle" fontWeight="bold">Query</text>
          <text x="185" y="64" fill={textCol} fontSize="9" textAnchor="middle">Refunds</text>
          <text x="185" y="104" fill={textCol} fontSize="9" textAnchor="middle">Schedule</text>
          <text x="185" y="144" fill={textCol} fontSize="9" textAnchor="middle">Safety</text>
          <text x="310" y="104" fill={textCol} fontSize="9" textAnchor="middle" fontWeight="bold">Action</text>
        </svg>
      );
    case "diagram7":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-6")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          {/* Cloud border and isolated containers */}
          <rect x="50" y="35" width="300" height="130" rx="16" fill="transparent" stroke={strokeCol} strokeWidth="2" strokeDasharray="6 4" />
          <text x="330" y="52" fill={strokeCol} fontSize="8" textAnchor="end" fontWeight="bold" letterSpacing="0.05em">PRIVATE K8S</text>
          <g transform="translate(80, 70)">
            <rect width="65" height="60" rx="10" fill={innerCardCol} stroke={borderCol} strokeWidth="2" />
            <text x="32.5" y="36" fill={textCol} fontSize="10" textAnchor="middle" fontWeight="bold">ClickHouse</text>
          </g>
          <g transform="translate(167.5, 70)">
            <rect width="65" height="60" rx="10" fill={innerCardCol} stroke={accentCol} strokeWidth="2" />
            <text x="32.5" y="36" fill={textCol} fontSize="10" textAnchor="middle" fontWeight="bold">Tracer</text>
          </g>
          <g transform="translate(255, 70)">
            <rect width="65" height="60" rx="10" fill={innerCardCol} stroke={borderCol} strokeWidth="2" />
            <text x="32.5" y="36" fill={textCol} fontSize="10" textAnchor="middle" fontWeight="bold">Ingress</text>
          </g>
          <path d="M145 100 H167.5 M232.5 100 H255" stroke={strokeCol} strokeWidth="2" />
        </svg>
      );
    case "diagram8":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-6")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          {/* Jittery token characters vs structured state boxes */}
          <g transform="translate(30, 20)">
            <text x="10" y="30" fill={textCol} fontSize="10" opacity="0.3">c</text>
            <text x="25" y="25" fill={textCol} fontSize="10" opacity="0.5">h</text>
            <text x="40" y="35" fill={textCol} fontSize="10" opacity="0.8">a</text>
            <text x="55" y="28" fill={textCol} fontSize="10">r</text>
            <path d="M70 30 C 90 30, 90 70, 110 70" stroke={borderCol} strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="10" y="130" fill={textCol} fontSize="10" letterSpacing="0.1em">T-O-K-E-N-S</text>
          </g>
          <g transform="translate(170, 40)">
            <rect width="180" height="120" rx="12" fill={innerCardCol} stroke={strokeCol} strokeWidth="2" />
            <rect x="15" y="15" width="150" height="25" rx="6" fill={bgCol} stroke={borderCol} />
            <rect x="15" y="50" width="150" height="25" rx="6" fill={bgCol} stroke={accentCol} />
            <rect x="15" y="85" width="150" height="25" rx="6" fill={bgCol} stroke={borderCol} />
            <text x="25" y="31" fill={textCol} fontSize="8" fontWeight="bold">Node: planning</text>
            <text x="25" y="66" fill={accentCol} fontSize="8" fontWeight="bold">Node: tool_call</text>
            <text x="25" y="101" fill={textCol} fontSize="8" fontWeight="bold">Node: response</text>
          </g>
          <text x="100" y="170" fill={textCol} fontSize="8" textAnchor="middle" fontWeight="bold" letterSpacing="0.05em">DELTA EVENT STREAM</text>
        </svg>
      );
    case "digital-ledger":
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-4")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="ledger-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="ledger-glow-blue" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="400" height="200" rx="16" fill="transparent" />

          {/* Background Dotted Blueprint Grid */}
          <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.15" />
          </pattern>
          <rect width="400" height="200" fill="url(#dotGrid)" rx="16" />

          {/* Left Page (The Technical Graph) */}
          <g transform="translate(60, 25)">
            {/* Page base */}
            <rect width="130" height="150" rx="8" fill={innerCardCol} stroke="#cbd5e1" strokeWidth="1.5" opacity="0.6" />
            <rect x="5" y="5" width="120" height="140" rx="6" fill={bgCol} opacity="0.1" />
            
            {/* Tech grid inside */}
            <path d="M20 120 H110 M20 40 V120" stroke="#cbd5e1" strokeWidth="1" opacity="0.25" />
            {/* Line graph */}
            <path d="M20 110 Q 50 80, 70 95 T 110 50" stroke={strokeCol} strokeWidth="2" fill="none" opacity="0.8" />
            <circle cx="70" cy="95" r="3.5" fill={innerCardCol} stroke={strokeCol} strokeWidth="1.5" />
            <circle cx="110" cy="50" r="4.5" fill={strokeCol} />
            <circle cx="110" cy="50" r="8" stroke={strokeCol} strokeWidth="1" fill="none" opacity="0.4" className="animate-pulse" filter="url(#ledger-glow-emerald)" />
            
            {/* Small code symbols */}
            <text x="25" y="30" fill="var(--color-text-primary)" fontSize="7" fontFamily="monospace" opacity="0.4">f(x) = dx/dt</text>
            <text x="20" y="132" fill="var(--color-text-primary)" fontSize="6" fontFamily="monospace" opacity="0.3">0.024s // telemetry</text>
          </g>

          {/* Right Page (The Personal Reflection / Writing) */}
          <g transform="translate(210, 25)">
            {/* Page base */}
            <rect width="130" height="150" rx="8" fill={innerCardCol} stroke="#cbd5e1" strokeWidth="1.5" opacity="0.6" />
            <rect x="5" y="5" width="120" height="140" rx="6" fill={bgCol} opacity="0.1" />
            
            {/* Writing lines (Essays) */}
            <line x1="20" y1="35" x2="110" y2="35" stroke="var(--color-text-primary)" strokeWidth="3" opacity="0.15" strokeLinecap="round" />
            <line x1="20" y1="50" x2="95" y2="50" stroke="var(--color-text-primary)" strokeWidth="3" opacity="0.15" strokeLinecap="round" />
            <line x1="20" y1="65" x2="105" y2="65" stroke="var(--color-text-primary)" strokeWidth="3" opacity="0.15" strokeLinecap="round" />
            <line x1="20" y1="80" x2="85" y2="80" stroke="var(--color-text-primary)" strokeWidth="3" opacity="0.15" strokeLinecap="round" />
            
            {/* Glowing Signature / Creative Flow */}
            <path d="M20 105 Q 40 100, 60 120 T 110 110" stroke={accentCol} strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#ledger-glow-blue)" />
            <path d="M85 105 L95 95 M90 125 L100 115" stroke={accentCol} strokeWidth="1" opacity="0.5" />
            
            {/* Floating thought star */}
            <path d="M105 85 L108 92 L115 95 L108 98 L105 105 L102 98 L95 95 L102 92 Z" fill={strokeCol} opacity="0.8" className="animate-pulse" filter="url(#ledger-glow-emerald)" />
          </g>

          {/* Ledger Binder Rings / Spine */}
          <line x1="200" y1="30" x2="200" y2="170" stroke="#cbd5e1" strokeWidth="2" opacity="0.4" />
          
          {/* Arc binder rings */}
          <path d="M192 50 Q 200 45, 208 50" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
          <path d="M192 90 Q 200 85, 208 90" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
          <path d="M192 130 Q 200 125, 208 130" stroke="#94a3b8" strokeWidth="2.5" fill="none" />

          {/* Glowing Animated Creative Flow linking the pages */}
          <path d="M170 75 Q 200 135, 230 130" stroke={accentCol} strokeWidth="1.5" strokeDasharray="4 8" opacity="0.7">
            <animate attributeName="stroke-dashoffset" values="24;0" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    default:
      return (
        <svg className={`w-full h-full ${minHeightClass} bg-transparent ${getPaddingClass("p-8")}`} viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="200" rx="16" fill="transparent" />
          <line x1="50" y1="50" x2="350" y2="150" stroke={strokeCol} strokeWidth="2" opacity="0.3"/>
          <line x1="50" y1="150" x2="350" y2="50" stroke="#cbd5e1" strokeWidth="2" opacity="0.3"/>
          <circle cx="200" cy="100" r="30" fill={innerCardCol} stroke={accentCol} strokeWidth="4"/>
          <circle cx="200" cy="100" r="10" fill={strokeCol}/>
        </svg>
      );
  }
}
