export function SmartCityIllustration() {
  return (
    <div className="relative w-full h-full min-h-[340px] lg:min-h-[420px] rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-sky-50 via-teal-50/60 to-amber-50/70 overflow-hidden flex items-center justify-center shadow-sm">
      <svg
        viewBox="0 0 640 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Vibrant smart city civic infrastructure illustration showing colourful municipal buildings, transit bridge, sunlit parks, street lighting, and AI routing arcs"
        className="w-full h-full object-cover"
      >
        <defs>
          <linearGradient id="skyGradColor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#F0FDFA" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
          <linearGradient id="indigoTower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="tealTower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <linearGradient id="signalArcColor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <pattern id="architecturalGridColor" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#93C5FD" strokeWidth="0.6" strokeOpacity="0.35" />
          </pattern>
        </defs>

        {/* Warm vibrant sky & blueprint grid */}
        <rect width="640" height="460" fill="url(#skyGradColor)" />
        <rect width="640" height="376" fill="url(#architecturalGridColor)" />

        {/* Radiant Sunrise Beacon */}
        <circle cx="520" cy="92" r="56" fill="#FDE68A" opacity="0.55" />
        <circle cx="520" cy="92" r="34" fill="url(#sunGlow)" opacity="0.9" />

        {/* Distant colourful skyline silhouettes */}
        <rect x="34" y="164" width="56" height="176" rx="4" fill="#A5B4FC" opacity="0.55" />
        <rect x="102" y="136" width="68" height="204" rx="4" fill="#7DD3FC" opacity="0.55" />
        <rect x="372" y="128" width="64" height="212" rx="4" fill="#99F6E4" opacity="0.7" />
        <rect x="530" y="172" width="72" height="168" rx="4" fill="#FDBA74" opacity="0.5" />

        {/* Primary Civic Hall & AI Control Tower (Deep Indigo) */}
        <rect x="198" y="96" width="114" height="244" rx="5" fill="url(#indigoTower)" />
        <path d="M212 96L228 74H282L298 96H212Z" fill="#0EA5E9" />
        <line x1="255" y1="48" x2="255" y2="74" stroke="#312E81" strokeWidth="3" />
        <circle cx="255" cy="46" r="6" fill="#F97316" />

        {/* Lit windows in warm gold & bright cyan */}
        {[120, 146, 172, 198, 224, 250].map((y, idx) => (
          <g key={y}>
            <rect x="216" y={y} width="18" height="10" rx="2" fill={idx % 2 === 0 ? '#FDE047' : '#BAE6FD'} />
            <rect x="246" y={y} width="18" height="10" rx="2" fill="#2DD4BF" />
            <rect x="276" y={y} width="18" height="10" rx="2" fill={idx % 2 === 1 ? '#FDE047' : '#C7D2FE'} />
          </g>
        ))}

        {/* Secondary Smart-Grid Building (Vibrant Teal) */}
        <rect x="424" y="148" width="98" height="192" rx="5" fill="url(#tealTower)" />
        <rect x="424" y="148" width="98" height="12" rx="2" fill="#F59E0B" />
        {[176, 200, 224, 248, 272].map((y, idx) => (
          <g key={y}>
            <rect x="440" y={y} width="26" height="9" rx="2" fill="#FFFFFF" opacity="0.9" />
            <rect x="478" y={y} width="26" height="9" rx="2" fill={idx % 2 === 0 ? '#FDE047' : '#A7F3D0'} />
          </g>
        ))}

        {/* Civic Plaza Pavilion (Warm Coral Roof + Crisp White Columns) */}
        <rect x="64" y="216" width="120" height="124" rx="5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="2" />
        <path d="M56 216L124 182L192 216H56Z" fill="#F97316" />
        <rect x="84" y="242" width="16" height="64" rx="2" fill="#E0E7FF" />
        <rect x="116" y="242" width="16" height="64" rx="2" fill="#4F46E5" />
        <rect x="148" y="242" width="16" height="64" rx="2" fill="#E0E7FF" />

        {/* Lush Emerald Urban Park Trees */}
        <g>
          <rect x="336" y="294" width="6" height="46" fill="#78350F" />
          <circle cx="339" cy="280" r="23" fill="#10B981" />
          <circle cx="364" cy="292" r="17" fill="#34D399" />
          <rect x="362" y="308" width="5" height="32" fill="#78350F" />
        </g>

        {/* Elevated Light-Rail / Transit Viaduct */}
        <path d="M0 326H640" stroke="#1E1B4B" strokeWidth="6" />
        <path d="M0 332H640" stroke="#38BDF8" strokeWidth="2.5" />
        {[90, 255, 420, 560].map((x) => (
          <rect key={x} x={x} y="332" width="10" height="44" fill="#4338CA" />
        ))}
        {/* Sleek Multi-Colour Electric Transit Train */}
        <rect x="308" y="304" width="122" height="20" rx="7" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2.5" />
        <rect x="320" y="310" width="18" height="7" rx="1.5" fill="#0D9488" />
        <rect x="344" y="310" width="18" height="7" rx="1.5" fill="#0EA5E9" />
        <rect x="368" y="310" width="18" height="7" rx="1.5" fill="#4F46E5" />
        <rect x="392" y="310" width="22" height="7" rx="1.5" fill="#F97316" />

        {/* Smart Streetlights with Warm Golden Cones */}
        {[168, 536].map((x) => (
          <g key={x}>
            <path d={`M${x} 376V268H${x + 16}`} stroke="#1E1B4B" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx={x + 16} cy="268" rx="6" ry="3.5" fill="#F59E0B" />
            <path
              d={`M${x + 10} 271L${x + 2} 314H${x + 30}L${x + 22} 271Z`}
              fill="#FDE047"
              opacity="0.28"
            />
          </g>
        ))}

        {/* Subsurface Utility Cutaway Band */}
        <rect x="0" y="376" width="640" height="84" fill="#0F172A" />
        <line x1="0" y1="396" x2="640" y2="396" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="10 8" strokeOpacity="0.6" />
        <path d="M40 426H220L248 416H450L478 426H600" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="140" cy="426" r="5.5" fill="#0EA5E9" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="350" cy="416" r="5.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="540" cy="426" r="5.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />

        {/* Multi-Hue AI Routing & Telemetry Arcs */}
        <path
          d="M124 176C155 104 205 66 255 46"
          stroke="url(#signalArcColor)"
          strokeWidth="2.75"
          strokeDasharray="6 5"
          strokeLinecap="round"
        />
        <path
          d="M472 148C420 84 335 62 255 46"
          stroke="url(#signalArcColor)"
          strokeWidth="2.75"
          strokeDasharray="6 5"
          strokeLinecap="round"
        />
        <path
          d="M552 264C510 180 395 100 255 46"
          stroke="#EC4899"
          strokeWidth="2"
          strokeOpacity="0.55"
          strokeDasharray="4 4"
        />

        {/* Vibrant Issue Pin Nodes */}
        <g transform="translate(111, 148)">
          <rect x="0" y="0" width="26" height="26" rx="13" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M13 7V13M13 17H13.01" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        <g transform="translate(459, 114)">
          <rect x="0" y="0" width="26" height="26" rx="13" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M8.5 13L11.5 16L17.5 10" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <text
          x="32"
          y="448"
          fill="#94A3B8"
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="0.06em"
        >
          SMART CITY INFRASTRUCTURE · ROADS · WATER · LIGHTING · TRANSIT · PARKS
        </text>
      </svg>
    </div>
  );
}
